// Main Entry Point : Orisim3D
// NodeJS dependencies : import them before Orisim3d.js
if (typeof module !== 'undefined' && module.exports) {
  var Model = require('./Model.js');
  var View2d = require('./View2d.js');
  var View3d = require('./View3d.js');
  var Command = require('./Command.js');
  var CommandArea = require('./CommandArea.js');
}

// Main Module
function Orisim3d(model, view2d, view3d) {
  // Instance variables
  this.model  = model;
  this.view2d = view2d;
  this.view3d = view3d;
}

// Class methods
Orisim3d.prototype = {
  constructor:Orisim3d
};

// Global
var orisim3d = {};

// Main startup
if (typeof window !== 'undefined') {
  window.onload = function () {
    // Create model, Command, then lookup view2d, view3d, textarea
    var model = new Model();
    model.init([-200, -200, 200, -200, 200, 200, -200, 200]);
    var command      = new Command(model);
    orisim3d.command = command;
    var canvas2d     = window.document.getElementById('canvas2d');
    var view2d       = canvas2d ? new View2d(model, canvas2d) : null;
    var canvas3d     = window.document.getElementById('canvas3d');
    var canvas3dtext = window.document.getElementById('canvas3dtext');
    var view3d       = canvas3d ? new View3d(model, canvas3d, canvas3dtext) : null;
    var commandarea  = window.document.getElementById('commandarea');
    var textArea     = commandarea ? new CommandArea(command, commandarea) : null;

    // Bind all in OriSim3d
    new Orisim3d(model, view2d, view3d);

    var first = true;

    // Animation loop
    function loop() {
      if (first) {
        // Read Cocotte Script
        // command.command("read script cocotte"); // For model buddled in html
        // command.command("read models/cocotte.txt"); // For xhr
        first = false;
      }
      if (model.change) {
        if (view2d !== null) {
          view2d.draw();
        }
        if (view3d !== null) {
          view3d.initBuffers();
        }
        model.change = !!command.anim()
      }
      // Always redraw view3d ?
      view3d.draw();
      requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);
  }
}

// Just for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Orisim3d;
}
