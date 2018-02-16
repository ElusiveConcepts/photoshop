# Photoshop Scripts and Plug-ins
A collection of scripts and plug-ins developed for working with photoshop.

## Scripts
Scripts are like Photoshop actions, but a little more robust, easily installed, and transferrable. Made with the ExtendScript Toolkit, these scripts are essentially an application specific JavaScript. Anyone with a familiarity with JavaScript should have little difficulty in working with ExtendScript.

Documentation on creating and editing Photoshop scripts can be found at https://www.adobe.com/devnet/photoshop/scripting.html.

### Installation:
To install the scripts, you need only copy the `*.jsx` or `*.jsxbin` file to the Scripts directory in your Photoshop presets folder. Note that Photoshop does not provide a user preset folder for scripts, and will not recognize one if you create it, so scripts must go in the application presets folder. See below for OS specific instruction locations. Once installed, restart Photoshop.

#### Windows
The "Scripts" folder is generally located at:
```
%ProgramFiles%\Adobe\Adobe Photoshop [version]\Presets\Scripts
```

#### macOS
The "Scripts" folder is generally located at:
```
/Applications/Adobe Photoshop CC [version]/Presets/Scripts
```

#### Alternative Installation
In reality, scripts can be run from anywhere, so you may install the script at a location of your choosing. It will not appear in the Scripts menu, however, and you will need to select: `File > Scripts > Browse`, then navigate to the location of the script and select it to run it.

### Usage
Open Photoshop, load your image, and then from the application menu select: `File > Scripts > [script]` to run the script.

## Script Definitions

### Tile Preview [ _Tile Preview.jsx_ ]
This script uses the existing selection, active layer, or active image (in order of preference) as a source to generate a new image tiled with the selection. This makes it fairly simple to quickly test a working image to see how it tiles, especially useful for making textures and tile maps for games. The preview will be a 5x5 grid of the given selection, layer, or image.

Options exist in the script for changing the following features, see the "settings" object variable.
* Number of tile columns and rows.
* Whether or not to add a gap between tiles.
* Turn off the first tile highlight box.
