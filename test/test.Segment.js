// file 'test/testCommand.js
// run with $ mocha --ui qunit
// or $ mocha or $ npm test or open test.html
NODE_ENV = true;
// Dependencies : import them before Model in browser
if (typeof module !== 'undefined' && module.exports) {
  var OR = OR || {};
  OR.Point = require('../js/Point.js');
  OR.Segment = require('../js/Segment.js');
}
function ok(expr, msg) {
  if (!expr) throw new Error(msg);
}
// Unit tests using Mocha
suite('Segment');
before(function () {
  // runs before all test in this block
});
test('init', function () {
  let p1 = new OR.Point(1, 2, 10, 20, 30);
  let p2 = new OR.Point(3, 4, 10, 20, 30);
  let s = new OR.Segment(p1, p2);
  ok(s.p1.xf === 1 && s.p2.yf === 4);
});
test('reverse', function () {
  let p1 = new OR.Point(1, 2, 10, 20, 30);
  let p2 = new OR.Point(3, 4, 40, 50, 60);
  let s = new OR.Segment(p1, p2);
  s.reverse();
  ok(s.p1 === p2 && s.p2 === p1,"expect p2,p1 got:"+s.p1+" "+s.p2);
});
test('length3d', function () {
  let p1 = new OR.Point(0, 0, 0);
  let p2 = new OR.Point(30, 40, 0);
  let s = new OR.Segment(p1,p2);
  let lg = s.length3d();
  ok(lg === 50,"expect 30 got:"+lg);
  lg = s.length3d();
  ok(lg === 50,"expect 30 got:"+lg);
});
test('length2d', function () {
  let p1 = new OR.Point(1, 2);
  let p2 = new OR.Point(4, 6);
  let s = new OR.Segment(p1,p2);
  let lg = s.length2d();
  ok(lg === 5,"expect 5 got:"+lg);
});
test('toString', function () {
  let p1 = new OR.Point(1, 2);
  let p2 = new OR.Point(4, 6);
  let s = new OR.Segment(p1,p2);
  ok(s.toString().indexOf('S(P1:[1,2,0] [1,2], P2:[4,6,0] [4,6])') !== -1,'got:['+s.toString()+"]")
});
test('Segment.compare', function () {
  let s1 = new OR.Segment(new OR.Point(0, 0, 0), new OR.Point(30, 40, 0));
  let s2 = new OR.Segment(new OR.Point(0, 0, 0), new OR.Point(30, 40, 0));
  let d = OR.Segment.compare(s1, s2);
  ok(d === 0,"got:"+d);
  s2 = new OR.Segment(new OR.Point(3, 0, 0), new OR.Point(30, 40, 0));
  d = OR.Segment.compare(s1, s2);
  ok(d === 9,"got:"+d);
  s2 = new OR.Segment(new OR.Point(30, 0, 0), new OR.Point(30, 40, 0));
  d = OR.Segment.compare(s1, s2);
  ok(d === 900,"got:"+d);
});
test('Segment.distanceToSegment', function () {
  let p1 = new OR.Point(0, 0, 0);
  let p2 = new OR.Point(30, 40, 0);
  let s = new OR.Segment(p1, p2);
  let d = OR.Segment.distanceToSegment(s, p1);
  ok(d === 0,"got:"+d);
  d = OR.Segment.distanceToSegment(s, p2);
  ok(d === 0,"got:"+d);

  let p3 = new OR.Point(0, -30, 0);
  d = OR.Segment.distanceToSegment(s, p3);
  ok(d === 30,"got:"+d);
  p3 = new OR.Point(30, 50, 0);
  d = OR.Segment.distanceToSegment(s, p3);
  ok(d === 10,"got:"+d);
  p3 = new OR.Point(30, 10, 0);
  d = OR.Segment.distanceToSegment(s, p3);
  ok(d === 18,"got:"+d);
});

