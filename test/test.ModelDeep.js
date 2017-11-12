// file 'test/testCommand.js
// run with $ mocha --ui qunit
// or $ mocha or $ npm test or open test.html
NODE_ENV = true;
// Dependencies : import them before Model in browser
if (typeof module !== 'undefined' && module.exports) {
  var OR = OR || {};
  OR.Point   = require('../js/Point.js');
  OR.Segment = require('../js/Segment.js');
  OR.Face    = require('../js/Face.js');
  OR.Plane   = require('../js/Plane.js');
  OR.Model   = require('../js/Model.js');
}
function ok(expr, msg) {
  if (!expr) throw new Error(msg);
}
// Unit tests using Mocha
suite('ModelDeep');
before(function () {
  // runs before all test in this block
});
// Make a list from points numbers
function listPoints(model, n) {
  let list = [];
  let i = 1; // argument 0 is model
  while (Number.isInteger(Number(arguments[i]))) {
    list.push(model.points[arguments[i++]]);
  }
  return list;
}
// Check Faces Points in Model
function checkFaces(model) {
  model.faces.forEach(function (f){
    f.points.forEach(function(p){
      if (model.points.indexOf(p) === -1){
        console.log("Point absent Face:"+f+" Point:"+p);
        return false;
      }
    });
  });
  return true;
}
// Check CCW @return > 0 if CCW
function isCCW (poly2d) {
  let n = poly2d.length/2;
  // Take lowest
  let ymin = poly2d[1];
  let iymin = 0;
  for (let i = 0; i < n; i++){
    if (poly2d[2*i+1] < ymin) {
      ymin = poly2d[2*i+1];
      iymin = i;
    }
  }
  // Take points on either side of lowest
  let next = (iymin === n - 1) ? 0 : iymin+1;
  let previous = (iymin == 0) ? n-1 : iymin-1;
  // If not aligned ccw is of the sign of area
  let ccw = area2(poly2d, previous, iymin, next);
  if (ccw == 0) {
    // If horizontally aligned compare x
    ccw = poly2d[2*next] - poly2d[2*previous];
  }
  return ccw;
}
// From Polygon V of XY coordinates take points of index A, B, C
// @return cross product Z = CA x CB ( > 0 means CCW)
function area2(v, a, b, c) {
  let ax = 2*a, bx = 2*b, ctx = 2*c;
  let ay = 2*a+1, by= 2*b+1, cy = 2*c+1;
  return (v[ax]-v[ctx])*(v[by]-v[cy]) - (v[ay]-v[cy])*(v[bx]-v[ctx]);
}

test('Split Bug 1', function () {
  let model = new OR.Model();
  model.init( [0,0,  0,-200, 200,-200]);
  let p = new OR.Point(-100, -100, 0);
  let n = new OR.Point(200, 200, 0);
  let pl = new OR.Plane(p, n);
  ok(model.faces[0].points.length === 3, "points :"+model.faces[0].points);

  model.splitFacesByPlane(pl); // bb bo ob

  ok(model.segments.length === 3, "segs :"+model.segments.length);
  ok(model.points.length === 3, "points :"+model.points.length);
  ok(model.faces.length === 1, "faces :"+model.faces.length);
  // Ajout en c6bb c9bo c5ob Pb en c5 ajoute 'a' qui a déjà été ajouté
  ok(model.faces[0].points.length === 3, "points :"+model.faces[0].points);
  ok(checkFaces(model));
});
test('Split Bug 2', function () {
  let model = new OR.Model();
  model.init([-200,-200, 200,-200, 200,200, -200,200]);
  // b 0 2
  model.splitBy(model.points[0], model.points[2]);
  ok(model.points.length === 4, "points :"+model.points.length);
  ok(model.segments.length === 5, "segs :"+model.segments.length);
  ok(model.faces.length === 2, "segs :"+model.faces.length);
  // b 1 3
  model.splitBy(model.points[1], model.points[3]);
  ok(model.points.length === 5, "points :"+model.points.length);
  ok(model.segments.length === 8, "segs :"+model.segments.length);
  ok(model.faces.length === 4, "segs :"+model.faces.length);
  ok(checkFaces(model));
});
test('Split Bug 3', function () {
  let model = new OR.Model();
  model.init([-200,-200, 200,-200, 200,200, -200,200]);
// b 0 2 b 1 3 c 0 3  c 0 1  c 0 4
  model.splitBy(model.points[0], model.points[2]);
  model.splitBy(model.points[1], model.points[3]);
  model.splitCross(model.points[0], model.points[3]);
  model.splitCross(model.points[0], model.points[1]);
  model.splitBy(model.points[0], model.points[4]);
  ok(model.segments.length === 17, "segs :"+model.segments.length);
  ok(checkFaces(model));
});
test('Rotate Bug 1', function () {
  let model = new OR.Model();
  model.init([-200,-200, 200,-200, 200,200, -200,200]);
  // d -200 -200 200 -200  200 200 -200 200 ty 180  c 3 0

  model.turn(2, 180);
  // console.log("Points:"+model.points);
  model.splitCross(model.points[3], model.points[0]);
  // console.log("Points:"+model.points);

  ok(Math.round(model.points[4].xf) === -200,"Got:"+model.points[4].xf);
  ok(Math.round(model.points[5].xf) === 200,"Got:"+model.points[5].xf);

  ok(model.segments.length === 7, "segs :"+model.segments.length);
  ok(checkFaces(model));
});


