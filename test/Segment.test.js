// File test/Segment.test.js

import {Point} from '../src/Point.js';
import {Segment} from '../src/Segment.js';

QUnit.module('Segment', () => {

  QUnit.test('init', function (assert) {
    let p1 = new Point(1,2, 10, 20, 30);
    let p2 = new Point(3,4, 10, 20, 30);
    let s = new Segment(p1, p2);
    assert.ok(s.p1.xf === 1 && s.p2.yf === 4,"expect p2,p1 got:"+s.p1+" "+s.p2);
  });

  QUnit.test('reverse', function (assert) {
    let p1 = new Point(1,2, 10, 20, 30);
    let p2 = new Point(3,4, 40, 50, 60);
    let s = new Segment(p1, p2);
    s.reverse();
    assert.ok(s.p1 === p2 && s.p2 === p1,"expect p2,p1 got:"+s.p1+" "+s.p2);
  });

  QUnit.test('length3d', function (assert) {
    let p1 = new Point(0,0, 0, 0, 0);
    let p2 = new Point(0,0, 30, 40, 0);
    let s = new Segment(p1,p2);
    let lg = s.length3d();
    assert.ok(lg === 50,"expect 50 got:"+lg);
    lg = s.length3d();
    assert.ok(lg === 50,"expect 50 got:"+lg);
  });

  QUnit.test('length2d', function (assert) {
    let p1 = new Point(1, 2);
    let p2 = new Point(4, 6);
    let s = new Segment(p1,p2);
    let lg = s.length2d();
    assert.ok(lg === 5,"expect 5 got:"+lg);
  });

  QUnit.test('toString', function (assert) {
    let p1 = new Point(1, 2);
    let p2 = new Point(4, 6);
    let s = new Segment(p1,p2);
    assert.ok(s.toString().indexOf('S(P1:[1,2][0,0,0] [1,2][0,0,0], P2:[4,6][0,0,0] [4,6][0,0,0])') !== -1,'got:['+s.toString()+"]")
  });

  QUnit.test('Segment.compare', function (assert) {
    let s1 = new Segment(new Point(0,0, 0, 0, 0), new Point(0,0, 30, 40, 0));
    let s2 = new Segment(new Point(0,0, 0, 0, 0), new Point(0,0, 30, 40, 0));
    let d = Segment.compare(s1, s2);
    assert.ok(d === 0,"got:"+d);
    s2 = new Segment(new Point(0,0, 3, 0, 0), new Point(0,0, 30, 40, 0));
    d = Segment.compare(s1, s2);
    assert.ok(d === 9,"got:"+d);
    s2 = new Segment(new Point(0,0, 30, 0, 0), new Point(0,0, 30, 40, 0));
    d = Segment.compare(s1, s2);
    assert.ok(d === 900,"got:"+d);
  });

  QUnit.test('Segment.distanceToSegment', function (assert) {
    let p1 = new Point(0,0, 0, 0, 0);
    let p2 = new Point(0,0, 30, 40, 0);
    let s = new Segment(p1, p2);
    let d = Segment.distanceToSegment(s, p1);
    assert.ok(d === 0,"got:"+d);
    d = Segment.distanceToSegment(s, p2);
    assert.ok(d === 0,"got:"+d);

    let p3 = new Point(0,0, 0, -30, 0);
    d = Segment.distanceToSegment(s, p3);
    assert.ok(d === 30,"got:"+d);
    p3 = new Point(0,0, 30, 50, 0);
    d = Segment.distanceToSegment(s, p3);
    assert.ok(d === 10,"got:"+d);
    p3 = new Point(0,0, 30, 10, 0);
    d = Segment.distanceToSegment(s, p3);
    assert.ok(d === 18,"got:"+d);
  });

});