test('Segment.closestSeg', function () {
  let p0 = new OR.Point(0,0,0);
  let p1 = new OR.Point(0,0,0);
  let s1 = new OR.Segment(p0,p1);
  let p2 = new OR.Point(0,0,0);
  let p3 = new OR.Point(0,0,0);
  let s2 = new OR.Segment(p2,p3);

  // Both OR.Segments degenerate into one point 0,0,0 = p0 Closest OR.Segment c is (p0,p0)
  let c = OR.Segment.closestSeg(s1, s2);
  ok(OR.Point.compare3d(c.p1, p0) === 0 && OR.Point.compare3d(c.p2, p0) === 0);

  // First OR.Segment degenerates and second OR.Segment is crossing first OR.Segment
  s2.p1.set3d(0, 100, 0);
  c = OR.Segment.closestSeg(s1, s2);
  ok(OR.Point.compare3d(c.p1, p0) === 0, "Got c.p1:"+c.p1);
  ok(OR.Point.compare3d(c.p2, p0) === 0, "Got c.p2:"+c.p2);

  // First OR.Segment degenerates and second OR.Segment degenerates but is distinct
  s2.p2.set3d(0, 100, 0);
  c = OR.Segment.closestSeg(s1, s2);
  ok(OR.Point.compare3d(c.p1, p0) === 0, "Got c.p1:"+c.p1);
  ok(OR.Point.compare3d(c.p2, s2.p2) === 0, "Got c.p2:"+c.p2);

  // First degenerate and second is a line
  s2.p1.set3d(100, -100, 0);
  s2.p2.set3d(100, 100, 0);
  c = OR.Segment.closestSeg(s1, s2);
  ok(OR.Point.compare3d(c.p1, p0) === 0, "Got c.p1:"+c.p1);
  ok(OR.Point.compare3d(c.p2, new OR.Point(100,0,0)) === 0, "Got c.p2:"+c.p2);

  // First and second are parallel lines
  s1.p1.set3d(0, -100, 0);
  s1.p2.set3d(0, 200, 0);
  s2.p1.set3d(100, -300, 0);
  s2.p2.set3d(100, 400, 0);
  c = OR.Segment.closestSeg(s1, s2);
  // Should take the first point of s1 and project it on s2
  ok(OR.Point.compare3d(c.p1, s1.p1) === 0, "Got c.p1:"+c.p1);
  ok(OR.Point.compare3d(c.p2, new OR.Point(100,-100,0)) === 0, "Got c.p2:"+c.p2);

  // First and second are intersecting lines
  s1.p1.set3d(100, 0, 0); // vertical on x = 100
  s1.p2.set3d(100, 400, 0);
  s2.p1.set3d(0, 0, 0);	// 45° from 0,0 to 200,200
  s2.p2.set3d(200, 200, 0);
  c = OR.Segment.closestSeg(s1, s2);
  ok(OR.Point.compare3d(c.p1, new OR.Point(100,100,0)) === 0, "Got c.p1:"+c.p1);
  ok(OR.Point.compare3d(c.p2, new OR.Point(100,100,0)) === 0, "Got c.p2:"+c.p2);

  // First and second are non intersecting segments
  s1.p1.set3d(100, 0, 0); // vertical x = 100 y[0,100]
  s1.p2.set3d(100, 100, 0);
  s2.p1.set3d(0, 200, 0);	// horizontal y = 200 x[0,200]
  s2.p2.set3d(200, 200, 0);
  c = OR.Segment.closestSeg(s1, s2);
  ok(OR.Point.compare3d(c.p1, new OR.Point(100,100,0)) === 0, "Got c.p1:"+c.p1);
  ok(OR.Point.compare3d(c.p2, new OR.Point(100,200,0)) === 0, "Got c.p2:"+c.p2);

  // First and second are non intersecting lines in 3D
  s1.p1.set3d(0, 0, 100); // diagonal on back side of cube
  s1.p2.set3d(100, 100, 100);
  s2.p1.set3d(0, 100, 0);	// diagonal on front side of cube
  s2.p2.set3d(100, 0, 0);
  c = OR.Segment.closestSeg(s1, s2);
  // console.log("Got c.p1:"+c.p1+" c.p2:"+c.p2)
  ok(OR.Point.compare3d(c.p1, new OR.Point(50,50,100)) === 0, "Got c.p1:"+c.p1);
  ok(OR.Point.compare3d(c.p2, new OR.Point(50,50,0)) === 0, "Got c.p2:"+c.p2);
});
test('Segment.closestLine', function () {
  let p0 = new OR.Point(0,0,0);
  let p1 = new OR.Point(0,0,0);
  let s1 = new OR.Segment(p0,p1);
  let p2 = new OR.Point(0,0,0);
  let p3 = new OR.Point(0,0,0);
  let s2 = new OR.Segment(p2,p3);

  // Both segments degenerate into one point 0,0,0 = p0 Closest segment c is (p0,p0)
  let c = OR.Segment.closestLine(s1, s2);
  ok(OR.Point.compare3d(c.p1, p0) === 0 && OR.Point.compare3d(c.p2, p0) === 0);

  // First segment degenerates and second segment is crossing first segment
  s2.p1.set3d(0, 100, 0);
  c = OR.Segment.closestLine(s1, s2);
  ok(OR.Point.compare3d(c.p1, p0) === 0, "Got c.p1:"+c.p1);
  ok(OR.Point.compare3d(c.p2, p0) === 0, "Got c.p2:"+c.p2);

  // First segment degenerates and second segment degenerates but is distinct
  s2.p2.set3d(0, 100, 0);
  c = OR.Segment.closestLine(s1, s2);
  ok(OR.Point.compare3d(c.p1, p0) === 0, "Got c.p1:"+c.p1);
  ok(OR.Point.compare3d(c.p2, s2.p2) === 0, "Got c.p2:"+c.p2);

  // First degenerate and second is a line
  s2.p1.set3d(100, -100, 0);
  s2.p2.set3d(100, 100, 0);
  c = OR.Segment.closestLine(s1, s2);
  ok(OR.Point.compare3d(c.p1, p0) === 0, "Got c.p1:"+c.p1);
  ok(OR.Point.compare3d(c.p2, new OR.Point(100,0,0)) === 0, "Got c.p2:"+c.p2);

  // First and second are parallel lines
  s1.p1.set3d(0, -100, 0);
  s1.p2.set3d(0, 200, 0);
  s2.p1.set3d(100, -300, 0);
  s2.p2.set3d(100, 400, 0);
  c = OR.Segment.closestLine(s1, s2);
  // Should take the first point of s1 and project it on s2
  ok(OR.Point.compare3d(c.p1, s1.p1) === 0, "Got c.p1:"+c.p1);
  ok(OR.Point.compare3d(c.p2, new OR.Point(100,-100,0)) === 0, "Got c.p2:"+c.p2);

  // First and second are intersecting lines
  s1.p1.set3d(100, 0, 0); // vertical on x = 100
  s1.p2.set3d(100, 400, 0);
  s2.p1.set3d(0, 0, 0);	// 45° from 0,0 to 200,200
  s2.p2.set3d(200, 200, 0);
  c = OR.Segment.closestLine(s1, s2);
  ok(OR.Point.compare3d(c.p1, new OR.Point(100,100,0)) === 0, "Got c.p1:"+c.p1);
  ok(OR.Point.compare3d(c.p2, new OR.Point(100,100,0)) === 0, "Got c.p2:"+c.p2);

  // First and second are non intersecting segments
  s1.p1.set3d(100, 0, 0); // vertical x = 100 y[0,100]
  s1.p2.set3d(100, 100, 0);
  s2.p1.set3d(0, 200, 0);	// horizontal y = 200 x[0,200]
  s2.p2.set3d(200, 200, 0);
  c = OR.Segment.closestLine(s1, s2);
  // Differs from ClosestSeg : lines intersect at 100,200 closest is a Point
  ok(OR.Point.compare3d(c.p1, new OR.Point(100,200,0)) === 0, "Got c.p1:"+c.p1);
  ok(OR.Point.compare3d(c.p2, new OR.Point(100,200,0)) === 0, "Got c.p2:"+c.p2);

  // First and second are non intersecting lines in 3D
  s1.p1.set3d(0, 0, 100); // diagonal on back side of cube
  s1.p2.set3d(100, 100, 100);
  s2.p1.set3d(0, 100, 0);	// diagonal on front side of cube
  s2.p2.set3d(100, 0, 0);
  c = OR.Segment.closestLine(s1, s2);
  // console.log("Got c.p1:"+c.p1+" c.p2:"+c.p2)
  ok(OR.Point.compare3d(c.p1, new OR.Point(50,50,100)) === 0, "Got c.p1:"+c.p1);
  ok(OR.Point.compare3d(c.p2, new OR.Point(50,50,0)) === 0, "Got c.p2:"+c.p2);
});