// File: js/Plane.js
// Dependencies : import them before Plane.js in browser
if (NODE_ENV === true && typeof module !== 'undefined' && module.exports) {
  var OR = OR || {};
  OR.Point = require("./Point.js");
}

// Plane is defined by an origin point R and a normal vector N
// a point P is on plane if and only if RP.N = 0
OR.Plane = function (r, n) {
  this.r = r;
  this.n = n;

  function isOnPlane(p) {
    // Point P is on plane iff RP.N = 0
    var rp = OR.Point.sub(p, this.r);
    var d  = OR.Point.dot(rp, this.n);
    return (Math.abs(d) < 0.1);
  }

  // Intersection of This plane with segment defined by two points
  function intersectPoint(a, b) {
    // (A+tAB).N = d <=> t = (d-A.N)/(AB.N) then Q=A+tAB 0<t<1
    var ab  = new OR.Point(b.x - a.x, b.y - a.y, b.z - a.z);
    var abn = OR.Point.dot(ab, this.n);
    // segment parallel to plane
    if (abn === 0)
      return null;
    // segment crossing
    var t = (OR.Point.dot(this.r, this.n) - OR.Point.dot(a, this.n)) / abn;
    if (t >= 0 && t <= 1.0)
      return OR.Point.add(a, ab.scale(t));
    return null;
  }

  // Intersection of This plane with Segment Return Point or null
  function intersectSeg(s) {
    // (A+tAB).N=d <=> t=(d-A.N)/(AB.N) then Q=A+tAB 0<t<1
    var ab  = new OR.Point(s.p2.x - s.p1.x, s.p2.y - s.p1.y, s.p2.z - s.p1.z);
    var abn = OR.Point.dot(ab, this.n);
    if (abn === 0)
      return null;
    var t = (OR.Point.dot(this.r, this.n) - OR.Point.dot(s.p1, this.n)) / abn;
    if (t >= 0 && t <= 1.0)
      return OR.Point.add(s.p1, ab.scale(t));
    return null;
  }

  // Classify point to thick plane 1 in front 0 on -1 behind
  function classifyPointToPlane(p) {
    // (A+tAB).N = d <=> d<e front, d>e behind, else on plane
    var dist = OR.Point.dot(this.r, this.n) - OR.Point.dot(this.n, p);
    if (dist > OR.Plane.THICKNESS)
      return 1;
    if (dist < -OR.Plane.THICKNESS)
      return -1;
    return 0;
  }

  // toString
  function toString() {
    return "Pl[r:" + this.r + " n:" + this.n + "]";
  }

  // API
  this.isOnPlane = isOnPlane;
  this.intersectPoint = intersectPoint;
  this.intersectSeg = intersectSeg;
  this.classifyPointToPlane = classifyPointToPlane;
  this.toString = toString;
};

// Static values
OR.Plane.THICKNESS = 1;

// Static methods

// Define a plane across 2 points
OR.Plane.across = function (p1, p2) {
  var middle = new OR.Point((p1.x + p2.x) / 2, (p1.y + p2.y) / 2, (p1.z + p2.z) / 2);
  var normal = new OR.Point(p2.x - p1.x, p2.y - p1.y, p2.z - p1.z);
  return new OR.Plane(middle, normal);
};

// Plane by 2 points along Z
OR.Plane.by     = function (p1, p2) {
  var r = new OR.Point(p1.x, p1.y, p1.z);
  // Cross product P2P1 x 0Z
  var n = new OR.Point(p2.y - p1.y, -(p2.x - p1.x), 0);
  return new OR.Plane(r, n);
};

// Plane orthogonal to Segment and passing by Point
OR.Plane.ortho  = function (s, p) {
  var r      = new OR.Point(p.x, p.y, p.z);
  var normal = new OR.Point(s.p2.x - s.p1.x, s.p2.y - s.p1.y, s.p2.z - s.p1.z);
  return new OR.Plane(r, normal);
};

// Just for Node.js
if (NODE_ENV === true && typeof module !== 'undefined') {
  module.exports = OR.Plane;
}
