// File test/Vec3.test.js
// run with mocha --require babel-polyfill --require babel-register --require  test/Vec3.test.js

import {Vec3} from "../src/Vec3.js";

function ok(expr, msg) {
  if (!expr) throw new Error(msg);
  else return true;
}

describe('Vec3', function () {

  it('Vec3()', function () {
    let v = new Vec3(10, 20, 30);
    ok(v.x === 10 && v.y === 20 && v.z === 30, "Got:" + v.toString());
  });

  it('Vec3.set3d()', function () {
    let v = new Vec3(0, 0, 0);
    v.set3d(10, 20, 30);
    ok(v.x === 10 && v.y === 20 && v.z === 30, "Got:" + v.toString());
  });

  it('Vec3.lengthSq', function () {
    let v = new Vec3(3, 4, 0);
    // 3^2 + 4^2 = 9+16 = 25 = 5^2
    ok(v.lengthSq() === 25);
  });

  it('Vec3.scale', function () {
    let v = new Vec3(3, 4, 0);
    // 3^2 + 4^2 = 9+16 = 25
    v.scale(2);
    ok(v.lengthSq() === 25 * 4);
  });

  it('Vec3.norm', function () {
    let v = new Vec3(3, 4, 0);
    v.norm();
    ok(Math.round(v.lengthSq()) === 1);
  });

  it('Vec3.dot', function () {
    let v1 = new Vec3(1, 2, 3);
    let v2 = new Vec3(4, 5, 6);
    ok(v1.dot(v2) === 32, "expect 32 got:" + v1.dot(v2));
  });

  it('Vec3.add', function () {
    let v1 = new Vec3(1, 2, 3);
    let v2 = new Vec3(4, 5, 6);
    let v = v1.add(v2);
    ok(v.x === 5 && v.y === 7 && v.z === 9, "Got" + v);
  });

  it('Vec3.sub', function () {
    let v1 = new Vec3(1, 2, 3);
    let v2 = new Vec3(4, 5, 6);
    let v = v2.sub(v1);
    ok(v.x === 3 && v.y === 3 && v.z === 3, "Got" + v);
  });

  it('Vec3.clone', function () {
    let p1 = new Vec3(1, 2, 3);
    let p = p1.clone();
    ok(p.x === 1 && p.y === 2 && p.z === 3, " Got:" + p.toString());
  });

  it('Vec3.toString', function () {
    let v = new Vec3(1, 2, 3);
    let s = v.toString();
    ok(s === "[1,2,3]", "Got" + s);
  });

});

