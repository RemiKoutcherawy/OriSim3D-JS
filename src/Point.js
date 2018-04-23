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
    this.x += b.x;
    this.y += b.y;
    this.z += b.z;
    return this;
  },

  clone: function () {
    return new this.constructor( this.xf, this.yf, this.x, this.y, this.z );
  },

  // String representation [x,y,z xf,yf]
  toString: function toString() {
    return "[" + Math.round(this.xf) + "," + Math.round(this.yf)
      + "][" + Math.round(this.x) + "," + Math.round((this.y)) + "," + Math.round(this.z) + "]";
  },

});

// Static values

// Return 0 if Point is near x,y,z
Point.compare3d = function compare3D(p1, p2, y, z) {
  let d, dz2, dy2, dx2;
  if (arguments.length === 2) {
    // compare3D (p1, p2)
    dx2 = (p1.x - p2.x) * (p1.x - p2.x);
    dy2 = (p1.y - p2.y) * (p1.y - p2.y);
    dz2 = (p1.z - p2.z) * (p1.z - p2.z);
    d = dx2 + dy2 + dz2;
    d = d > 1 ? d : 0;
  } else {
    // compare3D (p1, x,y,z)
    dx2 = (p1.x - p2) * (p1.x - p2);
    dy2 = (p1.y - y) * (p1.y - y);
    dz2 = (p1.z - z) * (p1.z - z);
    d = dx2 + dy2 + dz2;
    d = d > 1 ? d : 0;
  }
  return d;
};

// Return 0 if Point is near xf,yf
Point.compare2d = function compare2D(p1, p2) {
  const dx2 = (p1.xf - p2.xf) * (p1.xf - p2.xf);
  const dy2 = (p1.yf - p2.yf) * (p1.yf - p2.yf);
  return Math.sqrt(dx2 + dy2);
};

export {Point};
