// File: js/View2d.js
// Dependencies : import them before View2d.js in browser
if (NODE_ENV === true && typeof module !== 'undefined' && module.exports) {
  var Model = require('./Model.js');
  var Point = require('./Point.js');
  var Segment = require('./Segment.js');
}

// View2d Constructor
function View2d (model, canvas2d) {
  // Instance variables
  this.model           = model;
  this.canvas2d        = canvas2d;

  // Keep ref to this view2d for event
  this.canvas2d.view2d = this;
  if (this.canvas2d === null) {
    return;
  }
  this.ctx     = this.canvas2d.getContext('2d');

  // Values set by fit()
  this.scale   = 1;
  this.xOffset = 0;
  this.yOffset = 0;

  // Resize canvas to fit model
  // .bind(this) used to call fit() with this view2d context
  var boundFit = fit.bind(this);
  boundFit();

  // Mouse hit
  this.canvas2d.addEventListener('mousedown', this.mouseDown);

  // Point under mousedown
  function mouseDown (ev) {
    // Event clic
    var rect = ev.target.getBoundingClientRect();
    var x    = ev.clientX - rect.left;
    var y    = ev.clientY - rect.top;

    // Model scale and offset from view2d
    var view2d  = ev.target.view2d;
    var scale   = view2d.scale;
    var xOffset = view2d.xOffset;
    var yOffset = view2d.yOffset;

    // Model clic
    var xf = (x - xOffset) / scale;
    var yf = -(y - yOffset) / scale;
  }

  // Draw all points in blue
  function drawPoint () {
    var ctx     = this.ctx;
    var scale   = this.scale;
    var xOffset = this.xOffset;
    var yOffset = this.yOffset;

    var points      = this.model.points;
    ctx.font        = '18px serif';
    ctx.strokeStyle = 'blue';
    for (var i = 0; i < points.length; i++) {
      var p = points[i];
      var xf        = p.xf * scale + xOffset;
      var yf        = -p.yf * scale + yOffset;
      // Circle
      ctx.fillStyle = 'skyblue';
      ctx.beginPath();
      ctx.arc(xf, yf, 12, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.fill();
      // label
      ctx.fillStyle = 'black';
      if (i < 10) {
        ctx.fillText(String(i), xf - 4, yf + 5);
      } else {
        ctx.fillText(String(i), xf - 8, yf + 5);
      }
    }
  }

  // Draw all segments in green
  function drawSegment () {
    var ctx     = this.ctx;
    var scale   = this.scale;
    var xOffset = this.xOffset;
    var yOffset = this.yOffset;

    var segments    = this.model.segments;
    ctx.font        = '18px serif';
    ctx.strokeStyle = 'green';
    for (var i = 0; i < segments.length; i++){
      var s = segments[i];
      var xf1 = s.p1.xf * scale + xOffset;
      var yf1 = -s.p1.yf * scale + yOffset;
      var xf2 = s.p2.xf * scale + xOffset;
      var yf2 = -s.p2.yf * scale + yOffset;
      var xc  = (xf1 + xf2) / 2;
      var yc  = (yf1 + yf2) / 2;
      // Highlight
      if (s.highlight) {
        ctx.strokeStyle = 'red';
      } else {
        ctx.strokeStyle = 'green';
      }
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
      if (i < 10) {
        ctx.fillText(String(i), xc - 4, yc + 5);
      } else {
        ctx.fillText(String(i), xc - 8, yc + 5);
      }
    }
  }

  // Draw all faces
  function drawFaces () {
    var ctx     = this.ctx;
    var scale   = this.scale;
    var xOffset = this.xOffset;
    var yOffset = this.yOffset;

    var faces       = this.model.faces;
    ctx.font        = '18px serif';
    ctx.strokeStyle = 'black';
    for (var i = 0; i < faces.length; i++){
      var f = faces[i];
      var pts = f.points;
      var cx  = 0;
      var cy  = 0;
      ctx.beginPath();
      var xf = pts[0].xf * scale + xOffset;
      var yf = -pts[0].yf * scale + yOffset;
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
    }
  }

  // Draw the Model
  function draw() {
    if (this.canvas2d === null) {
      return;
    }
    this.ctx.clearRect(0, 0, this.canvas2d.width, this.canvas2d.height);
    this.drawFaces();
    this.drawSegment();
    this.drawPoint();
  }

  // Fit to show all the model in the view, ie compute scale
  function fit() {
    // Model
    var bounds      = this.model.get2DBounds();
    var modelWidth  = bounds.xmax - bounds.xmin;
    var modelHeight = bounds.ymax - bounds.ymin;

    // <div> containing Canvas
    var viewWidth  = this.canvas2d.clientWidth;
    var viewHeight = this.canvas2d.clientHeight;

    // Resize canvas to fit <div>, should not be necessary but is
    this.canvas2d.width  = viewWidth;
    this.canvas2d.height = viewHeight;

    // Compute Scale to fit
    const scaleX = viewWidth / modelWidth;
    const scaleY = viewHeight / modelHeight;
    this.scale   = Math.min(scaleX, scaleY) / 1.2;

    // Compute Offset to center drawing
    this.xOffset = viewWidth / 2;
    this.yOffset = viewHeight / 2;
  }

  // API
  this.drawPoint = drawPoint;
  this.drawSegment = drawSegment;
  this.drawFaces = drawFaces;
  this.draw = draw;
}
// Just for Node.js
if (NODE_ENV === true && typeof module !== 'undefined' && module.exports) {
  module.exports = View2d;
}