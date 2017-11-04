// Main Entry Point : Orisim3D
// NodeJS dependencies : import them before Orisim3d.js
if (NODE_ENV === true && typeof module !== 'undefined' && module.exports) {
  var Model = require('./Model.js');
  var View2d = require('./View2d.js');
  var View3dThree = require('./View3dThree.js');
  var Command = require('./Command.js');
  var CommandArea = require('./CommandArea.js');
}

// Main Module
var Orisim3d = function Orisim3d(model, view2d, View3dThree, command) {
  // Instance variables
  this.model  = model;
  this.view2d = view2d;
  this.view3d = View3dThree;
  this.command = command;
};

// Class methods
Orisim3d.prototype.constructor = Orisim3d;

// Main startup
if (typeof window !== 'undefined') {
  window.addEventListener("load", completed );
}

function completed () {
  window.removeEventListener( "load", completed );

  // Create model, Command, then lookup view2d, view3d, textarea
  var model = new Model([-200, -200, 200, -200, 200, 200, -200, 200]);
  var command      = new Command(model);
  var canvas2d     = window.document.getElementById('canvas2d');
  var view2d       = canvas2d ? new View2d(model, canvas2d) : null;
  var canvas3d     = window.document.getElementById('canvas3d');
  var view3d       = canvas3d ? new View3dThree(model) : null;
  var commandarea  = window.document.getElementById('commandarea');
  commandarea ? new CommandArea(command, commandarea) : null;

  // Bind all in OriSim3d
  orisim3d = new Orisim3d(model, view2d, view3d, command);

  // Launch animation
  requestAnimationFrame(loop);
}

// Animation loop
function loop() {
  // If model has changed
  if (orisim3d.model.change) {
    if (orisim3d.view2d !== null) {
      orisim3d.view2d.draw();
    }
    if (orisim3d.view3d !== null) {
      orisim3d.view3d.update(orisim3d.model);
    }
    // command.anim() returns true while animation in progress, and false at the end
    orisim3d.model.change = !!orisim3d.command.anim()
  }
  orisim3d.view3d.render();
  requestAnimationFrame(loop);
}

// Just for Node.js
if (NODE_ENV === true && typeof module !== 'undefined' && module.exports) {
  module.exports = Orisim3d;
}
