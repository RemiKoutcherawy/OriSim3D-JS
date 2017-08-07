// file 'test/test.Point.js
// run with $ mocha --ui qunit
// or $ mocha or $ npm test or open test.html

// Dependencies : import them before Model in browser
if (typeof module !== 'undefined' && module.exports) {
  var Point = require('../js/Point.js');
}
function ok(expr, msg) {
  if (!expr) throw new Error(msg);
}
// Unit tests using Mocha
suite('Point');
before(function () {
  // runs before all test in this block
});
test('init', function () {
  let p = new Point(1, 2, 10, 20, 30);
  ok(p.xf === 1 && p.yf === 2 && p.x === 10 && p.y === 20 && p.z === 30, "Got:"+p);
  p = new Point(1, 2);
  ok(p.xf === 1 && p.yf === 2 && p.x === 1 && p.y === 2 && p.z === 0, "Got:"+p);
  p = new Point(10, 20, 30);
  ok(p.xf === 10 && p.yf === 20 && p.x === 10 && p.y === 20 && p.z === 30, "Got:"+p);
});
test('set', function () {
  let p = new Point();
  p.set5d(1, 2, 10, 20, 30);
  ok(p.xf === 1 && p.yf === 2 && p.x === 10 && p.y === 20 && p.z === 30, "Got:"+p);
  p.set3d(40, 50, 60);
  ok(p.x === 40 && p.y === 50 && p.z === 60, "Got:"+p);
  p.set2d(-200, 200);
  ok(p.xf === -200 && p.yf === 200, "Got:"+p);
});
test('length', function () {
  let p = new Point(0, 0, 3, 4, 0);
  // 3^2 + 4^2 = 9+16 = 25 = 5^2
  ok(p.length() === 5);
});
test('norm', function () {
  let p = new Point(3, 4, 0);
  ok(p.norm().length() === 1);
});
test('Point.dot', function () {
  let p1 = new Point(0,0, 1,2,3);
  let p2 = new Point(3,4, 4,5,6);
  ok(Point.dot(p1, p2) === 32,"expect 32 got:"+Point.dot(p1, p2));
});
test('Point.add', function () {
  let p1 = new Point(0,0, 1,2,3);
  let p2 = new Point(3,4, 4,5,6);
  let p = Point.add(p1, p2);
  ok(Point.compare3d(p, 5,7,9) === 0,"got:"+Point.compare3d(p1, 5,7,9));
});
test('Point.sub', function () {
  let p1 = new Point(0,0, 1,2,3);
  let p2 = new Point(3,4, 4,5,6);
  let p = Point.sub(p2, p1);
  ok(Point.compare3d(p, 3,3,3) === 0,"got:"+Point.compare3d(p1, 3,3,3));
});
test('Point.compare3d', function () {
  let p1 = new Point(0,0, 0,0,0);
  let p2 = new Point(0,0, 3,4,0);
  ok(Point.compare3d(p1, p2) === 25," Got:"+Point.compare3d(p1, p2));
  p2.set3d(0,0,1);
  ok(Point.compare3d(p1, p2) === 0,"expect 0 got:"+Point.compare3d(p1, p2));
});
test('Point.compare2d', function () {
  let p1 = new Point(0,0, 0,0,0);
  let p2 = new Point(3,4, 1,2,3);
  ok(Point.compare2d(p1, p2) === 5, "expect 5 got:"+Point.compare2d(p1, p2) );
  p2.set2d(0,3);
  ok(p2.x === 1 && p2.y === 2 && p2.z === 3,"expect P[3d:1,2,3 flat:0,3] got:"+p2.toString());
  ok(p2.xf === 0 && p2.yf === 3,"expect P[3d:1,2,3 flat:0,3] got:"+p2.toString());
  ok(Point.compare2d(p1, p2) === 3, "expect 3 got:"+Point.compare2d(p1, p2));
});