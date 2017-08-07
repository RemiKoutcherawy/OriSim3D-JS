// File:src/Point.js
"use strict";

// Point to hold Points
// 3D : x y z
// Flat crease pattern : xf, yf
function Point(xf, yf, x, y, z) {
  this.debug = false;

  // Create new Point(x,y,z)
  if (arguments.length === 3) {
    if (this.debug){console.log("Point 3D:"+xf+" "+yf+" "+x+" "+y+" "+z);}
    // x y z 3D
    this.x  = xf;
    this.y  = yf;
    this.z  = x;
    // x y Flat, in unfolded state
    this.xf = xf;
    this.yf = yf;
    return this;
  }
  // Create new Point(xf,yf)
  else if (arguments.length === 2) {
    if (this.debug){console.log("Point 2D:"+xf+" "+yf+" "+x+" "+y+" "+z);}
    // x y Flat, in unfolded state
    this.xf = xf;
    this.yf = yf;
    // x y z 3D
    this.x  = xf;
    this.y  = yf;
    this.z  = 0;
    return this;
  }
  // Create with new Point(xf,yf, x,y,z)
  else {
    if (this.debug){console.log("Point 5D:"+xf+" "+yf+" "+x+" "+y+" "+z);}
    // x y Flat, in unfolded state
    this.xf = 0 | xf;
    this.yf = 0 | yf;
    // x y z 3D
    this.x = 0 | x;
    this.y = 0 | y;
    this.z = 0 | z;
  }
  if (this.debug){console.log("Point:"+this.xf+" "+this.yf+" "+this.x+" "+this.y+" "+this.z);}
  return this;
}

// Class methods
Point.prototype = {
  constructor: Point,
  // Set x y Flat and  x y z 3D 
  set5d: function (xf,yf, x,y,z) {
    if (this.debug){console.log("set5d:"+xf+" "+yf+" "+x+" "+y+" "+z);}
    // x y Flat, in unfolded state
    this.xf = 0 | xf;
    this.yf = 0 | yf;
    // x y z 3D
    this.x  = 0 | x;
    this.y  = 0 | y;
    this.z  = 0 | z;
  },
  // Set x y z 3D 
  set3d: function (x,y,z) {
    if (this.debug){console.log("set3d:"+x+" "+y+" "+z);}
    this.x  = 0 | x;
    this.y  = 0 | y;
    this.z  = 0 | z;
  },
  // Set x y z 2D
  set2d: function (xf,yf) {
    if (this.debug){console.log("set3d:"+xf+" "+yf);}
    this.xf  = 0 | xf;
    this.yf  = 0 | yf;
  },
  // Sqrt(this.this) 
  length: function () {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  },
  // Scale 
  scale: function (t){
    this.x *= t;
    this.y *= t;
    this.z *= t;
    return this;
  },
  // Normalize as a vector 
  norm: function (){
    let lg = this.length();
    return this.scale(1/lg);
  },

  // String representation 
  toString: function () {
    return "[" + Math.round(this.x)+","+ Math.round(this.y)+","+ Math.round(this.z)
      + "  "+ Math.round(this.xf)+","+Math.round(this.yf)+"]";
  },
  // Short String representation 
  toXYZString:function () {
    return "[" + Math.round(this.x) + "," + Math.round(this.y) + "," + Math.round(this.z) + "]";
  },
  // Short String representation 
  toXYString:function () {
    return "[" + Math.round(this.xf) + "," + Math.round(this.yf) + "]";
  }
};

// Static methods
// Dot a with b 
Point.dot = function dot(a, b) {
  return a.x * b.x + a.y * b.y + a.z * b.z;
};
// New Vector A + B 
Point.add = function add(A, B) {
  return new Point(A.x + B.x, A.y + B.y, A.z + B.z);
};
// New Vector A - B 
Point.sub = function sub(A, B) {
  return new Point(A.x - B.x, A.y - B.y, A.z - B.z);
};
// Return 0 if Point is near x,y,z 
Point.compare3d = function compare3D(p1, p2, y, z) {
  if (arguments.length === 2){
    // compare3D (p1, p2)
    let dx2 = (p1.x - p2.x) * (p1.x - p2.x);
    let dy2 = (p1.y - p2.y) * (p1.y - p2.y);
    let dz2 = (p1.z - p2.z) * (p1.z - p2.z);
    let d = dx2 + dy2 + dz2;
    return d > 1 ? d : 0;
  } else {
    // compare3D (p1, x,y,z)
    let dx2 = (p1.x - p2) * (p1.x - p2);
    let dy2 = (p1.y - y) * (p1.y - y);
    let dz2 = (p1.z - z) * (p1.z - z);
    let d = dx2 + dy2 + dz2;
    return d > 1 ? d : 0;
  }
};
// Return 0 if Point is near xf,yf 
Point.compare2d = function compare2D(p1, p2){
  let dx2 = (p1.xf - p2.xf) * (p1.xf - p2.xf);
  let dy2 = (p1.yf - p2.yf) * (p1.yf - p2.yf);
  return Math.sqrt(dx2 + dy2);
};

// For Node
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Point;
}