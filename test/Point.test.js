// File test/Point.test.js
// run with mocha --require babel-polyfill --require babel-register --require should test/Point.test.js

import {Point} from '../src/Point.js';
import {Vec3} from "../src/Vec3";

function ok(expr, msg) {
  if (!expr) throw new Error(msg); else return true;
}

describe('Point', function () {

  it('Point()', function () {
    let p = new Point(1, 2, 10, 20, 30);
    ok(p.xf === 1 && p.yf === 2 && p.x === 10 && p.y === 20 && p.z === 30, "Got:" + p);
  });

  it('Point.set values', function () {
    let p = new Point();
    p.set5d(1, 2, 10, 20, 30);
    ok(p.xf === 1 && p.yf === 2 && p.x === 10 && p.y === 20 && p.z === 30, "Got:" + p);
    p.set3d(40, 50, 60);
    ok(p.x === 40 && p.y === 50 && p.z === 60, "Got:" + p);
    p.set2d(-200, 200);
    ok(p.xf === -200 && p.yf === 200, "Got:" + p);
  });

  it('Point.add', function () {
    let p1 = new Point(0, 0, 0, 0, 0);
    let p2 = new Vec3(1, 2, 3);
    let p = p1.add(p2);
    ok(p.xf === 0 && p.yf === 0 && p.x === 1 && p.y === 2 && p.z === 3, " Got:" + p.toString());
  });

  it('Point.sub', function () {
    let p1 = new Point(0, 0, 0, 0, 0);
    let p2 = new Vec3(1, 2, 3);
    let p = p1.sub(p2);
    ok(p.xf === 0 && p.yf === 0 && p.x === -1 && p.y === -2 && p.z === -3, " Got:" + p.toString());
  });

  it('Point.clone', function () {
    let p1 = new Point(0, 0, 1, 2, 3);
    let p = p1.clone();
    ok(p.xf === 0 && p.yf === 0 && p.x === 1 && p.y === 2 && p.z === 3, " Got:" + p.toString());
  });

  it('Point.compare3d', function () {
    let p1 = new Point(0, 0, 0, 0, 0);
    ok(p1.compare3d(3, 4, 0) === 25, " Got:" + p1.compare3d(3, 4, 0));
    ok(p1.compare3d(0, 0, 0) === 0, "expect 0 got:" + p1.compare3d(0, 0, 0));
  });

  it('Point.compare3dPt', function () {
    let p1 = new Point(0, 0, 0, 0, 0);
    let p2 = new Point(0, 0, 3, 4, 0);
    ok(p1.compare3dPt(p2) === 25, " Got:" + p1.compare3dPt(3, 4, 0));
    ok(p1.compare3dPt(p1) === 0, "expect 0 got:" + p1.compare3dPt(0, 0, 0));
  });

  it('Point.dist', function () {
    let p = new Point(0, 0, 3, 4, 0);
    ok(p.dist() === 25, " Got:" + p.dist());
  });

  it('Point.compare2d', function () {
    let p1 = new Point(0, 0, 0, 0, 0);
    ok(p1.compare2d(3, 4) === 5, "Got:" + p1.compare2d(3, 4));
    ok(p1.compare2d(0, 3) === 3, "expect 3 got:" + p1.compare2d(0, 3));
  });

});

