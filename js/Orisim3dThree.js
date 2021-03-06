// Main Entry Point : Orisim3D
// NodeJS dependencies : import them before Orisim3d.js
if (NODE_ENV === true && typeof module !== 'undefined' && module.exports) {
  var OR = OR || {};
  OR.Model = require('./Model.js');
  OR.View2d = require('./View2d.js');
  OR.View3dThree = require('./View3dThree.js');
  OR.Command = require('./Command.js');
  OR.CommandArea = require('./CommandArea.js');
}

// Main Module
function Orisim3d(model, view2d, View3dThree, command) {
  // Instance variables
  this.model  = model;
  this.view2d = view2d;
  this.view3d = View3dThree;
  this.command = command;
}
// Main startup
if (typeof window !== 'undefined') {
  window.addEventListener("load", completed );
}

function completed () {
  window.removeEventListener( "load", completed );

  // Create model, Command, then lookup view2d, view3d, textarea
  var model = new OR.Model([-200, -200, 200, -200, 200, 200, -200, 200]);
  var command      = new OR.Command(model);
  var canvas2d     = window.document.getElementById('canvas2d');
  var view2d       = canvas2d ? new View2d(model, canvas2d) : null;
  var canvas3d     = window.document.getElementById('canvas3d');
  var view3d       = canvas3d ? new View3dThree() : null;
  var commandarea  = window.document.getElementById('commandarea');
  commandarea ? new CommandArea(command, commandarea) : null;

  // Bind all in OriSim3d
  OR.orisim3d = new Orisim3d(model, view2d, view3d, command);
  var tag = document.getElementById("cocotte.txt");
  OR.orisim3d.command.command(tag.textContent);

  // Launch animation
  requestAnimationFrame(loop);
}

// Animation loop
function loop() {
  // If model has changed
  if (OR.orisim3d.model.change) {
    if (OR.orisim3d.view2d !== null) {
      OR.orisim3d.view2d.draw();
    }
    if (OR.orisim3d.view3d !== null) {
      OR.orisim3d.view3d.update(OR.orisim3d.model);
    }
    // command.anim() returns true while animation in progress, and false at the end
    // !! convert value to boolean
    OR.orisim3d.model.change = !!OR.orisim3d.command.anim()
  }
  OR.orisim3d.view3d.render();
  requestAnimationFrame(loop);
}

// Just for Node.js
if (NODE_ENV === true && typeof module !== 'undefined' && module.exports) {
  module.exports = Orisim3d;
}
