// file 'test/Model.test.js
// Dependencies : import them before Model in browser

import {Point} from '../src/Point.js';
import {Segment} from '../src/Segment.js';
import {Face} from '../src/Face.js';
import {Plane} from '../src/Plane.js';
import {Vec3} from '../src/Vec3.js';
import {Model} from '../src/Model.js';

QUnit.module('Model', () => {

  QUnit.test('init', function (assert) {
    let model = new Model();
    model.init([-200, -200, 200, -200, 200, 200, -200, 200]);
    assert.ok(model.points.length === 4, "Got:" + model.points.length);
    assert.ok(model.segments.length === 4, "Got:" + model.segments.length);
    assert.ok(model.faces.length === 1, "Got:" + model.faces.length);
  });

  QUnit.test('addPointXY', function (assert) {
    let model = new Model();
    // Create a new point (5)
    const p = model.addPointXYXYZ(10, 20);
    assert.ok(p.xf === 10, "Got:" + p);
    assert.ok(p.yf === 20, "Got:" + p);
    assert.ok(p.x === 10, "Got:" + p);
    assert.ok(p.y === 20, "Got:" + p);
    assert.ok(p.z === 0, "Got:" + p);
  });

  QUnit.test('addPoint Warn', function (assert) {
    let model = new Model();
    // Create a point
    let p1 = new Point(100,100, 100,100,0);
    // Try to add it twice
    let p2 = model.addPoint(p1);
    // Warning
    let p3 = model.addPoint(p1);
    assert.ok(p2 === p3);
  });

  QUnit.test('addSegment Warn', function (assert) {
    let model = new Model();
    model.init([-200, -200, 200, -200, 200, 200, -200, 200]);
    // Diagonal segment
    let p1 = model.points[0];
    let p2 = model.points[2];
    let s = model.addSegment(p1, p2);
    assert.ok(model.segments.length === 5, "Got:" + model.segments.length);
    // assert.ok(s.toString().indexOf("P[-200,-200,0  -200,-200], P[200,200,0  200,200]") !== -1, "Got:"+s.toString());
    assert.ok(s.toString().indexOf("-200,-200") !== -1, "Got:" + s.toString());
    assert.ok(s.toString().indexOf("200,200") !== -1, "Got:" + s.toString());
    // Degenerate segment Warn
    s = model.addSegment(p1, p1);
    assert.ok(s === null, "Got:" + s);
    assert.ok(model.segments.length === 5, "Got:" + model.segments.length);
  });

  QUnit.test('addFace', function (assert) {
    let model = new Model();
    model.init([-200, -200, 200, -200, 200, 200, -200, 200]);
    assert.ok(model.faces.length === 1, "Got:" + model.faces.length);
    let f0 = model.faces[0];
    // Should no create a new face, but return existing face.
    model.addFace(f0);
    // assert.ok(model.faces.length === 1,"Got:"+model.faces.length);
    let f1 = new Face();
    f1.points.push(f0.points[0], f0.points[1], f0.points[2], f0.points[3]);
    model.addFace(f1);
    // assert.ok(model.faces.length === 1,"Got:"+model.faces.length);
    f1 = new Face();
    f1.points.push(f0.points[3], f0.points[0], f0.points[1], f0.points[2]);
    model.addFace(f1);
    // assert.ok(model.faces.length === 1,"Got:"+model.faces.length);
  });

  QUnit.test('searchSegmentsOnePoint', function (assert) {
    let model = new Model();
    model.init([-200, -200, 200, -200, 200, 200, -200, 200]);
    // Take point 0 (-200,-200)  on segment (-200,-200) to (200,-200)
    let p0 = model.points[0];
    let p4 = model.addPoint(new Point(0, 0, 0, 0, 0));
    model.addSegment(p0, model.points[2]);

    let segs1 = model.searchSegmentsOnePoint(p0);
    assert.ok(segs1.length === 3, "Got:" + segs1.length); // p0 is on 3 segments
    let segs2 = model.searchSegmentsOnePoint(p4);
    assert.ok(segs2.length === 0);  // p1 is dangling on no segment
  });

  QUnit.test('searchSegmentsTwoPoints', function (assert) {
    let model = new Model();
    model.init([-200, -200, 200, -200, 200, 200, -200, 200]);
    // Take point 0 (-200,-200) and point 1 (200,-200)
    let p0 = model.points[0];
    let p1 = model.points[1];
    let s = model.searchSegmentTwoPoints(p0, p1);
    assert.ok(s.p1 === p0 && s.p2 === p1); // p0,p1 is on 1 segment
  });

  QUnit.test('align2dFrom3d', function (assert) {
    let model = new Model();
    let p1 = model.addPoint(new Point(0, 0, 0, 0, 0));
    let p2 = model.addPoint(new Point(200, 200, 200, 200, 0));
    assert.ok(p2.xf === 200 && p2.yf === 200, "p2.xf = " + p2.xf);
    let s = model.addSegment(p1, p2);
    // New Point in 3D
    let p3 = model.addPoint(new Point(200, 200, 100, 100, 0));
    model.align2dFrom3d(p3, s);
    // 2D coords aligned on 3D
    assert.ok(p3.xf === 100 && p3.yf === 100, "p3.xf = " + p3.xf)
  });

  QUnit.test('faceRight faceLeft', function (assert) {
    let model = new Model();
    model.init([-200, -200, 200, -200, 200, 200, -200, 200]);
    // Take point 0 (-200,-200) and point 1 (200,-200)
    let p0 = model.points[0];
    let p1 = model.points[1];
    let fl = model.faceLeft(p0, p1);
    let fr = model.faceRight(p0, p1);
    assert.ok(fl === model.faces[0]);
    assert.ok(fr === null);
    // Reverse
    fl = model.faceLeft(p1, p0);
    fr = model.faceRight(p1, p0);
    assert.ok(fl === null);
    assert.ok(fr === model.faces[0]);

    // Split on X=0 to get 2 faces
    let p = new Point(0, 0, 0, 0, 0);
    let n = new Vec3(1, 0, 0);
    let pl = new Plane(p, n);
    model.splitFacesByPlane(pl);
    assert.ok(model.points.length === 6, "Got:" + model.points.length);
    assert.ok(model.faces.length === 2, "Got:" + model.faces.length);
    assert.ok(model.segments.length === 7, "Got:" + model.segments.length);
    p0 = model.points[4];
    p1 = model.points[5];
    fl = model.faceLeft(p0, p1);
    fr = model.faceRight(p0, p1);
    assert.ok(fl === model.faces[0], "Got:" + fl);
    assert.ok(fr === model.faces[1], "Got:" + fr);
  });

  QUnit.test('searchFace', function (assert) {
    let model = new Model();
    model.init([-200, -200, 200, -200, 200, 200, -200, 200]);
    let s = model.segments[0];
    let f = model.searchFace(s, null);
    assert.ok(f === model.faces[0]);
    f = model.searchFace(s, f);
    assert.ok(f === null);
  });

  QUnit.test('splitSegmentByPoint', function (assert) {
    let model = new Model();
    model.init([-200, -200, 200, -200, 200, 200, -200, 200]);
    let s0 = model.segments[0];
    // p is the middle of segment s
    let p4 = model.addPoint(new Point(0, -200, 0, -200, 0));
    // Split s0 on p4 => s0 is shorten, s5 is added
    model.splitSegmentByPoint(s0, p4);
    assert.ok(model.segments.length === 5, "Got:" + model.segments.length);
    assert.ok(s0.p1 === model.points[0], "Got:" + s0.p1);
    assert.ok(p4 === model.points[4], "Got p4:" + p4 + " model.points[4]:" + model.points[4]);
    assert.ok(s0.p2 === p4, "Got:" + s0.p2);
    assert.ok(model.segments[4].p1 === p4, "Got:" + model.segments[4]);
    assert.ok(model.segments[4].p2 === model.segments[1].p1, "Got:" + model.segments[4].p2);
  });

  QUnit.test('splitSegmentOnPoint', function (assert) {
    let model = new Model();
    model.init([-200, -200, 200, -200, 200, 200, -200, 200]);
    let s0 = model.segments[0];
    // p is the middle of segment s
    let p4 = model.addPoint(new Point(0, -200, 0, -200, 0));
    // Split s0 on p4 => s0 is shorten, s5 is added
    model.splitSegmentOnPoint(s0, p4);
    assert.ok(model.segments.length === 5, "Got:" + model.segments.length);
    assert.ok(s0.p1 === model.points[0], "Got:" + s0.p1);
    assert.ok(p4 === model.points[4], "Got p4:" + p4 + " model.points[4]:" + model.points[4]);
    assert.ok(s0.p2 === p4, "Got:" + s0.p2);
    assert.ok(model.segments[4].p1 === p4, "Got:" + model.segments[4]);
    assert.ok(model.segments[4].p2 === model.segments[1].p1, "Got:" + model.segments[4].p2);
  });

  QUnit.test('splitSegmentByRatio', function (assert) {
    let model = new Model();
    model.init([-200, -200, 200, -200, 200, 200, -200, 200]);
    let s0 = model.segments[0];
    // Split s0 by 0.2  => s0 is shorten -200 + 400*0.2 = -200 + 80 = -120
    model.splitSegmentByRatio(s0, 0.2);

    assert.ok(model.segments.length === 5, "Got:" + model.segments.length);
    assert.ok(model.points.length === 5, "Got:" + model.points.length);
    assert.ok(s0.p1 === model.points[0], "Got:" + s0.p1);
    assert.ok(s0.p2 === model.points[4], "Got:" + s0.p2);
    assert.ok(s0.p2.x === -120, "Got:" + s0.p2.x);
    assert.ok(s0.p2.xf === -120, "Got:" + s0.p2.xf);
  });

// Origami needs robust split face by plane
  QUnit.test('splitFaceByPlane No intersection', function (assert) {
    let model = new Model();
    model.init([-200, -200, 200, -200, 200, 200, -200, 200]);
    let f = model.faces[0];

    // Degenerate on left
    // console.log("No intersection on left");
    let p = new Point(-400, 0, -400, 0, 0); // On left
    let n = new Vec3(-1, 0, 0);
    let pl = new Plane(p, n);
    model.splitFaceByPlane(f, pl);
    assert.ok(model.faces.length === 1, "faces:" + model.faces.length);
    assert.ok(model.segments.length === 4, "segs:" + model.segments.length);
    assert.ok(model.points.length === 4, "points:" + model.points.length);

    // Degenerate on right
    // console.log("No intersection on right");
    f = model.faces[0];
    p = new Point(400, 0, 400, 0, 0); // On right
    n = new Vec3(-1, 0, 0);
    pl = new Plane(p, n);
    model.splitFaceByPlane(f, pl);
    assert.ok(model.faces.length === 1, "faces:" + model.faces.length);
    assert.ok(model.segments.length === 4, "segs:" + model.segments.length);
    assert.ok(model.points.length === 4, "points:" + model.points.length);
  });

  QUnit.test('splitFaceByPlane Cross on X=0', function (assert) {
    let model = new Model();
    model.init([-200, -200, 200, -200, 200, 200, -200, 200]);
    // Plane on YZ crossing X=0 => two intersections as new Points
    // console.log("Intersection on X=0");
    let p = new Point(0, 0, 0, 0, 0);
    let n = new Vec3(-1, 0, 0);
    let pl = new Plane(p, n);
    let f = model.faces[0];
    model.splitFaceByPlane(f, pl);
    assert.ok(model.faces.length === 2, "faces:" + model.faces.length);
    assert.ok(model.points.length === 6, "points:" + model.points.length);
    assert.ok(model.segments.length === 7, "segs:" + model.segments.length);
  });

  QUnit.test('splitFaceByPlane On Diagonal', function (assert) {
    let model = new Model();
    model.init([-200, -200, 200, -200, 200, 200, -200, 200]);
    // Diagonal Split one face only
    // console.log("Intersection on Diagonal");
    let pl = Plane.by(model.points[0], model.points[2]);
    // let pl = Plane.by(model.points[2], model.points[0]);
    let f = model.faces[0];
    model.splitFaceByPlane(f, pl);
    assert.ok(model.faces.length === 2, "faces :" + model.faces.length);
    assert.ok(model.segments.length === 5, "segs :" + model.segments.length);
    assert.ok(model.points.length === 4, "points :" + model.points.length);
  });

  QUnit.test('splitFaceByPlane On side', function (assert) {
    let model = new Model();
    model.init([-200, -200, 200, -200, 200, 200, -200, 200]);

    // Plane by [0] [1] on left
    // console.log("Intersection On left side to left");
    let pl = new Plane(new Point(-200,-200, -200,-200,0), new Vec3(-400, 0, 0));
    let f = model.faces[0];
    model.splitFaceByPlane(f, pl);
    assert.ok(model.faces.length === 1, "faces :" + model.faces.length);
    assert.ok(model.segments.length === 4, "segs :" + model.segments.length);
    assert.ok(model.points.length === 4, "points :" + model.points.length);

    // Plane by [0] [1] on left
    // console.log("Intersection On left side to right");
    pl = new Plane(new Point(-200,-200, -200,-200,0), new Vec3(400, 0, 0));
    f = model.faces[0];
    model.splitFaceByPlane(f, pl);
    assert.ok(model.faces.length === 1, "faces :" + model.faces.length);
    assert.ok(model.segments.length === 4, "segs :" + model.segments.length);
    assert.ok(model.points.length === 4, "points :" + model.points.length);

    // Plane by [0] [1] on bottom
    // console.log("Intersection On side bottom");
    pl = Plane.by(model.points[0], model.points[1]);
    f = model.faces[0];
    model.splitFaceByPlane(f, pl);
    assert.ok(model.faces.length === 1, "faces :" + model.faces.length);
    assert.ok(model.segments.length === 4, "segs :" + model.segments.length);
    assert.ok(model.points.length === 4, "points :" + model.points.length);
  });

  QUnit.test('splitFaceByPlane On side 3 points', function (assert) {
    let model = new Model();
    model.init([-200, -200, 0, -200, 200, -200, 200, 200, -200, 200]);

    // Plane on y=-200 passing by 0,1,2
    // console.log("Intersection On side 3 points");
    let pl = Plane.by(model.points[0], model.points[2]);
    let f = model.faces[0];
    model.splitFaceByPlane(f, pl);
    assert.ok(model.faces.length === 1, "faces :" + model.faces.length);
    assert.ok(model.segments.length === 5, "segs :" + model.segments.length);
    assert.ok(model.points.length === 5, "points :" + model.points.length);
  });

  QUnit.test('splitFaceByPlane On side 4 points', function (assert) {
    let model = new Model();
    model.init([-200, -200, 0, -200, 100, -200, 200, -200, 200, 200, -200, 200]);

    // Plane on y=-200 passing by 0,1,2
    // console.log("Intersection On side 4 points");
    let pl = Plane.by(model.points[0], model.points[2]);
    let f = model.faces[0];
    model.splitFaceByPlane(f, pl);
    assert.ok(model.faces.length === 1, "faces :" + model.faces.length);
    assert.ok(model.segments.length === 6, "segs :" + model.segments.length);
    assert.ok(model.points.length === 6, "points :" + model.points.length);
  });

  QUnit.test('splitFaceByPlane Strange case', function (assert) {
    let model = new Model();
    model.init([-200, -200, -100, -200, 0, 0, 100, -200, 200, -200, 200, 200, -200, 200]);

    // Plane on y=-200 passing by 0,1,3
    // console.log("Intersection On side 4 points");
    let pl = Plane.by(model.points[0], model.points[1]);
    let f = model.faces[0];
    model.splitFaceByPlane(f, pl);
    assert.ok(model.faces.length === 1, "faces :" + model.faces.length);
    // console.log("Face 0:"+model.faces[0])
    // console.log("Face 1:"+model.faces[1])
    assert.ok(model.segments.length === 7, "segs :" + model.segments.length);
    assert.ok(model.points.length === 7, "points :" + model.points.length);
  });

  // Split all face by plane
  QUnit.test('splitFacesByPlane all faces by', function (assert) {
    let model = new Model();
    model.init([-200, -200, 200, -200, 200, 200, -200, 200]);

    // Diagonal Split 0-1
    // console.log("Intersection on Diagonal");
    let pl = Plane.by(model.points[0], model.points[2]);
    model.splitFacesByPlane(pl);
    assert.ok(model.faces.length === 2, "faces :" + model.faces.length);
    assert.ok(model.segments.length === 5, "segs :" + model.segments.length);
    assert.ok(model.points.length === 4, "points :" + model.points.length);
    // Diagonal Split 1-2
    pl = Plane.by(model.points[1], model.points[3]);
    model.splitFacesByPlane(pl);
    assert.ok(model.faces.length === 4, "faces :" + model.faces.length);
    // console.log("segments : "+model.segments)
    assert.ok(model.segments.length === 8, "segs :" + model.segments.length);
    assert.ok(model.points.length === 5, "points :" + model.points.length);
  });

  // Split list face by two points
  QUnit.test('splitFacesByPlane list faces by', function (assert) {
    let model = new Model();
    model.init([-200, -200, 200, -200, 200, 200, -200, 200]);

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
    assert.ok(model.faces.length === 2, "faces :" + model.faces.length);
    assert.ok(model.segments.length === 5, "segs :" + model.segments.length);
    assert.ok(model.points.length === 4, "points :" + model.points.length);

    // Diagonal Split 1-2 but just face 0
    let list = listFaces(0);
    pl = Plane.by(model.points[1], model.points[3]);
    model.splitFacesByPlane(pl, list);
    assert.ok(model.faces.length === 3, "faces :" + model.faces.length);
    assert.ok(model.segments.length === 7, "segs :" + model.segments.length);
    assert.ok(model.points.length === 5, "points :" + model.points.length);
  });

  // Split all face across
  QUnit.test('splitFacesByPlane all faces across', function (assert) {
    let model = new Model();
    model.init([-200, -200, 200, -200, 200, 200, -200, 200]);

    // Median Split X=0
    // console.log("Plane on X=0");
    let p = new Point(0,0, 0,0,0);
    let n = new Vec3(1, 0, 0);
    let pl = new Plane(p, n);
    model.splitFacesByPlane(pl);
    assert.ok(model.faces.length === 2, "faces :" + model.faces.length);
    assert.ok(model.segments.length === 7, "segs :" + model.segments.length);
    assert.ok(model.points.length === 6, "points :" + model.points.length);
    // Median Split Y=0
    // console.log("Plane on Y=0");
    n = new Vec3(0, 1, 0);
    pl = new Plane(p, n);
    model.splitFacesByPlane(pl);
    assert.ok(model.faces.length === 4, "faces :" + model.faces.length);
    assert.ok(model.segments.length === 12, "segs :" + model.segments.length);
    assert.ok(model.points.length === 9, "points :" + model.points.length);
  });

  QUnit.test('splitCross', function (assert) {
    let model = new Model();
    model.init([-200, -200, 200, -200, 200, 200, -200, 200]);

    // Plane on YZ crossing X=0 => two intersections as new Points
    model.splitCross(model.points[0], model.points[1]);
    assert.ok(model.faces.length === 2, "faces:" + model.faces.length);
    assert.ok(model.segments.length === 7, "segs:" + model.segments.length);
    assert.ok(model.points.length === 6, "points:" + model.points.length);
    // Plane on YZ crossing Y=0 => two intersections as new Points
    model.splitCross(model.points[1], model.points[2]);
    assert.ok(model.faces.length === 4, "faces:" + model.faces.length);
    assert.ok(model.segments.length === 12, "segs:" + model.segments.length);
    assert.ok(model.points.length === 9, "points:" + model.points.length);
  });

  QUnit.test('splitBy', function (assert) {
    let model = new Model();
    model.init([-200, -200, 200, -200, 200, 200, -200, 200]);

    // On edge
    model.splitBy(model.points[0], model.points[1]);
    assert.ok(model.faces.length === 1, "faces:" + model.faces.length);
    assert.ok(model.segments.length === 4, "segs:" + model.segments.length);
    assert.ok(model.points.length === 4, "points:" + model.points.length);
    // On diagonal
    model.splitBy(model.points[0], model.points[2]);
    assert.ok(model.faces.length === 2, "faces:" + model.faces.length);
    assert.ok(model.segments.length === 5, "segs:" + model.segments.length);
    assert.ok(model.points.length === 4, "points:" + model.points.length);
  });

  QUnit.test('splitOrtho', function (assert) {
    let model = new Model();
    model.init([-200, -200, 200, -200, 200, 200, -200, 200]);
    // On edge
    model.splitOrtho(model.segments[0], model.points[0]);
    assert.ok(model.faces.length === 1, "faces:" + model.faces.length);
    assert.ok(model.segments.length === 4, "segs:" + model.segments.length);
    assert.ok(model.points.length === 4, "points:" + model.points.length);
    // Add center
    model.points.push(new Point(0,0, 0,0,0));
    model.splitOrtho(model.segments[0], model.points[4]);
    assert.ok(model.faces.length === 2, "faces:" + model.faces.length);
    assert.ok(model.segments.length === 7, "segs:" + model.segments.length);
    assert.ok(model.points.length === 7, "points:" + model.points.length);
  });

  QUnit.test('splitLineToLineByPoints', function (assert) {
    let model = new Model();
    model.init([-200, -200, 200, -200, 200, 200, -200, 200]);
    // On diagonal
    model.splitLineToLineByPoints(model.points[0], model.points[1], model.points[2]);
    assert.ok(model.faces.length === 2, "faces:" + model.faces.length);
    assert.ok(model.segments.length === 5, "segs:" + model.segments.length);
    assert.ok(model.points.length === 4, "points:" + model.points.length);
  });

  QUnit.test('splitLineToLine', function (assert) {
    let model = new Model();
    model.init([-200, -200, 200, -200, 200, 200, -200, 200]);
    model.splitLineToLine(model.segments[0], model.segments[1]);
    assert.ok(model.faces.length === 2, "faces:" + model.faces.length);
    assert.ok(model.segments.length === 5, "segs:" + model.segments.length);
    assert.ok(model.points.length === 4, "points:" + model.points.length);
  });

  // Angle
  QUnit.test('computeAngle Warn', function (assert) {
    let model = new Model();
    model.init([-200, -200, 200, -200, 200, 200, -200, 200]);

    // Diagonal Split
    // console.log("Intersection on Diagonal");
    let pl = Plane.by(model.points[0], model.points[2]);
    let f = model.faces[0];
    model.splitFaceByPlane(f, pl);
    assert.ok(model.points.length === 4, "points :" + model.points.length);
    assert.ok(model.segments.length === 5, "segs :" + model.segments.length);

    // Angle for edge = 0
    let s = model.segments[0];
    let angle = model.computeAngle(s);
    assert.ok(angle === 0, "Got:" + angle);

    // Angle with no right an left face Warning
    s.type = Segment.PLAIN;
    angle = model.computeAngle(s);
    assert.ok(angle === 0, "Got:" + angle);

    // Angle on flat = 0
    s = model.segments[4];
    s.type = Segment.PLAIN;
    angle = model.computeAngle(s);
    assert.ok(angle === 0, "Got:" + angle);

    // Rotate point on left face
    let pts = model.points.slice(3, 4);
    model.rotate(s, 45, pts);
    angle = model.computeAngle(s);
    assert.ok(Math.round(angle) === 45, "Got:" + angle);
  });

  QUnit.test('rotate all', function (assert) {
    let model = new Model();
    model.init([-200, -200, 200, -200, 200, 200, -200, 200]);

    // Split on X=0
    let p = new Point(0, 0, 0, 0, 0);
    let n = new Vec3(1, 0, 0);
    let pl = new Plane(p, n);
    model.splitFacesByPlane(pl);
    assert.ok(model.segments.length === 7, "segs :" + model.segments.length);

    // Rotate around median s, by 90°, points [1][2]
    // console.log("Segs:"+model.segments);
    let s = model.segments[6];
    let pts = model.points.slice(1, 3); // Points on left
    let pt = pts[0];
    // before
    assert.ok(pt.x === 200, "Got:" + pt.x);
    assert.ok(pt.y === -200, "Got:" + pt.y);
    assert.ok(pt.z === 0, "Got:" + pt.z);
    model.rotate(s, -90, pts);
    // after
    assert.ok(Math.round(pt.x) === 0, "Got:" + pt.x);
    assert.ok(Math.round(pt.y) === -200, "Got:" + pt.y);
    assert.ok(Math.round(pt.z) === 200, "Got:" + pt.z); // z positive toward viewer
    pt = pts[1];
    assert.ok(Math.round(pt.x) === 0, "Got:" + pt.x);
    assert.ok(Math.round(pt.y) === 200, "Got:" + pt.y);
    assert.ok(Math.round(pt.z) === 200, "Got:" + pt.z);

    // Check angle
    let angle = model.computeAngle(s);
    assert.ok(angle === 90, "Got:" + angle);
  });

  // Utility function : To make a list from points numbers
  function listPoints(model, n) {
    let list = [];
    let i = 1; // argument 0 is model
    while (Number.isInteger(Number(arguments[i]))) {
      list.push(model.points[arguments[i++]]);
    }
    return list;
  }

  // Rotate
  QUnit.test('rotate list', function (assert) {
    let model = new Model();
    model.init([-200, -200, 200, -200, 200, 200, -200, 200]);

    // Rotate around bottom s (y=-200), by 90°, points on axe[1] and up right [2]
    let s = model.segments[0];
    let list = listPoints(model, 1, 2);
    assert.ok(list.length === 2, "Got:" + list.length);
    let pt = list[1];
    // before
    // console.log("before:"+list);
    assert.ok(pt.x === 200, "Got:" + pt.x);
    assert.ok(pt.y === 200, "Got:" + pt.y);
    assert.ok(pt.z === 0, "Got:" + pt.z);
    model.rotate(s, 90, list);
    // after
    // console.log("after:"+list);
    assert.ok(Math.round(pt.x) === 200, "Got:" + pt.x);
    assert.ok(Math.round(pt.y) === -200, "Got:" + pt.y);// on plane y = -200
    assert.ok(Math.round(pt.z) === 400, "Got:" + pt.z); // side length = 400
    // Should not move
    pt = list[0];
    assert.ok(Math.round(pt.x) === 200, "Got:" + pt.x);
    assert.ok(Math.round(pt.y) === -200, "Got:" + pt.y);
    assert.ok(Math.round(pt.z) === 0, "Got:" + pt.z);

    // Rotate around bottom s (y=-200), by -90°, points on axe[1] and up right [2]
    s = model.segments[0];
    list = listPoints(model, 1, 2);
    assert.ok(list.length === 2, "Got:" + list.length);
    pt = list[1];
    // before
    // console.log("before:"+list);
    assert.ok(pt.x === 200, "Got:" + pt.x);
    assert.ok(Math.round(pt.y) === -200, "Got:" + pt.y);
    assert.ok(pt.z === 400, "Got:" + pt.z);
    model.rotate(s, -90, list);
    // after
    // console.log("after:"+list);
    assert.ok(Math.round(pt.x) === 200, "Got:" + pt.x);
    assert.ok(Math.round(pt.y) === 200, "Got:" + pt.y); // on plane y = 200
    assert.ok(Math.round(pt.z) === 0, "Got:" + pt.z); // side length = 400
    // Should not move
    pt = list[0];
    assert.ok(Math.round(pt.x) === 200, "Got:" + pt.x);
    assert.ok(Math.round(pt.y) === -200, "Got:" + pt.y);
    assert.ok(Math.round(pt.z) === 0, "Got:" + pt.z);
  });

  // Turn
  QUnit.test('Turn', function (assert) {
    let model = new Model();
    model.init([-200, -200, 200, -200, 200, 200, -200, 200]);
    let p = model.points[0];
    assert.ok(p.x === -200, "Got" + p.x);
    assert.ok(p.y === -200, "Got" + p.y);

    model.turn(1, 180);
    assert.ok(p.x === -200, "Got" + p.x);
    assert.ok(p.y === 200, "Got" + p.y);

    model.turn(2, 180);
    assert.ok(p.x === 200, "Got" + p.x);
    assert.ok(p.y === 200, "Got" + p.y);

    model.turn(3, 180);
    assert.ok(Math.round(p.x) === -200, "Got" + p.x);
    assert.ok(Math.round(p.y) === -200, "Got" + p.y);
  });

  // Adjust
  QUnit.test('Adjust', function (assert) {
    let model = new Model();
    model.init([-200, -200, 200, -200, 200, 200, -200, 200]);
    let p = model.points[0];
    let s = model.segments[0];
    p.x = -100;
    // Adjust one point on all segments
    let max = model.adjust(p);
    assert.ok(Math.round(p.x) === -200, "Got" + p.x);
    assert.ok(max < 0.01, "Got" + max);
    p.x = -400;
    // Adjust one point on list of segments
    max = model.adjust(p, [s]);
    assert.ok(Math.round(p.x) === -200, "Got" + p.x);
    assert.ok(max < 0.01, "Got" + max);
  });

  QUnit.test('Adjust List', function (assert) {
    let model = new Model();
    model.init([-200, -200, 200, -200, 200, 200, -200, 200]);
    let p0 = model.points[0];
    let p1 = model.points[1];
    let s = model.segments[0];
    p0.x = -100;
    // Adjust multiple points on all segments
    let max = model.adjustList([p0, p1]);
    assert.ok(Math.round(p0.x) === -200, "Got" + p0.x);
    assert.ok(max < 0.01, "Got" + max);
  });

  QUnit.test('Evaluate Segments', function (assert) {
    let model = new Model();
    model.init([-200, -200, 200, -200, 200, 200, -200, 200]);
    let p0 = model.points[0];
    p0.x = -100;
    // Evaluate Should mark segments 0 and 3
    let max = model.evaluate();
    assert.ok(model.segments[0].highlight === true, "Got:" + model.segments[0].highlight);
    assert.ok(model.segments[1].highlight === false, "Got:" + model.segments[1].highlight);
    assert.ok(model.segments[2].highlight === false, "Got:" + model.segments[2].highlight);
    assert.ok(model.segments[3].highlight === true, "Got:" + model.segments[3].highlight);
  });

  // Move
  QUnit.test('Move List', function (assert) {
    let model = new Model();
    model.init([-200, -200, 200, -200, 200, 200, -200, 200]);
    let p0 = model.points[0];
    let p1 = model.points[1];
    // Move 2 points by 1,2,3
    model.move(1, 2, 3, [p0, p1]);
    assert.ok(Math.round(p0.x) === -199, "Got:" + p0.x);
    assert.ok(Math.round(p0.y) === -198, "Got:" + p0.y);
    assert.ok(Math.round(p0.z) === 3, "Got:" + p0.z);
    // Move all points by 1,2,3
    model.move(1, 2, 3);
    assert.ok(Math.round(p0.x) === -198, "Got:" + p0.x);
    assert.ok(Math.round(p0.y) === -196, "Got:" + p0.y);
    assert.ok(Math.round(p0.z) === 6, "Got:" + p0.z);
  });

  // Move On
  QUnit.test('Move on List', function (assert) {
    let model = new Model();
    model.init([-200, -200, 200, -200, 200, 200, -200, 200]);
    let p0 = model.points[0];
    let p1 = model.points[1];
    // Move on p0 points p1
    model.moveOn(p0, 0, 1, [p1]);
    assert.ok(Math.round(p1.x) === 200, "Got:" + p1.x);
    assert.ok(Math.round(p1.y) === -200, "Got:" + p1.y);
    assert.ok(Math.round(p1.z) === 0, "Got:" + p1.z);
    model.moveOn(p0, 1, 0, [p1]);
    assert.ok(Math.round(p1.x) === -200, "Got:" + p1.x);
    assert.ok(Math.round(p1.y) === -200, "Got:" + p1.y);
    assert.ok(Math.round(p1.z) === 0, "Got:" + p1.z);
  });

  // Flat
  QUnit.test('Flat', function (assert) {
    let model = new Model();
    model.init([-200, -200, 200, -200, 200, 200, -200, 200]);
    let p0 = model.points[0];
    let p1 = model.points[1];
    model.move(0, 0, 3, [p0, p1]);

    // Move flat points p0 p1
    model.flat([p1]);
    assert.ok(Math.round(p1.x) === 200, "Got:" + p1.x);
    assert.ok(Math.round(p1.y) === -200, "Got:" + p1.y);
    assert.ok(Math.round(p1.z) === 0, "Got:" + p1.z);
    model.move(0, 0, 3, [p0, p1]);
    model.flat();
    assert.ok(Math.round(p1.x) === 200, "Got:" + p1.x);
    assert.ok(Math.round(p1.y) === -200, "Got:" + p1.y);
    assert.ok(Math.round(p1.z) === 0, "Got:" + p1.z);
  });

  // Select Points
  QUnit.test('selectPts', function (assert) {
    let model = new Model();
    model.init([-200, -200, 200, -200, 200, 200, -200, 200]);
    let p0 = model.points[0];
    let p1 = model.points[1];
    model.selectPts([p1]);
    assert.ok(p0.select === false, "Got" + p0.select);
    assert.ok(p1.select === true, "Got" + p1.select);
  });

  // Select Segments
  QUnit.test('selectSegs', function (assert) {
    let model = new Model();
    model.init([-200, -200, 200, -200, 200, 200, -200, 200]);
    let s0 = model.segments[0];
    let s1 = model.segments[1];
    model.selectPts([s1]);
    assert.ok(s0.select === false, "Got" + s0.select);
    assert.ok(s1.select === true, "Got" + s1.select);
  });

  // Offset
  QUnit.test('Offset', function (assert) {
    let model = new Model();
    model.init([-200, -200, 200, -200, 200, 200, -200, 200]);
    model.splitCross(model.points[0], model.points[2]);
    let f = model.faces[0];
    model.offset(42, [model.faces[0]]);
    assert.ok(model.faces[0].offset === 42, "Got:" + model.faces[0].offset);
    assert.ok(model.faces[1].offset === 0, "Got:" + model.faces[1].offset);
  });

  // get2DBounds
  QUnit.test('get2DBounds', function (assert) {
    let model = new Model();
    model.init([-200, -200, 200, -200, 200, 200, -200, 200]);
    let bounds = model.get2DBounds();
    assert.ok(bounds.xmin === -200, "Got:" + bounds.xmin);
    assert.ok(bounds.xmax === 200, "Got:" + bounds.xmax);
    assert.ok(bounds.ymin === -200, "Got:" + bounds.ymin);
    assert.ok(bounds.ymax === 200, "Got:" + bounds.ymax);
  });

  // get3DBounds
  QUnit.test('get3DBounds', function (assert) {
    let model = new Model();
    model.init([-200, -200, 200, -200, 200, 200, -200, 200]);
    let bounds = model.get3DBounds();
    assert.ok(bounds.xmin === -200, "Got:" + bounds.xmin);
    assert.ok(bounds.xmax === 200, "Got:" + bounds.xmax);
    assert.ok(bounds.ymin === -200, "Got:" + bounds.ymin);
    assert.ok(bounds.ymax === 200, "Got:" + bounds.ymax);
  });

  // ScaleModel
  QUnit.test('scaleModel', function (assert) {
    let model = new Model();
    model.init([-200, -200, 200, -200, 200, 200, -200, 200]);
    let p0 = model.points[0];
    model.scaleModel(4);
    assert.ok(p0.x === -800, "Got:" + p0.x);
    assert.ok(p0.y === -800, "Got:" + p0.y);
    assert.ok(p0.z === 0, "Got:" + p0.z);
  });

  // ZoomFit
  QUnit.test('zoomFit', function (assert) {
    let model = new Model();
    model.init([-400, -400, 200, -200, 400, 400, -200, 300]);
    let p0 = model.points[0];
    model.zoomFit();
    assert.ok(p0.x === -200, "Got:" + p0.x);
    assert.ok(p0.y === -200, "Got:" + p0.y);
    assert.ok(p0.z === 0, "Got:" + p0.z);
  });

});
