// File: js/Command.js
"use strict";

// Dependencies : import them before Command in browser
if (typeof module !== 'undefined' && module.exports) {
  var Model        = require('./Model.js');
  var Interpolator = require('./Interpolator.js');
}

// Called by orTextArea when orTextArea gets "Enter"
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
  // Angle used for fold as a starting value when animation starts
  this.angleBefore  = 0;
  // Coefficient to multiply value given in Offset commands
  this.kOffset      = 0.2; // 0.2 for real rendering, can be 10 to debug
}

// Static values
const State = {idle:0, run:1, anim:2, pause:3, undo:4};
// console.log(Object.keys(State)[1]); // run

// Class methods
Command.prototype = {
  constructor:Command,
  // Tokenize, split the String in this.toko Array of String @testOK
  tokenize:function (input) {
    let text  = input.replace(/[\);]/g, ' rparent');
    text      = text.replace(/,/g, ' ');
    text      = text.replace(/\/\/.*$/mg, '');
    this.toko = text.split(/\s+/);
    this.iTok = 0;
    return this.toko;
  },
  // Read a File @testOK
  readfile:function (filename) {
    let text = null;
    // If we are in NodeJS fs is required
    if (typeof require !== 'undefined') {
      const fs = require('fs');
      text     = fs.readFileSync(filename, 'utf-8');
    }
    // If we are in browser XHR is needed
    else {
      const request              = new XMLHttpRequest();
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
      // XMLHttpRequest.open(method, url, async) Here async = false !
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
    // Work on model
    let model = this.model;
    let toko  = this.toko;
    let iTok  = this.iTok;
    // Commands
    // "d : define" @testOK
    if (toko[iTok] === "d" || toko[iTok] === "define") {
      // Define sheet by N points x,y CCW
      iTok++;
      let list = [];
      while (Number.isInteger(Number(this.toko[iTok]))) {
        list.push(this.toko[iTok++]);
      }
      model.init(list);
    }
    // Origami splits
    // "b : by" @testOK
    else if (toko[iTok] === "b" || toko[iTok] === "by") {
      // Split by two points
      iTok++;
      let a = model.points[toko[iTok++]];
      let b = model.points[toko[iTok++]];
      model.splitBy(a, b);
    }
    // "c : cross"  @testOK
    else if (toko[iTok] === "c" || toko[iTok] === "cross") {
      // Split across two points all (or just listed) faces
      iTok++;
      let a = model.points[toko[iTok++]];
      let b = model.points[toko[iTok++]];
      model.splitCross(a, b);
    }
    // "p : perpendicular"  @testOK
    else if (toko[iTok] === "p" || toko[iTok] === "perpendicular") {
      // Split perpendicular of line by point
      iTok++;
      let s = model.segments[toko[iTok++]];
      let p = model.points[toko[iTok++]];
      model.splitOrtho(s, p);
    }
    // "lol : LineOnLine" TODO test
    else if (toko[iTok] === "lol" || toko[iTok] === "lineonline") {
      // Split by a plane passing between segments
      iTok++;
      let s0 = model.segments[toko[iTok++]];
      let s1 = model.segments[toko[iTok++]];
      model.splitLineToLine(s0, s1);
    }
    // Segment split
    // "s : split seg numerator denominator"
    else if (toko[iTok] === "s" || toko[iTok] === "split") {
      // Split set by N/D
      iTok++;
      let s = model.segments[toko[iTok++]];
      let n = toko[iTok++];
      let d = toko[iTok++];
      model.splitSegmentByRatio(s, n / d);
    }

    // Animation commands use tni tpi
    // " r : rotate Seg Angle Points"
    else if (toko[iTok] === "r" || toko[iTok] === "rotate") {
      // Rotate Seg Angle Points with animation
      iTok++;
      let s     = model.segments[toko[iTok++]];
      let angle = (toko[iTok++] * (this.tni - this.tpi));
      let list  = this.listPoints(iTok);
      model.rotate(s, angle, list);
      iTok = this.iTok;
    }
    // "f : fold to angle"
    else if (toko[iTok] === "f" || toko[iTok] === "fold") {
      iTok++;
      let s = model.segments[toko[iTok++]];
      // Cache current angle at start of animation
      if (this.tpi === 0)
        this.angleBefore = model.computeAngle(s);
      let angle = ((toko[iTok++] - this.angleBefore) * (this.tni - this.tpi));
      let list  = this.listPoints(iTok);
      // Reverse segment to have the first point on left face
      if (this.tpi === 0 && model.faceRight(s.p1, s.p2).points.indexOf(list[0]) !== -1)
        s.reverse();
      model.rotate(s, angle, list);
    }
    // Adjust points
    // "a : adjust"
    else if (toko[iTok] === "a") {
      // Adjust Points in 3D to fit 3D length
      iTok++;
      model.adjust(model.points);
    }
    // // Adjust with only given segments
    // else if (toko[iTok] === "as") { // "as : adjust set segments"
    //   // Adjust Points in 3D to fit 3D length
    //   iTok++;
    //   let p0 = model.points.get(toko[iTok++]);
    //   model.adjustSegments(p0, model.segments);
    // }
    //
    // else if (toko[iTok] === "flat") { // "flat : z = 0"
    //   // Move all let to z = 0
    //   iTok++;
    //   model.flat(model.points);
    // }
    // // Offsets
    // else if (toko[iTok] === "o") { // "o : offset"
    //   // Offset by dz the list of faces : o dz f1 f2...
    //   iTok++;
    //   let dz = toko[iTok++] * this.kOffset;
    //   model.offset(dz);
    // }
    // else if (toko[iTok] === "od") { // "od : offset decal"
    //   // Get the maximal offset of all listed faces add 1
    //   // and subtract for all listed faces (or all if none listed)
    //   iTok++;
    //   let dz = toko[iTok++] * this.kOffset;
    //   model.offsetDecal(dz);
    // }
    // else if (toko[iTok] === "oa") { // "oa : offsetAdd"
    //   // Add Offset dz to the list of faces : oa dz f1 f2...
    //   iTok++;
    //   let dz = toko[iTok++] * this.kOffset;
    //   model.offsetAdd(dz);
    // }
    // else if (toko[iTok] === "om") { // "om : offsetMul"
    //   // Multiply Offset by k for all faces : om k
    //   iTok++;
    //   let k = toko[iTok++];
    //   model.offsetMul(k);
    // }
    // else if (toko[iTok] === "ob") { // "ob : offsetBetween"
    //   iTok++;
    //   model.offsetBetween(model.faces);
    // }
    // // Moves
    // else if (toko[iTok] === "m") { // "m : move dx dy dz pts"
    //   // Move 1 let in 3D with Coefficient for animation
    //   iTok++;
    //   model.move(toko[iTok++] * (this.tni - this.tpi), toko[iTok++]* (this.tni - this.tpi)
    //     , toko[iTok++] * (this.tni - this.tpi)
    //     , model.points);
    // }
    // else if (toko[iTok] === "mo") { // "mo : move on"
    //   // Move all points on one with animation
    //   iTok++;
    //   let p0 = model.points.get(toko[iTok++]);
    //   let k2 = ((1 - this.tni) / (1 - this.tpi));
    //   let k1 = (this.tni - this.tpi * k2);
    //   model.moveOn(p0, k1, k2, model.points);
    // }
    // else if (toko[iTok] === "mol") { // "mol : move on line"
    //   // Move all points on line with animation
    //   iTok++;
    //   let p0 = model.segments.get(toko[iTok++]);
    //   let k2 = ((1 - this.tni) / (1 - this.tpi));
    //   let k1 = (this.tni - this.tpi * k2);
    //   model.moveOnLine(p0, k1, k2, model.points);
    // }
    // else if (toko[iTok] === "stp") { // "stp : stick on let pt pts"
    //   // Move all points on one no animation
    //   iTok++;
    //   let p0 = model.points.get(toko[iTok++]);
    //   model.moveOn(p0, 1, 0, model.points);
    // }
    // else if (toko[iTok] === "stl") { // "stl : stick on line sg pts"
    //   // Move all points on line without animation
    //   iTok++;
    //   let p0 = model.segments.get(toko[iTok++]);
    //   model.moveOnLine(p0, 1, 0, model.points);
    // }
    // Turns
    else if (toko[iTok] === "tx") { // "tx : TurnX"
      iTok++;
      model.turn(1, Number(toko[iTok++]) * (this.tni - this.tpi));
    }
    else if (toko[iTok] === "ty") { // "ty : TurnY"
      iTok++;
      model.turn(2, Number(toko[iTok++]) * (this.tni - this.tpi));
    }
    else if (toko[iTok] === "tz") { // "tz : TurnZ"
      iTok++;
      model.turn(3, Number(toko[iTok++]) * (this.tni - this.tpi));
    }
    // Zooms
    else if (toko[iTok] === "z") { // "z : Zoom scale,x,y"
      iTok++;
      let scale   = toko[iTok++], x = toko[iTok++], y = toko[iTok++];
      // for animation
      let ascale  = ((1 + this.tni * (scale - 1)) / (1 + this.tpi * (scale - 1)));
      let bfactor = (scale * (this.tni / ascale - this.tpi));
      model.move(x * bfactor, y * bfactor, 0, null);
      model.scaleModel(ascale);
    }
    else if (toko[iTok] === "zf") { // "zf : Zoom Fit"
      iTok++;
      if (this.tpi === 0) {
        let b      = model.get3DBounds();
        let w      = 400;
        this.za[0] = w / Math.max(b[2] - b[0], b[3] - b[1]);
        this.za[1] = -(b[0] + b[2]) / 2;
        this.za[2] = -(b[1] + b[3]) / 2;
      }
      let scale   = ((1 + this.tni * (this.za[0] - 1)) / (1 + this.tpi * (this.za[0] - 1)));
      let bfactor = (this.za[0] * (this.tni / scale - this.tpi));
      model.move(this.za[1] * bfactor, this.za[2] * bfactor, 0, null);
      model.scaleModel(scale);
    }
    // Interpolator
    else if (toko[iTok] === "il") { // "il : Interpolator Linear"
      iTok++;
      this.interpolator = Interpolator.LinearInterpolator;
    }
    else if (toko[iTok] === "ib") { // "ib : Interpolator Bounce"
      iTok++;
      this.interpolator = Interpolator.BounceInterpolator;
    } else if (toko[iTok] === "io") { // "io : Interpolator OverShoot"
      iTok++;
      this.interpolator = Interpolator.OvershootInterpolator;
    }
    else if (toko[iTok] === "ia") { // "ia : Interpolator Anticipate"
      iTok++;
      this.interpolator = Interpolator.AnticipateInterpolator;
    }
    else if (toko[iTok] === "iao") { // "iao : Interpolator Anticipate OverShoot"
      iTok++;
      this.interpolator = Interpolator.AnticipateOvershootInterpolator;
    }
    else if (toko[iTok] === "iad") { // "iad : Interpolator Accelerate Decelerate"
      iTok++;
      this.interpolator = Interpolator.AccelerateDecelerateInterpolator;
    }
    else if (toko[iTok] === "iso") { // "iso Interpolator Spring Overshoot"
      iTok++;
      this.interpolator = Interpolator.SpringOvershootInterpolator;
    }
    else if (toko[iTok] === "isb") { // "isb Interpolator Spring Bounce"
      iTok++;
      this.interpolator = Interpolator.SpringBounceInterpolator;
    }
    else if (toko[iTok] === "igb") { // "igb : Interpolator Gravity Bounce"
      iTok++;
      this.interpolator = Interpolator.GravityBounceInterpolator;
    }
    // Mark points and segments
    else if (toko[iTok] === "pt") { // "select points"
      iTok++;
      model.selectPts(model.points);
    }
    else if (toko[iTok] === "seg") { // "select segments"
      iTok++;
      model.selectSegs(model.segments);
    }
    else if (toko[iTok] === "end") { // "end" give Control back to CommandLoop
      iTok = this.toko.length;
    }
    // Fall through
    else if (toko[iTok] === "t"
      || toko[iTok] === "rparent"
      || toko[iTok] === "u"
      || toko[iTok] === "co"
      || toko[iTok] === "end") {
      console.log("Warn unnecessary token :" + toko[iTok] + "\n");
      iTok++;
      return -1;
    } else {
      //mainPane.orTextArea.print("execute unknown token :" + toko[iTok] + "\n");
      //mainPane.orTextArea.clean();
      //mainPane.orTextArea.println("Commands : ");
      //mainPane.orTextArea.println("Define    : d x y x y x y x y;");
      //mainPane.orTextArea.println("By        : b p1 p2 [f]     LineOnLine: l p1 p2 p3 [f]");
      //mainPane.orTextArea.println("CrossFace : c p1 p2 [f]     Perpendicular  : p s1 p1 [f]");
      //mainPane.orTextArea.println("Split     : s sn Numerator Denominator ");
      //mainPane.orTextArea.println("Rotate    : r s a [p]       Adjust        : a p p...;");
      //mainPane.orTextArea.println("Fold      : f s a [p]");
      //mainPane.orTextArea.println("Move      : m p x y z;      Offset        : o f dz");
      //mainPane.orTextArea.println("Time t duration ...)        Turn XYZ      : tx ty tz angle");
      //mainPane.orTextArea.println("Zoom      : z ratio x y     Interpolation : il ib ia io iao it ito ig");
      //mainPane.orTextArea.println("Read file.txt   2D  3D  Db  u");
      iTok++; // ignore
    }
    this.iTok = iTok;
    return iTok;
  },

  // Make a list from following points numbers @testOK
  listPoints:function (iTok) {
    let list = [];
    while (Number.isInteger(Number(this.toko[iTok]))) {
      list.push(this.model.points[this.toko[iTok++]]);
    }
    // Keep incremented parameter passed by value
    this.iTok = iTok;
    return list;
  },

  // Execute list of commands
  command:function (cde) {
// -- State Idle tokenize list of command
    if (this.state === State.idle) {
      if (cde === "u") {
        this.toko = this.done.slice().reverse();
        this.undo(); // We are exploring toko[]
        return;
      } else if (cde.startsWith("read")) {
        let filename = cde.substring(5);
        // Attention replace argument cde by the content of the file
        cde          = this.readfile(filename.trim());
        if (cde === null)
          return;
        // On success clear toko and use read cde
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
        // iTok will be incremented by duration = toko[iTok++]
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

      let iBefore = this.iTok;

// Execute one command
      let iReached = this.execute();

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
      let index = this.popUndo();
      let ret   = (index > this.iTok);
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
    let t  = new Date().getTime();
    // Compute tn varying from 0 to 1
    let tn = (t - this.tstart - this.pauseDuration) / this.duration; // tn from 0 to 1
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

  pushUndo:function () {
  },
  popUndo:function () {
  }
};

// Just for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Command;
}

