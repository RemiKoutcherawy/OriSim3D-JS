// File: js/Segment.js

// Dependencies : import them before Segment.js in browser
// Test in NodeJS
if (NODE_ENV === true && typeof require === 'function') {
  var Point = require('./Point.js');
}

// Segment to hold Segments : Two points p1 p2
var Segment = function (p1, p2, type) {
  // API
  this.p1        = p1;
  this.p2        = p2;
  this.type      = Segment.PLAIN | type;
  this.angle     = 0;
  this.highlight = false;

  // Reverse order of the 2 points of this segment
  function reverse() {
    const p   = this.p1;
    this.p1 = this.p2;
    this.p2 = p;
  }

  // 3D Length in space
  function length3d() {
    return Math.sqrt((this.p1.x - this.p2.x) * (this.p1.x - this.p2.x)
      + (this.p1.y - this.p2.y) * (this.p1.y - this.p2.y)
      + (this.p1.z - this.p2.z) * (this.p1.z - this.p2.z));
  }

  // 2D Length in flat view
  function length2d() {
    return Math.sqrt(
      (this.p1.xf - this.p2.xf) * (this.p1.xf - this.p2.xf)
      + (this.p1.yf - this.p2.yf) * (this.p1.yf - this.p2.yf));
  }

  // String representation
  function toString() {
    return "S(P1:"+this.p1.toXYZString()+" "+this.p1.toXYString()+", P2:"+this.p2.toXYZString()+" "+this.p2.toXYString()+")";
    // +" type:"+this.type+" angle:"+this.angle
    // +" 2d:"+this.lg2d+" 3d:"+this.lg3d+" "
    // +" L="+faceLeft+" R="+faceRight+")";
  }

  // API
  this.reverse = reverse;
  this.length3d = length3d;
  this.length2d = length2d;
  this.toString = toString;
};

// Class method
Segment.prototype.constructor = Segment;

// Static values
Segment.PLAIN     = 0;
Segment.EDGE      = 1;
Segment.MOUNTAIN  = 2;
Segment.VALLEY    = 3;
Segment.TEMPORARY = -1;
Segment.EPSILON   = 0.01;

// Static methods

// Compares segments s1 with s2
Segment.compare = function (s1, s2) {
  var d = Point.compare3d(s1.p1, s2.p1) + Point.compare3d(s2.p2, s2.p2);
  return d > 1 ? d : 0;
};

// 2D Distance between Segment and Point @testOK
Segment.distanceToSegment = function (seg, pt) {
  var x1 = seg.p1.x;
  var y1 = seg.p1.y;
  var x2 = seg.p2.x;
  var y2 = seg.p2.y;
  var x = pt.x;
  var y = pt.y;
  var l2 = (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2);
  var r = ((y1 - y) * (y1 - y2) + (x1 - x) * (x1 - x2)) / l2;
  var s = ((y1 - y) * (x2 - x1) - (x1 - x) * (y2 - y1)) / l2;
  var d = 0;
  if (r <= 0) {
    d = Math.sqrt((x - x1) * (x - x1) + (y - y1) * (y - y1));
  } else if (r >= 1) {
    d = Math.sqrt((x - x2) * (x - x2) + (y - y2) * (y - y2));
  } else {
    d = (Math.abs(s) * Math.sqrt(l2));
  }
  return d;
};

