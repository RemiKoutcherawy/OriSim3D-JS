// Main Entry Point : Orisim3D
"use strict";
// NodeJS dependencies : import them before Orisim3d.js
if (typeof module !== 'undefined' && module.exports) {
  var Model = require('./Model.js');
  var View2d = require('./View2d.js');
  var View3d = require('./View3d.js');
  var Command = require('./Command.js');
  var CommandArea = require('./CommandArea.js');
}

// Main startup
// Browser dependencies : import them before Orisim3d.js in browser
if (typeof window !== 'undefined') {
  window.onload = function () {
    // Create model, Command, then lookup view2d, view3d, textarea
    let model = new Model();
    model.init([-200, -200, 200, -200, 200, 200, -200, 200]);
    let command     = new Command(model);
    let canvas2d = window.document.getElementById('canvas2d');
    let view2d = canvas2d ? new View2d(model, canvas2d): null;
    let canvas3d = window.document.getElementById('canvas3d');
    let canvas3dtext = window.document.getElementById('canvas3dtext');
    let view3d = canvas3d ? new View3d(model, canvas3d, canvas3dtext ) : null;
    let commandarea = window.document.getElementById('commandarea');
    let textArea = commandarea ? new CommandArea(command, commandarea) : null;

    // Bind all in OriSim3d
    new Orisim3d(model, view2d, view3d);

    // Animation loop
    function loop() {

      if (model.change ){
        if (view2d !== null) {
          view2d.draw();
        }
        if (view3d !== null){
          view3d.initBuffers();
        }
        model.change = !!command.anim() || view3d.wTexFront === 0;
      }
      // Always redraw view3d ?
      view3d.draw();
      requestAnimationFrame(loop);
    }
    // model.change = true;
    requestAnimationFrame(loop);
  }
}

// Node.JS unit tests no Window
// > node js/Orisim3d.js
else {
  let assert  = require("assert");
  let model = new Model();
  model.init([-200,-200, 200,-200, 200,200, -200,200]);
  let or = new Orisim3d(model);
  // No View2d
  assert(or.model.points.length === 4, "4 Points");
  assert(or.model.segments.length === 4, "4 Segment");
  assert(or.model.faces.length === 1, "1 Face");
}

// Main Module
function Orisim3d (model, view2d, view3d) {
  // Instance variables
  this.model = model;
  this.view2d = view2d;
  this.view3d = view3d;
}

// Class methods
Orisim3d.prototype = {
  constructor: Orisim3d
};

// Just for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Orisim3d;
}
