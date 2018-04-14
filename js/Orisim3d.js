// Main Entry Point : Orisim3D
// NodeJS dependencies : import them before Orisim3d.js
if (typeof require === 'function') { // test for nodejs environment
  var OR = OR || {};
  OR.Model = require('./Model.js');
  OR.View2d = require('./View2d.js');
  OR.View3d = require('./View3d.js');
  OR.Command = require('./Command.js');
  OR.CommandArea = require('./CommandArea.js');
}

// Main Module
function Orisim3d(model, view2d, view3d, command) {
  // Instance variables
  this.model  = model;
  this.view2d = view2d;
  this.view3d = view3d;
  this.command = command;
}

// Main startup
if (typeof window !== 'undefined') {
  window.addEventListener("load", completed );
}

function completed () {
  window.removeEventListener( "load", completed );

  // Create model, Command, then lookup view2d, view3d, textarea
  var model = new OR.Model();
  model.init([-200, -200, 200, -200, 200, 200, -200, 200]);
  var command      = new OR.Command(model);
  var canvas2d     = window.document.getElementById('canvas2d');
  var view2d       = canvas2d ? new View2d(model, canvas2d) : null;
  var canvas3d     = window.document.getElementById('canvas3d');
  var view3d       = canvas3d ? new View3d(model, canvas3d) : null;
  var commandarea  = window.document.getElementById('commandarea');
  commandarea ? new CommandArea(command, commandarea) : null;

  // Bind all in OriSim3d
  OR.orisim3d = new Orisim3d(model, view2d, view3d, command);

  // Read tag and launch
  var tag = document.getElementById("cocotte.txt");
  OR.orisim3d.command.command(tag.textContent);

  // Launch animation
  requestAnimationFrame(loop);
}

// Animation loop
function loop() {
  if (OR.orisim3d.model.change) {
    if (OR.orisim3d.view2d !== null) {
      OR.orisim3d.view2d.draw();
    }
    if (OR.orisim3d.view3d !== null) {
      OR.orisim3d.view3d.initBuffers();
    }
    // !! convert to boolean (should not be necessary)
    OR.orisim3d.model.change = !!OR.orisim3d.command.anim()
  }
  OR.orisim3d.view3d.draw();
  requestAnimationFrame(loop);
}

// Just for Node.js
if (typeof exports !== 'undefined') {
  module.exports = Orisim3d;
}
