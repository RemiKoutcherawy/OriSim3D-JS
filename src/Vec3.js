// File src/Vec3.js

function Vec3(x, y, z) {

  this.x = x || 0;
  this.y = y || 0;
  this.z = z || 0;

}

Object.assign(Vec3.prototype, {

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
    const lg = this.length();
    return this.scale(1.0 / lg);
  },

});

// Dot a with b
Vec3.dot = function dot(a, b) {
  return a.x * b.x + a.y * b.y + a.z * b.z;
};

// New Vector a + b
Vec3.add = function add(a, b) {
  return new Vec3(a.x + b.x, a.y + b.y, a.z + b.z);
};

// New Vector a - b
Vec3.sub = function sub(a, b) {
  return new Vec3(a.x - b.x, a.y - b.y, a.z - b.z);
};

export {Vec3};
