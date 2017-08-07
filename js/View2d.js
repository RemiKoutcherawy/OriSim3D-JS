// File: js/View2d
"use strict";

// Dependencies : import them before View2d.js in browser
if (typeof module !== 'undefined' && module.exports) {
  var Model = require('./Model.js');
  var Point = require('./Point.js');
  var Segment = require('./Segment.js');
}

// View2d Constructor
function View2d(model, canvas2d) {
  // Instance variables
  this.model = model;
  this.canvas2d = canvas2d;
  // Keep ref to this view2d for event
  this.canvas2d.view2d = this;
  if (this.canvas2d === null) {
    return;
  }
  this.ctx   = this.canvas2d.getContext('2d');
  // Values set by fit()
  this.scale = 1;
  this.xOffset = 0;
  this.yOffset = 0;
  // Resize canvas to fit model
  this.fit();
  // Mouse hit
  this.canvas2d.addEventListener('mousedown', this.mouseDown);
}

// Class methods
View2d.prototype = {
  constructor : View2d,

  // Point under mousedown
  mouseDown: function (ev) {
    // Event clic
    var rect = ev.target.getBoundingClientRect();
    var x = ev.clientX - rect.left;
    var y = ev.clientY - rect.top;

    // Model scale and offset from view2d
    let view2d  = ev.target.view2d;
    let scale   = view2d.scale;
    let xOffset = view2d.xOffset;
    let yOffset = view2d.yOffset;

    // Model clic
    let xf = (x - xOffset) / scale;
    let yf = -(y - yOffset) / scale;

    // Debug
    let ctx = view2d.ctx;

    let model = view2d.model;
    model.points.find(function (p) {
      if (Point.compare2d(p, new Point(xf,yf)) < 10) {
        console.log("P :"+model.points.indexOf(p)+' '+p.toString());

        // Debug
        let xf = p.xf * scale + xOffset;
        let yf = -p.yf * scale + yOffset;
        // Circle
        ctx.fillStyle = 'magenta';
        ctx.beginPath();
        ctx.arc(xf, yf, 12, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fill();
        // label
        ctx.fillStyle = 'black';
        let i  = model.points.indexOf(p);
        if (i < 10){
          ctx.fillText(String(i), xf-4, yf+5);
        } else {
          ctx.fillText(String(i), xf-8, yf+5);
        }
      }
    });
    model.segments.find(function (s) {
      if (Segment.distanceToSegment(s, new Point(xf,yf)) < 10) {
         console.log("S :"+model.segments.indexOf(s)+' '+s);
// Debug
        let xf1 = s.p1.xf * scale + xOffset;
        let yf1 = -s.p1.yf * scale + yOffset;
        let xf2 = s.p2.xf * scale + xOffset;
        let yf2 = -s.p2.yf * scale + yOffset;
        let xc = (xf1+xf2)/2;
        let yc = (yf1+yf2)/2;
        // Segment
        ctx.beginPath();
        ctx.moveTo(xf1, yf1);
        ctx.lineTo(xf2, yf2);
        ctx.closePath();
        ctx.stroke();
        // Circle
        ctx.fillStyle = 'magenta';
        ctx.beginPath();
        ctx.arc(xc, yc, 12, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fill();
        // label
        let i  = model.segments.indexOf(s);
        ctx.fillStyle = 'black';
        if (i < 10){
          ctx.fillText(String(i), xc-4, yc+5);
        } else {
          ctx.fillText(String(i), xc-8, yc+5);
        }
      }
    });
    //model.faces.forEach(function(f, i){
    //  console.log("F"+i+":"+f);
    //})
  },
  // Draw all points in blue
  drawPoint : function () {
    let ctx = this.ctx;
    let scale  = this.scale;
    let xOffset = this.xOffset;
    let yOffset = this.yOffset;

    let points = this.model.points;
    ctx.font = '18px serif';
    ctx.strokeStyle = 'blue';
    points.forEach((p,i) => {
      let xf = p.xf * scale + xOffset;
      let yf = -p.yf * scale + yOffset;
      // Circle
      ctx.fillStyle = 'skyblue';
      ctx.beginPath();
      ctx.arc(xf, yf, 12, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.fill();
      // label
      ctx.fillStyle = 'black';
      if (i < 10){
        ctx.fillText(String(i), xf-4, yf+5);
      } else {
        ctx.fillText(String(i), xf-8, yf+5);
      }
    });
  },
  // Draw all segments in green
  drawSegment : function () {
    let ctx = this.ctx;
    let scale  = this.scale;
    let xOffset = this.xOffset;
    let yOffset = this.yOffset;

    let segments = this.model.segments;
    ctx.font = '18px serif';
    ctx.strokeStyle = 'green';
    segments.forEach((s,i) => {
      let xf1 = s.p1.xf * scale + xOffset;
      let yf1 = -s.p1.yf * scale + yOffset;
      let xf2 = s.p2.xf * scale + xOffset;
      let yf2 = -s.p2.yf * scale + yOffset;
      let xc = (xf1+xf2)/2;
      let yc = (yf1+yf2)/2;
      // Segment
      ctx.beginPath();
      ctx.moveTo(xf1, yf1);
      ctx.lineTo(xf2, yf2);
      ctx.closePath();
      ctx.stroke();
      // Circle
      ctx.fillStyle = 'lightgreen';
      ctx.beginPath();
      ctx.arc(xc, yc, 12, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.fill();
      // label
      ctx.fillStyle = 'black';
      if (i < 10){
        ctx.fillText(String(i), xc-4, yc+5);
      } else {
        ctx.fillText(String(i), xc-8, yc+5);
      }
    });
  },
  // Draw all faces
  drawFaces: function () {
    let ctx = this.ctx;
    let scale = this.scale;
    let xOffset = this.xOffset;
    let yOffset = this.yOffset;

    let faces = this.model.faces;
    ctx.font = '18px serif';
    ctx.strokeStyle = 'black';
    faces.forEach((f, i) => {
      let pts = f.points;
      let cx = 0;
      let cy = 0;
      ctx.beginPath();
      let xf = pts[0].xf * scale + xOffset;
      let yf = -pts[0].yf * scale + yOffset;
      ctx.moveTo(xf, yf);
      pts.forEach(function (p) {
        xf = p.xf * scale + xOffset;
        yf = -p.yf * scale + yOffset;
        ctx.lineTo(xf, yf);
        cx += xf;
        cy += yf;
      });
      ctx.closePath();
      ctx.fillStyle = 'lightblue';
      ctx.fill();

      // Circle
      cx /= pts.length;
      cy /= pts.length;
      ctx.beginPath();
      ctx.arc(cx, cy, 12, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.fillStyle = 'lightcyan';
      ctx.fill();
      // label
      ctx.fillStyle = 'black';
      if (i < 10) {
        ctx.fillText(String(i), cx - 4, cy + 5);
      } else {
        ctx.fillText(String(i), cx - 8, cy + 5);
      }
    });
  },
  // Draw the Model
  draw : function draw () {
    if (this.canvas2d === null) {
      return;
    }
    this.ctx.clearRect(0, 0, this.canvas2d.width, this.canvas2d.height);
    this.drawFaces();
    this.drawSegment();
    this.drawPoint();
  },

  // Fit to show all the model in the view, ie compute scale
  fit: function fit() {
    // Model
    const bounds      = this.model.get2DBounds();
    let modelWidth  = bounds.xmax - bounds.xmin;
    let modelHeight = bounds.ymax - bounds.ymin;

    // <div> containing Canvas
    let viewWidth   = this.canvas2d.clientWidth;
    let viewHeight  = this.canvas2d.clientHeight;

    // Resize canvas to fit <div>, should not be necessary but is
    this.canvas2d.width  = viewWidth;
    this.canvas2d.height = viewHeight;

    // Compute Scale to fit
    const scaleX = viewWidth / modelWidth;
    const scaleY = viewHeight / modelHeight;
    this.scale = Math.min(scaleX, scaleY) / 1.1;

    // Compute Offset to center drawing
    this.xOffset = viewWidth / 2;
    this.yOffset = viewHeight / 2;
  }
};

// Just for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = View2d;
}