// File: js/Model.js
"use strict";

// Dependencies : import them before Model.js in browser
if (typeof module !== 'undefined' && module.exports) {
  var Point   = require('./Point.js');
  var Segment = require('./Segment.js');
  var Face    = require('./Face.js');
  var Plane   = require('./Plane.js');
}

// Model to hold Points, Segments, Faces
function Model() {
  // Arrays to hold points, faces, segments
  this.points   = [];
  this.segments = [];
  this.faces    = [];
}

// Class methods
Model.prototype = {
  constructor:Model,

  // Initializes this orModel with XY points CCW @testOK
  init:function (list) {
    this.points   = [];
    this.segments = [];
    this.faces    = [];
    this.change   = true;
    let f         = new Face();
    // Add XY XYZ points, make EDGE segments
    let p1        = null;
    for (let i = 0; i < list.length; i += 2) {
      let p2 = this.addPointXYZ(list[i], list[i + 1], list[i], list[i + 1], 0);
      f.points.push(p2);
      if (p1 !== null) {
        this.addSegment(p1, p2, Segment.EDGE);
      }
      p1 = p2;
    }
    this.addSegment(p1, f.points[0], Segment.EDGE);
    this.addFace(f);
    return this;
  },
  // Adds a point to this Model or return the point at x,y @testOK
  addPointXYZ:function (xf, yf, x, y, z) {
    // Create a new Point
    let p = null;
    if (arguments.length === 2) {
      p = new Point(xf, yf);
    } else if (arguments.length === 3) {
      p = new Point(x, y, z);
    } else if (arguments.length === 5) {
      p = new Point(xf, yf, x, y, z);
    } else {
      console.log("Warn wrong number of Args for addPointXYZ")
    }
    this.points.push(p);
    return p;
  },
  // Adds a point to this Model or return existing point @testOK
  addPoint:function (pt) {
    // Search existing points
    for (let i = 0; i < this.points.length; i++) {
      if (Point.compare3d(this.points[i], pt) < 1) {
        // Return existing point instead of pt parameter
        return this.points[i];
      }
    }
    // Add new Point if not already in model
    this.points.push(pt);
    //this.change = true;
    return pt;
  },
  // Adds a segment to this model @testOK
  addSegment:function (p1, p2, type) {
    if (Point.compare3d(p1, p2) === 0) {
      console.log("Warn Add degenerate segment:" + p1);
      // console.log(new Error().stack);
      return null;
    }
    let s = new Segment(p1, p2, type);
    this.segments.push(s);
    //this.change = true;
    return s;
  },
  // Adds a face to this model @testOK
  addFace:function (f) {
    // TODO search existing faces
    this.faces.push(f);
    //this.change = true;
    return f;
  },
  // Align Point p on segment s in 2D from coordinates in 3D @testOK
  align2dFrom3d:function (p, s) {
    // Compute the length from p1 to p in 3D
    let lg3d = Math.sqrt((s.p1.x - p.x) * (s.p1.x - p.x)
      + (s.p1.y - p.y) * (s.p1.y - p.y)
      + (s.p1.z - p.z) * (s.p1.z - p.z));
    // Compute ratio with the segment length
    let t    = lg3d / s.length3d();
    // Set 2D to have the same ratio
    p.xf     = s.p1.xf + t * (s.p2.xf - s.p1.xf);
    p.yf     = s.p1.yf + t * (s.p2.yf - s.p1.yf);
  },
  // Find face on the right of segment a b @testOK
  faceRight:function (a, b) {
    if (b === undefined) {
      // Guess we have a segment instead of two points
      b = a.p2;
      a = a.p1;
    }
    let ia    = 0, ib = 0;
    let right = null;
    this.faces.forEach(function (f) {
      // Both points are in face
      if (((ia = f.points.indexOf(a)) >= 0)
        && ((ib = f.points.indexOf(b)) >= 0)) {
        // a is after b, the face is on the right
        if (ia === ib + 1 || (ib === f.points.length - 1 && ia === 0)) {
          right = f;
        }
      }
    });
    return right;
  },
  // Find face on the left @testOK
  faceLeft:function (a, b) {
    if (b === undefined) {
      // Guess we have a segment instead of two points
      b = a.p2;
      a = a.p1;
    }
    let ia, ib;
    let left = null;
    this.faces.forEach(function (f) {
      // Both points are in face
      if (((ia = f.points.indexOf(a)) >= 0)
        && ((ib = f.points.indexOf(b)) >= 0)) {
        // b is after a, the face is on the left
        if (ib === ia + 1 || (ia === f.points.length - 1 && ib === 0)) {
          left = f;
        }
      }
    });
    return left;
  },
  // Search face containing a and b but which is not f0 @testOK
  searchFace:function (s, f0) {
    let a     = s.p1;
    let b     = s.p2;
    let found = null;
    this.faces.forEach(function (f) {
      if (f0 === null
        && (f.points.indexOf(a)) > -1
        && (f.points.indexOf(b) > -1)) {
        found = f;
      }
      else if (f !== f0
        && (f.points.indexOf(a)) > -1
        && (f.points.indexOf(b) > -1)) {
        found = f;
      }
    });
    return found;
  },

  // Compute angle between face left and right of a segment, angle is positive  @testOK
  computeAngle:function (s) {
    let a     = s.p1;
    let b     = s.p2;
    // Find faces left and right
    let left  = this.faceLeft(a, b);
    let right = this.faceRight(a, b);
    // Compute angle in Degrees at this segment
    if (s.type === Segment.EDGE) {
      console.log("Warn Angle on Edge:" + s);
      // console.log(new Error().stack);
      return 0;
    }
    if (right === null || left === null) {
      console.log("Warn No right and left face for:" + s + " left:" + left + " right:" + right);
      // console.log(new Error().stack);
      return 0;
    }
    let nL  = left.computeFaceNormal();
    let nR  = right.computeFaceNormal();
    // Cross product nL nR
    let cx  = nL[1] * nR[2] - nL[2] * nR[1], cy = nL[2] * nR[0] - nL[0] * nR[2], cz = nL[0] * nR[1] - nL[1] * nR[0];
    // Segment vector
    let vx  = s.p2.x - s.p1.x, vy = s.p2.y - s.p1.y, vz = s.p2.z - s.p1.z;
    // Scalar product between segment and cross product, normed
    let sin = (cx * vx + cy * vy + cz * vz) /
      Math.sqrt(vx * vx + vy * vy + vz * vz);
    // Scalar between normals
    let cos = nL[0] * nR[0] + nL[1] * nR[1] + nL[2] * nR[2];
    if (cos > 1.0)
      cos = 1.0;
    if (cos < -1.0)
      cos = -1.0;
    s.angle = Math.acos(cos) / Math.PI * 180.0;
    if (Number.isNaN(s.angle)) {
      s.angle = 0.0;
    }
    if (sin < 0)
      s.angle = -s.angle;
    // Follow the convention folding in front is positive
    s.angle = -s.angle;
    return s.angle;
  },
  // Search segment containing Points a and b @testOK
  searchSegmentTwoPoints:function (a, b) {
    let list = [];
    this.segments.forEach(function (s) {
      if ((Point.compare3d(s.p1, a) === 0 && Point.compare3d(s.p2, b) === 0)
        || (Point.compare3d(s.p2, a) === 0 && Point.compare3d(s.p1, b) === 0))
        list.push(s);
    });
    if (list.length > 1) {
      console.log("Error More than one segment on 2 points:" + list.length
        + " " + list[0].p1 + list[0].p2 + " " + list[1].p1 + list[1].p2);
      // console.log(new Error().stack);
    }
    if (list.length === 0)
      return null;
    return list[0];
  },
  // Search segments containing Point a @testOK
  searchSegmentsOnePoint:function (a) {
    let list = [];
    this.segments.forEach(function (s) {
      if (s.p1 === a || s.p2 === a)
        list.push(s);
    });
    return list;
  },

  // Splits Segment by a point @testOK
  splitSegmentByPoint:function (s, p) {
    // No new segment if on ending point
    if (Point.compare3d(s.p1, p) === 0 || Point.compare3d(s.p2, p) === 0) {
      return s;
    }
    // Create new Segment
    let s1 = this.addSegment(p, s.p2, s.type);
    // Shorten s
    s.p2   = p;
    s.length2d();
    s.length3d();
    return s1;
  },
  // Split segment on a point, add point to model, update faces containing segment @testOK
  splitSegmentOnPoint:function (s1, p) {
    // Align Point p on segment s in 2D from coordinates in 3D
    this.align2dFrom3d(p, s1);
    // Add point P to first face.
    let l = this.searchFace(s1, null);
    if (l !== null && l.points.indexOf(p) === -1) {
      // Add after P2 or P1 for the left face (CCW)
      let pts = l.points;
      for (let i = 0; i < pts.length; i++) {
        if (pts[i] === s1.p1
          && pts[i === pts.length - 1 ? 0 : i + 1] === s1.p2) {
          pts.splice(i + 1, 0, p);
          break;
        }
        if (pts[i] === s1.p2
          && pts[i === pts.length - 1 ? 0 : i + 1] === s1.p1) {
          pts.splice(i + 1, 0, p);
          break;
        }
      }
    }
    // Add point P to second face.
    let r = this.searchFace(s1, l);
    if (r !== null && r.points.indexOf(p) === -1) {
      let pts = r.points;
      // Add after P2 or P1 for the right face (CCW)
      for (let i = 0; i < pts.length; i++) {
        if (pts[i] === s1.p1 && pts[i === pts.length - 1 ? 0 : i + 1] === s1.p2) {
          pts.splice(i + 1, 0, p);
          break;
        }
        if (pts[i] === s1.p2 && pts[i === pts.length - 1 ? 0 : i + 1] === s1.p1) {
          pts.splice(i + 1, 0, p);
          break;
        }
      }
    }
    // Add this as a new point to the model
    this.addPoint(p);
    // Now we can shorten s to p
    this.splitSegmentByPoint(s1, p);
    return s1;
  },
  // Splits Segment by a ratio k in  ]0 1[ counting from p1 @testOK
  splitSegmentByRatio:function (s, k) {
    // Create new Point
    let p = new Point();
    p.set3d(
      s.p1.x + k * (s.p2.x - s.p1.x),
      s.p1.y + k * (s.p2.y - s.p1.y),
      s.p1.z + k * (s.p2.z - s.p1.z));
    this.splitSegmentOnPoint(s, p);
  },

  // Origami
  // Split Face f by plane pl @testOK except on <:> denerate poly
  splitFaceByPlane:function (f1, pl) {
    let front     = []; // Front side
    let back      = []; // Back side
    let inFront   = false; // Front face with at least one point
    let inBack    = false;  // Back face with at least one point
    let lastinter = null; // Last intersection

    // Begin with last point
    let a     = f1.points[f1.points.length - 1];
    let aSide = pl.classifyPointToPlane(a);
    for (let n = 0; n < f1.points.length; n++) {
      // Segment from previous 'a'  to current 'b'
      // 9 cases : behind -1, on 0, in front +1
      // Push to front and back
      //  	  a  b Inter front back
      // c1) -1  1 i     i b   i    bf
      // c2)  0  1 a     b     .    of
      // c3)  1  1 .     b     .    ff
      // c4)  1 -1 i     i     i b  fb
      // c5)  0 -1 a     .     a b  ob ??
      // c6) -1 -1 .           b    bb
      // c7)  1  0 b     b     .    fo
      // c8)  0  0 a b   b     .    oo
      // c9) -1  0 b     b     b    bo
      let b     = f1.points[n];
      let bSide = pl.classifyPointToPlane(b);
      if (bSide === 1) {    // b in front
        if (aSide === -1) { // a behind
          // c1) b in front, a behind => edge cross bf
          let j = pl.intersectPoint(b, a);
          // Add i to model points
          let i = this.addPoint(j);
          // Add 'i' to front and back sides
          front.push(i);
          back.push(i);
          // Examine segment a,b to split (can be null if already split)
          let s     = this.searchSegmentTwoPoints(a, b);
          let index = this.segments.indexOf(s);
          if (index !== -1) {
            // Set i 2D coordinates from 3D
            this.align2dFrom3d(i, s);
            // Add new segment
            this.addSegment(i, b, Segment.PLAIN);
            // Modify existing set b = i
            // this.segments.splice(index, 1); has drawback
            if (s.p1 === a) {
              s.p2 = i;
            }
            else {
              s.p1 = i;
            }
          }
          // Eventually add segment from last intersection
          if (lastinter !== null) {
            this.addSegment(lastinter, i, Segment.PLAIN);
            lastinter = null;
          } else {
            lastinter = i;
          }
        }
        else if (aSide === 0) {
          // c2) 'b' in front, 'a' on
          lastinter = a;
        }
        else if (aSide === 1) {
          // c3) 'b' in front 'a' in front
        }
        // In all 3 cases add 'b' to front side
        front.push(b);
        inFront = true;
      }
      else if (bSide === -1) {  // b behind
        if (aSide === 1) {        // a in front
          // c4) edge cross add intersection to both sides
          let j = pl.intersectPoint(b, a);
          // Add i to model points
          let i = this.addPoint(j);
          // Add 'i' to front and back sides
          front.push(i);
          back.push(i);
          // Examine segment a,b to split
          let s     = this.searchSegmentTwoPoints(a, b);
          let index = this.segments.indexOf(s);
          if (index !== -1) {
            // Set i 2D coordinates from 3D
            this.align2dFrom3d(i, s);
            // Add new segment
            this.addSegment(i, b, Segment.PLAIN);
            // Modify existing
            // this.segments.splice(index, 1); has drawback
            if (s.p1 === a) {
              s.p2 = i;
            } else {
              s.p1 = i;
            }
          }
          // Eventually add segment from last inter
          if (lastinter !== null && i !== lastinter) {
            this.addSegment(lastinter, i);
            lastinter = null;
          } else {
            lastinter = i;
          }
        }
        else if (aSide === 0) {
          // c5) 'a' on 'b' behind
          if (back[back.length - 1] !== a) {
            back.push(a);
          }
          // Eventually add segment from last inter
          if (lastinter !== null && lastinter !== a) {
            this.addSegment(lastinter, a, Segment.PLAIN);
            lastinter = null;
          } else {
            lastinter = a;
          }
        }
        else if (aSide === -1) {
          // c6) 'a' behind 'b' behind
        }
        // In all 3 cases add current point 'b' to back side
        back.push(b);
        inBack = true;
      }
      else if (bSide === 0) {   // b on
        if (aSide === 1) {
          // c7) 'a' front 'b' on
        }
        if (aSide === 0) {
          // c8) 'a' on 'b' on
        }
        if (aSide === -1) {       // a behind
          // c9 'a' behind 'b' on
          back.push(b);
          // Eventually add segment from last inter
          if (lastinter !== null && lastinter !== b) {
            let s = this.searchSegmentTwoPoints(lastinter, b);
            if (s === null) {
              this.addSegment(lastinter, b, Segment.PLAIN);
            }
            lastinter = null;
          } else {
            lastinter = b;
          }
        }
        // In all 3 cases, add 'b' to front side
        front.push(b);
      }
      // Next edge
      a     = b;
      aSide = bSide;
    }
    // Modify initial face f1 and add new face if not degenerated
    // this.faces.splice(this.faces.indexOf(f1), 1); change Array
    if (inFront) {
      f1.points = front;
      f1        = null;
    }
    if (inBack) {
      if (f1 !== null) {
        f1.points = back;
      } else {
        let f    = new Face();
        f.points = back;
        this.faces.push(f);
        //this.change = true;
      }
    }
  },
  // Split all or given Faces by a plane @testOK
  splitFacesByPlane:function (pl, list) {
    // Split list or all faces
    list = (list !== undefined) ? list : this.faces;
    // When a face is split, one face is modified in Array and one added, at the end
    for (let i = list.length - 1; i > -1; i--) {
      let f = list[i];
      this.splitFaceByPlane(f, pl);
    }
  },
  // Split all or given faces Across two points @testOK
  splitCross:function (p1, p2, list) {
    let pl = Plane.across(p1, p2);
    this.splitFacesByPlane(pl, list);
  },
  // Split all or given faces By two points @testOK
  splitBy:function (p1, p2, list) {
    let pl = Plane.by(p1, p2);
    this.splitFacesByPlane(pl, list);
  },
  // Split faces by a plane Perpendicular to a Segment passing by a Point "p" @testOK
  splitOrtho:function (s, p, list) {
    let pl = Plane.ortho(s, p);
    this.splitFacesByPlane(pl, list);
  },
  // Split faces by a plane between two segments given by 3 points p1 center @testOK
  splitLineToLineByPoints:function (p0, p1, p2, list) {
    // Project p0 on p1 p2
    let p0p1 = Math.sqrt((p1.x - p0.x) * (p1.x - p0.x)
      + (p1.y - p0.y) * (p1.y - p0.y)
      + (p1.z - p0.z) * (p1.z - p0.z));
    let p1p2 = Math.sqrt((p1.x - p2.x) * (p1.x - p2.x)
      + (p1.y - p2.y) * (p1.y - p2.y)
      + (p1.z - p2.z) * (p1.z - p2.z));
    let k    = p0p1 / p1p2;
    let x    = p1.x + k * (p2.x - p1.x);
    let y    = p1.y + k * (p2.y - p1.y);
    let z    = p1.z + k * (p2.z - p1.z);
    // e is on p1p2 symmetric of p0
    let e    = new Point(x, y, z);
    // Define Plane
    let pl   = Plane.by(p0, e);
    this.splitFacesByPlane(pl, list);
  },
  // Split faces by a plane between two segments @testOK
  splitLineToLine:function (s1, s2, list) {
    let s = Segment.closestLine(s1, s2);
    if (s.length3d() < 1) {
      // Segments cross at c Center
      let c = s.p1;
      let a = Point.sub(s1.p1, c).length() > Point.sub(s1.p2, c).length() ? s1.p1 : s1.p2;
      let b = Point.sub(s2.p1, c).length() > Point.sub(s2.p2, c).length() ? s2.p1 : s2.p2;
      this.splitLineToLineByPoints(a, c, b, list);
    } else {
      // Segments do not cross, parallel
      let pl = Plane.across(s.p1, s.p2);
      this.splitFacesByPlane(pl, list);
    }
  },

  // Rotate around axis Segment by angle a list of Points @testOK
  rotate:function (s, angle, list) {
    let angleRd = angle * Math.PI / 180.0;
    let ax      = s.p1.x, ay = s.p1.y, az = s.p1.z;
    let nx      = s.p2.x - ax, ny = s.p2.y - ay, nz = s.p2.z - az;
    let n       = 1.0 / Math.sqrt(nx * nx + ny * ny + nz * nz);
    nx *= n;
    ny *= n;
    nz *= n;
    let sin     = Math.sin(angleRd), cos = Math.cos(angleRd);
    let c1      = 1.0 - cos;
    let c11     = c1 * nx * nx + cos, c12 = c1 * nx * ny - nz * sin, c13 = c1 * nx * nz + ny * sin;
    let c21     = c1 * ny * nx + nz * sin, c22 = c1 * ny * ny + cos, c23 = c1 * ny * nz - nx * sin;
    let c31     = c1 * nz * nx - ny * sin, c32 = c1 * nz * ny + nx * sin, c33 = c1 * nz * nz + cos;
    list.forEach(function (p) {
      let ux = p.x - ax, uy = p.y - ay, uz = p.z - az;
      p.x    = ax + c11 * ux + c12 * uy + c13 * uz;
      p.y    = ay + c21 * ux + c22 * uy + c23 * uz;
      p.z    = az + c31 * ux + c32 * uy + c33 * uz;
    });
    //this.change = true;
  },
  // Turn model around axis by  angle @testOK
  turn:function (axe, angle) {
    angle *= Math.PI / 180.0;
    let ax = 0, ay = 0, az = 0;
    let nx = 0.0;
    let ny = 0.0;
    let nz = 0.0;
    if (axe === 1) {
      nx = 1.0;
    }
    else if (axe === 2) {
      ny = 1.0;
    }
    else if (axe === 3) {
      nz = 1.0;
    }
    let n   = (1.0 / Math.sqrt(nx * nx + ny * ny + nz * nz));
    nx *= n;
    ny *= n;
    nz *= n;
    let sin = Math.sin(angle);
    let cos = Math.cos(angle);
    let c1  = 1.0 - cos;
    let c11 = c1 * nx * nx + cos, c12 = c1 * nx * ny - nz * sin, c13 = c1 * nx * nz + ny * sin;
    let c21 = c1 * ny * nx + nz * sin, c22 = c1 * ny * ny + cos, c23 = c1 * ny * nz - nx * sin;
    let c31 = c1 * nz * nx - ny * sin, c32 = c1 * nz * ny + nx * sin, c33 = c1 * nz * nz + cos;
    this.points.forEach(function (p) {
      let ux = p.x - ax, uy = p.y - ay, uz = p.z - az;
      p.x    = ax + c11 * ux + c12 * uy + c13 * uz;
      p.y    = ay + c21 * ux + c22 * uy + c23 * uz;
      p.z    = az + c31 * ux + c32 * uy + c33 * uz;
    });
  },

  // Adjust one Point on its (eventually given) segments @testOK
  adjust:function (p, segments) {
    // Take all segments containing point p or given list
    let segs = segments || this.searchSegmentsOnePoint(p);
    let dmax = 100;
    // Kaczmarz or Verlet
    // Iterate while length difference between 2d and 3d is > 1e-3
    for (let i = 0; dmax > 0.001 && i < 20; i++) {
      dmax = 0;
      // Iterate over all segments
      // Pm is the medium point
      let pm = new Point(0, 0, 0);
      for (let j = 0; j < segs.length; j++) {
        let s = segs[j];
        let lg3d = s.length3d();
        let lg2d = s.length2d(); // Should not change
        let d    = (lg2d - lg3d);
        if (Math.abs(d) > dmax) {
          dmax = Math.abs(d);
        }
        // Move B Bnew = A + AB * r With r = l2d/l3d
        // AB * r is the extension based on length3d to match length2d
        let r = (lg2d / lg3d);
        if (s.p2 === p) {
          // move p2
          pm.x += s.p1.x + (s.p2.x - s.p1.x) * r;
          pm.y += s.p1.y + (s.p2.y - s.p1.y) * r;
          pm.z += s.p1.z + (s.p2.z - s.p1.z) * r;
        } else if (s.p1 === p) {
          // move p1
          pm.x += s.p2.x + (s.p1.x - s.p2.x) * r;
          pm.y += s.p2.y + (s.p1.y - s.p2.y) * r;
          pm.z += s.p2.z + (s.p1.z - s.p2.z) * r;
        }
      }
      // Average position taking all segments
      if (segs.length !== 0) {
        p.x = pm.x / segs.length;
        p.y = pm.y / segs.length;
        p.z = pm.z / segs.length;
      }
    }
    return dmax;
  },
  // Adjust list of Points @testOK
  adjustList:function (list) {
    let dmax = 100;
    for (let i = 0; dmax > 0.001 && i < 100; i++) {
      dmax     = 0;
      for (let j = 0; j < list.length; j++) {
        let p = list[j];
        let segs = this.searchSegmentsOnePoint(p);
        let d = this.adjust(p, segs);
      }
    }
    return dmax;
  },

  // Evaluate and highlight segments with wrong length
  evaluate:function () {
    let dmax = 0;
    let smax = null;
    // Iterate over all segments
    this.segments.forEach(function (s) {
      let d = Math.abs(s.length2d() - s.length3d());
      if (d < 0.1) {
        s.highlight = false;
      } else {
        s.highlight = true;
        if (d > dmax) {
          dmax = d;
          smax = s;
        }
      }
    });
    return smax;
  },
  // Select (highlight) points
  selectPts:function (pts) {
    //for (let p in pts)
    pts.forEach(function (p) {
      p.select ^= true; // xor
    });
  },
  // Select (highlight) segments
  selectSegs:function (segs) {
    segs.forEach(function (s) {
      s.select ^= true; // xor
    });
  },

  // Move list of points by dx,dy,dz
  move:function (dx, dy, dz, pts) {
    pts = (pts === null) ? this.points : ((pts.length === 0) ? this.points : pts);
    pts.forEach(function (p) {
      p.x += dx;
      p.y += dy;
      p.z += dz;
    });
  },
  // Move on a point P0 all following points, k from 0 to 1 for animation
  moveOn:function (p0, k1, k2, pts) {
    pts.forEach(function (p) {
      p.x = p0.x * k1 + p.x * k2;
      p.y = p0.y * k1 + p.y * k2;
      p.z = p0.z * k1 + p.z * k2;
    });
  },
  // Move on a line S0 all following points, k from 0 to 1 for animation
  moveOnLine:function (s, k1, k2, pts) {
    pts.forEach(function (p) {
      // Point n = s0.closestLine(new Segment(p,p)).p1;
      // First case if there is a segment joining point p and s search point common pc
      let pc = null;
      let pd = null;
      this.segments.some(function (si) {
        if (si.equals(p, s.p1)) {
          pc = si.p2;
          pd = s.p2;
          return true;
        } else if (si.equals(p, s.p2)) {
          pc = si.p2;
          pd = s.p1;
          return true;
        } else if (si.equals(s.p1, p)) {
          pc = si.p1;
          pd = s.p2;
          return true;
        } else if (si.equals(s.p2, p)) {
          pc = si.p1;
          pd = s.p1;
          return true;
        }
      });
      // if we have pc point common and pd point distant
      if (pc !== null) {
        // Turn p on pc pd (keep distance from Pc to P)
        let pcp  = Math.sqrt((pc.x - p.x) * (pc.x - p.x)
          + (pc.y - p.y) * (pc.y - p.y)
          + (pc.z - p.z) * (pc.z - p.z));
        let pcpd = Math.sqrt((pc.x - pd.x) * (pc.x - pd.x)
          + (pc.y - pd.y) * (pc.y - pd.y)
          + (pc.z - pd.z) * (pc.z - pd.z));
        let k    = pcp / pcpd;
        p.x      = (pc.x + k * (pd.x - pc.x)) * k1 + p.x * k2;
        p.y      = (pc.y + k * (pd.y - pc.y)) * k1 + p.y * k2;
        p.z      = (pc.z + k * (pd.z - pc.z)) * k1 + p.z * k2;
      }
      // Second case
      else {
        // console.log("Second case"); Oui ça arrive sur le bateau
        // Project point
        let pp = s.closestLine(new Segment(p, p)).p1;
        // Move point p on projected pp
        p.x    = (p.x + (pp.x - p.x)) * k1 + p.x * k2;
        p.y    = (p.y + (pp.y - p.y)) * k1 + p.y * k2;
        p.z    = (p.z + (pp.z - p.z)) * k1 + p.z * k2;
      }
    }, this);
  },
  // Move given or all points to z = 0
  flat:function (pts) {
    let lp = pts.length === 0 ? this.points : pts;
    lp.forEach(function (p) {
      p.z = 0;
    });
  },
  // Offset by dz all following faces according to Z
  offset:function (dz, lf) {
    lf.forEach(function (f) {
      f.offset = dz * (f.normal[2] >= 0 ? 1 : -1);
    });
  },
  // Offset all faces either behind zero plane or above zero plane
  offsetDecal:function (dcl, list) {
    list    = list.length === 0 ? this.faces : list;
    let max = dcl < 0 ? -1000 : 1000;
    let o   = 0;
    list.forEach(function (f) {
      f.computeFaceNormal();
      o = f.offset * (f.normal[2] >= 0 ? 1 : -1);
      if (dcl < 0 && o > max) max = o;
      if (dcl > 0 && o < max) max = o;
    });
    list.forEach(function (f) {
      f.offset -= (max - dcl) * (f.normal[2] >= 0 ? 1 : -1);
    });
  },
  // Add offset dz to all following faces according to Z
  offsetAdd:function (dz, list) {
    let lf = list.length === 0 ? this.faces : list;
    lf.forEach(function (f) {
      f.offset += dz * (f.normal[2] >= 0 ? 1 : -1);
    });
  },
  // Multiply offset by k for all faces or only listed
  offsetMul:function (k, list) {
    let lf = list.length === 0 ? this.faces : list;
    lf.forEach(function (f) {
      f.offset *= k;
    });
  },
  // Divide offset around average offset, to fold between
  offsetBetween:function (list) {
    let average = 0;
    let n       = 0;
    list.forEach(function (f) {
      average += f.offset * (f.normal[2] >= 0 ? 1 : -1);
      n++;
    });
    average /= n;
    this.faces.forEach(function (f) {
      f.offset -= average * (f.normal[2] >= 0 ? 1 : -1);
    });
    list.forEach(function (f) {
      f.offset /= 2;
    });
  },

  // 2D Boundary [xmin, ymin, xmax, ymax]*/
  get2DBounds:function () {
    let xmax = -100.0, xmin = 100.0;
    let ymax = -100.0, ymin = 100.0;
    this.points.forEach(function (p) {
      let x = p.xf, y = p.yf;
      if (x > xmax) xmax = x;
      if (x < xmin) xmin = x;
      if (y > ymax) ymax = y;
      if (y < ymin) ymin = y;
    });
    return {xmin, ymin, xmax, ymax};
  },
  // Fit the model to -200 +200
  zoomFit:function () {
    let b     = this.get3DBounds();
    let w     = 400;
    let scale = w / Math.max(b[2] - b[0], b[3] - b[1]);
    let cx    = -(b[0] + b[2]) / 2;
    let cy    = -(b[1] + b[3]) / 2;
    this.move(cx, cy, 0, null);
    this.scaleModel(scale);
  },
  // Scale model
  scaleModel:function (scale) {
    this.points.forEach(function (p) {
      p.x *= scale;
      p.y *= scale;
      p.z *= scale;
    });
  },
  // 3D Boundary View [xmin, ymin, xmax, ymax]
  get3DBounds:function () {
    let xmax = -200.0, xmin = 200.0;
    let ymax = -200.0, ymin = 200.0;
    this.points.forEach(function (p) {
      let x = p.x, y = p.y;
      if (x > xmax) xmax = x;
      if (x < xmin) xmin = x;
      if (y > ymax) ymax = y;
      if (y < ymin) ymin = y;
    });
    return [xmin, ymin, xmax, ymax]
  }
};

// Just for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Model;
}
