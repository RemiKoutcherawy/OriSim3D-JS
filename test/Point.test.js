// File test/Point.test.js

import { Point } from '../src/Point.js';

QUnit.module( 'Point', () => {

  QUnit.test( 'Point (xf, yf, x, y, z)', ( assert ) => {
    let p = new Point(1, 2, 10, 20, 30);
    assert.ok(p.xf === 1 && p.yf === 2 && p.x === 10 && p.y === 20 && p.z === 30, "Got:"+p);
  });

  QUnit.test( 'set', ( assert ) => {
    let p = new Point();
    p.set5d(1,2, 10,20,30);
    assert.ok(p.xf === 1 && p.yf === 2 && p.x === 10 && p.y === 20 && p.z === 30, "Got:"+p);
    p.set3d(40, 50, 60);
    assert.ok(p.x === 40 && p.y === 50 && p.z === 60, "Got:"+p);
    p.set2d(-200, 200);
    assert.ok(p.xf === -200 && p.yf === 200, "Got:"+p);
  });

});
