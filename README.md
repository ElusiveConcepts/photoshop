# Photoshop Scripts and Plug-ins
A collection of scripts and plug-ins developed for working with photoshop.

## Scripts
Scripts are like Photoshop actions, but a little more robust. For documentation on creating and editing photoshop scripst, see: https://www.adobe.com/devnet/photoshop/scripting.html

### Installation
#### Windows
1. Copy script file to your Photoshop application scripts directory. This is generally located at:
   %ProgramFiles%\Adobe\Adobe Photoshop [version]\Presets\Scripts
   * _Note: Generally you would place user files in your user presets, but Photoshop doesn't provide one for Scripts
2. Restart Photoshop
3. From the application menu, select: File > Scripts > [script]

#### Mac
1. Copy script file to ~/Library/Application Support/Adobe/Adobe Photoshop [version]/Presets/Scripts
1. Copy script file to your Photoshop application scripts directory. This is generally located at:
   /Applications/Adobe Photoshop CC [version]/Presets/Scripts
   * _Note: Generally you would place user files in your user presets, but Photoshop doesn't provide one for Scripts
2. Restart Photoshop
3. From the application menu, select: File > Scripts > [script]

### Script Definitions

#### Tile Preview [ _Tile Preview.jsx_ ]
This script uses the existing selection, active layer, or active image (in order of preference) as a source to generate a new image tiled with the selection.
This makes it fairly simple to quickly test a working image to see how it tiles, especially useful for making textures and tile maps for games.
The preview will always be 5x5 of the given selection, layer, or image.
