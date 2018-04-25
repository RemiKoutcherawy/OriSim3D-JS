// File: src/View2Ds

// View2d Constructor
function View2d(model) {

  // Instance variables
  this.model = model;

  if (this.canvas2d === undefined) {
    // Canvas2d in front
    this.canvas2d = document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
    this.canvas2d.width = window.innerWidth;
    this.canvas2d.height = window.innerHeight;
    this.canvas2d.style.cssText = 'position:fixed;top:0;left:0;cursor:pointer;z-index:1';
  }
  // Keep ref to this View2d for event
  this.canvas2d.view2d = this;

  // Once for all get Context
  this.ctx = this.canvas2d.getContext('2d');

  // Values set by fit()
  this.scale = 1;
  this.xOffset = 0;
  this.yOffset = 0;

  // Mouse
  this.canvas2d.addEventListener( 'mousedown', onMouseDown, false );

  function onMouseDown( event ) {
    // event.preventDefault();
    console.log("onMouseDown Event:"+event.clientX+" "+event.clientY);

    // Event clic
    const rect = event.target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Model scale and offset from view2d
    const view2d = event.target.view2d;
    const scale = view2d.scale;
    const xOffset = view2d.xOffset;
    const yOffset = view2d.yOffset;

    // Model clic
    const xf = (x - xOffset) / scale;
    const yf = -(y - yOffset) / scale;
    console.log("onMouseDown Model:"+xf+" "+yf);

    const pt = model.find(xf, yf);
  }

}

Object.assign(View2d.prototype, {

  // Draw all points in blue
  drawPoint: function drawPoint() {
    const ctx = this.ctx;
    const scale = this.scale;
    const xOffset = this.xOffset;
    const yOffset = this.yOffset;

    const points = this.model.points;
    ctx.font = '18px serif';
    ctx.strokeStyle = 'blue';
    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      const xf = p.xf * scale + xOffset;
      const yf = -p.yf * scale + yOffset;
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
  },

  // Draw all segments in green
  drawSegment: function drawSegment() {
    const ctx = this.ctx;
    const scale = this.scale;
    const xOffset = this.xOffset;
    const yOffset = this.yOffset;

    const segments = this.model.segments;
    ctx.font = '18px serif';
    ctx.strokeStyle = 'green';
    for (let i = 0; i < segments.length; i++) {
      const s = segments[i];
      const xf1 = s.p1.xf * scale + xOffset;
      const yf1 = -s.p1.yf * scale + yOffset;
      const xf2 = s.p2.xf * scale + xOffset;
      const yf2 = -s.p2.yf * scale + yOffset;
      const xc = (xf1 + xf2) / 2;
      const yc = (yf1 + yf2) / 2;
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
  },

  // Draw all faces
  drawFaces: function drawFaces() {
    const ctx = this.ctx;
    const scale = this.scale;
    const xOffset = this.xOffset;
    const yOffset = this.yOffset;

    const faces = this.model.faces;
    ctx.font = '18px serif';
    ctx.strokeStyle = 'black';
    for (let i = 0; i < faces.length; i++) {
      const f = faces[i];
      const pts = f.points;
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
    }
  },

  // Draw the Model
  draw: function draw() {
    if (this.canvas2d === null) {
      console.log("draw with no canvas");
      return;
    }
    this.fit();
    this.ctx.clearRect(0, 0, this.canvas2d.width, this.canvas2d.height);
    this.drawFaces();
    this.drawSegment();
    this.drawPoint();
  },

  // Fit to show all the model in the view, ie compute scale
  fit: function fit() {
    // Model
    const bounds = this.model.get2DBounds();
    const modelWidth = bounds.xmax - bounds.xmin;
    const modelHeight = bounds.ymax - bounds.ymin;

    // <div> containing Canvas
    const viewWidth = this.canvas2d.clientWidth;
    const viewHeight = this.canvas2d.clientHeight;

    // Resize canvas to fit <div>, should not be necessary but is
    this.canvas2d.width = viewWidth;
    this.canvas2d.height = viewHeight;

    // Compute Scale to fit
    const scaleX = viewWidth / modelWidth;
    const scaleY = viewHeight / modelHeight;
    this.scale = Math.min(scaleX, scaleY) / 1.2;

    // Compute Offset to center drawing
    this.xOffset = viewWidth / 2;
    this.yOffset = viewHeight / 2;
  },

});

export {View2d};