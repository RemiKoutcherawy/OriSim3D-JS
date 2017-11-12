// file 'test/test.Plane.js
// run with $ mocha --ui qunit
// or $ mocha or $ npm test or open test.html
NODE_ENV = true;
// Dependencies : import them before Model in browser
if (typeof module !== 'undefined' && module.exports) {
  var OR = OR || {};
  OR.Point   = require('../js/Point.js');
  OR.Segment = require('../js/Segment.js');
  OR.Plane   = require('../js/Plane.js');
}
function ok(expr, msg) {
  if (!expr) throw new Error(msg);
}

// Unit tests using Mocha
suite('Plane');
before(function () {
  // runs before all test in this block
});
test('init', function () {
  let p = new OR.Point(0,0,1);
  let n = new OR.Point(0,0,1);
  let pl = new OR.Plane(p, n);
  ok(pl.r === p && pl.n === n, "Got:"+pl);
});
test('isOnPlane', function () {
  let p = new OR.Point(10,10, 0); // plane passing by 10,10,0
  let n = new OR.Point(10, 0, 0); // plane normal to right
  let pl = new OR.Plane(p, n);
  let p2 = new OR.Point(10, 0, 0);
  ok(pl.isOnPlane(p2), "Got:"+pl+" "+pl.isOnPlane(p2));
  p2.set3d(10,10,10);
  ok(pl.isOnPlane(p2), "Got:"+pl+" "+pl.isOnPlane(p2));
  p2.set3d(11,10,10);
  ok(!pl.isOnPlane(p2), "Got:"+pl+" "+pl.isOnPlane(p2));
  p2.set3d(9,10,10);
  ok(!pl.isOnPlane(p2), "Got:"+pl+" "+pl.isOnPlane(p2));
});
test('across', function () {
  let p1 = new OR.Point(10, 0, 0); // On x axis
  let p2 = new OR.Point(30, 0, 0); // Plane passing by 20,0,0 aligned on y z
  let pl = OR.Plane.across(p1, p2);
  let p3 = new OR.Point(20, 0, 0);
  ok(pl.isOnPlane(p3), "Got:"+pl);
  p3.set3d(20, 10, 10);
  ok(pl.isOnPlane(p3), "Got:"+pl);
});
test('by', function () {
  let p1 = new OR.Point(10, 50, 0);
  let p2 = new OR.Point(-10, 50, 0);
  let pl = OR.Plane.by(p1, p2);
  let p3 = new OR.Point(0, 50, 10);
  ok(pl.isOnPlane(p1), "Got:"+pl);
  ok(pl.isOnPlane(p2), "Got:"+pl);
  ok(pl.isOnPlane(p3), "Got:"+pl);
});

test('intersectPoint', function () {
  let p1 = new OR.Point(10, 50, 0);
  let p2 = new OR.Point(-10, 50, 0);
  let pl = OR.Plane.across(p1, p2);
  let p3 = pl.intersectPoint(p1, p2);
  ok(p3.x === 0, "Got:"+p3);
  let p4 = pl.intersectPoint(p1, p3);
  ok(p4 !== null, "Got:"+p4);
  p3.set3d(5,50,0); // move on right no intersection
  p4 = pl.intersectPoint(p1, p3);
  ok(p4 === null, "Got:"+p4);
  p3.set3d(-5,50,0); // move on left no intersection
  p4 = pl.intersectPoint(p2, p3);
  ok(p4 === null, "Got:"+p4);
});
test('intersectSeg', function () {
  let p1 = new OR.Point(10, 50, 0);
  let p2 = new OR.Point(-10, 50, 0);
  let s = new OR.Segment(p1, p2);
  let pl = OR.Plane.across(p1, p2);
  let p3 = pl.intersectSeg(s);
  ok(p3 !== null, "Got:"+p3);
});
test('classifyPointToPlane', function () {
  let p1 = new OR.Point(10, 50, 0); // Right
  let p2 = new OR.Point(-10, 50, 0); // Left
  let p3 = new OR.Point(0, 50, 0); // Middle
  let pl = OR.Plane.across(p1, p2);
  let d = pl.classifyPointToPlane(p1);
  ok(d > 0, "Got:"+d); // p1 right
  d = pl.classifyPointToPlane(p2);
  ok(d < 0, "Got:"+d); // p2 left
  d = pl.classifyPointToPlane(p3);
  ok(d === 0, "Got:"+d); // p3 middle

  // Plane on YZ axis
  let p = new OR.Point(0, 0, 0);
  let n = new OR.Point(-1, 0, 0);
  pl = new OR.Plane(p, n);
  d = pl.classifyPointToPlane(p1);
  ok(d > 0, "Got:"+d); // p1 right
  d = pl.classifyPointToPlane(p2);
  ok(d < 0, "Got:"+d); // p2 left
  d = pl.classifyPointToPlane(p3);
  ok(d === 0, "Got:"+d); // p3 middle
});