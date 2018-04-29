// File: src/Face.js
// Face contains points, segments, normal

function Face() {

  // A face is made of points
  this.points = [];

  // Properties
  this.offset = 0;
  this.normal = [0, 0, 1];

  //Selected
  this.select = false;
  this.highlight = false;
}

Object.assign(Face.prototype, {

  // Compute Face normal
  computeFaceNormal: function computeFaceNormal() {
    if (this.points.length < 3) {
      console.log("Warn Face < 3pts:" + this);
      return null;
    }

    for (let i = 0; i < this.points.length - 2; i++) {
      // Take triangles until p2p1 x p1p3 > 0.1
      const p1 = this.points[i];
      const p2 = this.points[i + 1];
      const p3 = this.points[i + 2];
      const u = [p2.x - p1.x, p2.y - p1.y, p2.z - p1.z];
      const v = [p3.x - p1.x, p3.y - p1.y, p3.z - p1.z];
      this.normal[0] = u[1] * v[2] - u[2] * v[1];
      this.normal[1] = u[2] * v[0] - u[0] * v[2];
      this.normal[2] = u[0] * v[1] - u[1] * v[0];
      if (Math.abs(this.normal[0]) + Math.abs(this.normal[1]) + Math.abs(this.normal[2]) > 0.1) {
        break;
      }
    }

    const n = this.normal;
    const d = Math.sqrt(n[0] * n[0] + n[1] * n[1] + n[2] * n[2]);
    n[0] /= d;
    n[1] /= d;
    n[2] /= d;

    return n;
  },

  // Look if face contains point x,y in 2D view
  onFace2d: function (xf, yf) {
    let points = this.points;
    let hits = 0;
    let last = points[points.length - 1];
    let lastx = last.xf, lasty = last.yf;
    let curx, cury;

    // Walk the edges of the polygon, count crossings on horizontal
    for (let i = 0; i < points.length; lastx = curx, lasty = cury, i++) {
      curx = points[i].xf;
      cury = points[i].yf;
      // Ignore if on horizontal edge
      if (cury === lasty)
        continue;

      // Edge on the left
      let leftx;
      if (curx < lastx) {
        if (xf >= lastx)
          continue;
        leftx = curx;
      } else {
        if (xf >= curx)
          continue;
        leftx = lastx;
      }

      let test1, test2;
      if (cury < lasty) {
        if (yf < cury || yf >= lasty)
          continue;
        if (xf < leftx) {
          // Got a hit when yf in[cury,lasty] and xf in[curx,lastx]
          hits++;
          continue;
        }
        test1 = xf - curx;
        test2 = yf - cury;
      } else {
        if (yf < lasty || yf >= cury)
          continue;
        if (xf < leftx) {
          // Got a hit when yf in[cury,lasty] and xf in[curx,lastx]
          hits++;
          continue;
        }
        test1 = xf - lastx;
        test2 = yf - lasty;
      }
      // Check if real crossing
      if (test1 < (test2 / (lasty - cury) * (lastx - curx)))
        hits++;
    }
    return ((hits & 1) !== 0);
  },

  // String representation
  toString: function toString() {
    let str = "F" + "(";
    this.points.forEach(function (p, i, a) {
      str = str + "P" + i + p.toString() + (i === a.length - 1 ? "" : " ");
    });
    str = str + ")";
    return str;
  },

});

export {Face};
