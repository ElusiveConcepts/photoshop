/**
 * Tile Preview - Adobe Photoshop Script
 *
 * @fileOverview generates a new image using the current image, layer, or
 * selection as a tile for previewing tiled textures.
 *
 * @author: Roger Soucy <roger.soucy@elusive-concepts.com>
 * @website: http://elusive-concepts.com/
 * @copyright Elusive Concepts, LLC 2018
 * @license https://opensource.org/licenses/MIT
 *
 * @requires: Adobe Photoshop CC 2015 or higher
 *
 * @version: 1.0.0
 */

/**
 * Installation:
 *
 * 1. Place script in %appdata%\Adobe\Adobe Photoshop CC 2018\Presets\Scripts\
 * 2. Restart Photoshop
 * 3. Choose File > Scripts > Tile Preview
 */

/** @namespace TILE namespace/container */
var TILE = TILE || {};

// enable double-clicking on Mac and Windows
#target photoshop
app.bringToFront();

/**
 * @class
 * @name Preview
 * @global
 * @type {Object}
 * @param {Object} Preview Preview object in global TILEMAP
 * @param {Object} PS Photoshop Application object (app)
 * @package TILE
 */
(function(Preview, PS, undefined)
{ /** @lends TILE */

	/** @type {Object} tiling settings */
	var settings = {
		rows : 5,
		cols : 5,
		gap  : false
	};


	/** @type {String} define the current target [IMAGE, LAYER, SELECTION] */
	var target = "IMAGE";

	/** @type {String} save the current ruler units */
	var units = app.preferences.rulerUnits;

	/** @type {Object} active document */
	var doc = activeDocument;

	/** @type {Object} active layer */
	var layer = doc.activeLayer;

	/** @type {Object} active selection (read only) */
	var selection = doc.selection;

	/** @type {Object} vector2 of the tile size */
	var tile_size = {x:0, y:0};

	/** @type {Object} preview image document */
	var preview_doc = false;


	/**
	 * constructor
	 */
	var _init = function()
	{
		// confirm correct version
		if(!_minimum_version())
		{
			_notify('Tilemap Preview requires Adobe Photoshop CC 2015 or higher.', 'Incorrect Version');
			return
		}

		// confirm open document
		if(!_open_document())
		{
			_notify('There is no open file to preview.', 'No Files Open');
			return;
		}


		// confirm image is not empty
		if(doc.artLayers <=1 && layer.bounds[0] == layer.bounds[2])
		{
			var msg  = "The image contains no artwork.\n";
			    msg += "Please select a different image, or add artwork.";

			_notify(msg, "No Artwork");
			return;
		}

		// Set the active target
		if(selection.active())
		{
			target = "SELECTION";
		}

		else if(doc.artLayers.length > 1 || doc.layerSets.length > 0)
		{
			target = "LAYER";

			// confirm layer is not empty
			if(layer.bounds[0] == layer.bounds[2])
			{
				var msg  = "The current layer is empty.\n";
				    msg += "Please select a different layer, or add content.";

				_notify(msg, "No Layer Content");
				return;
			}

			// confirm use of layer group if one is selected
			if(layer.typename == 'LayerSet')
			{
				var msg  = "This will preview tiling of the selected layer group.\n";
				    msg += "Are you sure you want to continue?";

				if(!_notify(msg, "Tile Layer Group?", true)) { return; }
			}
		}

		// Set the ruler units to pixels
		preferences.rulerUnits = Units.PIXELS;

		// Create a single undo point on our source image
		doc.suspendHistory('Tile Preview', '_copy_active()');

		if(!tile_size.x || !tile_size.y)
		{
			var msg  = "Unable to obtain a useable tile from the source image.\n";
			_notify(msg, "No Source Tile");
			return;
		}

		// Try to create a new image document
		if(!_create_image() || !preview_doc)
		{
			var msg  = "Unable to open a new image for preview.\n";
			_notify(msg, "Unable to create preview");

			return;
		}

		// try to paste the tiles
		if(!_create_tiles())
		{
			var msg  = "Could not paste tiles in preview.\n";
			_notify(msg, "Unable to create tiles");

			return;
		}

		// try to hilight one tile
		if(!_highlight_tile())
		{
			var msg  = "Unable to highlight the last tile.\n";
			_notify(msg, "Unable to hilight");

			return;
		}
	}


	/**
	 * Copy the active selection
	 *
	 * This function copies the current selection (if there is one), or the
	 * active layer(s). In the case of a layer group, we create a duplicate,
	 * merge the group, then copy it.
	 *
	 * @return {Boolean}
	 */
	var _copy_active = function()
	{
		try
		{
			switch(target)
			{
				case 'IMAGE':
					layer.copy(false);

					tile_size.x = parseInt(doc.width);
					tile_size.y = parseInt(doc.height);

					break;

				case 'LAYER':
					if(layer.typename == 'LayerSet')
					{
						var layer_set_dup = layer.duplicate().merge();
						var box = _parse_bounds(layer_set_dup.bounds);

						layer_set_dup.copy(false);

						layer_set_dup.remove();

						tile_size.x = box[1].x - box[0].x;
						tile_size.y = box[1].y - box[0].y;
					}
					else
					{
						layer.copy(false);

						var box = _parse_bounds(layer.bounds);

						tile_size.x = box[1].x - box[0].x;
						tile_size.y = box[1].y - box[0].y;
					}

					break;

				case 'SELECTION':

					selection.copy(false);

					var box = _parse_bounds(selection.bounds);

					// Note, this may not match if some of the selection is empty
					tile_size.x = box[1].x - box[0].x;
					tile_size.y = box[1].y - box[0].y;

					break;
			}

			return true;
		}
		catch(e)
		{
			return false;
		}
	}


	/**
	 * Create a new Image Document
	 *
	 * @return {Boolean}
	 */
	var _create_image = function()
	{
		try
		{
			var doc_x = tile_size.x * settings.cols;
			var doc_y = tile_size.y * settings.rows;

			if(settings.gap)
			{
				doc_x += settings.gap * (settings.cols - 1);
				doc_y += settings.gap * (settings.rows - 1);
			}

			preview_doc = app.documents.add(doc_x, doc_y, doc.resolution, "Tile Preview");

			preview_doc.artLayers.add();
			preview_doc.backgroundLayer.remove();

			return true;
		}
		catch(e)
		{
			return false;
		}
	}


	/**
	 * Paste the tiles into the new image
	 *
	 * This pastes the source tile into the new image in a grid. Because PS
	 * always pastes as a new layer, we merge as we go.
	 *
	 * @return {boolean}
	 */
	var _create_tiles = function()
	{
		try
		{
			var doc_x  = parseInt(preview_doc.width);
			var doc_y  = parseInt(preview_doc.height);

			for(var y = 0; y < doc_y; y += tile_size.y)
			{
				for(var x = 0; x < doc_x; x += tile_size.x)
				{
					var area = [
						[x, y],
						[x + tile_size.x, y],
						[x + tile_size.x, y + tile_size.y],
						[x, y + tile_size.y]
					];

					preview_doc.selection.select(area);
					preview_doc.paste(true).merge();
				}
			}

			return true;
		}
		catch(e)
		{
			return false;
		}
	}


	/**
	 * Highlight one tile
	 *
	 * This function creates a new layer, then adds a 1px square around the edge
	 * of the first tile coordinates. (Helps to show where the pattern ends)
	 *
	 * @return {Boolean}
	 */
	var _highlight_tile = function()
	{
		try
		{
			var fuscia = new SolidColor();
			    fuscia.rgb.hexValue = "FF00FF";

			var doc_x = parseInt(preview_doc.width);
			var doc_y = parseInt(preview_doc.height);

			var layer2 = preview_doc.artLayers.add();

			var area = [
				[0, 0],
				[tile_size.x, 0],
				[tile_size.x, tile_size.y],
				[0, tile_size.y]
			];

			preview_doc.activeLayer = layer2;
			preview_doc.selection.select(area);
			preview_doc.selection.stroke(fuscia, 1, StrokeLocation.INSIDE);
			preview_doc.selection.deselect();

			return true;
		}
		catch(e)
		{
			return false;
		}

	}


	/**
	 * Parse a Photoshop bounds array of UnitValues
	 *
	 * Takes an array of 4 UnitValues (e.g. 20 px), and parses them into an
	 * array of 2 vector objects.
	 *
	 * @param  {array} bounds array of 4 UnitValues
	 *
	 * @return {array}
	 */
	var _parse_bounds = function(bounds)
	{
		var coords = [ {x:0,y:0}, {x:0,y:0} ];

		coords[0].x = parseInt(bounds[0]);
		coords[0].y = parseInt(bounds[1]);
		coords[1].x = parseInt(bounds[2]);
		coords[1].y = parseInt(bounds[3]);

		return coords;
	}


	/**
	 * Notification Handler
	 *
	 * Launches a notification alert or confirmation box with a given message.
	 *
	 * @param  {String} msg   message to display
	 * @param  {String} title dialog box title
	 * @param  {Boolean} yesno show confirmation box (and return result) [default: false]
	 *
	 * @return {Boolean}       only for confirmation boxes
	 */
	var _notify = function(msg, title, yesno)
	{
		yesno = yesno || false;

		if(yesno) { return confirm(msg, title, false); }
		else      { alert(msg, title); }
	}


	/**
	 * Confirm version is Adobe Photoshop CC 2015 (v16) or higher
	 *
	 * @return {Boolean}
	 */
	var _minimum_version = function()
	{
		return (parseInt(version, 10) >= 16)
	}


	/**
	 * Confirm that a document is open
	 *
	 * @return {Boolean}
	 */
	var _open_document = function()
	{
		return (documents.length)
	}


	/**
	 * Deconstructor
	 */
	var _end = function()
	{
		// restore original settings
		preferences.rulerUnits = units;

		// re-focus original image
		app.activeDocument = doc;
	}

	/**
	 * Add an active check to the selection Object
	 *
	 * @return {boolean} if selection is active
	 */
	Selection.prototype.active = function()
	{
		try      { return (selection.bounds) ? true : false; }
		catch(e) { return false; }
	}


	// Run initialization (constructor)
	// don't report error on user cancel
	_init();

	// Run deconstructor
	_end()


}(TILE.Preview = {}, app));
