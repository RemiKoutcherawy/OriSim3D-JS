// File: src/Plane.js

import {Vec3} from "./Vec3.js";

// Plane is defined by an origin point R and a normal vector N
// a point P is on plane if and only if RP.N = 0
function Plane(r, n) {
  this.r = r; // Vec3
  this.n = n; // Vec3
}

Object.assign(Plane.prototype, {

  // Return true if Point p is on this Plane
  isOnPlane: function (p) {
    // Point P is on plane iff RP.N = 0
    const rp = p.sub(this.r);
    const d = rp.dot(this.n);
    return (Math.abs(d) < 0.1);
  },

  // Return Point p intersection of this plane with segment defined by two points or null
  intersectPoint: function (a, b) {
    // (A+tAB).N = d <=> t = (d-A.N)/(AB.N) then Q=A+tAB 0<t<1
    const ab = new Vec3(b.x - a.x, b.y - a.y, b.z - a.z);
    const abn = ab.dot(this.n);
    // segment parallel to plane
    if (abn === 0)
      return null;
    // segment crossing
    const t = (this.n.dot(this.r) - this.n.dot(a)) / abn;
    if (t >= 0 && t <= 1.0)
      return a.clone().add(ab.scale(t));
    return null;
  },

  // Return Point p intersection of this plane with Segment s or null
  intersectSeg: function (s) {
    // (A+tAB).N=d <=> t=(d-A.N)/(AB.N) then Q=A+tAB 0<t<1
    const ab = new Vec3(s.p2.x - s.p1.x, s.p2.y - s.p1.y, s.p2.z - s.p1.z);
    const abn = ab.dot(this.n);
    if (abn === 0)
      return null;
    const t = (this.n.dot(this.r) - s.p1.dot(this.n)) / abn;
    if (t >= 0 && t <= 1.0)
      return s.p1.clone().add(ab.scale(t));
    return null;
  },

  // Classify point to thick plane : 1 in front, 0 on, -1 behind
  classifyPointToPlane: function (p) {
    // (A+tAB).N = d <=> d<e front, d>e behind, else on plane
    const dist = this.n.dot(this.r) - this.n.dot(p);
    if (dist > 1) // THICKNESS =1
      return 1;
    if (dist < -1)
      return -1;
    return 0;
  },

  // toString
  toString: function () {
    return "Pl[r:" + this.r + " n:" + this.n + "]";
  },

});

// Static

// Define a plane across 2 points
Plane.across = function (p1,p2) {
  const middle = new Vec3((p1.x + p2.x) / 2, (p1.y + p2.y) / 2, (p1.z + p2.z) / 2);
  const normal = new Vec3(p2.x - p1.x, p2.y - p1.y, p2.z - p1.z);
  return new Plane(middle, normal);
};

// Plane by 2 points along Z
Plane.by = function (p1, p2) {
  const r = new Vec3(p1.x, p1.y, p1.z);
  // Cross product P2P1 x 0Z
  const n = new Vec3((p2.y - p1.y), -(p2.x - p1.x), 0);
  return new Plane(r, n);
};

// Plane orthogonal to Segment and passing by Point
Plane.ortho = function (s, p) {
  const r = new Vec3(p.x, p.y, p.z);
  const normal = new Vec3((s.p2.x - s.p1.x), (s.p2.y - s.p1.y), (s.p2.z - s.p1.z));
  return new Plane(r, normal);
};

export {Plane};