// File:src/Point.js
// Point to hold Points
var OR = OR || {};

// 3D : x y z
// Crease pattern flat : xf, yf

OR.Point = function (xf, yf, x, y, z) {

  // Create new Point(x,y,z)
  if (arguments.length === 3) {
    // x y z 3D
    this.x  = xf;
    this.y  = yf;
    this.z  = x;
    // x y Flat, in unfolded state
    this.xf = xf;
    this.yf = yf;
  }

  // Create new Point(xf,yf)
  else if (arguments.length === 2) {
    // x y Flat, in unfolded state
    this.xf = xf;
    this.yf = yf;
    // x y z 3D
    this.x  = xf;
    this.y  = yf;
    this.z  = 0;
  }

  // Create with new Point(xf,yf, x,y,z)
  else {
    // x y Flat, in unfolded state
    this.xf = 0 | xf;
    this.yf = 0 | yf;
    // x y z 3D
    this.x  = 0 | x;
    this.y  = 0 | y;
    this.z  = 0 | z;
  }

  this.select = false;

  // Set x y Flat and  x y z 3D
  function set5d (xf, yf, x, y, z) {
    // x y Flat, in unfolded state
    this.xf = 0 | xf;
    this.yf = 0 | yf;
    // x y z 3D
    this.x  = 0 | x;
    this.y  = 0 | y;
    this.z  = 0 | z;
    return this;
  }

  // Set x y z 3D
  function set3d (x, y, z) {
    this.x = 0 | x;
    this.y = 0 | y;
    this.z = 0 | z;
    return this;
  }

  // Set x y z 2D
  function set2d (xf, yf) {
    this.xf = 0 | xf;
    this.yf = 0 | yf;
    return this;
  }

  // Sqrt(this.this)
  function length () {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  // Scale
  function scale (t) {
    this.x *= t;
    this.y *= t;
    this.z *= t;
    return this;
  }

  // Normalize as a vector
  function norm() {
    var lg = this.length();
    return this.scale(1.0 / lg);
  }

  // String representation [x,y,z xf,yf]
  function toString () {
    return "[" + Math.round(this.x) + "," + Math.round(this.y) + "," + Math.round(this.z)
      + "  " + Math.round(this.xf) + "," + Math.round(this.yf) + "]";
  }

  // Short String representation [x,y,z]
  function toXYZString () {
    return "[" + Math.round(this.x) + "," + Math.round(this.y) + "," + Math.round(this.z) + "]";
  }

  // Short String representation [xf,yf]
  function toXYString () {
    return "[" + Math.round(this.xf) + "," + Math.round(this.yf) + "]";
  }

  // API
  this.set5d = set5d;
  this.set3d = set3d;
  this.set2d = set2d;
  this.length = length;
  this.scale = scale;
  this.norm = norm;
  this.toString = toString;
  this.toXYZString = toXYZString;
  this.toXYString = toXYString;
};

// Static methods

// Dot a with b
OR.Point.dot = function dot(a, b) {
  return a.x * b.x + a.y * b.y + a.z * b.z;
};

// New Vector a + b
OR.Point.add = function add(a, b) {
  return new OR.Point(a.x + b.x, a.y + b.y, a.z + b.z);
};

// New Vector a - b
OR.Point.sub = function sub(a, b) {
  return new OR.Point(a.x - b.x, a.y - b.y, a.z - b.z);
};

// Return 0 if OR.Point is near x,y,z
OR.Point.compare3d = function compare3D(p1, p2, y, z) {
  if (arguments.length === 2) {
    // compare3D (p1, p2)
    var dx2 = (p1.x - p2.x) * (p1.x - p2.x);
    var dy2 = (p1.y - p2.y) * (p1.y - p2.y);
    var dz2 = (p1.z - p2.z) * (p1.z - p2.z);
    var d   = dx2 + dy2 + dz2;
    d = d > 1 ? d : 0;
  } else {
    // compare3D (p1, x,y,z)
    dx2 = (p1.x - p2) * (p1.x - p2);
    dy2 = (p1.y - y) * (p1.y - y);
    dz2 = (p1.z - z) * (p1.z - z);
    d   = dx2 + dy2 + dz2;
    d = d > 1 ? d : 0;
  }
  return d;
};

// Return 0 if OR.Point is near xf,yf
OR.Point.compare2d = function compare2D(p1, p2) {
  var dx2 = (p1.xf - p2.xf) * (p1.xf - p2.xf);
  var dy2 = (p1.yf - p2.yf) * (p1.yf - p2.yf);
  return Math.sqrt(dx2 + dy2);
};

// For NodeJS, will be discarded by uglify
if (NODE_ENV === true && typeof module !== 'undefined') {
  module.exports = OR.Point;
}
