# Photoshop Scripts and Plug-ins
A collection of scripts and plug-ins developed for working with photoshop.

## Scripts
Scripts are like Photoshop actions, but a little more robust. For documentation on creating and editing photoshop scripst, see: https://www.adobe.com/devnet/photoshop/scripting.html

### Installation
#### Windows
1. Copy script file to %appdata%\Adobe\Adobe Photoshop [version]\Presets\Scripts
..* _You may need to create this folder_
2. Restart Photoshop
3. From the application menu, select: File > Scripts > [script]

#### Mac
1. Copy script file to ~/Library/Application Support/Adobe/Adobe Photoshop [version]/Presets/Scripts
..* _You may need to create this folder_
2. Restart Photoshop
3. From the application menu, select: File > Scripts > [script]

### Script Definitions

#### Tile Preview _Tile Preview.jsx_
This script uses the existing selection, active layer, or active image (in order of preference) as a source to generate a new image tiled with the selection.
This makes it fairly simple to quickly test a working image to see how it tiles, especially useful for making textures and tile maps for games.
The preview will always be 5x5 of the given selection, layer, or image.
