// File test/Segment.test.js

import {Point} from '../src/Point.js';
import {Segment} from '../src/Segment.js';

function ok(expr, msg) {
  if (!expr) throw new Error(msg); else return true;
}

describe('Segment', function () {

  it('init', function () {
    let p1 = new Point(1, 2, 10, 20, 30);
    let p2 = new Point(3, 4, 10, 20, 30);
    let s = new Segment(p1, p2);
    ok(s.p1.xf === 1 && s.p2.yf === 4, "expect p2,p1 got:" + s.p1 + " " + s.p2);
  });

  it('reverse', function () {
    let p1 = new Point(1, 2, 10, 20, 30);
    let p2 = new Point(3, 4, 40, 50, 60);
    let s = new Segment(p1, p2);
    s.reverse();
    ok(s.p1 === p2 && s.p2 === p1, "expect p2,p1 got:" + s.p1 + " " + s.p2);
  });

  it('length3d', function () {
    let p1 = new Point(0, 0, 0, 0, 0);
    let p2 = new Point(0, 0, 30, 40, 0);
    let s = new Segment(p1, p2);
    let lg = s.length3d();
    ok(lg === 50, "expect 50 got:" + lg);
    lg = s.length3d();
    ok(lg === 50, "expect 50 got:" + lg);
  });

  it('length2d', function () {
    let p1 = new Point(1, 2);
    let p2 = new Point(4, 6);
    let s = new Segment(p1, p2);
    let lg = s.length2d();
    ok(lg === 5, "expect 5 got:" + lg);
  });

  it('toString', function () {
    let p1 = new Point(1, 2);
    let p2 = new Point(4, 6);
    let s = new Segment(p1, p2);
    ok(s.toString().indexOf('S(P1:[1,2][0,0,0], P2:[4,6][0,0,0])') !== -1, 'got:[' + s.toString() + "]")
  });

  it('Segment.compare', function () {
    let s1 = new Segment(new Point(0, 0, 0, 0, 0), new Point(0, 0, 30, 40, 0));
    let s2 = new Segment(new Point(0, 0, 0, 0, 0), new Point(0, 0, 30, 40, 0));
    let d = Segment.compare(s1, s2);
    ok(d === 0, "got:" + d);
    s2 = new Segment(new Point(0, 0, 3, 0, 0), new Point(0, 0, 30, 40, 0));
    d = Segment.compare(s1, s2);
    ok(d === 9, "got:" + d);
    s2 = new Segment(new Point(0, 0, 30, 0, 0), new Point(0, 0, 30, 40, 0));
    d = Segment.compare(s1, s2);
    ok(d === 900, "got:" + d);
  });

  it('Segment.distanceToSegment', function () {
    let p1 = new Point(0, 0, 0, 0, 0);
    let p2 = new Point(0, 0, 30, 40, 0);
    let s = new Segment(p1, p2);

    let d = Segment.distanceToSegment(s, p1);
    ok(d === 0, "got:" + d);
    d = Segment.distanceToSegment(s, p2);
    ok(d === 0, "got:" + d);

    let p3 = new Point(0, 0, 0, -30, 0);
    d = Segment.distanceToSegment(s, p3);
    ok(d === 30, "got:" + d);

    p3 = new Point(0, 0, 30, 50, 0);
    d = Segment.distanceToSegment(s, p3);
    ok(d === 10, "got:" + d);

    p3 = new Point(0, 0, 30, 10, 0);
    d = Segment.distanceToSegment(s, p3);
    ok(d === 18, "got:" + d);
  });

  it('Segment.closestLine', function () {
    let p0 = new Point(0, 0, 0);
    let p1 = new Point(0, 0, 0);
    let s1 = new Segment(p0, p1);
    let p2 = new Point(0, 0, 0);
    let p3 = new Point(0, 0, 0);
    let s2 = new Segment(p2, p3);

    // Both segments degenerate into one point 0,0,0 = p0 Closest segment c is (p0,p0)
    let c = Segment.closestLine(s1, s2);
    ok(c.p1.compare3d(p0.x, p0.y, p0.z) === 0 && c.p2.compare3d(p0.x, p0.y, p0.z) === 0);

    // First segment degenerates and second segment is crossing first segment
    s2.p1.set3d(0, 100, 0);
    c = Segment.closestLine(s1, s2);
    ok(c.p1.compare3d(p0.x, p0.y, p0.z) === 0, "Got c.p1:" + c.p1);
    ok(c.p2.compare3d(p0.x, p0.y, p0.z) === 0, "Got c.p2:" + c.p2);

    // First segment degenerates and second segment degenerates but is distinct
    s2.p2.set3d(0, 100, 0);
    c = Segment.closestLine(s1, s2);
    ok(c.p1.compare3d(p0.x, p0.y, p0.z) === 0, "Got c.p1:" + c.p1);
    ok(c.p2.compare3d(s2.p2.x, s2.p2.y, s2.p2.z) === 0, "Got c.p2:" + c.p2+" d:"+c.p2.compare3d(s2.p2.x, s2.p2.y, s2.p2.z) );

    // First degenerate and second is a line
    s2.p1.set3d(100, -100, 0);
    s2.p2.set3d(100, 100, 0);
    c = Segment.closestLine(s1, s2);
    ok(c.p1.compare3d(p0.x, p0.y, p0.z) === 0, "Got c.p1:" + c.p1);
    ok(c.p2.compare3d(100, 0, 0) === 0, "Got c.p2:" + c.p2);

    // First and second are parallel lines
    s1.p1.set3d(0, -100, 0);
    s1.p2.set3d(0, 200, 0);
    s2.p1.set3d(100, -300, 0);
    s2.p2.set3d(100, 400, 0);
    c = Segment.closestLine(s1, s2);
    // Should take the first point of s1 and project it on s2
    ok(c.p1.compare3d(s1.p1.x, s1.p1.y, s1.p1.z) === 0, "Got c.p1:" + c.p1);
    ok(c.p2.compare3d(100, -100, 0) === 0, "Got c.p2:" + c.p2);

    // First and second are intersecting lines
    s1.p1.set3d(100, 0, 0); // vertical on x = 100
    s1.p2.set3d(100, 400, 0);
    s2.p1.set3d(0, 0, 0);	// 45° from 0,0 to 200,200
    s2.p2.set3d(200, 200, 0);
    c = Segment.closestLine(s1, s2);
    ok(c.p1.compare3d(100, 100, 0) === 0, "Got c.p1:" + c.p1);
    ok(c.p2.compare3d(100, 100, 0) === 0, "Got c.p2:" + c.p2);

    // First and second are non intersecting segments
    s1.p1.set3d(100, 0, 0); // vertical x = 100 y[0,100]
    s1.p2.set3d(100, 100, 0);
    s2.p1.set3d(0, 200, 0);	// horizontal y = 200 x[0,200]
    s2.p2.set3d(200, 200, 0);
    c = Segment.closestLine(s1, s2);
    // Differs from ClosestSeg : lines intersect at 100,200 closest is a Point
    ok(c.p1.compare3d(100, 200, 0) === 0, "Got c.p1:" + c.p1);
    ok(c.p2.compare3d(100, 200, 0) === 0, "Got c.p2:" + c.p2);

    // First and second are non intersecting lines in 3D
    s1.p1.set3d(0, 0, 100); // diagonal on back side of cube
    s1.p2.set3d(100, 100, 100);
    s2.p1.set3d(0, 100, 0);	// diagonal on front side of cube
    s2.p2.set3d(100, 0, 0);
    c = Segment.closestLine(s1, s2);
    // console.log("Got c.p1:"+c.p1+" c.p2:"+c.p2)
    ok(c.p1.compare3d(50, 50, 100) === 0, "Got c.p1:" + c.p1);
    ok(c.p2.compare3d(50, 50, 0) === 0, "Got c.p2:" + c.p2);
  });

});
