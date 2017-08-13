// File: js/Command.js
// Dependencies : import them before Command.js in browser
if (typeof module !== 'undefined' && module.exports) {
  var Model        = require('./Model.js');
  var Interpolator = require('./Interpolator.js');
}

// Interprets a list of commands, and apply them on Model
function Command(model) {
  this.model        = model;
  this.toko         = [];
  this.done         = [];
  this.iTok         = 0;
  // State machine
  this.state        = State.idle;
  // Time interpolated at instant 'p' preceding and at instant 'n' current
  this.tni          = 1;
  this.tpi          = 0;
  this.interpolator = Interpolator.LinearInterpolator;
  // scale, ctx, cy, cz used in ZoomFit
  this.za           = [0, 0, 0, 0];
  // Interpolator used in anim() to map tn (time normalized) to tni (time interpolated)
  this.interpolator = Interpolator.LinearInterpolator;
  // Coefficient to multiply value given in Offset commands
  this.kOffset = 1; // 0.2 for real rendering, can be 10 to debug
}

// Static values
const State = {idle:0, run:1, anim:2, pause:3, undo:4};
// console.log(Object.keys(State)[1]); // run

// Class methods
Command.prototype = {
  constructor:Command,

  // Tokenize, split the String in this.toko Array of String @testOK
  tokenize:function (input) {
    var text  = input.replace(/[\);]/g, ' rparent');
    text      = text.replace(/,/g, ' ');
    text      = text.replace(/\/\/.*$/mg, '');
    this.toko = text.split(/\s+/);
    this.iTok = 0;
    return this.toko;
  },

  // Read a File @testOK
  readfile:function (filename) {
    var text = null;
    // If we are in NodeJS fs is required
    if (typeof require !== 'undefined') {
      const fs = require('fs');
      text     = fs.readFileSync(filename, 'utf-8');
    }
    // If we are in browser XHR or Script embedded
    else {
      const request = new XMLHttpRequest();
      request.onreadystatechange = function () {
        if (request.readyState === XMLHttpRequest.DONE && request.status === 200) {
          const type = request.getResponseHeader("Content-Type");
          if (type.match(/^text/)) { // Make sure response is text
            text = request.responseText;
          }
        } else if (request.readyState !== XMLHttpRequest.OPENED) {
          console.log("Error ? state:" + request.readyState + " status:" + request.status);
        }
      };
      // XMLHttpRequest.open(method, url, async)
      // Here async = false ! => Warning from Firefox, Chrome,
      request.open('GET', filename, false);
      request.send(null);
    }
    if (text === null) {
      console.log("Error reading:" + filename);
    }
    return text;
  },

  // Execute one command token on model
  execute:function () {
    // Commands
    // "d : define" @testOK
    if (this.toko[this.iTok] === "d" || this.toko[this.iTok] === "define") {
      // Define sheet by N points x,y CCW
      this.iTok++;
      var list = [];
      while (Number.isInteger(Number(this.toko[this.iTok]))) {
        list.push(this.toko[this.iTok++]);
      }
      this.model.init(list);
    }
    // Origami splits
    // "b : by" @testOK
    else if (this.toko[this.iTok] === "b" || this.toko[this.iTok] === "by") {
      // Split by two points
      this.iTok++;
      var a = this.model.points[this.toko[this.iTok++]];
      var b = this.model.points[this.toko[this.iTok++]];
      this.model.splitBy(a, b);
    }
    // "c : cross"  @testOK
    else if (this.toko[this.iTok] === "c" || this.toko[this.iTok] === "cross") {
      // Split across two points all (or just listed) faces
      this.iTok++;
      var a = this.model.points[this.toko[this.iTok++]];
      var b = this.model.points[this.toko[this.iTok++]];
      this.model.splitCross(a, b);
    }
    // "p : perpendicular"  @testOK
    else if (this.toko[this.iTok] === "p" || this.toko[this.iTok] === "perpendicular") {
      // Split perpendicular of line by point
      this.iTok++;
      var s = this.model.segments[this.toko[this.iTok++]];
      var p = this.model.points[this.toko[this.iTok++]];
      this.model.splitOrtho(s, p);
    }
    // "lol : LineOnLine" TODO test
    else if (this.toko[this.iTok] === "lol" || this.toko[this.iTok] === "lineonline") {
      // Split by a plane passing between segments
      this.iTok++;
      var s0 = this.model.segments[this.toko[this.iTok++]];
      var s1 = this.model.segments[this.toko[this.iTok++]];
      this.model.splitLineToLine(s0, s1);
    }
    // Segment split TODO test
    // "s : split seg numerator denominator"
    else if (this.toko[this.iTok] === "s" || this.toko[this.iTok] === "split") {
      // Split set by N/D
      this.iTok++;
      var s = this.model.segments[this.toko[this.iTok++]];
      var n = this.toko[this.iTok++];
      var d = this.toko[this.iTok++];
      this.model.splitSegmentByRatio(s, n / d);
    }

    // Animation commands use tni tpi
    // " r : rotate Seg Angle Points"
    else if (this.toko[this.iTok] === "r" || this.toko[this.iTok] === "rotate") {
      // Rotate Seg Angle Points with animation
      this.iTok++;
      var s     = this.model.segments[this.toko[this.iTok++]];
      var angle = (this.toko[this.iTok++] * (this.tni - this.tpi));
      var list  = this.listPoints();
      this.model.rotate(s, angle, list);
    }
    // "f : fold to angle"
    else if (this.toko[this.iTok] === "f" || this.toko[this.iTok] === "fold") {
      this.iTok++;
      var s = this.model.segments[this.toko[this.iTok++]];
      // Cache current angle at start of animation
      if (this.tpi === 0)
        this.angleBefore = this.model.computeAngle(s);
      var angle = ((this.toko[this.iTok++] - this.angleBefore) * (this.tni - this.tpi));
      var list = this.listPoints();
      // Reverse segment to have the first point on left face
      if (this.tpi === 0 && this.model.faceRight(s.p1, s.p2).points.indexOf(list[0]) !== -1)
        s.reverse();
      this.model.rotate(s, angle, list);
    }

    // Adjust all or listed points
    // "a : adjust"
    else if (this.toko[this.iTok] === "a" || this.toko[this.iTok] === "adjust") {
      // Adjust Points in 3D to fit 3D length
      this.iTok++;
      var list  = this.listPoints();
      var liste = list.length === 0 ? this.model.points : list;
      var dmax = this.model.adjustList(liste);
    }

    // Offsets
    // "o : offset"
    else if (this.toko[this.iTok] === "o" || this.toko[this.iTok] === "offset") {
      // Offset by dz the list of faces : o dz f1 f2...
      this.iTok++;
      var dz = this.toko[this.iTok++] * this.kOffset;
      var list  = this.listFaces();
      this.model.offset(dz, list);
    }

    // Moves
    // "m : move dx dy dz pts"
    else if (this.toko[this.iTok] === "m" || this.toko[this.iTok] === "move") {
      // Move 1 point by dx,dy,dz in 3D with Coefficient for animation
      this.iTok++;
      this.model.move(this.toko[this.iTok++] * (this.tni - this.tpi)
        , this.toko[this.iTok++]* (this.tni - this.tpi)
        , this.toko[this.iTok++] * (this.tni - this.tpi)
        , this.model.points);
    }
    // "mo : move on"
    else if (this.toko[this.iTok] === "mo") {
      // Move all points on one with animation
      this.iTok++;
      var p0 = this.model.points.get(this.toko[this.iTok++]);
      var k2 = ((1 - this.tni) / (1 - this.tpi));
      var k1 = (this.tni - this.tpi * k2);
      this.model.moveOn(p0, k1, k2, this.model.points);
    }

    // Turns
    // "tx : TurnX angle"
    else if (this.toko[this.iTok] === "tx") {
      this.iTok++;
      this.model.turn(1, Number(this.toko[this.iTok++]) * (this.tni - this.tpi));
    }
    // "ty : TurnY angle"
    else if (this.toko[this.iTok] === "ty") {
      this.iTok++;
      this.model.turn(2, Number(this.toko[this.iTok++]) * (this.tni - this.tpi));
    }
    // "tz : TurnZ angle"
    else if (this.toko[this.iTok] === "tz") {
      this.iTok++;
      this.model.turn(3, Number(this.toko[this.iTok++]) * (this.tni - this.tpi));
    }

    // Zooms
    // "z : Zoom scale x y" The zoom is centered on x y z=0
    else if (this.toko[this.iTok] === "z") {
      this.iTok++;
      var scale   = this.toko[this.iTok++];
      var x = this.toko[this.iTok++];
      var y = this.toko[this.iTok++];
      // for animation
      var ascale  = ((1 + this.tni * (scale - 1)) / (1 + this.tpi * (scale - 1)));
      var bfactor = (scale * (this.tni / ascale - this.tpi));
      this.model.move(x * bfactor, y * bfactor, 0, null);
      this.model.scaleModel(ascale);
    }
    // "zf : Zoom Fit"
    else if (this.toko[this.iTok] === "zf") {
      this.iTok++;
      if (this.tpi === 0) {
        var b      = this.model.get3DBounds();
        var w      = 400;
        this.za[0] = w / Math.max(b[2] - b[0], b[3] - b[1]);
        this.za[1] = -(b[0] + b[2]) / 2;
        this.za[2] = -(b[1] + b[3]) / 2;
      }
      var scale   = ((1 + this.tni * (this.za[0] - 1)) / (1 + this.tpi * (this.za[0] - 1)));
      var bfactor = this.za[0] * (this.tni / scale - this.tpi);
      this.model.move(this.za[1] * bfactor, this.za[2] * bfactor, 0, null);
      this.model.scaleModel(scale);
    }

    // Interpolators
    else if (this.toko[this.iTok] === "il") { // "il : Interpolator Linear"
      this.iTok++;
      this.interpolator = Interpolator.LinearInterpolator;
    }
    else if (this.toko[this.iTok] === "ib") { // "ib : Interpolator Bounce"
      this.iTok++;
      this.interpolator = Interpolator.BounceInterpolator;
    } else if (this.toko[this.iTok] === "io") { // "io : Interpolator OverShoot"
      this.iTok++;
      this.interpolator = Interpolator.OvershootInterpolator;
    }
    else if (this.toko[this.iTok] === "ia") { // "ia : Interpolator Anticipate"
      this.iTok++;
      this.interpolator = Interpolator.AnticipateInterpolator;
    }
    else if (this.toko[this.iTok] === "iao") { // "iao : Interpolator Anticipate OverShoot"
      this.iTok++;
      this.interpolator = Interpolator.AnticipateOvershootInterpolator;
    }
    else if (this.toko[this.iTok] === "iad") { // "iad : Interpolator Accelerate Decelerate"
      this.iTok++;
      this.interpolator = Interpolator.AccelerateDecelerateInterpolator;
    }
    else if (this.toko[this.iTok] === "iso") { // "iso Interpolator Spring Overshoot"
      this.iTok++;
      this.interpolator = Interpolator.SpringOvershootInterpolator;
    }
    else if (this.toko[this.iTok] === "isb") { // "isb Interpolator Spring Bounce"
      this.iTok++;
      this.interpolator = Interpolator.SpringBounceInterpolator;
    }
    else if (this.toko[this.iTok] === "igb") { // "igb : Interpolator Gravity Bounce"
      this.iTok++;
      this.interpolator = Interpolator.GravityBounceInterpolator;
    }

    // Mark points and segments
    // "select points"
    else if (this.toko[this.iTok] === "pt") {
      this.iTok++;
      this.model.selectPts(this.model.points);
    }
    // "select segments"
    else if (this.toko[this.iTok] === "seg") {
      this.iTok++;
      this.model.selectSegs(this.model.segments);
    }

    // End skip remaining tokens
    // "end" give Control back to CommandLoop
    else if (this.toko[this.iTok] === "end") {
      this.iTok = this.toko.length;
    }

    // Default should not get these
    else if (this.toko[this.iTok] === "t"
      || this.toko[this.iTok] === "rparent"
      || this.toko[this.iTok] === "u"
      || this.toko[this.iTok] === "co") {
      console.log("Warn unnecessary token :" + this.toko[this.iTok] + "\n");
      this.iTok++;
      return -1;
    } else {
      // Real default : ignore
      this.iTok++;
    }
    return this.iTok;
  },

  // Make a list from following points numbers @testOK
  listPoints:function () {
    var list = [];
    while (Number.isInteger(Number(this.toko[this.iTok]))) {
      list.push(this.model.points[this.toko[this.iTok++]]);
    }
    return list;
  },

  // Make a list from following segments numbers @testOK
  listSegments:function () {
    var list = [];
    while (Number.isInteger(Number(this.toko[this.iTok]))) {
      list.push(this.model.segments[this.toko[this.iTok++]]);
    }
    return list;
  },
  // Make a list from following faces numbers @testOK
  listFaces:function () {
    var list = [];
    while (Number.isInteger(Number(this.toko[this.iTok]))) {
      list.push(this.model.faces[this.toko[this.iTok++]]);
    }
    return list;
  },

  // Main entry Point
  // Execute list of commands
  // TODO : simplify
  command:function (cde) {
// -- State Idle tokenize list of command
    if (this.state === State.idle) {
      if (cde === "u") {
        this.toko = this.done.slice().reverse();
        this.undo(); // We are exploring this.toko[]
        return;
      }
      else if (cde.startsWith("read")) {
        var filename = cde.substring(5);
        if (filename.indexOf("script") !== -1) {
          // Expect "read script cocotte.txt" => filename="script cocotte.txt" => id="cocotte.txt"
          // With a tag <script id="cocotte.txt" type="not-javascript">d ...< /script> in html file
          var id = filename.substring(7);
          cde    = document.getElementById(id).text;
        } else {
          // Attention replace argument cde by the content of the file
          cde = this.readfile(filename.trim());
        }
        if (cde === null)
          return;
        // On success clear this.toko and use read cde
        this.done = [];
        this.undo = [];
        // Continue to Execute
      }
      else if (cde === "co" || cde === "pa") {
        // In idle, no job, continue, or pause are irrelevant
        return;
      }
      else if (cde.startsWith("d")) {
        // Starts a new folding
        this.done = [];
        this.undo = [];
      }
      // Execute
      this.toko  = this.tokenize(cde);
      this.state = State.run;
      this.iTok  = 0;
      this.commandLoop();
      return;
    }
// -- State Run execute list of command
    if (this.state === State.run) {
      this.commandLoop();
      return;
    }
// -- State Animation execute up to ')' or pause
    if (this.state === State.anim) {
      // "Pause"
      if (cde === "pa") {
        this.state = State.pause;
      }
      return;
    }
// -- State Paused in animation
    if (this.state === State.pause) {
      // "Continue"
      if (cde === "co") {
        // performance.now() vs new Date().getTime();
        this.pauseDuration = new Date().getTime() - this.pauseStart;
        // Continue animation
        //mainPane.view3d.animate(this);
        this.state = State.anim;
      }
      else if (cde === "u") {
        // Undo one step
        this.state = State.undo;
        this.undo();
      }
      return;
    }
// -- State undo
    if (this.state === State.undo) {
      if (this.undoInProgress === false) {
        if (cde === "u") {
          // Ok continue to undo
          this.undo();
        }
        else if (cde === "co") {
          // Switch back to run
          this.state = State.run;
          this.commandLoop();
        }
        else if (cde === "pa") {
          // Forbidden ignore pause
        } else {
          // A new Command can only come from Debug
          // Removes 't' or 'd'
          this.iTok--;
          // Execute
          this.toko  = this.tokenize(cde);
          this.state = State.run;
          this.iTok  = 0;
          this.commandLoop();
        }
      }
    }
  },

  // Loop to execute commands
  commandLoop:function () {
    while (this.iTok < this.toko.length) {
      // Breaks loop to launch animation on 't'
      if (this.toko[this.iTok] === "t") {
        // Time t duration ... )
        this.done.push(this.toko[this.iTok++]);
        // this.iTok will be incremented by duration = this.toko[this.iTok++]
        this.done.push(this.toko[this.iTok]);
        this.duration      = this.toko[this.iTok++];
        this.pauseDuration = 0;
        this.state         = State.anim;
        this.animStart();
        // Return breaks the loop, giving control to anim
        return;
      }
      else if (this.toko[this.iTok] === "rparent") {
        // Finish pushing command
        this.done.push(this.toko[this.iTok++]);
        continue;
      }

      var iBefore = this.iTok;

      // Execute one command
      var iReached = this.execute();

      // Push modified model
      this.pushUndo();
      // Add done commands to done list
      while (iBefore < iReached) {
        this.done.push(this.toko[iBefore++]);
      }
      // Post an event to repaint
      // The repaint will not occur till next animation, or end Cde
      this.model.change = true;
    }
    // End of command line switch to idle
    if (this.state === State.run) {
      this.state = State.idle;
    }
  },

  // Sets a flag in model which is tested in Animation loop in Orisim3d.js
  animStart:function () {
    this.model.change = true;
    this.tstart       = new Date().getTime();
    this.tpi          = 0.0;
  },

  // Called from Orisim3d.js in Animation loop
  // return true if anim should continue false if anim should end
  anim:function () {
    if (this.state === State.undo) {
      var index = this.popUndo();
      var ret   = (index > this.iTok);
      // Stop undo if undo mark reached and switch to repaint
      if (ret === false) {
        this.undoInProgress = false;
        //mainPane.repaint();
      }
      return ret;
    }
    else if (this.state === State.pause) {
      this.pauseStart = new Date().getTime();
      return false;
    }
    else if (this.state !== State.anim) {
      return false;
    }
    // We are in state anim
    var t  = new Date().getTime();
    // Compute tn varying from 0 to 1
    var tn = (t - this.tstart - this.pauseDuration) / this.duration; // tn from 0 to 1
    if (tn > 1.0)
      tn = 1.0;
    this.tni = this.interpolator(tn);

    // Execute commands just after t xxx up to including ')'
    this.iBeginAnim = this.iTok;
    while (this.toko[this.iTok] !== "rparent") {
      this.execute();
      if (this.iTok === this.toko.length) {
        console.log("Warning missing parent !");
        break;
      }
    }
    // For undoing animation
    this.pushUndo();

    // Keep t (tpi) preceding t now (tni)
    this.tpi = this.tni; // t preceding

    // If Animation is finished, set end values
    if (tn >= 1.0) {
      this.tni = 1.0;
      this.tpi = 0.0;
      // Push done
      while (this.iBeginAnim < this.iTok) {
        // Time t duration ... )
        this.done.push(this.toko[this.iBeginAnim++]);
      }
      // Switch back to run and launch next cde
      this.state = State.run;
      this.commandLoop();
      // If commandLoop has launched another animation we continue
      if (this.state === State.anim)
        return true;
      // OK we stop anim
      return false;
    }
    // Rewind to continue animation
    this.iTok = this.iBeginAnim;
    return true;
  },

  // TODO : implement
  pushUndo:function () {
  },
  popUndo:function () {
  }
};

// Just for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Command;
}
