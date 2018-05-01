// File src/Vec3.js
// Just a vector

function Vec3(x, y, z) {
  this.x = x || 0;
  this.y = y || 0;
  this.z = z || 0;
}

Object.assign(Vec3.prototype, {

  // Set x y z 3D
  set3d: function set3d(x, y, z) {
    this.x = 0 | x;
    this.y = 0 | y;
    this.z = 0 | z;
    return this;
  },

  // Sqrt(this.this)
  lengthSq: function lengthSq() {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  },

  // Scale
  scale: function scale(t) {
    this.x *= t;
    this.y *= t;
    this.z *= t;
    return this;
  },

  // Normalize as a vector
  norm: function norm() {
    const lg = Math.sqrt(this.lengthSq());
    return this.scale(1.0 / lg);
  },

  // Dot a with b
  dot: function dot(b) {
    return this.x * b.x + this.y * b.y + this.z * b.z;
  },

  // New Vector a + b
  add: function add(b) {
    return new Vec3(this.x + b.x, this.y + b.y, this.z + b.z);
  },

  // New Vector a - b
  sub: function sub(b) {
    return new Vec3(this.x - b.x, this.y - b.y, this.z - b.z);
  },

  // Clone
  clone: function () {
    return new this.constructor(this.x, this.y, this.z);
  },

  // String representation [x,y,z xf,yf]
  toString: function toString() {
    return "[" + Math.round(this.x) + "," + Math.round((this.y)) + "," + Math.round(this.z) + "]";
  },

});

export {Vec3};
