// File: src/Command.js

import {Interpolator} from './Interpolator.js';

// Interprets a list of commands, and apply them on Model
function Command(modele) {
  this.model = modele;
  this.toko = []; // list of tokens
  this.done = []; // list of tokens used in animation
  this.iTok = 0;
  // State machine
  this.state = State.idle;
  // Time interpolated at instant 'p' preceding and at instant 'n' current
  this.tni = 1;
  this.tpi = 0;
  // scale, cx, cy, cz used in ZoomFit
  this.za = [0, 0, 0, 0];
  // Interpolator used in anim() to map tn (time normalized) to tni (time interpolated)
  this.interpolator = Interpolator.Linear;

  // instance variables
  this.pauseStart = 0;
  this.pauseDuration = 0;
  this.duration = 0;
  this.tstart = 0;
}

Object.assign(Command.prototype, {

  // Tokenize, split the String in toko Array of String
  tokenize: function tokenize(input) {
    let text = input.replace(/[\);]/g, ' rparent');
    text = text.replace(/,/g, ' ');
    text = text.replace(/\/\/.*$/mg, '');
    this.toko = text.split(/\s+/);
  },

  // Read a File
  readfile: function readfile(filename) {
    let text = null;
    // If we are in NodeJS fs is required
    if (typeof require === 'function') { // test for nodejs environment
      const fs = require('fs');
      text = fs.readFileSync(filename, 'utf-8');
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
  execute: function execute() {
    // Make a list from following points numbers
    function listPoints() {
      const list = [];
      while (Number.isInteger(Number(toko[iTok]))) {
        list.push(model.points[toko[iTok++]]);
      }
      return list;
    }

    // Make a list from following faces numbers
    function listFaces() {
      const list = [];
      while (Number.isInteger(Number(toko[iTok]))) {
        list.push(model.faces[toko[iTok++]]);
      }
      return list;
    }

    let list = [], a = null, b = null, angle = null, s = null, p = null;
    let iTok = this.iTok;
    let model = this.model;
    let toko = this.toko;
    let tni = this.tni;
    let tpi = this.tpi;

    // Commands
    // "d : define"
    if (toko[iTok] === "d" || toko[iTok] === "define") {
      // Define sheet by N points x,y CCW
      iTok++;
      while (Number.isInteger(Number(toko[iTok]))) {
        list.push(toko[iTok++]);
      }
      model.init(list);
    }
    // Origami splits
    // "b : by"
    else if (toko[iTok] === "b" || toko[iTok] === "by") {
      // Split by two points
      iTok++;
      a = model.points[toko[iTok++]];
      b = model.points[toko[iTok++]];
      model.splitBy(a, b);
    }
    // "c : cross" 
    else if (toko[iTok] === "c" || toko[iTok] === "cross") {
      // Split across two points all (or just listed) faces
      iTok++;
      a = model.points[toko[iTok++]];
      b = model.points[toko[iTok++]];
      model.splitCross(a, b);
    }
    // "p : perpendicular" 
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
      const s0 = model.segments[toko[iTok++]];
      const s1 = model.segments[toko[iTok++]];
      model.splitLineToLine(s0, s1);
    }
    // Segment split TODO test
    // "s : split seg numerator denominator"
    else if (toko[iTok] === "s" || toko[iTok] === "split") {
      // Split set by N/D
      iTok++;
      s = model.segments[toko[iTok++]];
      const n = toko[iTok++];
      const d = toko[iTok++];
      model.splitSegmentByRatio(s, n / d);
    }

    // Animation commands use tni tpi
    // " r : rotate Seg Angle Points"
    else if (toko[iTok] === "r" || toko[iTok] === "rotate") {
      // Rotate Seg Angle Points with animation
      iTok++;
      s = model.segments[toko[iTok++]];
      angle = (toko[iTok++] * (tni - tpi));
      list = listPoints();
      model.rotate(s, angle, list);
    }
    // "f : fold to angle"
    else if (toko[iTok] === "f" || toko[iTok] === "fold") {
      iTok++;
      s = model.segments[toko[iTok++]];
      // Cache current angle at start of animation
      let angleBefore = 0;
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
      list = listPoints();
      const liste = list.length === 0 ? model.points : list;
      model.adjustList(liste);
    }

    // Offsets
    // "o : offset"
    else if (toko[iTok] === "o" || toko[iTok] === "offset") {
      // Offset by dz the list of faces : o dz f1 f2...
      iTok++;
      const dz = toko[iTok++];
      list = listFaces();
      model.offset(dz, list);
    }

    // Moves
    // "m : move dx dy dz pts"
    else if (toko[iTok] === "m" || toko[iTok] === "move") {
      // Move 1 point by dx,dy,dz in 3D with Coefficient for animation
      iTok++;
      model.move(toko[iTok++] * (tni - tpi)
        , toko[iTok++] * (tni - tpi)
        , toko[iTok++] * (tni - tpi)
        , model.points);
    }
    // "mo : move on"
    else if (toko[iTok] === "mo") {
      // Move all points on one with animation
      iTok++;
      const p0 = model.points.get(toko[iTok++]);
      const k2 = ((1 - tni) / (1 - tpi));
      const k1 = (tni - tpi * k2);
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
      const scale = toko[iTok++];
      const x = toko[iTok++];
      const y = toko[iTok++];
      // for animation
      const ascale = ((1 + tni * (scale - 1)) / (1 + tpi * (scale - 1)));
      const bfactor = (scale * (tni / ascale - tpi));
      model.move(x * bfactor, y * bfactor, 0, null);
      model.scaleModel(ascale);
    }
    // "zf : Zoom Fit"
    else if (toko[iTok] === "zf") {
      iTok++;
      if (tpi === 0) {
        b = model.get3DBounds();
        const w = 400;
        this.za[0] = w / Math.max(b.xmax - b.xmin, b.ymax - b.ymin);
        this.za[1] = -(b.xmin + b.xmax) / 2;
        this.za[2] = -(b.ymin + b.ymax) / 2;
      }
      scale = ((1 + tni * (this.za[0] - 1)) / (1 + tpi * (this.za[0] - 1)));
      const bfactor = this.za[0] * (tni / scale - tpi);
      model.move(this.za[1] * bfactor, this.za[2] * bfactor, 0, null);
      model.scaleModel(scale);
    }

    // Interpolators
    else if (toko[iTok] === "il") { // "il : Interpolator Linear"
      iTok++;
      this.interpolator = Interpolator.Linear;
    }
    else if (toko[iTok] === "ib") { // "ib : Interpolator Bounce"
      iTok++;
      this.interpolator = Interpolator.Bounce;
    } else if (toko[iTok] === "io") { // "io : Interpolator OverShoot"
      iTok++;
      this.interpolator = Interpolator.Overshoot;
    }
    else if (toko[iTok] === "ia") { // "ia : Interpolator Anticipate"
      iTok++;
      this.interpolator = Interpolator.Anticipate;
    }
    else if (toko[iTok] === "iao") { // "iao : Interpolator Anticipate OverShoot"
      iTok++;
      this.interpolator = Interpolator.AnticipateOvershoot;
    }
    else if (toko[iTok] === "iad") { // "iad : Interpolator Accelerate Decelerate"
      iTok++;
      this.interpolator = Interpolator.AccelerateDecelerate;
    }
    else if (toko[iTok] === "iso") { // "iso Interpolator Spring Overshoot"
      iTok++;
      this.interpolator = Interpolator.SpringOvershoot;
    }
    else if (toko[iTok] === "isb") { // "isb Interpolator Spring Bounce"
      iTok++;
      this.interpolator = Interpolator.SpringBounce;
    }
    else if (toko[iTok] === "igb") { // "igb : Interpolator Gravity Bounce"
      iTok++;
      this.interpolator = Interpolator.GravityBounce;
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

    this.iTok = iTok;
    return iTok;
  },

// Main entry Point
// Execute list of commands
  command: function command(cde) {
    // -- State Idle tokenize list of command
    if (this.state === State.idle) {
      if (cde.startsWith("read")) {
        const filename = cde.substring(5);
        if (filename.indexOf("script") !== -1) {
          // Expect "read script cocotte.txt" => filename="script cocotte.txt" => id="cocotte.txt"
          // With a tag <script id="cocotte.txt" type="not-javascript">d ...< /script> in html file
          const id = filename.substring(7);
          cde = document.getElementById(id).text;
        } else {
          // Attention replace argument cde by the content of the file
          cde = readfile(filename.trim());
        }
        if (cde === null)
          return;
        // Continue to Execute
      }
      else if (cde.startsWith("d")) {
        // Starts a new folding
        this.done = [];
        // Continue to Execute
      }
      // Execute
      this.tokenize(cde);
      this.state = State.run; // Switch to Run
      this.iTok = 0;
      this.commandLoop();
    }
    // -- State Run execute list of command
    else if (this.state === State.run) {
      this.commandLoop();
    }
    // -- State Animation execute up to ')' or pause
    else if (this.state === State.anim) {
      // "Pause"
      if (cde === "pa") {
        this.state = State.pause;
      }
    }
    // -- State Paused in animation
    else if (this.state === State.pause) {
      // "Continue"
      if (cde === "co") {
        // performance.now() vs new Date().getTime();
        this.pauseDuration = new Date().getTime() - this.pauseStart;
        // Continue animation
        this.commandLoop();
        this.state = State.anim;
      }
    }
  },

// Loop to execute commands
  commandLoop: function commandLoop() {
    let duration = this.duration;
    let pauseDuration = this.pauseDuration;
    let state = this.state;

    while (this.iTok < this.toko.length) {
      // Breaks loop to launch animation on 't'
      if (this.toko[this.iTok] === "t") {
        // Time t duration ... )
        this.done.push(this.toko[this.iTok++]);
        // iTok will be incremented by duration = toko[iTok++]
        this.done.push(this.toko[this.iTok]);
        duration = this.toko[this.iTok++];
        pauseDuration = 0;
        state = State.anim;
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
      const iReached = this.execute();

      // Add done commands to done list
      while (iBefore < iReached) {
        this.done.push(this.toko[iBefore++]);
      }
    }
    // End of command line switch to idle
    if (state === State.run) {
      this.state = State.idle;
    }
  },

// Sets a flag in model which is tested in Animation loop
  animStart: function animStart() {
    this.model.change = true;
    this.tstart = new Date().getTime();
    this.tpi = 0.0;
  },

// Called from Orisim3d.js in Animation loop
// return true if anim should continue false if anim should end
  anim: function anim() {
    let state = this.state;
    if (state === State.pause) {
      this.pauseStart = new Date().getTime();
      return false;
    }
    else if (state !== State.anim) {
      return false;
    }
    // We are in state anim
    const t = new Date().getTime();
    // Compute tn varying from 0 to 1
    let tn = (t - this.tstart - this.pauseDuration) / duration; // tn from 0 to 1
    if (tn > 1.0) {
      tn = 1.0;
    }
    this.tni = this.interpolator(tn);

    // Execute commands just after t xxx up to including ')'
    let iBeginAnim = this.iTok;
    while (this.toko[this.iTok] !== "rparent") {
      this.execute();
      if (this.iTok === this.toko.length) {
        console.log("Warning missing parent !");
        break;
      }
    }

    // Keep t (tpi) preceding t now (tni)
    this.tpi = this.tni; // t preceding

    // If Animation is finished, set end values
    if (tn >= 1.0) {
      this.tni = 1.0;
      this.tpi = 0.0;
      // Push done
      while (iBeginAnim < this.iTok) {
        // Time t duration ... )
        this.done.push(toko[iBeginAnim++]);
      }
      // Switch back to run and launch next cde
      state = State.run;
      this.commandLoop();

      // If commandLoop has launched another animation we continue
      if (state === State.anim) {
        return true;
      }

      // OK we stop anim
      return false;
    }

    // Rewind to continue animation
    this.iTok = iBeginAnim;
    return true;
  },
});

// Static values
const State = {idle: 0, run: 1, anim: 2, pause: 3};
// console.log(Object.keys(State)[1]); // run

export {Command};