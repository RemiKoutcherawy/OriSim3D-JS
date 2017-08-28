// Helper to simplify Inkscape svg
// Hardcode the calculations
const fs = require('fs');
const util = require('util');

var filename = "cocotte.svg"
var svg     = fs.readFileSync(filename, 'utf-8');

var parseString = require('xml2js').parseString;
function tagName(name){
  if (name==="g"){
    console.dir(name);
  }
  return name;
}
function attrName(name){
  if (name==="transform"){
    console.dir(name);
  }
  return name;
}
var a,	c,	e,	b,	d,	f, tx, ty;
function attrValue(name){
  if (name.indexOf("matrix") !== -1){
    console.dir(name);
    var t = name.substring(7).split(/[,\(\)]/);
    // console.dir(t);
    a = t[0]; b = t[1]; c = t[2]; d = t[3]; e = t[4]; f = t[5];
    console.log(a+','+b+','+c+','+d+','+e+','+f);
  }
  // if (name.indexOf("M") !== -1){
  //   console.dir(name);
  //   var t = name.substring(2).split(/[,\s]/);
  //   console.dir(t);
  //   console.log('M ');
  //   for (var i = 0; i < t.length -1; i+=2){
  //     var x = Number(a*t[i+0]) + Number(c*t[i+1]) +Number(e);
  //     var y = Number(b*t[i+0]) + Number(d*t[i+1]) +Number(f);
  //     console.log(" "+x+","+y);
  //   }
  // }

  if (name.indexOf("translate") !== -1){
    console.dir(name);
    var t = name.substring(10).split(/[,\)]/);
    console.dir(t);
    console.log('translate ');
    tx = t[0]; ty = t[1];
    console.log("tx:"+tx+' ty:'+ty);
  }
  if (name.indexOf("M") !== -1){
    console.dir(name);
    var t = name.substring(2).split(/[,\s]/);
    console.dir(t);
    console.log('M computed :');
    for (var i = 0; i < t.length -1; i+=2){
      var x = Number(t[i+0])+Number(tx);
      var y = Number(t[i+1])+Number(ty);
      // console.log(" "+x.toFixed(2)+","+y.toFixed(2));
      process.stdout.write(" "+x.toFixed(2)+","+y.toFixed(2));
    }
    console.log("");
  }
  return name;
}
//transform all attribute and tag names and values to uppercase
parseString(svg, {
    tagNameProcessors: [tagName]
    ,attrNameProcessors: [attrName]
    // ,valueProcessors: [valName]
    ,attrValueProcessors: [attrValue]
    }
    ,function (err, result) {
    // processed data
    // console.log('data:'+result);
  });

// A la mano
width=56.869331;
height=57.145916;
x=38.055489;
y=66.603027;
ry=7.1754026;
rx=7.1268449;
tx=-37.456961
ty=-66.108389
console.log("x:"+(x+tx).toFixed(2));
console.log("y:"+(y+ty).toFixed(2));
