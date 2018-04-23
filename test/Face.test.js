// File test/Face.test.mjs

import {Point} from '../src/Point.js';
import {Face} from '../src/Face.js';

QUnit.module('Face', () => {

  QUnit.test('Face ()', (assert) => {
    let f = new Face();
    assert.ok(Array.isArray(f.points), "Got:" + f.points);
    assert.ok(Array.isArray(f.normal), "Got:" + f.normal);
    assert.ok(f.select === 0, "Got:" + f.select);
    assert.ok(f.highlight === false, "Got:" + f.highlight);
    assert.ok(f.offset === 0, "Got:" + f.offset);
  });

  QUnit.test('computeFaceNormal()', function (assert) {
    let p1 = new Point().set3d(0, 0, 0);
    let p2 = new Point().set3d(30, 0, 0);
    let p3 = new Point().set3d(0, 0, 40);
    let f = new Face();
    f.points.push(p1);
    f.points.push(p2);
    f.points.push(p3);
    f.computeFaceNormal();
    assert.ok(f.normal[0] === 0, "Got:" + f.normal[0]);
    assert.ok(f.normal[1] === -1, "Got:" + f.normal[1]);
    assert.ok(f.normal[2] === 0, "Got:" + f.normal[2]);
  });

});
