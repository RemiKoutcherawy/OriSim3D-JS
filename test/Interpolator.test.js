// file 'test/Interpolator.test.js
// import {describe} from "mocha";

import {Interpolator} from '../src/Interpolator.js';

function ok(expr, msg) {
  if (!expr) throw new Error(msg); else return true;
}

describe('Interpolator', function () {

  before(function () {
    // runs before all test in this block
  });

  after(function () {
    // after all test draw all the Graphic curves
    if ((typeof window) !== 'undefined') {
      for (let m = 0; m < Object.getOwnPropertyNames(Interpolator).length; m++) {
        // const name = Object.keys(OR.Interpolator)[m];
        // const fn   = window["OR"]["Interpolator"][name];
        const name = Object.keys(Interpolator)[m];
        const fn = Interpolator[name];
        // var fn = eval("Interpolator"+name);
        draw(fn);
      }
    }
  });

  function draw(fn, color) {
    if ((typeof window) !== 'undefined') {
      const canvas = window.document.getElementById('view2d-canvas');
      const ctx = canvas.getContext('2d');
      const w = canvas.width;
      const h = canvas.height / 2;
      const dx = w / 100;
      const dy = 100;
      ctx.beginPath();
      if (typeof color !== 'undefined') {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
      }
      for (let x = 0; x <= w; x += dx) {
        const t = x / w;
        ctx.moveTo(x, dy + fn(t) * h);
        ctx.lineTo(x + dx, dy + fn(t + dx / w) * h);
      }
      ctx.stroke();
      // Axes
      ctx.beginPath();
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 1;
      ctx.moveTo(0, dy);
      ctx.lineTo(0, dy + h);
      ctx.lineTo(w, dy + h);
      ctx.stroke();
    }
  }

  it('Linear', function () {
    let i = Interpolator.Linear;
    let t0 = i(0);
    const t1 = i(1);
    const t05 = 0.5;
    ok(Math.round(t0) === 0 && Math.round(t05 * 10) === 5 && Math.round(t1) === 1, "Got: " + t0 + " " + t05 + " " + t1);
  });

  it('AccelerateDecelerate', function () {
    const i = Interpolator.AccelerateDecelerate;
    const t0 = i(0);
    const t1 = i(1);
    const t05 = 0.5;
    ok(Math.round(t0) === 0 && Math.round(t05 * 10) === 5 && Math.round(t1) === 1, "Got: " + t0 + " " + t05 + " " + t1);
  });

  it('SpringOvershoot', function () {
    const i = Interpolator.SpringOvershoot;
    const t0 = i(0);
    const t1 = i(1);
    const t05 = i(0.5);
    ok(Math.round(t0) === 0 && Math.round(t05 * 10) === 9 && Math.round(t1) === 1, "Got: " + t0 + " " + t05 + " " + t1);
  });

  it('SpringBounce', function () {
    const i = Interpolator.SpringBounce;
    const t0 = i(0);
    const t1 = i(1);
    const t05 = i(0.5);
    ok(Math.round(t0) === 0 && Math.round(t05 * 10) === 9 && Math.round(t1) === 1, "Got: " + t0 + " " + t05 + " " + t1);
  });

  it('GravityBounce', function () {
    const i = Interpolator.GravityBounce;
    const t0 = i(0);
    const t1 = i(1);
    const t05 = i(0.5);
    ok(Math.round(t0) === 0 && Math.round(t05 * 10) === 10 && Math.round(t1) === 1, "Got: " + t0 + " " + t05 + " " + t1);
  });

  it('Bounce', function () {
    const i = Interpolator.Bounce;
    const t0 = i(0);
    const t1 = i(1);
    const t05 = i(0.5);
    ok(Math.round(t0) === 0 && Math.round(t05 * 10) === 7 && Math.round(t1) === 1, "Got: " + t0 + " " + t05 + " " + t1);
  });

  it('Overshoot', function () {
    const i = Interpolator.Overshoot;
    const t0 = i(0);
    const t1 = i(1);
    const t05 = i(0.5);
    ok(Math.round(t0) === 0 && Math.round(t05 * 10) === 11 && Math.round(t1) === 1, "Got: " + t0 + " " + t05 + " " + t1);
  });

  it('Anticipate', function () {
    const i = Interpolator.Anticipate;
    const t0 = i(0);
    const t1 = i(1);
    const t05 = i(0.5);
    ok(Math.round(t0) === 0 && Math.round(t05 * 10) === 1 && Math.round(t1) === 1, "Got: " + t0 + " " + t05 + " " + t1);
  });

  it('AnticipateOvershoot', function () {
    const i = Interpolator.AnticipateOvershoot;
    const t0 = i(0);
    const t1 = i(1);
    const t05 = i(0.5);
    ok(Math.round(t0) === 0 && Math.round(t05 * 10) === 5 && Math.round(t1) === 1, "Got: " + t0 + " " + t05 + " " + t1);

    draw(Interpolator.AnticipateOvershoot, 'red');
  });

});

