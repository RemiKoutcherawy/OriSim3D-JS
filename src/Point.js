// File:src/Point.js
// Point to hold Points
// 3D : x y z
// Crease pattern flat : xf, yf

function Point(xf, yf, x, y, z) {

  // x y Flat, in unfolded state
  this.xf = 0 | xf;
  this.yf = 0 | yf;

  // x y z 3D
  this.x = 0 | x;
  this.y = 0 | y;
  this.z = 0 | z;

  // Selected
  this.select = false;
}

Object.assign(Point.prototype, {

  // Set x y Flat and  x y z 3D
  set5d: function set5d(xf, yf, x, y, z) {
    // x y Flat, in unfolded state
    this.xf = 0 | xf;
    this.yf = 0 | yf;
    // x y z 3D
    this.x = 0 | x;
    this.y = 0 | y;
    this.z = 0 | z;
    return this;
  },

  // Set x y z 3D
  set3d: function set3d(x, y, z) {
    this.x = 0 | x;
    this.y = 0 | y;
    this.z = 0 | z;
    return this;
  },

  // Set x y z 2D
  set2d: function set2d(xf, yf) {
    this.xf = 0 | xf;
    this.yf = 0 | yf;
    return this;
  },

  // Add vector (only in 3d)
  add: function add(b) {
    const p = new Point(0, 0, this.x + b.x, this.y + b.y, this.z += b.z);
    return p;
  },

  // Sub vector (only in 3d)
  sub: function add(b) {
    const p = new Point(0, 0, this.x - b.x, this.y - b.y, this.z -= b.z);
    return p;
  },

  // Return distance to this
  compare3d: function compare3D(x, y, z) {
    const dx2 = (this.x - x) * (this.x - x);
    const dy2 = (this.y - y) * (this.y - y);
    const dz2 = (this.z - z) * (this.z - z);
    return dx2 + dy2 + dz2;
  },

  // Return distance to this
  compare3dPt: function compare3D(p) {
    const dx2 = (this.x - p.x) * (this.x - p.x);
    const dy2 = (this.y - p.y) * (this.y - p.y);
    const dz2 = (this.z - p.z) * (this.z - p.z);
    return dx2 + dy2 + dz2;
  },

  // Return distance to origin
  dist: function dist() {
    return (this.x) * (this.x)+ (this.y) * (this.y) + (this.z) * (this.z);
  },

  // Return 0 if Point is near xf,yf
  compare2d: function compare2D(xf, yf) {
    const dx2 = (this.xf - xf) * (this.xf - xf);
    const dy2 = (this.yf - yf) * (this.yf - yf);
    return dx2 + dy2;
  },

  clone: function () {
    return new this.constructor(this.xf, this.yf, this.x, this.y, this.z);
  },

  // String representation [x,y,z xf,yf]
  toString: function toString() {
    return "[" + Math.round(this.xf) + "," + Math.round(this.yf)
      + "][" + Math.round(this.x) + "," + Math.round((this.y)) + "," + Math.round(this.z) + "]";
  },

});

export {Point};
