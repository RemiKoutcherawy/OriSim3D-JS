// file 'test/test.Model.js
// run with $ mocha --ui qunit
// or $ mocha or $ npm test or open test.html

// Dependencies : import them before Model in browser
if (typeof module !== 'undefined' && module.exports) {
  var Point   = require('../js/Point.js');
  var Segment = require('../js/Segment.js');
  var Face    = require('../js/Face.js');
  var Plane   = require('../js/Plane.js');
  var Model   = require('../js/Model.js');
}
function ok(expr, msg) {
  if (!expr) throw new Error(msg);
}
// Unit tests using Mocha
suite('Model');
before(function () {
  // runs before all test in this block
});
test('init', function () {
  let model = new Model();
  model.init([-200, -200, 200, -200, 200, 200, -200, 200]);
  ok(model.points.length === 4,"Got:"+model.points.length);
  ok(model.segments.length === 4,"Got:"+model.segments.length);
  ok(model.faces.length === 1,"Got:"+model.faces.length);
});
test('addPointXY', function () {
  let model = new Model();
  // Create a new point (5)
  const p = model.addPointXYZ(10, 20);
  ok(p.xf === 10, "Got:"+p);
  ok(p.yf === 20, "Got:"+p);
  ok(p.x === 10, "Got:"+p);
  ok(p.y === 20, "Got:"+p);
  ok(p.z === 0, "Got:"+p);
});
test('addPoint Warn', function () {
  let model = new Model();
  // Create a point
  let p1 = new Point(100,100, 100,100,0);
  // Try to add it twice
  let p2 = model.addPoint(p1);
  // Warning
  let p3 = model.addPoint(p1);
  ok(p2 === p3);
});
test('addSegment Warn', function () {
  let model = new Model();
  model.init([-200, -200, 200, -200, 200, 200, -200, 200]);
  // Diagonal segment
  let p1 = model.points[0];
  let p2 = model.points[2];
  let s  = model.addSegment(p1, p2);
  ok(model.segments.length === 5,"Got:"+model.segments.length);
  // ok(s.toString().indexOf("P[-200,-200,0  -200,-200], P[200,200,0  200,200]") !== -1, "Got:"+s.toString());
  ok(s.toString().indexOf("-200,-200") !== -1, "Got:"+s.toString());
  ok(s.toString().indexOf("200,200") !== -1, "Got:"+s.toString());
  // Degenerate segment Warn
  s = model.addSegment(p1, p1);
  ok(s === null,"Got:"+s);
  ok(model.segments.length === 5,"Got:"+model.segments.length);
});
test('addFace', function () {
  let model = new Model();
  model.init([-200, -200, 200, -200, 200, 200, -200, 200]);
  ok(model.faces.length === 1,"Got:"+model.faces.length);
  let f0 = model.faces[0];
  // Should no create a new face, but return existing face.
  model.addFace(f0);
  // ok(model.faces.length === 1,"Got:"+model.faces.length);
  let f1 = new Face();
  f1.points.push(f0.points[0],f0.points[1],f0.points[2],f0.points[3]);
  model.addFace(f1);
  // ok(model.faces.length === 1,"Got:"+model.faces.length);
  f1 = new Face();
  f1.points.push(f0.points[3],f0.points[0],f0.points[1],f0.points[2]);
  model.addFace(f1);
  // ok(model.faces.length === 1,"Got:"+model.faces.length);
});
test('searchSegmentsOnePoint', function () {
  let model = new Model();
  model.init([-200,-200, 200,-200, 200,200, -200,200]);
  // Take point 0 (-200,-200)  on segment (-200,-200) to (200,-200)
  let p0    = model.points[0];
  let p4 = model.addPoint(new Point(0,0, 0,0,0));
  model.addSegment(p0, model.points[2]);

  let segs1 = model.searchSegmentsOnePoint(p0);
  ok(segs1.length === 3, "Got:"+segs1.length); // p0 is on 3 segments
  let segs2 = model.searchSegmentsOnePoint(p4);
  ok(segs2.length === 0);  // p1 is dangling on no segment
});
test('searchSegmentsTwoPoints', function () {
  let model = new Model();
  model.init([-200, -200, 200, -200, 200, 200, -200, 200]);
  // Take point 0 (-200,-200) and point 1 (200,-200)
  let p0   = model.points[0];
  let p1   = model.points[1];
  let s = model.searchSegmentTwoPoints(p0, p1);
  ok(s.p1 === p0 && s.p2 === p1); // p0,p1 is on 1 segment
});
test('align2dFrom3d', function () {
  let model = new Model();
  let p1 = model.addPoint(new Point(0,0, 0,0,0));
  let p2 = model.addPoint(new Point(200,200, 200,200,0));
  ok(p2.xf === 200 && p2.yf === 200,"p2.xf = "+p2.xf);
  let s = model.addSegment(p1,p2);
  // New Point in 3D
  let p3 = model.addPoint(new Point(200,200, 100,100,0));
  model.align2dFrom3d(p3, s);
  // 2D coords aligned on 3D
  ok(p3.xf === 100 && p3.yf === 100, "p3.xf = "+p3.xf)
});
test('faceRight faceLeft', function () {
  let model = new Model();
  model.init([-200, -200, 200, -200, 200, 200, -200, 200]);
  // Take point 0 (-200,-200) and point 1 (200,-200)
  let p0 = model.points[0];
  let p1 = model.points[1];
  let fl = model.faceLeft(p0, p1);
  let fr = model.faceRight(p0, p1);
  ok(fl === model.faces[0]);
  ok(fr === null);
  // Reverse
  fl = model.faceLeft(p1, p0);
  fr = model.faceRight(p1, p0);
  ok(fl === null);
  ok(fr === model.faces[0]);

  // Split on X=0 to get 2 faces
  let p = new Point(0, 0, 0);
  let n = new Point(1, 0, 0);
  let pl = new Plane(p, n);
  model.splitFacesByPlane(pl);
  ok(model.points.length === 6, "Got:"+model.points.length);
  ok(model.faces.length === 2, "Got:"+model.faces.length);
  ok(model.segments.length === 7, "Got:"+model.segments.length);
  p0 = model.points[4];
  p1 = model.points[5];
  fl = model.faceLeft(p0, p1);
  fr = model.faceRight(p0, p1);
  ok(fl === model.faces[0], "Got:"+fl);
  ok(fr === model.faces[1], "Got:"+fr);
});
test('searchFace', function () {
  let model = new Model();
  model.init([-200, -200, 200, -200, 200, 200, -200, 200]);
  let s = model.segments[0];
  let f = model.searchFace(s, null);
  ok(f === model.faces[0]);
  f = model.searchFace(s, f);
  ok(f === null);
});
test('splitSegmentByPoint', function () {
  let model = new Model();
  model.init([-200, -200, 200, -200, 200, 200, -200, 200]);
  let s0 = model.segments[0];
  // p is the middle of segment s
  let p4 = model.addPoint(new Point(0,-200, 0,-200,0));
  // Split s0 on p4 => s0 is shorten, s5 is added
  model.splitSegmentByPoint(s0, p4);
  ok(model.segments.length === 5, "Got:"+model.segments.length);
  ok(s0.p1 === model.points[0], "Got:"+s0.p1);
  ok(p4 === model.points[4], "Got p4:"+p4+" model.points[4]:"+model.points[4]);
  ok(s0.p2 === p4, "Got:"+s0.p2);
  ok(model.segments[4].p1 === p4, "Got:"+model.segments[4]);
  ok(model.segments[4].p2 === model.segments[1].p1, "Got:"+model.segments[4].p2);
});
test('splitSegmentOnPoint', function () {
  let model = new Model();
  model.init([-200, -200, 200, -200, 200, 200, -200, 200]);
  let s0 = model.segments[0];
  // p is the middle of segment s
  let p4 = model.addPoint(new Point(0,-200, 0,-200,0));
  // Split s0 on p4 => s0 is shorten, s5 is added
  model.splitSegmentOnPoint(s0, p4);
  ok(model.segments.length === 5, "Got:"+model.segments.length);
  ok(s0.p1 === model.points[0], "Got:"+s0.p1);
  ok(p4 === model.points[4], "Got p4:"+p4+" model.points[4]:"+model.points[4]);
  ok(s0.p2 === p4, "Got:"+s0.p2);
  ok(model.segments[4].p1 === p4, "Got:"+model.segments[4]);
  ok(model.segments[4].p2 === model.segments[1].p1, "Got:"+model.segments[4].p2);
});
test('splitSegmentByRatio', function () {
  let model = new Model();
  model.init([-200, -200, 200, -200, 200, 200, -200, 200]);
  let s0 = model.segments[0];
  // Split s0 by 0.2  => s0 is shorten -200 + 400*0.2 = -200 + 80 = -120
  model.splitSegmentByRatio(s0, 0.2);

  ok(model.segments.length === 5, "Got:"+model.segments.length);
  ok(model.points.length === 5, "Got:"+model.points.length);
  ok(s0.p1 === model.points[0], "Got:"+s0.p1);
  ok(s0.p2 === model.points[4], "Got:"+s0.p2);
  ok(s0.p2.x === -120, "Got:"+s0.p2.x);
  ok(s0.p2.xf === -120, "Got:"+s0.p2.xf);
});

