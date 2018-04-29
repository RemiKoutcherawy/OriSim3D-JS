// File test/Face.test.mjs

import {Point} from '../src/Point.js';
import {Face} from '../src/Face.js';

function ok(expr, msg) {
  if (!expr) throw new Error(msg); else return true;
}

describe('Face', function () {

  it('Face ()', () => {
    let f = new Face();
    ok(Array.isArray(f.points), "Got:" + f.points);
    ok(Array.isArray(f.normal), "Got:" + f.normal);
    ok(f.select === false, "Got:" + f.select);
    ok(f.highlight === false, "Got:" + f.highlight);
    ok(f.offset === 0, "Got:" + f.offset);
  });

  it('computeFaceNormal()', function () {
    let p1 = new Point().set3d(0, 0, 0);
    let p2 = new Point().set3d(30, 0, 0);
    let p3 = new Point().set3d(0, 0, 40);
    let f = new Face();
    f.points.push(p1);
    f.points.push(p2);
    f.points.push(p3);
    f.computeFaceNormal();
    ok(f.normal[0] === 0, "Got:" + f.normal[0]);
    ok(f.normal[1] === -1, "Got:" + f.normal[1]);
    ok(f.normal[2] === 0, "Got:" + f.normal[2]);
  });

  it('onFace2d()', function () {
    let p1 = new Point().set2d(0, 0);
    let p2 = new Point().set2d(100, 0);
    let p3 = new Point().set2d(0, 100);
    let f = new Face();
    f.points.push(p1);
    f.points.push(p2);
    f.points.push(p3);

    // Outside
    ok(!f.onFace2d(-10, -10), "Got:" + f.onFace2d(-10, -10));
    // Inside
    ok(f.onFace2d(10, 10), "Got:" + f.onFace2d(0, 0));
    // On edge
    ok(!f.onFace2d(50, 50), "Got:" + f.onFace2d(50, 50));
    // On point
    ok(f.onFace2d(0, 0), "Got:" + f.onFace2d(0, 0));
    // Outside
    ok(!f.onFace2d(100, 100), "Got:" + f.onFace2d(100, 100));
  });



});
