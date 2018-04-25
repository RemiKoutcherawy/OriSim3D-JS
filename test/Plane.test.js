// file 'test/Plane.test.js

import {Point} from '../src/Point.js';
import {Segment} from '../src/Segment.js';
import {Plane} from '../src/Plane.js';
import {Vec3} from '../src/Vec3.js';

function ok(expr, msg) {
  if (!expr) throw new Error(msg); else return true;
}

describe('Plane', function () {

  it('init', function () {
    let p = new Vec3(0, 0, 1);
    let n = new Vec3(0, 0, 1);
    let pl = new Plane(p, n);
    ok(pl.r === p && pl.n === n, "Got:" + pl);
  });

  it('isOnPlane', function () {
    let p = new Vec3(10, 10, 0);  // plane passing by 10,10,0
    let n = new Vec3(10, 0, 0);   // plane normal to right
    let pl = new Plane(p, n);
    let p2 = new Vec3(10, 0, 0);
    ok(pl.isOnPlane(p2), "Got:" + pl + " " + pl.isOnPlane(p2));
    p2.set3d(10, 10, 10);
    ok(pl.isOnPlane(p2), "Got:" + pl + " " + pl.isOnPlane(p2));
    p2.set3d(11, 10, 10);
    ok(!pl.isOnPlane(p2), "Got:" + pl + " " + pl.isOnPlane(p2));
    p2.set3d(9, 10, 10);
    ok(!pl.isOnPlane(p2), "Got:" + pl + " " + pl.isOnPlane(p2));
  });

  it('intersectPoint', function () {
    let p1 = new Vec3(10, 50, 0);
    let p2 = new Vec3(-10, 50, 0);
    let pl = Plane.across(p1, p2);

    // p3 is on plane at x = 10-10 = 0
    let p3 = pl.intersectPoint(p1, p2);
    ok(p3.x === 0, "Got:" + p3);
    ok(p3.y === 50, "Got:" + p3);

    // move p2 on plane
    p2.set3d(0, 50, 0);
    p3 = pl.intersectPoint(p1, p2);
    ok(p3.x === 0, "Got:" + p3);
    ok(p3.y === 50, "Got:" + p3);

    // move p2 on right no intersection
    p2.set3d(5, 50, 0);
    p3 = pl.intersectPoint(p1, p2);
    ok(p3 === null, "Got:" + p3);

    // move p1 on left no intersection
    p1.set3d(-5, 50, 0);
    p2.set3d(-10, 50, 0);
    p3 = pl.intersectPoint(p1, p2);
    ok(p3 === null, "Got:" + p3);
  });

  it('intersectSeg', function () {
    let p1 = new Vec3(10, 50, 0);
    let p2 = new Vec3(-10, 50, 0);
    let s = new Segment(p1, p2);
    let pl = Plane.across(p1, p2);
    let p3 = pl.intersectSeg(s);
    ok(p3 !== null, "Got:" + p3);
  });

  it('classifyPointToPlane(Vector)', function () {
    let p1 = new Vec3(10, 50, 0); // Right
    let p2 = new Vec3(-10, 50, 0); // Left
    let p3 = new Vec3(0, 50, 0); // Middle
    let pl = Plane.across(p1, p2);
    let d = pl.classifyPointToPlane(p1);
    ok(d > 0, "Got:" + d); // p1 right
    d = pl.classifyPointToPlane(p2);
    ok(d < 0, "Got:" + d); // p2 left
    d = pl.classifyPointToPlane(p3);
    ok(d === 0, "Got:" + d); // p3 middle

    // Plane on YZ axis
    let p = new Vec3(0, 0, 0);
    let n = new Vec3(-1, 0, 0);
    pl = new Plane(p, n);
    d = pl.classifyPointToPlane(p1);
    ok(d > 0, "Got:" + d); // p1 right
    d = pl.classifyPointToPlane(p2);
    ok(d < 0, "Got:" + d); // p2 left
    d = pl.classifyPointToPlane(p3);
    ok(d === 0, "Got:" + d); // p3 middle
  });

  it('classifyPointToPlane(Point)', function () {
    let p1 = new Point(0,0, 10, 50, 0); // Right
    let p2 = new Point(0,0, -10, 50, 0); // Left
    let p3 = new Point(0,0, 0, 50, 0); // Middle
    let pl = Plane.across(p1, p2);
    let d = pl.classifyPointToPlane(p1);
    ok(d > 0, "Got:" + d); // p1 right
    d = pl.classifyPointToPlane(p2);
    ok(d < 0, "Got:" + d); // p2 left
    d = pl.classifyPointToPlane(p3);
    ok(d === 0, "Got:" + d); // p3 middle
  });

  it('toString', function () {
    let p = new Vec3(1, 2, 3);
    let n = new Vec3(4, 5, 6);
    let pl = new Plane(p, n);
    let s = pl.toString();
    ok(s === "Pl[r:[1,2,3] n:[4,5,6]]", "Got:" + s);
  });

  // Static methods
  it('Plane.across', function () {
    let p1 = new Vec3(10, 0, 0); // On x axis
    let p2 = new Vec3(30, 0, 0); // Plane passing by 20,0,0 aligned on y z
    let pl = Plane.across(p1, p2);
    let p3 = new Vec3(20, 0, 0);
    ok(pl.isOnPlane(p3), "Got:" + pl);
    p3.set3d(20, 10, 10);
    ok(pl.isOnPlane(p3), "Got:" + pl);
  });

  it('Plane.by', function () {
    let p1 = new Vec3(10, 50, 0);
    let p2 = new Vec3(-10, 50, 0);
    let pl = Plane.by(p1, p2);

    let p3 = new Vec3(0, 50, 10); // Middle displaced on z
    ok(pl.isOnPlane(p1), "Got:" + pl);
    ok(pl.isOnPlane(p2), "Got:" + pl);
    ok(pl.isOnPlane(p3), "Got:" + pl);
  });

  it('Plane.ortho', function () {
    let p1 = new Point(0, 0, 0, 0, 0);
    let p2 = new Point(0, 0, 40, 40, 0);
    let p3 = new Point(0, 0, 20, 20, 0);
    let s = new Segment(p1, p2);
    let pl = Plane.ortho(s, p3);
    let v3 = new Vec3(p3.x, p3.y, p3.z);
    ok(pl.isOnPlane(v3), "Got:" + pl);
  });

});