// File: build.js
// run with $ node build.js
// or $ uglifyjs js/Point.js js/Segment.js js/Face.js js/Plane.js js/Model.js js/View2d.js \
// js/View3d.js js/Interpolator.js js/Command.js js/CommandArea.js -c -m -o app.js
// or $ uglifyjs js/* -c -m -o app.js
var UglifyJS = require("uglify-es");
var fs = require("fs");
var code = {
  "Point.js": fs.readFileSync("js/Point.js", "utf8"),
  "Plane.js": fs.readFileSync("js/Plane.js", "utf8"),
  "Segment.js": fs.readFileSync("js/Segment.js", "utf8"),
  "Face.js": fs.readFileSync("js/Face.js", "utf8"),
  "Model.js": fs.readFileSync("js/Model.js", "utf8"),
  "Interpolator.js": fs.readFileSync("js/Interpolator.js", "utf8"),
  "Command.js": fs.readFileSync("js/Command.js", "utf8"),
  "View2d.js": fs.readFileSync("js/View2d.js", "utf8"),
  "View3d.js": fs.readFileSync("js/View3d.js", "utf8"),
  "CommandArea.js": fs.readFileSync("js/CommandArea.js", "utf8"),
  "Orisim3d.js": fs.readFileSync("js/Orisim3d.js", "utf8"),
};
var options = {
  toplevel: false,
  compress: {
    dead_code: true
  }
};
var result = UglifyJS.minify(code, options);
// console.log(result.code);
fs.writeFileSync("app.js", result.code);
console.log("Done : app.js generated.");
