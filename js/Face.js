// File: js/Face.js
"use strict";

// Dependencies : import them before Model in browser
if (typeof module !== 'undefined' && module.exports) {
  const Point = require('./Point.js');
}

// Face contains points, segments, normal
function Face() {
  this.points    = [];
  this.normal    = [0, 0, 1];
  this.select    = 0;
  this.highlight = false;
  this.offset    = 0;
}
// Static values
Face.EPSILON = 0.1;

// Class methods
Face.prototype = {
  constructor: Face,

  // Compute Face normal
  computeFaceNormal: function () {
    if (this.points.length < 3) {
      console.log("Pb Face < 3pts:" + this);
      return null;
    }
    for (let i = 0; i < this.points.length - 2; i++) {
      // Take triangles until p2p1 x p1p3 > 0.1
      let p1         = this.points[i];
      let p2         = this.points[i + 1];
      let p3         = this.points[i + 2];
      let u          = [p2.x - p1.x, p2.y - p1.y, p2.z - p1.z];
      let v          = [p3.x - p1.x, p3.y - p1.y, p3.z - p1.z];
      this.normal[0] = u[1] * v[2] - u[2] * v[1];
      this.normal[1] = u[2] * v[0] - u[0] * v[2];
      this.normal[2] = u[0] * v[1] - u[1] * v[0];
      if (Math.abs(this.normal[0]) + Math.abs(this.normal[1]) + Math.abs(this.normal[2]) > Face.EPSILON) {
        break;
      }
    }
    this.normalize(this.normal);
    return this.normal;
  },

  // Normalize vector v[3] = v[3]/||v[3]||
  normalize: function (v) {
    let d = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    v[0] /= d;
    v[1] /= d;
    v[2] /= d;
  },

  // String representation
  toString: function () {
    let str = "F" + "(";
    this.points.forEach(function (p, i, a) {
      str = str + "P" + i + p.toString()+ (i === a.length - 1 ? "": " ");
    });
    str = str + ")";
    return str;
  }
};

// Just for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Face;
}