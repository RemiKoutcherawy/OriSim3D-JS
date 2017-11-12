// file 'test/test.Interpolator.js
// run with $ mocha --ui qunit
// or $ mocha or $ npm test or open test.Interpolator.html
NODE_ENV = true;
// Dependencies : import them before Model in browser
if (typeof module !== 'undefined' && module.exports) {
  var OR = OR || {};
  OR.Interpolator = require("../js/Interpolator.js");
}
function ok(expr, msg) {
  if (!expr) throw new Error(msg);
}
// Unit tests using Mocha
suite('Interpolator');
before(function () {
  // runs before all test in this block
});
after(function() {
  // after all test draw all the Graphic curves
  if ((typeof window) !== 'undefined') {
    for (let m = 0; m < Object.getOwnPropertyNames(OR.Interpolator).length; m++) {
      const name = Object.keys(OR.Interpolator)[m];
      const fn   = window["OR"]["Interpolator"][name];
      // var fn = eval("Interpolator."+name);
      draw(fn);
    }
  }
});
function draw(fn, color) {
  if ((typeof window) !== 'undefined') {
    const canvas = window.document.getElementById('view2d-canvas');
    const ctx    = canvas.getContext('2d');
    const w      = canvas.width;
    const h      = canvas.height / 2;
    const dx     = w / 100;
    const dy     = 100;
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

test('LinearInterpolator', function () {
  var i  = OR.Interpolator.LinearInterpolator;
  var t0 = i(0); const t1 = i(1); const t05 = 0.5;
  ok(Math.round(t0) === 0 && Math.round(t05*10) === 5 && Math.round(t1) === 1, "Got: "+t0+" "+t05+" "+t1);
});
test('AccelerateDecelerateInterpolator', function () {
  const i  = OR.Interpolator.AccelerateDecelerateInterpolator;
  const t0 = i(0); const t1 = i(1); const t05 = 0.5;
  ok(Math.round(t0) === 0 && Math.round(t05*10) === 5 && Math.round(t1) === 1, "Got: "+t0+" "+t05+" "+t1);
});
test('SpringOvershootInterpolator', function () {
  const i  = OR.Interpolator.SpringOvershootInterpolator;
  const t0 = i(0); const t1 = i(1); const t05 = i(0.5);
  ok(Math.round(t0) === 0 && Math.round(t05*10) === 9 && Math.round(t1) === 1, "Got: "+t0+" "+t05+" "+t1);
});
test('SpringBounceInterpolator', function () {
  const i  = OR.Interpolator.SpringBounceInterpolator;
  const t0 = i(0); const t1 = i(1); const t05 = i(0.5);
  ok(Math.round(t0) === 0 && Math.round(t05*10) === 9 && Math.round(t1) === 1, "Got: "+t0+" "+t05+" "+t1);
});
test('GravityBounceInterpolator', function () {
  const i  = OR.Interpolator.GravityBounceInterpolator;
  const t0 = i(0); const t1 = i(1); const t05 = i(0.5);
  ok(Math.round(t0) === 0 && Math.round(t05*10) === 10 && Math.round(t1) === 1, "Got: "+t0+" "+t05+" "+t1);
});
test('BounceInterpolator', function () {
  const i  = OR.Interpolator.BounceInterpolator;
  const t0 = i(0); const t1 = i(1); const t05 = i(0.5);
  ok(Math.round(t0) === 0 && Math.round(t05*10) === 7 && Math.round(t1) === 1, "Got: "+t0+" "+t05+" "+t1);
});
test('OvershootInterpolator', function () {
  const i  = OR.Interpolator.OvershootInterpolator;
  const t0 = i(0); const t1 = i(1); const t05 = i(0.5);
  ok(Math.round(t0) === 0 && Math.round(t05*10) === 11 && Math.round(t1) === 1, "Got: "+t0+" "+t05+" "+t1);
});
test('AnticipateInterpolator', function () {
  const i  = OR.Interpolator.AnticipateInterpolator;
  const t0 = i(0); const t1 = i(1); const t05 = i(0.5);
  ok(Math.round(t0) === 0 && Math.round(t05*10) === 1 && Math.round(t1) === 1, "Got: "+t0+" "+t05+" "+t1);
});
test('AnticipateOvershootInterpolator', function () {
  const i  = OR.Interpolator.AnticipateOvershootInterpolator;
  const t0 = i(0); const t1 = i(1); const t05 = i(0.5);
  ok(Math.round(t0) === 0 && Math.round(t05*10) === 5 && Math.round(t1) === 1, "Got: "+t0+" "+t05+" "+t1);
  draw(OR.Interpolator.AnticipateOvershootInterpolator, 'red');
});

