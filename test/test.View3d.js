// file 'test/test.View3d.js
// run with $ mocha --ui qunit
// or $ mocha or $ npm test or open test.html
// Use https://github.com/stackgl/headless-gl
// npm install gl --save-dev
NODE_ENV = true;

// Dependencies : import them before Model in browser
if (typeof module !== 'undefined' && module.exports) {
  var Model   = require('../js/Model.js');
  var View3d   = require('../js/View3d.js');
}
function ok(expr, msg) {
  if (!expr) throw new Error(msg);
}
if (typeof window !== 'undefined') {
  window.addEventListener("load", completed );
}
var view3d  = null;
function completed () {
  window.removeEventListener("load", completed);
  var model = new Model();
  model.init([-200, -200, 200, -200, 200, 200, -200, 200]);
  model.splitBy(model.points[0], model.points[2]);
  model.rotate(model.segments[4], 45, [model.points[1]]);
  var canvas3d = window.document.getElementById('canvas3d');
  // Set View3d
  view3d   = canvas3d ? new View3d(model, canvas3d) : null;
  view3d.initBuffers();
  // First draw
  view3d.draw();
  // Animation
  requestAnimationFrame(loop);
}
// Animation loop
function loop() {
  view3d.draw();
  requestAnimationFrame(loop);
}

// Unit tests using Mocha
suite('View3d');
before(function () {
  // runs before all test in this block
});
test('init', function () {
  var model = new Model();
  model.init([-200, -200, 200, -200, 200, 200, -200, 200]);
  model.splitBy(model.points[0], model.points[2]);
  model.rotate(model.segments[4], 45, [model.points[1]]);

  // TODO
  var width = 64, height = 64;
  var gl = require('gl')(width, height, { preserveDrawingBuffer: true })

  // Clear screen
  gl.clearColor(1, 0, 0, 1)
  gl.clear(gl.COLOR_BUFFER_BIT)

  // Read
  var pixels = new Uint8Array(width * height * 4)
  gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels)
});
