// File: js/Command.js
// Dependencies : import them before Command.js in browser
if (NODE_ENV === true && typeof module !== 'undefined' && module.exports) {
  var OR = OR || {};
  OR.Interpolator = require('./Interpolator.js');
}

// Interprets a list of commands, and apply them on Model
OR.Command = function (modele) {
  var model        = modele;
  var toko         = [];
  var done         = [];
  var iTok         = 0;
  // State machine
  var state        = State.idle;
  // Time interpolated at instant 'p' preceding and at instant 'n' current
  var tni          = 1;
  var tpi          = 0;
  // scale, cx, cy, cz used in ZoomFit
  var za           = [0, 0, 0, 0];
  // Interpolator used in anim() to map tn (time normalized) to tni (time interpolated)
  var interpolator =  OR.Interpolator.LinearInterpolator;
  // Coefficient to multiply value given in Offset commands
  var kOffset = 1; // 0.2 for real rendering, can be 10 to debug
  //
  var undo, pauseStart, pauseDuration, duration, tstart, undoInProgress;

  var context = this;

  // Tokenize, split the String in toko Array of String @testOK
  function tokenize(input) {
    var text  = input.replace(/[\);]/g, ' rparent');
    text      = text.replace(/,/g, ' ');
    text      = text.replace(/\/\/.*$/mg, '');
    toko = text.split(/\s+/);
    iTok = 0;
    context.toko = toko;
    return toko;
  }

  // Read a File @testOK
  function readfile (filename) {
    var text = null;
    // If we are in NodeJS fs is required
    if (NODE_ENV === true && typeof require !== 'undefined') {
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
  }

  // Execute one command token on model
  function execute () {
    var list = [], a = null, b = null, angle = null, s = null, p = null;

    // Commands
    // "d : define" @testOK
    if (toko[iTok] === "d" || toko[iTok] === "define") {
      // Define sheet by N points x,y CCW
      iTok++;
      while (Number.isInteger(Number(toko[iTok]))) {
        list.push(toko[iTok++]);
      }
      model.init(list);
    }
    // Origami splits
    // "b : by" @testOK
    else if (toko[iTok] === "b" || toko[iTok] === "by") {
      // Split by two points
      iTok++;
      a = model.points[toko[iTok++]];
      b = model.points[toko[iTok++]];
      model.splitBy(a, b);
    }
    // "c : cross"  @testOK
    else if (toko[iTok] === "c" || toko[iTok] === "cross") {
      // Split across two points all (or just listed) faces
      iTok++;
      a = model.points[toko[iTok++]];
      b = model.points[toko[iTok++]];
      model.splitCross(a, b);
    }
    // "p : perpendicular"  @testOK
    else if (toko[iTok] === "p" || toko[iTok] === "perpendicular") {
      // Split perpendicular of line by point
      iTok++;
      s = model.segments[toko[iTok++]];
      p = model.points[toko[iTok++]];
      model.splitOrtho(s, p);
    }
    // "lol : LineOnLine" TODO test
    else if (toko[iTok] === "lol" || toko[iTok] === "lineonline") {
      // Split by a plane passing between segments
      iTok++;
      var s0 = model.segments[toko[iTok++]];
      var s1 = model.segments[toko[iTok++]];
      model.splitLineToLine(s0, s1);
    }
    // Segment split TODO test
    // "s : split seg numerator denominator"
    else if (toko[iTok] === "s" || toko[iTok] === "split") {
      // Split set by N/D
      iTok++;
      s = model.segments[toko[iTok++]];
      var n = toko[iTok++];
      var d = toko[iTok++];
      model.splitSegmentByRatio(s, n / d);
    }

    // Animation commands use tni tpi
    // " r : rotate Seg Angle Points"
    else if (toko[iTok] === "r" || toko[iTok] === "rotate") {
      // Rotate Seg Angle Points with animation
      iTok++;
      s     = model.segments[toko[iTok++]];
      angle = (toko[iTok++] * (tni - tpi));
      list  = listPoints();
      model.rotate(s, angle, list);
    }
    // "f : fold to angle"
    else if (toko[iTok] === "f" || toko[iTok] === "fold") {
      iTok++;
      s = model.segments[toko[iTok++]];
      // Cache current angle at start of animation
      var angleBefore = 0;
      if (tpi === 0) {
        angleBefore = model.computeAngle(s);
      }
      angle = ((toko[iTok++] - angleBefore) * (tni - tpi));
      list = listPoints();
      // Reverse segment to have the first point on left face
      if (tpi === 0 && model.faceRight(s.p1, s.p2).points.indexOf(list[0]) !== -1)
        s.reverse();
      model.rotate(s, angle, list);
    }

    // Adjust all or listed points
    // "a : adjust"
    else if (toko[iTok] === "a" || toko[iTok] === "adjust") {
      // Adjust Points in 3D to fit 3D length
      iTok++;
      list  = listPoints();
      var liste = list.length === 0 ? model.points : list;
      model.adjustList(liste);
    }

    // Offsets
    // "o : offset"
    else if (toko[iTok] === "o" || toko[iTok] === "offset") {
      // Offset by dz the list of faces : o dz f1 f2...
      iTok++;
      var dz = toko[iTok++] * kOffset;
      list  = listFaces();
      model.offset(dz, list);
    }

    // Moves
    // "m : move dx dy dz pts"
    else if (toko[iTok] === "m" || toko[iTok] === "move") {
      // Move 1 point by dx,dy,dz in 3D with Coefficient for animation
      iTok++;
      model.move(toko[iTok++] * (tni - tpi)
        , toko[iTok++]* (tni - tpi)
        , toko[iTok++] * (tni - tpi)
        , model.points);
    }
    // "mo : move on"
    else if (toko[iTok] === "mo") {
      // Move all points on one with animation
      iTok++;
      var p0 = model.points.get(toko[iTok++]);
      var k2 = ((1 - tni) / (1 - tpi));
      var k1 = (tni - tpi * k2);
      model.moveOn(p0, k1, k2, model.points);
    }

    // Turns
    // "tx : TurnX angle"
    else if (toko[iTok] === "tx") {
      iTok++;
      model.turn(1, Number(toko[iTok++]) * (tni - tpi));
    }
    // "ty : TurnY angle"
    else if (toko[iTok] === "ty") {
      iTok++;
      model.turn(2, Number(toko[iTok++]) * (tni - tpi));
    }
    // "tz : TurnZ angle"
    else if (toko[iTok] === "tz") {
      iTok++;
      model.turn(3, Number(toko[iTok++]) * (tni - tpi));
    }

    // Zooms
    // "z : Zoom scale x y" The zoom is centered on x y z=0
    else if (toko[iTok] === "z") {
      iTok++;
      var scale = toko[iTok++];
      var x = toko[iTok++];
      var y = toko[iTok++];
      // for animation
      var ascale  = ((1 + tni * (scale - 1)) / (1 + tpi * (scale - 1)));
      var bfactor = (scale * (tni / ascale - tpi));
      model.move(x * bfactor, y * bfactor, 0, null);
      model.scaleModel(ascale);
    }
    // "zf : Zoom Fit"
    else if (toko[iTok] === "zf") {
      iTok++;
      if (tpi === 0) {
        b      = model.get3DBounds();
        var w      = 400;
        za[0] = w / Math.max(b.xmax - b.xmin, b.ymax - b.ymin);
        za[1] = -(b.xmin + b.xmax) / 2;
        za[2] = -(b.ymin + b.ymax) / 2;
      }
      scale   = ((1 + tni * (za[0] - 1)) / (1 + tpi * (za[0] - 1)));
      bfactor = za[0] * (tni / scale - tpi);
      model.move(za[1] * bfactor, za[2] * bfactor, 0, null);
      model.scaleModel(scale);
    }

    // Interpolators
    else if (toko[iTok] === "il") { // "il : Interpolator Linear"
      iTok++;
      context.interpolator = OR.Interpolator.LinearInterpolator;
    }
    else if (toko[iTok] === "ib") { // "ib : Interpolator Bounce"
      iTok++;
      context.interpolator = OR.Interpolator.BounceInterpolator;
    } else if (toko[iTok] === "io") { // "io : Interpolator OverShoot"
      iTok++;
      context.interpolator = OR.Interpolator.OvershootInterpolator;
    }
    else if (toko[iTok] === "ia") { // "ia : Interpolator Anticipate"
      iTok++;
      context.interpolator = OR.Interpolator.AnticipateInterpolator;
    }
    else if (toko[iTok] === "iao") { // "iao : Interpolator Anticipate OverShoot"
      iTok++;
      context.interpolator = OR.Interpolator.AnticipateOvershootInterpolator;
    }
    else if (toko[iTok] === "iad") { // "iad : Interpolator Accelerate Decelerate"
      iTok++;
      context.interpolator = OR.Interpolator.AccelerateDecelerateInterpolator;
    }
    else if (toko[iTok] === "iso") { // "iso Interpolator Spring Overshoot"
      iTok++;
      context.interpolator = OR.Interpolator.SpringOvershootInterpolator;
    }
    else if (toko[iTok] === "isb") { // "isb Interpolator Spring Bounce"
      iTok++;
      context.interpolator = OR.Interpolator.SpringBounceInterpolator;
    }
    else if (toko[iTok] === "igb") { // "igb : Interpolator Gravity Bounce"
      iTok++;
      context.interpolator = OR.Interpolator.GravityBounceInterpolator;
    }

    // Mark points and segments
    // "select points"
    else if (toko[iTok] === "pt") {
      iTok++;
      model.selectPts(model.points);
    }
    // "select segments"
    else if (toko[iTok] === "seg") {
      iTok++;
      model.selectSegs(model.segments);
    }

    // End skip remaining tokens
    // "end" give Control back to CommandLoop
    else if (toko[iTok] === "end") {
      iTok = toko.length;
    }

    // Default should not get these
    else if (toko[iTok] === "t"
      || toko[iTok] === "rparent"
      || toko[iTok] === "u"
      || toko[iTok] === "co") {
      console.log("Warn unnecessary token :" + toko[iTok] + "\n");
      iTok++;
      return -1;
    } else {
      // Real default : ignore
      iTok++;
    }
    return iTok;
  }

  // Make a list from following points numbers @testOK
  function listPoints () {
    var list = [];
    while (Number.isInteger(Number(toko[iTok]))) {
      list.push(model.points[toko[iTok++]]);
    }
    return list;
  }

  // Make a list from following segments numbers
  function listSegments () {
    var list = [];
    while (Number.isInteger(Number(toko[iTok]))) {
      list.push(model.segments[toko[iTok++]]);
    }
    return list;
  }

  // Make a list from following faces numbers @testOK
  function listFaces () {
    var list = [];
    while (Number.isInteger(Number(toko[iTok]))) {
      list.push(model.faces[toko[iTok++]]);
    }
    return list;
  }

  // Main entry Point
  // Execute list of commands
  // TODO : simplify
  function command (cde) {
// -- State Idle tokenize list of command
    if (state === State.idle) {
      if (cde === "u") {
        toko = done.slice().reverse();
        // undo(); // We are exploring toko[]
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
          cde = readfile(filename.trim());
        }
        if (cde === null)
          return;
        // On success clear toko and use read cde
        done = [];
        undo = [];
        // Continue to Execute
      }
      else if (cde === "co" || cde === "pa") {
        // In idle, no job, continue, or pause are irrelevant
        return;
      }
      else if (cde.startsWith("d")) {
        // Starts a new folding
        done = [];
        undo = [];
      }
      // Execute
      toko  = tokenize(cde);
      state = State.run;
      iTok  = 0;
      commandLoop();
      return;
    }
// -- State Run execute list of command
    if (state === State.run) {
      commandLoop();
      return;
    }
// -- State Animation execute up to ')' or pause
    if (state === State.anim) {
      // "Pause"
      if (cde === "pa") {
        state = State.pause;
      }
      return;
    }
// -- State Paused in animation
    if (state === State.pause) {
      // "Continue"
      if (cde === "co") {
        // performance.now() vs new Date().getTime();
        pauseDuration = new Date().getTime() - pauseStart;
        // Continue animation
        commandLoop();
        state = State.anim;
      }
      else if (cde === "u") {
        // Undo one step
        state = State.undo;
        // undo();
      }
      return;
    }
// -- State undo
    if (state === State.undo) {
      if (undoInProgress === false) {
        if (cde === "u") {
          // Ok continue to undo
          // undo();
        }
        else if (cde === "co") {
          // Switch back to run
          state = State.run;
          commandLoop();
        }
        else if (cde === "pa") {
          // Forbidden ignore pause
        } else {
          // A new Command can only come from Debug
          // Removes 't' or 'd'
          iTok--;
          // Execute
          toko  = tokenize(cde);
          state = State.run;
          iTok  = 0;
          commandLoop();
        }
      }
    }
  }

  // Loop to execute commands
  function commandLoop () {
    while (iTok < toko.length) {
      // Breaks loop to launch animation on 't'
      if (toko[iTok] === "t") {
        // Time t duration ... )
        done.push(toko[iTok++]);
        // iTok will be incremented by duration = toko[iTok++]
        done.push(toko[iTok]);
        duration      = toko[iTok++];
        pauseDuration = 0;
        state         = State.anim;
        animStart();
        // Return breaks the loop, giving control to anim
        return;
      }
      else if (toko[iTok] === "rparent") {
        // Finish pushing command
        done.push(toko[iTok++]);
        continue;
      }

      var iBefore = iTok;

      // Execute one command
      var iReached = execute();

      // Push modified model
      pushUndo();
      // Add done commands to done list
      while (iBefore < iReached) {
        done.push(toko[iBefore++]);
      }
      // Post an event to repaint
      // The repaint will not occur till next animation, or end Cde
      model.change = true;
    }
    // End of command line switch to idle
    if (state === State.run) {
      state = State.idle;
    }
  }

  // Sets a flag in model which is tested in Animation loop
  function animStart () {
    model.change = true;
    tstart       = new Date().getTime();
    tpi          = 0.0;
  }

  // Called from Orisim3d.js in Animation loop
  // return true if anim should continue false if anim should end
  function anim () {
    if (state === State.undo) {
      var index = popUndo();
      var ret   = (index > iTok);
      // Stop undo if undo mark reached and switch to repaint
      if (ret === false) {
        undoInProgress = false;
        //mainPane.repaint();
      }
      return ret;
    }
    else if (state === State.pause) {
      pauseStart = new Date().getTime();
      return false;
    }
    else if (state !== State.anim) {
      return false;
    }
    // We are in state anim
    var t  = new Date().getTime();
    // Compute tn varying from 0 to 1
    var tn = (t - tstart - pauseDuration) / duration; // tn from 0 to 1
    if (tn > 1.0){
      tn = 1.0;
    }
    tni = context.interpolator(tn);

    // Execute commands just after t xxx up to including ')'
    var iBeginAnim = iTok;
    while (toko[iTok] !== "rparent") {
      execute();
      if (iTok === toko.length) {
        console.log("Warning missing parent !");
        break;
      }
    }
    // For undoing animation
    pushUndo();

    // Keep t (tpi) preceding t now (tni)
    tpi = tni; // t preceding

    // If Animation is finished, set end values
    if (tn >= 1.0) {
      tni = 1.0;
      tpi = 0.0;
      // Push done
      while (iBeginAnim < iTok) {
        // Time t duration ... )
        done.push(toko[iBeginAnim++]);
      }
      // Switch back to run and launch next cde
      state = State.run;
      commandLoop();

      // If commandLoop has launched another animation we continue
      if (state === State.anim) {
        return true;
      }

      // OK we stop anim
      return false;
    }

    // Rewind to continue animation
    iTok = iBeginAnim;
    return true;
  }

  // TODO : implement
  function pushUndo () { }
  function popUndo () { }

  // API
  this.tokenize = tokenize;
  this.readfile = readfile;
  this.execute = execute;

  this.interpolator = interpolator;
  this.toko = toko;
  this.listPoints = listPoints;
  this.listSegments = listSegments;

  this.command = command;
  this.commandLoop = commandLoop;
  this.anim = anim;
};

// Static values
const State = {idle:0, run:1, anim:2, pause:3, undo:4};
// console.log(Object.keys(State)[1]); // run

// Just for Node.js
if (NODE_ENV === true && typeof module !== 'undefined' && module.exports) {
  module.exports = OR.Command;
}
