// File: js/Plane.js
// Dependencies : import them before Plane.js in browser
if (typeof module !== 'undefined' && module.exports) {
  var Point = require("./Point.js");
}

// Plane is defined by an origin point R and a normal vector N
// a point P is on plane iff RP.N = 0
function Plane(r, n) {
  this.r = r;
  this.n = n;
}

// Static values
Plane.THICKNESS = 1;

// Static methods
// Define a plane across 2 points
Plane.across = function (p1, p2) {
  var middle = new Point((p1.x + p2.x) / 2, (p1.y + p2.y) / 2, (p1.z + p2.z) / 2);
  var normal = new Point(p2.x - p1.x, p2.y - p1.y, p2.z - p1.z);
  return new Plane(middle, normal);
};
// Plane by 2 points along Z
Plane.by     = function (p1, p2) {
  var r = new Point(p1.x, p1.y, p1.z);
  // Cross product P2P1 x 0Z
  var n = new Point(p2.y - p1.y, -(p2.x - p1.x), 0);
  return new Plane(r, n);
};
// Plane orthogonal to Segment and passing by Point
Plane.ortho  = function (s, p) {
  var r      = new Point(p.x, p.y, p.z);
  var normal = new Point(s.p2.x - s.p1.x, s.p2.y - s.p1.y, s.p2.z - s.p1.z);
  return new Plane(r, normal);
};

// Class methods
Plane.prototype = {
  isOnPlane:function (p) {
    // Point P is on plane iff RP.N = 0
    var rp = Point.sub(p, this.r);
    var d  = Point.dot(rp, this.n);
    return (Math.abs(d) < 0.1);
  },
  // Intersection of This plane with segment defined by two points
  intersectPoint:function (a, b) {
    // (A+tAB).N = d <=> t = (d-A.N)/(AB.N) then Q=A+tAB 0<t<1
    var ab  = new Point(b.x - a.x, b.y - a.y, b.z - a.z);
    var abn = Point.dot(ab, this.n);
    // segment parallel to plane
    if (abn === 0)
      return null;
    // segment crossing
    var t = (Point.dot(this.r, this.n) - Point.dot(a, this.n)) / abn;
    if (t >= 0 && t <= 1.0)
      return Point.add(a, ab.scale(t));
    return null;
  },
  // Intersection of This plane with Segment Return Point or null
  intersectSeg:function (s) {
    // (A+tAB).N=d <=> t=(d-A.N)/(AB.N) then Q=A+tAB 0<t<1
    var ab  = new Point(s.p2.x - s.p1.x, s.p2.y - s.p1.y, s.p2.z - s.p1.z);
    var abn = Point.dot(ab, this.n);
    if (abn === 0)
      return null;
    var t = (Point.dot(this.r, this.n) - Point.dot(s.p1, this.n)) / abn;
    if (t >= 0 && t <= 1.0)
      return Point.add(s.p1, ab.scale(t));
    return null;
  },
  // Classify point to thick plane 1 in front 0 on -1 behind
  classifyPointToPlane:function (p) {
    // (A+tAB).N = d <=> d<e front, d>e behind, else on plane
    var dist = Point.dot(this.r, this.n) - Point.dot(this.n, p);
    if (dist > Plane.THICKNESS)
      return 1;
    if (dist < -Plane.THICKNESS)
      return -1;
    return 0;
  },
  // toString
  toString:function () {
    return "Pl[r:" + this.r + " n:" + this.n + "]";
  }
};

// Just for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Plane;
}