// Origami needs robust split face by plane
test('splitFaceByPlane No intersection', function () {
  let model = new Model();
  model.init([-200, -200, 200, -200, 200, 200, -200, 200]);
  let f = model.faces[0];
  // Degenerate on left
  // console.log("No intersection on left");
  let p = new Point(-400, 0, 0); // On left
  let n = new Point(-1, 0, 0);
  let pl = new Plane(p, n);
  model.splitFaceByPlane(f, pl);
  ok(model.faces.length === 1, "faces:"+model.faces.length);
  ok(model.segments.length === 4, "segs:"+model.segments.length);
  ok(model.points.length === 4, "points:"+model.points.length);
  // Degenerate on right
  // console.log("No intersection on right");
  f = model.faces[0];
  p = new Point(400, 0, 0); // On right
  n = new Point(-1, 0, 0);
  pl = new Plane(p, n);
  model.splitFaceByPlane(f, pl);
  ok(model.faces.length === 1, "faces:"+model.faces.length);
  ok(model.segments.length === 4, "segs:"+model.segments.length);
  ok(model.points.length === 4, "points:"+model.points.length);
});
test('splitFaceByPlane Cross on X=0', function () {
  let model = new Model();
  model.init([-200, -200, 200, -200, 200, 200, -200, 200]);
  // Plane on YZ crossing X=0 => two intersections as new Points
  // console.log("Intersection on X=0");
  let p = new Point(0, 0, 0);
  let n = new Point(-1, 0, 0);
  let pl = new Plane(p, n);
  let f = model.faces[0];
  model.splitFaceByPlane(f, pl);
  ok(model.faces.length === 2, "faces:"+model.faces.length);
  ok(model.points.length === 6, "points:"+model.points.length);
  ok(model.segments.length === 7, "segs:"+model.segments.length);
});
test('splitFaceByPlane On Diagonal', function () {
  let model = new Model();
  model.init([-200,-200, 200,-200, 200,200, -200,200]);
  // Diagonal Split one face only
  // console.log("Intersection on Diagonal");
  let pl = Plane.by(model.points[0], model.points[2]);
  // let pl = Plane.by(model.points[2], model.points[0]);
  let f = model.faces[0];
  model.splitFaceByPlane(f, pl);
  ok(model.faces.length === 2, "faces :"+model.faces.length);
  ok(model.segments.length === 5, "segs :"+model.segments.length);
  ok(model.points.length === 4, "points :"+model.points.length);
});
test('splitFaceByPlane On side', function () {
  let model = new Model();
  model.init([-200,-200, 200,-200, 200,200, -200,200]);

  // Plane by [0] [1] on left
  // console.log("Intersection On left side to left");
  let pl = new Plane(new Point(-200,-200), new Point(-400,0));
  let f = model.faces[0];
  model.splitFaceByPlane(f, pl);
  ok(model.faces.length === 1, "faces :"+model.faces.length);
  ok(model.segments.length === 4, "segs :"+model.segments.length);
  ok(model.points.length === 4, "points :"+model.points.length);

  // Plane by [0] [1] on left
  // console.log("Intersection On left side to right");
  pl = new Plane(new Point(-200,-200), new Point(400,0));
  f = model.faces[0];
  model.splitFaceByPlane(f, pl);
  ok(model.faces.length === 1, "faces :"+model.faces.length);
  ok(model.segments.length === 4, "segs :"+model.segments.length);
  ok(model.points.length === 4, "points :"+model.points.length);

  // Plane by [0] [1] on bottom
  // console.log("Intersection On side bottom");
  pl = Plane.by(model.points[0], model.points[1]);
  f = model.faces[0];
  model.splitFaceByPlane(f, pl);
  ok(model.faces.length === 1, "faces :"+model.faces.length);
  ok(model.segments.length === 4, "segs :"+model.segments.length);
  ok(model.points.length === 4, "points :"+model.points.length);
});
test('splitFaceByPlane On side 3 points', function () {
  let model = new Model();
  model.init([-200,-200, 0,-200, 200,-200, 200,200, -200,200]);

  // Plane on y=-200 passing by 0,1,2
  // console.log("Intersection On side 3 points");
  let pl = Plane.by(model.points[0], model.points[2]);
  let f = model.faces[0];
  model.splitFaceByPlane(f, pl);
  ok(model.faces.length === 1, "faces :"+model.faces.length);
  ok(model.segments.length === 5, "segs :"+model.segments.length);
  ok(model.points.length === 5, "points :"+model.points.length);
});
test('splitFaceByPlane On side 4 points', function () {
  let model = new Model();
  model.init([-200,-200, 0,-200, 100,-200, 200,-200, 200,200, -200,200]);

  // Plane on y=-200 passing by 0,1,2
  // console.log("Intersection On side 4 points");
  let pl = Plane.by(model.points[0], model.points[2]);
  let f = model.faces[0];
  model.splitFaceByPlane(f, pl);
  ok(model.faces.length === 1, "faces :"+model.faces.length);
  ok(model.segments.length === 6, "segs :"+model.segments.length);
  ok(model.points.length === 6, "points :"+model.points.length);
});
test('splitFaceByPlane Strange case', function () {
  let model = new Model();
  model.init([-200,-200, -100,-200, 0,0, 100,-200, 200,-200, 200,200, -200,200]);

  // Plane on y=-200 passing by 0,1,3
  // console.log("Intersection On side 4 points");
  let pl = Plane.by(model.points[0], model.points[1]);
  let f = model.faces[0];
  model.splitFaceByPlane(f, pl);
  ok(model.faces.length === 1, "faces :"+model.faces.length);
  // console.log("Face 0:"+model.faces[0])
  // console.log("Face 1:"+model.faces[1])
  ok(model.segments.length === 7, "segs :"+model.segments.length);
  ok(model.points.length === 7, "points :"+model.points.length);
});
// Split all faces by a plane
test('splitFacesByPlane all faces by plane', function () {
  let model = new Model();
  model.init([-200,-200, 200,-200, 200,200, -200,200]);

  // Diagonal Split 0-1
  // console.log("Intersection on Diagonal");
  let pl = Plane.by(model.points[0], model.points[2]);
  model.splitFacesByPlane(pl);
  ok(model.faces.length === 2, "faces :"+model.faces.length);
  ok(model.segments.length === 5, "segs :"+model.segments.length);
  ok(model.points.length === 4, "points :"+model.points.length);
  // Diagonal Split 1-2
  pl = Plane.by(model.points[1], model.points[3]);
  model.splitFacesByPlane(pl);
  ok(model.faces.length === 4, "faces :"+model.faces.length);
  // console.log("segments : "+model.segments)
  ok(model.segments.length === 8, "segs :"+model.segments.length);
  ok(model.points.length === 5, "points :"+model.points.length);
});
// Split list face by two points
test('splitFacesByPlane list faces by plane', function () {
  let model = new Model();
  model.init([-200,-200, 200,-200, 200,200, -200,200]);
  // Make a list from faces numbers
  function listFaces() {
    let list = [];
    let i = 0;
    while (Number.isInteger(Number(arguments[i]))) {
      list.push(model.faces[arguments[i++]]);
    }
    return list;
  }
  // Diagonal Split 0-1
  // console.log("Intersection on Diagonal");
  let pl = Plane.by(model.points[0], model.points[2]);
  model.splitFacesByPlane(pl);
  ok(model.faces.length === 2, "faces :"+model.faces.length);
  ok(model.segments.length === 5, "segs :"+model.segments.length);
  ok(model.points.length === 4, "points :"+model.points.length);

  // Diagonal Split 1-2 but just face 0
  let list = listFaces(0);
  pl = Plane.by(model.points[1], model.points[3]);
  model.splitFacesByPlane(pl, list);
  ok(model.faces.length === 3, "faces :"+model.faces.length);
  ok(model.segments.length === 7, "segs :"+model.segments.length);
  ok(model.points.length === 5, "points :"+model.points.length);
});
// Split all face across
test('splitFacesByPlane all faces across points', function () {
  let model = new Model();
  model.init([-200,-200, 200,-200, 200,200, -200,200]);

  // Median Split X=0
  // console.log("Plane on X=0");
  let p = new Point(0, 0, 0);
  let n = new Point(1,0, 0);
  let pl = new Plane(p, n);
  model.splitFacesByPlane(pl);
  ok(model.faces.length === 2, "faces :"+model.faces.length);
  ok(model.segments.length === 7, "segs :"+model.segments.length);
  ok(model.points.length === 6, "points :"+model.points.length);
  // Median Split Y=0
  // console.log("Plane on Y=0");
  n = new Point(0, 1, 0);
  pl = new Plane(p, n);  model.splitFacesByPlane(pl);
  ok(model.faces.length === 4, "faces :"+model.faces.length);
  ok(model.segments.length === 12, "segs :"+model.segments.length);
  ok(model.points.length === 9, "points :"+model.points.length);
});
test('splitCross', function () {
  let model = new Model();
  model.init([-200,-200, 200,-200, 200,200, -200,200]);

  // Plane on YZ crossing X=0 => two intersections as new Points
  model.splitCross(model.points[0], model.points[1]);
  ok(model.faces.length === 2, "faces:"+model.faces.length);
  ok(model.segments.length === 7, "segs:"+model.segments.length);
  ok(model.points.length === 6, "points:"+model.points.length);
  // Plane on YZ crossing Y=0 => two intersections as new Points
  model.splitCross(model.points[1], model.points[2]);
  ok(model.faces.length === 4, "faces:"+model.faces.length);
  ok(model.segments.length === 12, "segs:"+model.segments.length);
  ok(model.points.length === 9, "points:"+model.points.length);
});
test('splitBy', function () {
  let model = new Model();
  model.init([-200,-200, 200,-200, 200,200, -200,200]);

  // On edge
  model.splitBy(model.points[0], model.points[1]);
  ok(model.faces.length === 1, "faces:"+model.faces.length);
  ok(model.segments.length === 4, "segs:"+model.segments.length);
  ok(model.points.length === 4, "points:"+model.points.length);
  // On diagonal
  model.splitBy(model.points[0], model.points[2]);
  ok(model.faces.length === 2, "faces:"+model.faces.length);
  ok(model.segments.length === 5, "segs:"+model.segments.length);
  ok(model.points.length === 4, "points:"+model.points.length);
});
test('splitOrtho', function () {
  let model = new Model();
  model.init([-200,-200, 200,-200, 200,200, -200,200]);
  // On edge
  model.splitOrtho(model.segments[0], model.points[0]);
  ok(model.faces.length === 1, "faces:"+model.faces.length);
  ok(model.segments.length === 4, "segs:"+model.segments.length);
  ok(model.points.length === 4, "points:"+model.points.length);
  // Add center
  model.points.push(new Point(0,0));
  model.splitOrtho(model.segments[0], model.points[4]);
  ok(model.faces.length === 2, "faces:"+model.faces.length);
  ok(model.segments.length === 7, "segs:"+model.segments.length);
  ok(model.points.length === 7, "points:"+model.points.length);
});
test('splitLineToLineByPoints', function () {
  let model = new Model();
  model.init([-200,-200, 200,-200, 200,200, -200,200]);
  // On diagonal
  model.splitLineToLineByPoints(model.points[0], model.points[1], model.points[2]);
  ok(model.faces.length === 2, "faces:"+model.faces.length);
  ok(model.segments.length === 5, "segs:"+model.segments.length);
  ok(model.points.length === 4, "points:"+model.points.length);
});
test('splitLineToLine', function () {
  let model = new Model();
  model.init([-200,-200, 200,-200, 200,200, -200,200]);
  model.splitLineToLine(model.segments[0], model.segments[1]);
  ok(model.faces.length === 2, "faces:"+model.faces.length);
  ok(model.segments.length === 5, "segs:"+model.segments.length);
  ok(model.points.length === 4, "points:"+model.points.length);
});
// Angle
test('computeAngle Warn', function () {
  let model = new Model();
  model.init([-200,-200, 200,-200, 200,200, -200,200]);

  // Diagonal Split
  // console.log("Intersection on Diagonal");
  let pl = Plane.by(model.points[0], model.points[2]);
  let f = model.faces[0];
  model.splitFaceByPlane(f, pl);
  ok(model.points.length === 4, "points :"+model.points.length);
  ok(model.segments.length === 5, "segs :"+model.segments.length);

  // Angle for edge = 0
  let s = model.segments[0];
  let angle = model.computeAngle(s);
  ok(angle === 0,"Got:"+angle);

  // Angle with no right an left face Warning
  s.type = Segment.PLAIN;
  angle = model.computeAngle(s);
  ok(angle === 0,"Got:"+angle);

  // Angle on flat = 0
  s = model.segments[4];
  s.type = Segment.PLAIN;
  angle = model.computeAngle(s);
  ok(angle === 0,"Got:"+angle);

  // Rotate point on left face
  let pts = model.points.slice(3,4);
  model.rotate(s, 45, pts);
  angle = model.computeAngle(s);
  ok(Math.round(angle) === 45,"Got:"+angle);
});
test('rotate all', function () {
  let model = new Model();
  model.init([-200,-200, 200,-200, 200,200, -200,200]);

  // Split on X=0
  let p = new Point(0, 0, 0);
  let n = new Point(1, 0, 0);
  let pl = new Plane(p, n);
  model.splitFacesByPlane(pl);
  ok(model.segments.length === 7, "segs :"+model.segments.length);

  // Rotate around median s, by 90°, points [1][2]
  // console.log("Segs:"+model.segments);
  let s = model.segments[6];
  let pts = model.points.slice(1,3); // Points on left
  let pt = pts[0];
  // before
  ok(pt.x === 200, "Got:"+pt.x);
  ok(pt.y === -200,"Got:"+pt.y);
  ok(pt.z === 0,   "Got:"+pt.z);
  model.rotate(s, -90, pts);
  // after
  ok(Math.round(pt.x) === 0,"Got:"+pt.x);
  ok(Math.round(pt.y) === -200,"Got:"+pt.y);
  ok(Math.round(pt.z) === 200,"Got:"+pt.z); // z positive toward viewer
  pt = pts[1];
  ok(Math.round(pt.x) === 0,"Got:"+pt.x);
  ok(Math.round(pt.y) === 200,"Got:"+pt.y);
  ok(Math.round(pt.z) === 200,"Got:"+pt.z);

  // Check angle
  let angle = model.computeAngle(s);
  ok(angle === 90,"Got:"+angle);
});
// Make a list from points numbers
function listPoints(model, n) {
  let list = [];
  let i = 1; // argument 0 is model
  while (Number.isInteger(Number(arguments[i]))) {
    list.push(model.points[arguments[i++]]);
  }
  return list;
}
// Rotate
test('rotate list', function () {
  let model = new Model();
  model.init([-200,-200, 200,-200, 200,200, -200,200]);

  // Rotate around bottom s (y=-200), by 90°, points on axe[1] and up right [2]
  let s = model.segments[0];
  let list = listPoints(model,1,2);
  ok(list.length === 2, "Got:"+list.length);
  let pt = list[1];
  // before
  // console.log("before:"+list);
  ok(pt.x === 200, "Got:"+pt.x);
  ok(pt.y === 200,"Got:"+pt.y);
  ok(pt.z === 0,   "Got:"+pt.z);
  model.rotate(s, 90, list);
  // after
  // console.log("after:"+list);
  ok(Math.round(pt.x) === 200,"Got:"+pt.x);
  ok(Math.round(pt.y) === -200,"Got:"+pt.y);// on plane y = -200
  ok(Math.round(pt.z) === 400,"Got:"+pt.z); // side length = 400
  // Should not move
  pt = list[0];
  ok(Math.round(pt.x) === 200,"Got:"+pt.x);
  ok(Math.round(pt.y) === -200,"Got:"+pt.y);
  ok(Math.round(pt.z) === 0,"Got:"+pt.z);

  // Rotate around bottom s (y=-200), by -90°, points on axe[1] and up right [2]
  s = model.segments[0];
  list = listPoints(model,1,2);
  ok(list.length === 2, "Got:"+list.length);
  pt = list[1];
  // before
  // console.log("before:"+list);
  ok(pt.x === 200, "Got:"+pt.x);
  ok(Math.round(pt.y) === -200,"Got:"+pt.y);
  ok(pt.z === 400,   "Got:"+pt.z);
  model.rotate(s, -90, list);
  // after
  // console.log("after:"+list);
  ok(Math.round(pt.x) === 200,"Got:"+pt.x);
  ok(Math.round(pt.y) === 200,"Got:"+pt.y); // on plane y = 200
  ok(Math.round(pt.z) === 0,"Got:"+pt.z); // side length = 400
  // Should not move
  pt = list[0];
  ok(Math.round(pt.x) === 200,"Got:"+pt.x);
  ok(Math.round(pt.y) === -200,"Got:"+pt.y);
  ok(Math.round(pt.z) === 0,"Got:"+pt.z);
});
// Turn
test('Turn', function () {
  let model = new Model();
  model.init([-200,-200, 200,-200, 200,200, -200,200]);
  let p = model.points[0];
  ok(p.x === -200,"Got:"+p.x);
  ok(p.y === -200,"Got:"+p.y);

  model.turn(1, 180);
  ok(p.x === -200,"Got:"+p.x);
  ok(p.y === 200,"Got:"+p.y);

  model.turn(2, 180);
  ok(p.x === 200,"Got:"+p.x);
  ok(p.y === 200,"Got:"+p.y);

  model.turn(3, 180);
  ok(Math.round(p.x) === -200,"Got:"+p.x);
  ok(Math.round(p.y) === -200,"Got:"+p.y);
});
// Adjust
test('Adjust Point', function () {
  let model = new Model();
  model.init([-200,-200, 200,-200, 200,200, -200,200]);
  let p = model.points[0];
  let s0 = model.segments[0];
  let s3 = model.segments[3];
  p.x = -100;
  p.y = -100;
  p.z = -100;
  // One point against all segments
  let max = model.adjust(p);
  ok(Math.round(s0.length3d()) === 400,"Got:"+s0.length3d());
  ok(Math.round(s3.length3d()) === 400,"Got:"+s3.length3d());
  ok(max < 0.001,"Got:"+max);
  p.x = -300;
  p.y = -300;
  p.z = -300;
  // One point against one segment
  max = model.adjust(p, [s0]);
  ok(Math.round(s0.length3d()) === 400,"Got:"+s0.length3d());
  ok(max < 0.001,"Got:"+max);
  p.x = -300;
  p.y = -300;
  p.z = -300;
  // Two points against all segments
  let p1 = model.points[2];
  max = model.adjustList([p, p1]);
  ok(Math.round(s0.length3d()) === 400,"Got:"+s0.length3d());
  ok(max < 0.001,"Got:"+max);
});
test('Adjust List of Points', function () {
  let model = new Model();
  model.init([-200,-200, 200,-200, 200,200, -200,200]);
  let p0 = model.points[0];
  let p1 = model.points[1];
  let s0 = model.segments[0];
  let s1 = model.segments[1];
  p0.x = -100; // instead of -200
  p1.x = 100;  // instead of 200
  let max = model.adjustList([p0, p1]);
  ok(Math.round(s0.length3d()) === 400,"Got:"+s0.length3d());
  ok(Math.round(s1.length3d()) === 400,"Got:"+s1.length3d());
  ok(max < 0.001,"Got:"+max);
});