// Closest points from s1 to s2 returned as a new segment
Segment.closestSeg = function closestSeg(s1, s2) {
  // On this segment we have : S1(t1)=p1+t1*(p2-p1)       = p1+t1*v1   = p
  // On v argument we have   : S2(t2)=v.p1+t2*(v.p2-v.p1) = s2.p2+t2*v2 = q
  // Vector pq perpendicular to both lines : pq(t1,t2).v1=0  pq(t1,t2).v2=0
  // Cramer system :
  // (v1.v1)*t1 - (v1.v2)*t2 = -v1.r <=> a*t1 -b*t2 = -c
  // (v1.v2)*t1 - (v2.v2)*t2 = -v2.r <=> b*t1 -e*t2 = -f
  // Solved to t1=(bf-ce)/(ae-bb) t2=(af-bc)/(ae-bb)
  var t1;
  var t2;
  // s1 direction
  var v1 = new Point(s1.p2.x - s1.p1.x, s1.p2.y - s1.p1.y, s1.p2.z - s1.p1.z);
  // s2 direction
  var v2 = new Point(s2.p2.x - s2.p1.x, s2.p2.y - s2.p1.y, s2.p2.z - s2.p1.z);
  // s2.p1 to s1.p1
  var r = new Point(s1.p1.x - s2.p1.x, s1.p1.y - s2.p1.y, s1.p1.z - s2.p1.z);
  var a = Point.dot(v1,v1); // squared length of s1
  var e = Point.dot(v2,v2); // squared length of s2
  var f = Point.dot(v2,r);  //
  // Check degeneration of segments into points
  if (a <= Segment.EPSILON && e <= Segment.EPSILON) {
    // Both degenerate into points
    t1 = t2 = 0.0;
    return new Segment(s1.p1, s2.p1, Segment.TEMPORARY);
  }
  if (a <= Segment.EPSILON) {
    // This segment degenerate into point
    t1 = 0.0;
    t2 = f / e; // t1=0 => t2 = (b*t1+f)/e = f/e
    t2 = t2 < 0 ? 0 : t2 > 1 ? 1 : t2;
  } else {
    var c = Point.dot(v1, r);
    if (e <= Segment.EPSILON) {
      // Second segment degenerate into point
      t2 = 0.0;
      t1 = -c / a; // t2=0 => t1 = (b*t2-c)/a = -c/a
      t1 = t1 < 0 ? 0 : t1 > 1 ? 1 : t1;
    } else {
      // General case
      var b = Point.dot(v1, v2); // Delayed computation of b
      var denom = a * e - b * b; // Denominator of Cramer system
      // Segments not parallel, compute closest and clamp
      if (denom !== 0.0) {
        t1 = (b * f - c * e) / denom;
        t1 = t1 < 0 ? 0 : t1 > 1 ? 1 : t1;
      }
      else {
        // Arbitrary point, here 0 => p1
        t1 = 0;
      }
      // Compute closest on L2 using
      t2 = (b * t1 + f) / e;
      // if t2 in [0,1] done, else clamp t2 and recompute t1
      if (t2 < 0.0) {
        t2 = 0;
        t1 = -c / a;
        t1 = t1 < 0 ? 0 : t1 > 1 ? 1 : t1;
      }
      else if (t2 > 1.0) {
        t2 = 1.0
        ;
        t1 = (b - c) / a;
        t1 = t1 < 0 ? 0 : t1 > 1 ? 1 : t1;
      }
    }
  }
  var c1 = Point.add(s1.p1, v1.scale(t1)); // c1 = p1+t1*(p2-p1)
  var c2 = Point.add(s2.p1, v2.scale(t2)); // c2 = p1+t2*(p2-p1)
  return new Segment(c1, c2);
};

// Closest points from s1(line) to s2(line) returned as a new segment
Segment.closestLine = function closestLine(s1, s2) {
  // On s1 segment we have : S1(t1)=p1+t1*(p2-p1)       = p1+t1*v1   = p
  // On s2 segment we have : S2(t2)=v.p1+t2*(v.p2-v.p1) = s2.p2+t2*v2 = q
  // Vector pq perpendicular to both lines : pq(t1,t2).v1=0  pq(t1,t2).v2=0
  // Cramer system :
  // (v1.v1)*t1 - (v1.v2)*t2 = -v1.r <=> a*t1 -b*t2 = -c
  // (v1.v2)*t1 - (v2.v2)*t2 = -v2.r <=> b*t1 -e*t2 = -f
  // Solved to t1=(bf-ce)/(ae-bb) t2=(af-bc)/(ae-bb)
  var t1;
  var t2;
  var v1 = new Point(s1.p2.x - s1.p1.x, s1.p2.y - s1.p1.y, s1.p2.z - s1.p1.z); // s1 direction
  var v2 = new Point(s2.p2.x - s2.p1.x, s2.p2.y - s2.p1.y, s2.p2.z - s2.p1.z); // s direction
  var r = new Point(s1.p1.x - s2.p1.x, s1.p1.y - s2.p1.y, s1.p1.z - s2.p1.z); // s2.p1 to s1.p1
  var a = Point.dot(v1, v1); // squared length of s1
  var e = Point.dot(v2, v2); // squared length of s
  var f = Point.dot(v2, r);  //
  // Check degeneration of segments into points
  if (a <= Segment.EPSILON && e <= Segment.EPSILON) {
    // Both degenerate into points
    t1 = t2 = 0.0;
    return new Segment(s1.p1, s2.p1, Segment.TEMPORARY, -1);
  }
  if (a <= Segment.EPSILON) {
    // This segment degenerate into point
    t1 = 0.0;
    t2 = f / e; // t1=0 => t2 = (b*t1+f)/e = f/e
  } else {
    var c = Point.dot(v1, r);
    if (e <= Segment.EPSILON) {
      // Second segment degenerate into point
      t2 = 0.0;
      t1 = -c / a; // t2=0 => t1 = (b*t2-c)/a = -c/a
    } else {
      // General case
      var b = Point.dot(v1, v2); // Delayed computation of b
      var denom = a * e - b * b; // Denominator of cramer system
      // Segments not parallel, compute closest
      if (denom !== 0.0) {
        t1 = (b * f - c * e) / denom;
      }
      else {
        // Arbitrary point, here 0 => p1
        t1 = 0;
      }
      // Compute closest on L2 using
      t2 = (b * t1 + f) / e;
    }
  }
  var c1 = Point.add(s1.p1, v1.scale(t1)); // c1 = p1+t1*(p2-p1)
  var c2 = Point.add(s2.p1, v2.scale(t2)); // c2 = p1+t2*(p2-p1)
  return new Segment(c1, c2);
};

// For NodeJS, will be discarded by uglify
if (NODE_ENV === true && typeof module !== 'undefined') {
  module.exports = Segment;
}