# Substrates
Available at [palmdrop.github.io/substrates](https://palmdrop.github.io/substrates/)

![Screenshot](/.github/images/screenshot2.png)

An experimental project for creating dynamic noise effects. Visual programming on the web. A more general solution to my previous [*Surfaces* projects](https://github.com/palmdrop/surfaces).

I got tired of manually editing code to achieve various noise and domain warping effects, and although it would probably have been faster and easier to learn to use software such as Touch Designer, I liked the idea of building a tool of my own, specifically designed for the noise and domain warping effects I love to play around with.

The project is unfinished and occasionally buggy, and will probably remain that way for a long time. But hopefully, after some time of sporadic work, I'll solve all the issues, and add all the missing functionality.

## Usage
The application uses a visual programming language, where the only real requirement is to feed the `OUTPUT` node with a color. The color value will be evaluated for each pixel in the viewport.

Use the program by dragging nodes from the `palette` side panel. I suggest you start with the `generator` nodes. These nodes usually output a floating point value. Connect this output value to the `hsv to rgb` node (found in the `color` dropdown), and the output of the `hsv to rgb` node to the `OUTPUT` node color value. You should at this point see something on the screen.

When a node is selected, you can change the parameters in the left sidebar. If no node is selected, this will default to the `OUTPUT` node settings.

### Node types
These are the different node types:
* generator - outputs a value for each pixel.
* input - takes external input (such as an image) and outputs a value.
* math - takes some input values and performs various operations.
* color - nodes for working with colors. 
* warp - nodes used for domain warping (displacing).

A note on `warp` nodes: A warp node outputs a 3-dimensional vector (a point in 3D space). Each `generator` and `input` node optionally takes a `point` argument. This argument is used to determine which point in space to sample. Input the `warp` output here. If the `point` argument is omitted, it will default to a position determined based on the pixel coordinate. 

### Shortcuts
* `H` - Hide/show the nodes.
* `C` - Center the nodes.
* `F` - Tries to fit the nodes into the available screen space.
* `CTRL-Z` - Undo the last action.
* `S` - Save the current node setup.
* `P` - Capture the current frame.
* `DELETE` - Delete the selected node (`OUTPUT` node cannot be deleted).

## Backlog
My personal backlog. Items in no particular priority order.

### Functionality
- [X] Make it possible to save images along with the program.
- [ ] Implement redo.
- [ ] Generic node that accepts any GLSL.
- [ ] Option to output/download final shader code.
- [ ] "Presets" to easily explore different effects.
- [ ] Ellipse node.
- [ ] Grid node.
- [ ] Feedback node
- [ ] Normal node (sample 4 points minimum, output a color value that represents the normal of a specific point).
- [ ] Nodes for extracting RGB channel values.
- [ ] Ability to "publish" or "share" a configuration.
- [ ] Multi-selection for nodes

### Fixes
- [X] Fix undo for images.
- [ ] Changing speed should only change time increment, not time multiplier.

### Improvements
- [ ] Refactor `InterfaceRenderer` and `InterfaceController` to be more modular. It's difficult and messy to add/change things at the moment.
- [ ] Optimize click detection using a grid or quadtree.
- [ ] Cull nodes outside of the viewport.
- [ ] Add snapping to more easily connect nodes.
- [ ] Clean up and expose shader builder internals as a separate NPM package.
- [ ] Improve the user interface (styling, usability, etc).

## Tools
- [Three.js](https://github.com/mrdoob/three.js/) - No 3D functionality exist, but the library is used to easily set up a rendering context.
- [Svelte](https://github.com/sveltejs/svelte)

## Credits
- Font - [Syne typeface](https://gitlab.com/bonjour-monde/fonderie/syne-typeface/-/tree/master)

## Contact and social media
:computer: [Website](https://palmdrop.site)

:mailbox_with_mail: [Email](mailto:anton@exlex.se)

:camera: [Instagram](https://www.instagram.com/palmdrop/)