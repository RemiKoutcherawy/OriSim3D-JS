// File: src/Segment.js
// Segment holds Two points p1 p2

import {Point} from './Point.js';
import {Vec3} from './Vec3.js';

// Segment to hold Segments : Two points p1 p2
function Segment(p1, p2, type) {
  // API
  this.p1        = p1;
  this.p2        = p2;
  this.type      = Segment.PLAIN | type;
  this.angle     = 0;
  this.select    = false;
}

Object.assign(Segment.prototype, {
  // Reverse order of the 2 points of this Segment
  reverse: function reverse() {
    const p = this.p1;
    this.p1 = this.p2;
    this.p2 = p;
  },

  // 3D Length in space
  length3d: function length3d() {
    return Math.sqrt((this.p1.x - this.p2.x) * (this.p1.x - this.p2.x)
      + (this.p1.y - this.p2.y) * (this.p1.y - this.p2.y)
      + (this.p1.z - this.p2.z) * (this.p1.z - this.p2.z));
  },

  // 2D Length in flat view
  length2d: function length2d() {
    return Math.sqrt(
      (this.p1.xf - this.p2.xf) * (this.p1.xf - this.p2.xf)
      + (this.p1.yf - this.p2.yf) * (this.p1.yf - this.p2.yf));
  },

  // String representation
  toString: function toString() {
    return "S(P1:"+this.p1.toString()+" "+this.p1.toString()+", P2:"+this.p2.toString()+" "+this.p2.toString()+")";
    // +" type:"+this.type+" angle:"+this.angle
    // +" 2d:"+this.lg2d+" 3d:"+this.lg3d+" "
    // +" L="+faceLeft+" R="+faceRight+")";
  },

});

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
  const d = Point.compare3d(s1.p1, s2.p1) + Point.compare3d(s2.p2, s2.p2);
  return d > 1 ? d : 0;
};

// 2D Distance between Segment and Point @testOK
Segment.distanceToSegment = function (seg, pt) {
  const x1 = seg.p1.x;
  const y1 = seg.p1.y;
  const x2 = seg.p2.x;
  const y2 = seg.p2.y;
  const x = pt.x;
  const y = pt.y;
  const l2 = (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2);
  const r = ((y1 - y) * (y1 - y2) + (x1 - x) * (x1 - x2)) / l2;
  const s = ((y1 - y) * (x2 - x1) - (x1 - x) * (y2 - y1)) / l2;
  let d = 0;
  if (r <= 0) {
    d = Math.sqrt((x - x1) * (x - x1) + (y - y1) * (y - y1));
  } else if (r >= 1) {
    d = Math.sqrt((x - x2) * (x - x2) + (y - y2) * (y - y2));
  } else {
    d = (Math.abs(s) * Math.sqrt(l2));
  }
  return d;
};

Segment.closestLine = function closestLine(s1, s2) {
  // On s1 segment we have : S1(t1)=p1+t1*(p2-p1)       = p1+t1*v1   = p
  // On s2 segment we have : S2(t2)=v.p1+t2*(v.p2-v.p1) = s2.p2+t2*v2 = q
  // Vector pq perpendicular to both lines : pq(t1,t2).v1=0  pq(t1,t2).v2=0
  // Cramer system :
  // (v1.v1)*t1 - (v1.v2)*t2 = -v1.r <=> a*t1 -b*t2 = -c
  // (v1.v2)*t1 - (v2.v2)*t2 = -v2.r <=> b*t1 -e*t2 = -f
  // Solved to t1=(bf-ce)/(ae-bb) t2=(af-bc)/(ae-bb)
  let t1;
  let t2;
  const v1 = new Vec3(s1.p2.x - s1.p1.x, s1.p2.y - s1.p1.y, s1.p2.z - s1.p1.z); // s1 direction
  const v2 = new Vec3(s2.p2.x - s2.p1.x, s2.p2.y - s2.p1.y, s2.p2.z - s2.p1.z); // s direction
  const r = new Vec3(s1.p1.x - s2.p1.x, s1.p1.y - s2.p1.y, s1.p1.z - s2.p1.z); // s2.p1 to s1.p1
  const a = Vec3.dot(v1, v1); // squared length of s1
  const e = Vec3.dot(v2, v2); // squared length of s
  const f = Vec3.dot(v2, r);  //
  // Check degeneration of segments into points
  let closest;
  if (a <= Segment.EPSILON && e <= Segment.EPSILON) {
    // Both degenerate into points
    // t1 = t2 = 0.0;
    closest = new Segment(s1.p1, s2.p1, Segment.TEMPORARY, -1);
  } else {
    if (a <= Segment.EPSILON) {
      // This segment degenerate into point
      t1 = 0.0;
      t2 = f / e; // t1=0 => t2 = (b*t1+f)/e = f/e
    } else {
      let c = Vec3.dot(v1, r);
      if (e <= Segment.EPSILON) {
        // Second segment degenerate into point
        t2 = 0.0;
        t1 = -c / a; // t2=0 => t1 = (b*t2-c)/a = -c/a
      } else {
        // General case
        const b = Vec3.dot(v1, v2); // Delayed computation of b
        const denom = a * e - b * b; // Denominator of Cramer system
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
    const c1 = Vec3.add(s1.p1, v1.scale(t1)); // c1 = p1+t1*(p2-p1)
    const c2 = Vec3.add(s2.p1, v2.scale(t2)); // c2 = p1+t2*(p2-p1)
    closest = new Segment(c1, c2);
  }
  return closest;
};

export {Segment};
