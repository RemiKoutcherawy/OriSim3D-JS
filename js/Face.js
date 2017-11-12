// File: js/Face.js
// Dependencies : import them before Face.js in browser
// Test in NodeJS

if (NODE_ENV === true && typeof module !== 'undefined' && module.exports) {
  var OR = OR || {};
  OR.Point = require('./Point.js');
}

// Face contains points, segments, normal
OR.Face = function () {
  this.points    = [];
  this.normal    = [0, 0, 1];
  this.select    = 0;
  this.highlight = false;
  this.offset    = 0;

  // Compute Face normal
  function computeFaceNormal () {
    if (this.points.length < 3) {
      console.log("Warn Face < 3pts:" + this);
      return null;
    }
    for (var i = 0; i < this.points.length - 2; i++) {
      // Take triangles until p2p1 x p1p3 > 0.1
      var p1         = this.points[i];
      var p2         = this.points[i + 1];
      var p3         = this.points[i + 2];
      var u          = [p2.x - p1.x, p2.y - p1.y, p2.z - p1.z];
      var v          = [p3.x - p1.x, p3.y - p1.y, p3.z - p1.z];
      this.normal[0] = u[1] * v[2] - u[2] * v[1];
      this.normal[1] = u[2] * v[0] - u[0] * v[2];
      this.normal[2] = u[0] * v[1] - u[1] * v[0];
      if (Math.abs(this.normal[0]) + Math.abs(this.normal[1]) + Math.abs(this.normal[2]) > 0.1) {
        break;
      }
    }
    normalize(this.normal);
    return this.normal;
  }

  // Normalize vector v[3] = v[3]/||v[3]||
  function normalize (v) {
    var d = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    v[0] /= d;
    v[1] /= d;
    v[2] /= d;
  }

  // String representation
  function toString () {
    var str = "F" + "(";
    this.points.forEach(function (p, i, a) {
      str = str + "P" + i + p.toString()+ (i === a.length - 1 ? "": " ");
    });
    str = str + ")";
    return str;
  }

  // API
  this.computeFaceNormal = computeFaceNormal;
  this.toString = toString;
};

// Static values

// Just for Node.js
if (NODE_ENV === true && typeof module !== 'undefined') {
  module.exports = OR.Face;
}