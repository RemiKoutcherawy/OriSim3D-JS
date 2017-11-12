// File: js/Model.js
// Dependencies : import them before Model.js in browser
if (NODE_ENV === true && typeof module !== 'undefined' && module.exports) {
  var OR = OR || {};
  OR.Point   = require('./Point.js');
  OR.Segment = require('./Segment.js');
  OR.Face    = require('./Face.js');
  OR.Plane   = require('./Plane.js');
}

// Model to hold Points, Segments, Faces
OR.Model = function (list) {
  // Arrays to hold points, faces, segments
  this.points   = [];
  this.segments = [];
  this.faces    = [];
  this.needRebuild = true;
  this.change   = true; // should trigger a redraw

  // Initializes this orModel with XY points CCW @testOK
  function init (list) {
    this.points   = [];
    this.segments = [];
    this.faces    = [];
    var f         = new OR.Face();
    // Add XY as XYZ points, make EDGE segments
    var p1        = null;
    for (var i = 0; i < list.length; i += 2) {
      var p2 = this.addPointXYZ(list[i], list[i + 1], list[i], list[i + 1], 0);
      f.points.push(p2);
      if (p1 !== null) {
        this.addSegment(p1, p2, OR.Segment.EDGE);
      }
      p1 = p2;
    }
    this.addSegment(p1, f.points[0], OR.Segment.EDGE);
    this.addFace(f);
    this.needRebuild = true;
  }

  // Adds a point to this Model or return the point at x,y @testOK
  function addPointXYZ (xf,yf, x,y,z) {
    // Create a new Point
    var p = null;
    if (arguments.length === 2) {
      p = new OR.Point(xf, yf);
    }
    else if (arguments.length === 3) {
      p = new OR.Point(x, y, z);
    }
    else if (arguments.length === 5) {
      p = new OR.Point(xf, yf, x, y, z);
    }
    else {
      console.log("Warn wrong number of Args for addPointXYZ")
    }
    this.points.push(p);
    return p;
  }

  // Adds a point to this Model or return existing point @testOK
  function addPoint (pt) {
    // Search existing points
    for (var i = 0; i < this.points.length; i++) {
      if (OR.Point.compare3d(this.points[i], pt) < 1) {
        // Return existing point instead of pt parameter
        return this.points[i];
      }
    }
    // Add new Point if not already in model
    this.points.push(pt);
    return pt;
  }

  // Adds a segment to this model @testOK
  function addSegment (p1, p2, type) {
    if (OR.Point.compare3d(p1, p2) === 0) {
      console.log("Warn Add degenerate segment:" + p1);
      return null;
    }
    var s = new OR.Segment(p1, p2, type);
    this.segments.push(s);
    return s;
  }

  // Adds a face to this model @testOK
  function addFace (f) {
    // TODO search existing faces
    this.faces.push(f);
    return f;
  }

  // Align Point p on segment s in 2D from coordinates in 3D @testOK
  function align2dFrom3d (p, s) {
    // Compute the length from p1 to p in 3D
    var lg3d = Math.sqrt((s.p1.x - p.x) * (s.p1.x - p.x)
      + (s.p1.y - p.y) * (s.p1.y - p.y)
      + (s.p1.z - p.z) * (s.p1.z - p.z));
    // Compute ratio with the segment length
    var t    = lg3d / s.length3d();
    // Set 2D to have the same ratio
    p.xf     = s.p1.xf + t * (s.p2.xf - s.p1.xf);
    p.yf     = s.p1.yf + t * (s.p2.yf - s.p1.yf);
  } //;

  // Find face on the right of segment a b @testOK
  function faceRight (a, b) {
    if (b === undefined) {
      // Guess we have a segment instead of two points
      b = a.p2;
      a = a.p1;
    }
    var ia    = 0, ib = 0;
    var right = null;
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
  }

  // Find face on the left @testOK
  function faceLeft (a, b) {
    if (b === undefined) {
      // Guess we have a segment instead of two points
      b = a.p2;
      a = a.p1;
    }
    var ia, ib;
    var left = null;
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
  }

  // Search face containing a and b but which is not f0 @testOK
  function searchFace (s, f0) {
    var a     = s.p1;
    var b     = s.p2;
    var found = null;
    this.faces.forEach(function (f) {
      if (f0 === null
        && (f.points.indexOf(a) > -1)
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
  }

  // Compute angle between face left and right of a segment, angle is positive  @testOK
  function computeAngle (s) {
    var a     = s.p1;
    var b     = s.p2;
    // Find faces left and right
    var left  = this.faceLeft(a, b);
    var right = this.faceRight(a, b);
    // Compute angle in Degrees at this segment
    if (s.type === OR.Segment.EDGE) {
      console.log("Warn Angle on Edge:" + s);
      return 0;
    }
    if (right === null || left === null) {
      console.log("Warn No right and left face for:" + s + " left:" + left + " right:" + right);
      return 0;
    }
    var nL  = left.computeFaceNormal();
    var nR  = right.computeFaceNormal();
    // Cross product nL nR
    var cx  = nL[1] * nR[2] - nL[2] * nR[1], cy = nL[2] * nR[0] - nL[0] * nR[2], cz = nL[0] * nR[1] - nL[1] * nR[0];
    // Segment vector
    var vx  = s.p2.x - s.p1.x, vy = s.p2.y - s.p1.y, vz = s.p2.z - s.p1.z;
    // Scalar product between segment and cross product, normed
    var sin = (cx * vx + cy * vy + cz * vz) /
      Math.sqrt(vx * vx + vy * vy + vz * vz);
    // Scalar between normals
    var cos = nL[0] * nR[0] + nL[1] * nR[1] + nL[2] * nR[2];
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
  }

  // Search segment containing Points a and b @testOK
  function searchSegmentTwoPoints (a, b) {
    var list = [];
    this.segments.forEach(function (s) {
      if ((OR.Point.compare3d(s.p1, a) === 0 && OR.Point.compare3d(s.p2, b) === 0)
        ||(OR.Point.compare3d(s.p2, a) === 0 && OR.Point.compare3d(s.p1, b) === 0) )
        list.push(s);
    });
    if (list.length > 1) {
      console.log("Error More than one segment on 2 points:" + list.length
        + " " + list[0].p1 + list[0].p2 + " " + list[1].p1 + list[1].p2);
    }
    if (list.length === 0)
      return null;
    return list[0];
  }

  // Search segments containing Point a @testOK
  function searchSegmentsOnePoint (a) {
    var list = [];
    this.segments.forEach(function (s) {
      if (s.p1 === a || s.p2 === a)
        list.push(s);
    });
    return list;
  }

  // Splits Segment by a point @testOK
  function splitSegmentByPoint (s, p) {
    // No new segment if on ending point
    if (OR.Point.compare3d(s.p1, p) === 0 || OR.Point.compare3d(s.p2, p) === 0) {
      return s;
    }
    // Create new Segment
    var s1 = this.addSegment(p, s.p2, s.type);
    // Shorten s
    s.p2   = p;
    s.length2d();
    s.length3d();
    return s1;
  }

  // Split segment on a point, add point to model, update faces containing segment @testOK
  function splitSegmentOnPoint (s1, p) {
    var pts = null, i = null;

    // Align Point p on segment s in 2D from coordinates in 3D
    this.align2dFrom3d(p, s1);
    // Add point P to first face.
    var l = this.searchFace(s1, null);
    if (l !== null && l.points.indexOf(p) === -1) {
      // Add after P2 or P1 for the left face (CCW)
      pts = l.points;
      for (i = 0; i < pts.length; i++) {
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
    var r = this.searchFace(s1, l);
    if (r !== null && r.points.indexOf(p) === -1) {
      pts = r.points;
      // Add after P2 or P1 for the right face (CCW)
      for (i = 0; i < pts.length; i++) {
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
  }

  // Splits Segment by a ratio k in  ]0 1[ counting from p1 @testOK
  function splitSegmentByRatio (s, k) {
    // Create new Point
    var p = new OR.Point();
    p.set3d(
      s.p1.x + k * (s.p2.x - s.p1.x),
      s.p1.y + k * (s.p2.y - s.p1.y),
      s.p1.z + k * (s.p2.z - s.p1.z));
    this.splitSegmentOnPoint(s, p);
  }

  // Origami
  // Split Face f by plane pl @testOK except on <:> degenerate poly
  // Complex by design
  function splitFaceByPlane (f1, pl) {
    var front     = []; // Front side
    var back      = []; // Back side
    var inFront   = false; // Front face with at least one point
    var inBack    = false;  // Back face with at least one point
    var lastinter = null; // Last intersection

    // Begin with last point
    var a     = f1.points[f1.points.length - 1];
    var aSide = pl.classifyPointToPlane(a);
    for (var n = 0; n < f1.points.length; n++) {
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
      var b     = f1.points[n];
      var bSide = pl.classifyPointToPlane(b);
      if (bSide === 1) {    // b in front
        if (aSide === -1) { // a behind
          // c1) b in front, a behind => edge cross bf
          var j = pl.intersectPoint(b, a);
          // Add i to model points
          var i = this.addPoint(j);
          // Add 'i' to front and back sides
          front.push(i);
          back.push(i);
          // Examine segment a,b to split (can be null if already split)
          var s     = this.searchSegmentTwoPoints(a, b);
          var index = this.segments.indexOf(s);
          if (index !== -1) {
            // Set i 2D coordinates from 3D
            this.align2dFrom3d(i, s);
            // Add new segment
            this.addSegment(i, b, OR.Segment.PLAIN);
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
            this.addSegment(lastinter, i, OR.Segment.PLAIN);
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
          j = pl.intersectPoint(b, a);
          // Add i to model points
          i = this.addPoint(j);
          // Add 'i' to front and back sides
          front.push(i);
          back.push(i);
          // Examine segment a,b to split
          s     = this.searchSegmentTwoPoints(a, b);
          index = this.segments.indexOf(s);
          if (index !== -1) {
            // Set i 2D coordinates from 3D
            this.align2dFrom3d(i, s);
            // Add new segment
            this.addSegment(i, b, OR.Segment.PLAIN);
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
          if (back[back.length - 1] !== a){
            back.push(a);
          }
          // Eventually add segment from last inter
          if (lastinter !== null && lastinter !== a) {
            this.addSegment(lastinter, a, OR.Segment.PLAIN);
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
            s = this.searchSegmentTwoPoints(lastinter, b);
            if (s === null) {
              this.addSegment(lastinter, b, OR.Segment.PLAIN);
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
        var f    = new OR.Face();
        f.points = back;
        this.faces.push(f);
      }
    }
  }

  // Split all or given Faces by a plane @testOK
  function splitFacesByPlane (pl, list) {
    // Split list or all faces
    list = (list !== undefined) ? list : this.faces;
    // When a face is split, one face is modified in Array and one added, at the end
    for (var i = list.length - 1; i > -1; i--) {
      var f = list[i];
      this.splitFaceByPlane(f, pl);
    }
  }

  // Split all or given faces Across two points @testOK
  function splitCross (p1, p2, list) {
    var pl = OR.Plane.across(p1, p2);
    this.splitFacesByPlane(pl, list);
  }

  // Split all or given faces By two points @testOK
  function splitBy (p1, p2, list) {
    var pl = OR.Plane.by(p1, p2);
    this.splitFacesByPlane(pl, list);
  }

  // Split faces by a plane Perpendicular to a Segment passing by a Point "p" @testOK
  function splitOrtho (s, p, list) {
    var pl = OR.Plane.ortho(s, p);
    this.splitFacesByPlane(pl, list);
  }

  // Split faces by a plane between two segments given by 3 points p1 center @testOK
  function splitLineToLineByPoints (p0, p1, p2, list) {
    // Project p0 on p1 p2
    var p0p1 = Math.sqrt((p1.x - p0.x) * (p1.x - p0.x)
      + (p1.y - p0.y) * (p1.y - p0.y)
      + (p1.z - p0.z) * (p1.z - p0.z));
    var p1p2 = Math.sqrt((p1.x - p2.x) * (p1.x - p2.x)
      + (p1.y - p2.y) * (p1.y - p2.y)
      + (p1.z - p2.z) * (p1.z - p2.z));
    var k    = p0p1 / p1p2;
    var x    = p1.x + k * (p2.x - p1.x);
    var y    = p1.y + k * (p2.y - p1.y);
    var z    = p1.z + k * (p2.z - p1.z);
    // e is on p1p2 symmetric of p0
    var e    = new OR.Point(x, y, z);
    // Define Plane
    var pl   = OR.Plane.by(p0, e);
    this.splitFacesByPlane(pl, list);
  }

  // Split faces by a plane between two segments @testOK
  function splitLineToLine (s1, s2, list) {
    var s = OR.Segment.closestLine(s1, s2);
    if (s.length3d() < 1) {
      // Segments cross at c Center
      var c = s.p1;
      var a = OR.Point.sub(s1.p1, c).length() > OR.Point.sub(s1.p2, c).length() ? s1.p1 : s1.p2;
      var b = OR.Point.sub(s2.p1, c).length() > OR.Point.sub(s2.p2, c).length() ? s2.p1 : s2.p2;
      this.splitLineToLineByPoints(a, c, b, list);
    } else {
      // Segments do not cross, parallel
      var pl = OR.Plane.across(s.p1, s.p2);
      this.splitFacesByPlane(pl, list);
    }
  }

  // Rotate around axis Segment by angle a list of Points @testOK
  function rotate (s, angle, list) {
    var angleRd = angle * Math.PI / 180.0;
    var ax      = s.p1.x, ay = s.p1.y, az = s.p1.z;
    var nx      = s.p2.x - ax, ny = s.p2.y - ay, nz = s.p2.z - az;
    var n       = 1.0 / Math.sqrt(nx * nx + ny * ny + nz * nz);
    nx *= n;
    ny *= n;
    nz *= n;
    var sin     = Math.sin(angleRd), cos = Math.cos(angleRd);
    var c1      = 1.0 - cos;
    var c11     = c1 * nx * nx + cos, c12 = c1 * nx * ny - nz * sin, c13 = c1 * nx * nz + ny * sin;
    var c21     = c1 * ny * nx + nz * sin, c22 = c1 * ny * ny + cos, c23 = c1 * ny * nz - nx * sin;
    var c31     = c1 * nz * nx - ny * sin, c32 = c1 * nz * ny + nx * sin, c33 = c1 * nz * nz + cos;
    list.forEach(function (p) {
      var ux = p.x - ax, uy = p.y - ay, uz = p.z - az;
      p.x    = ax + c11 * ux + c12 * uy + c13 * uz;
      p.y    = ay + c21 * ux + c22 * uy + c23 * uz;
      p.z    = az + c31 * ux + c32 * uy + c33 * uz;
    });
  }

  // Adjust one Point on its (eventually given) segments @testOK
  function adjust (p, segments) {
    // Take all segments containing point p or given list
    var segs = segments || this.searchSegmentsOnePoint(p);
    var dmax = 100;
    // Kaczmarz or Verlet
    // Iterate while length difference between 2d and 3d is > 1e-3
    for (var i = 0; dmax > 0.001 && i < 20; i++) {
      dmax = 0;
      // Iterate over all segments
      // Pm is the medium point
      var pm = new OR.Point(0, 0, 0);
      for (var j = 0; j < segs.length; j++) {
        var s = segs[j];
        var lg3d = s.length3d();
        var lg2d = s.length2d(); // Should not change
        var d    = (lg2d - lg3d);
        if (Math.abs(d) > dmax) {
          dmax = Math.abs(d);
        }
        // Move B = A + AB * r with r = l2d / l3d
        // AB * r is the extension based on length3d to match length2d
        var r = (lg2d / lg3d);
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
      // Set Point with average position taking all segments
      if (segs.length !== 0) {
        p.x = pm.x / segs.length;
        p.y = pm.y / segs.length;
        p.z = pm.z / segs.length;
      }
    }
    return dmax;
  }

  // Adjust list of Points @testOK
  function adjustList (list) {
    var dmax = 100;
    for (var i = 0; dmax > 0.001 && i < 100; i++) {
      dmax     = 0;
      for (var j = 0; j < list.length; j++) {
        var p = list[j];
        var segs = this.searchSegmentsOnePoint(p);
        var d = this.adjust(p, segs);
        if (Math.abs(d) > dmax) {
          dmax = Math.abs(d);
        }
      }
    }
    return dmax;
  }

  // Evaluate and highlight segments with wrong length @testOK
  function evaluate () {
    // Iterate over all segments
    for (var i = 0; i < this.segments.length; i++) {
      var s       = this.segments[i];
      var d       = Math.abs(s.length2d() - s.length3d());
      s.highlight = d >= 0.1;
    }
  }

  // Move list of points by dx,dy,dz @testOK
  function move (dx, dy, dz, pts) {
    pts = (pts === null) ? this.points : (pts === undefined) ? this.points : pts;
    pts.forEach(function (p) {
      p.x += dx;
      p.y += dy;
      p.z += dz;
    });
  }

  // Move on a point P0 all following points, k from 0 to 1 for animation @testOK
  function moveOn (p0, k1, k2, pts) {
    pts.forEach(function (p) {
      p.x = p0.x * k1 + p.x * k2;
      p.y = p0.y * k1 + p.y * k2;
      p.z = p0.z * k1 + p.z * k2;
    });
  }

  // Move given or all points to z = 0
  function flat (pts) {
    var lp = pts === undefined ? this.points : pts;
    lp.forEach(function (p) {
      p.z = 0;
    });
  }

  // Turn model around axis by  angle @testOK
  function turn (axe, angle) {
    angle *= Math.PI / 180.0;
    var ax = 0, ay = 0, az = 0;
    var nx = 0.0;
    var ny = 0.0;
    var nz = 0.0;
    if (axe === 1) {
      nx = 1.0;
    }
    else if (axe === 2) {
      ny = 1.0;
    }
    else if (axe === 3) {
      nz = 1.0;
    }
    var n   = (1.0 / Math.sqrt(nx * nx + ny * ny + nz * nz));
    nx *= n;
    ny *= n;
    nz *= n;
    var sin = Math.sin(angle);
    var cos = Math.cos(angle);
    var c1  = 1.0 - cos;
    var c11 = c1 * nx * nx + cos, c12 = c1 * nx * ny - nz * sin, c13 = c1 * nx * nz + ny * sin;
    var c21 = c1 * ny * nx + nz * sin, c22 = c1 * ny * ny + cos, c23 = c1 * ny * nz - nx * sin;
    var c31 = c1 * nz * nx - ny * sin, c32 = c1 * nz * ny + nx * sin, c33 = c1 * nz * nz + cos;
    this.points.forEach(function (p) {
      var ux = p.x - ax, uy = p.y - ay, uz = p.z - az;
      p.x    = ax + c11 * ux + c12 * uy + c13 * uz;
      p.y    = ay + c21 * ux + c22 * uy + c23 * uz;
      p.z    = az + c31 * ux + c32 * uy + c33 * uz;
    });
  }

  // Select (highlight) points @testOK
  function selectPts (pts) {
    pts.forEach(function (p) {
      p.select = !p.select;
    });
  }

  // Select (highlight) segments @testOK
  function selectSegs (segs) {
    segs.forEach(function (s) {
      s.select = !s.select;
    });
  }

  // Offset by dz all following faces according to Z @testOK
  function offset (dz, lf) {
    lf.forEach(function (f) {
      f.offset += dz;
    });
  }

  // 2D Boundary [xmin, ymin, xmax, ymax] @testOK
  function get2DBounds () {
    var xmax = -100.0;
    var xmin = 100.0;
    var ymax = -100.0;
    var ymin = 100.0;
    this.points.forEach(function (p) {
      var x = p.xf, y = p.yf;
      if (x > xmax) xmax = x;
      if (x < xmin) xmin = x;
      if (y > ymax) ymax = y;
      if (y < ymin) ymin = y;
    });
    var obj = {};
    obj.xmin = xmin;
    obj.ymin = ymin;
    obj.xmax = xmax;
    obj.ymax = ymax;
    return obj;
  }

  // Fit the model to -200 +200 @testOK
  function zoomFit () {
    var b     = this.get3DBounds();
    var w     = 400;
    var scale = w / Math.max(b.xmax - b.xmin, b.ymax - b.ymin);
    var cx    = -(b.xmin + b.xmax) / 2;
    var cy    = -(b.ymin + b.ymax) / 2;
    this.move(cx, cy, 0, null);
    this.scaleModel(scale);
  }

  // Scale model @testOK
  function scaleModel (scale) {
    this.points.forEach(function (p) {
      p.x *= scale;
      p.y *= scale;
      p.z *= scale;
    });
  }

  // 3D Boundary View [xmin, ymin, xmax, ymax]
  function get3DBounds () {
    var xmax = -200.0, xmin = 200.0;
    var ymax = -200.0, ymin = 200.0;
    this.points.forEach(function (p) {
      var x = p.x, y = p.y;
      if (x > xmax) xmax = x;
      if (x < xmin) xmin = x;
      if (y > ymax) ymax = y;
      if (y < ymin) ymin = y;
    });
    var obj = {};
    obj.xmin = xmin;
    obj.ymin = ymin;
    obj.xmax = xmax;
    obj.ymax = ymax;
    return obj;
  }

  // API
  this.init = init;
  this.addPointXYZ = addPointXYZ;
  this.addPoint = addPoint;
  this.addSegment = addSegment;
  this.addFace = addFace;
  this.searchSegmentsOnePoint = searchSegmentsOnePoint;
  this.searchSegmentTwoPoints = searchSegmentTwoPoints;
  this.align2dFrom3d = align2dFrom3d;
  this.faceLeft = faceLeft;
  this.faceRight = faceRight;
  this.splitFacesByPlane = splitFacesByPlane;
  this.splitFaceByPlane = splitFaceByPlane;
  this.searchFace = searchFace;
  this.splitSegmentByPoint = splitSegmentByPoint;
  this.splitSegmentOnPoint = splitSegmentOnPoint;
  this.splitSegmentByRatio = splitSegmentByRatio;

  this.splitCross = splitCross;
  this.splitBy = splitBy;
  this.splitOrtho = splitOrtho;
  this.splitLineToLine = splitLineToLine;

  this.splitLineToLineByPoints = splitLineToLineByPoints;
  this.computeAngle = computeAngle;
  this.rotate = rotate;
  this.turn = turn;
  this.adjust = adjust;
  this.adjustList = adjustList;
  this.evaluate = evaluate;
  this.move = move;
  this.moveOn = moveOn;
  this.flat = flat;
  this.offset = offset;

  this.selectSegs = selectSegs;
  this.selectPts = selectPts;
  this.get2DBounds = get2DBounds;
  this.get3DBounds = get3DBounds;

  this.zoomFit = zoomFit;
  this.scaleModel = scaleModel;

  // Initialize if a list is provided
  var boundinit = init.bind(this);
  list ? boundinit(list): null;
};

// For NodeJS, will be discarded by uglify
if (NODE_ENV === true && typeof module !== 'undefined') {
  module.exports = OR.Model;
}
