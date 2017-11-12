// file 'test/test.Face.js

// run with $ mocha --ui qunit
// or $ mocha or $ npm test or open test.html
NODE_ENV = true;

// Dependencies : import them before Model in browser
if (typeof module !== 'undefined' && module.exports) {
  var OR = OR || {};
  OR.Point = require('../js/Point.js');
  OR.Face = require('../js/Face.js');
}
function ok(expr, msg) {
  if (!expr) throw new Error(msg);
}

// Unit tests using Mocha
suite('Face');
before(function () {
  // runs before all test in this block
});

test('init', function () {
  let f = new OR.Face();
  ok(Array.isArray(f.points), "Got:"+f.points);
  ok(Array.isArray(f.normal), "Got:"+f.normal);
  ok(f.select === 0, "Got:"+f.select);
  ok(f.highlight === false, "Got:"+f.highlight);
  ok(f.offset === 0, "Got:"+f.offset);
});

test('computeFaceNormal', function () {
  let p1 = new OR.Point(0, 0, 0);
  let p2 = new OR.Point(30, 0, 0);
  let p3 = new OR.Point(0, 0, 40);
  let f = new OR.Face();
  f.points.push(p1);
  f.points.push(p2);
  f.points.push(p3);
  f.computeFaceNormal();
  ok(f.normal[0] === 0, "Got:"+f.normal[0]);
  ok(f.normal[1] === -1, "Got:"+f.normal[1]);
  ok(f.normal[2] === 0, "Got:"+f.normal[2]);
});
