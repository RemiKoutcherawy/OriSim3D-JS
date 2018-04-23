// file 'test/Plane.test.js

import {Point} from '../src/Point.js';
import {Segment} from '../src/Segment.js';
import {Plane} from '../src/Plane.js';
import {Vec3} from '../src/Vec3.js';

QUnit.module('Plane', () => {

  QUnit.test('init', function (assert) {
    let p = new Point(0, 0, 0, 0, 1);
    let n = new Vec3(0, 0, 1);
    let pl = new Plane(p, n);
    assert.ok(pl.r === p && pl.n === n, "Got:" + pl);
  });

  QUnit.test('isOnPlane', function (assert) {
    let p = new Point(10,10, 10,10,0);  // plane passing by 10,10,0
    let n = new Vec3(10,0,0);           // plane normal to right
    let pl = new Plane(p, n);
    let p2 = new Point(10,0, 10,0,0);
    assert.ok(pl.isOnPlane(p2), "Got:" + pl + " " + pl.isOnPlane(p2));
    p2.set3d(10, 10, 10);
    assert.ok(pl.isOnPlane(p2), "Got:" + pl + " " + pl.isOnPlane(p2));
    p2.set3d(11, 10, 10);
    assert.ok(!pl.isOnPlane(p2), "Got:" + pl + " " + pl.isOnPlane(p2));
    p2.set3d(9, 10, 10);
    assert.ok(!pl.isOnPlane(p2), "Got:" + pl + " " + pl.isOnPlane(p2));
  });

  QUnit.test('across', function (assert) {
    let p1 = new Point(10, 0, 0); // On x axis
    let p2 = new Point(30, 0, 0); // Plane passing by 20,0,0 aligned on y z
    let pl = Plane.across(p1, p2);
    let p3 = new Point(20, 0, 0);
    assert.ok(pl.isOnPlane(p3), "Got:" + pl);
    p3.set3d(20, 10, 10);
    assert.ok(pl.isOnPlane(p3), "Got:" + pl);
  });

  QUnit.test('by', function (assert) {
    let p1 = new Point(10,50, 10,50,0);
    let p2 = new Point(-10,50, -10,50,0);
    let pl = Plane.by(p1, p2);
    let p3 = new Point(0,50, 0,50,10);
    assert.ok(pl.isOnPlane(p1), "Got:" + pl);
    assert.ok(pl.isOnPlane(p2), "Got:" + pl);
    assert.ok(pl.isOnPlane(p3), "Got:" + pl);
  });

  QUnit.test('intersectPoint', function (assert) {
    let p1 = new Point(10,50, 10,50,0);
    let p2 = new Point(-10,50, -10,50,0);
    let pl = Plane.across(p1, p2);

    // p3 is on plane at x = 10-10 = 0
    let p3 = pl.intersectPoint(p1, p2);
    assert.ok(p3.x === 0, "Got:" + p3);
    assert.ok(p3.y === 50, "Got:" + p3);

    // move p2 on plane
    p2.set3d(0, 50, 0);
    p3 = pl.intersectPoint(p1, p2);
    assert.ok(p3.x === 0, "Got:" + p3);
    assert.ok(p3.y === 50, "Got:" + p3);

    // move p2 on right no intersection
    p2.set3d(5, 50, 0);
    p3 = pl.intersectPoint(p1, p2);
    assert.ok(p3 === null, "Got:" + p3);

    // move p1 on left no intersection
    p1.set3d(-5, 50, 0);
    p2.set3d(-10, 50, 0);
    p3 = pl.intersectPoint(p1, p2);
    assert.ok(p3 === null, "Got:" + p3);
  });

  QUnit.test('intersectSeg', function (assert) {
    let p1 = new Point(10, 50, 10, 50, 0);
    let p2 = new Point(-10, 50, -10, 50, 0);
    let s = new Segment(p1, p2);
    let pl = Plane.across(p1, p2);
    let p3 = pl.intersectSeg(s);
    assert.ok(p3 !== null, "Got:" + p3);
  });

  QUnit.test('classifyPointToPlane', function (assert) {
    let p1 = new Point(10, 50, 10, 50, 0); // Right
    let p2 = new Point(-10, 50, -10, 50, 0); // Left
    let p3 = new Point(0, 50, 0, 50, 0); // Middle
    let pl = Plane.across(p1, p2);
    let d = pl.classifyPointToPlane(p1);
    assert.ok(d > 0, "Got:" + d); // p1 right
    d = pl.classifyPointToPlane(p2);
    assert.ok(d < 0, "Got:" + d); // p2 left
    d = pl.classifyPointToPlane(p3);
    assert.ok(d === 0, "Got:" + d); // p3 middle

    // Plane on YZ axis
    let p = new Point(0, 0, 0, 0, 0);
    let n = new Point(-1, 0, -1, 0, 0);
    pl = new Plane(p, n);
    d = pl.classifyPointToPlane(p1);
    assert.ok(d > 0, "Got:" + d); // p1 right
    d = pl.classifyPointToPlane(p2);
    assert.ok(d < 0, "Got:" + d); // p2 left
    d = pl.classifyPointToPlane(p3);
    assert.ok(d === 0, "Got:" + d); // p3 middle
  });

});