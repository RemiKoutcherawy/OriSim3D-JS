// File: js/View3dThree.js
// Dependencies : import them before View3d.js in browser
if (NODE_ENV === true && typeof module !== 'undefined') {
  var THREE = require('three');
  var Model = require('./Model.js');
  var Orisim3d = require('./Orisim3dThree.js');
}

var View3dThree = function () {
  // Create model, Command, then lookup view2d, view3d, textarea
  var model = new Model();
  model.init([-200, -200, 200, -200, 200, 200, -200, 200]);

  var canvas3d, camera, controls, scene, renderer;
  var materialFront, materialBack;
  var materialPoint, materialPointSelected;
  var materialLine, materialLineSelected;
  var anim = false;
  var objects = [];

  function buildObjects (model) {
    // Remove all Objects
    var i;
    for (i = scene.children.length; i > 0; i--) {
      var obj = scene.children[i];
      scene.remove(obj);
    }
    objects.length = 0;

    // Put Points
    for (i = 0; i < model.points.length; i++) {
      var pt = model.points[i];
      var ptVector = new THREE.Vector3(pt.x, pt.y, pt.z);
      var geometryPoint = new THREE.Geometry();
      geometryPoint.vertices.push(ptVector);
      var point         = new THREE.Points(geometryPoint, materialPoint);
      scene.add(point);
      objects.push(point);
    }

    // Puts Segments
    for (i = 0; i < model.segments.length; i++) {
      var s = model.segments[i];
      var pt1Vector = new THREE.Vector3(s.p1.x, s.p1.y, s.p1.z);
      var pt2Vector = new THREE.Vector3(s.p2.x, s.p2.y, s.p2.z);
      var geometryline = new THREE.Geometry();
      geometryline.vertices.push(pt1Vector);
      geometryline.vertices.push(pt2Vector);
      var line         = new THREE.LineSegments(geometryline, materialLine);
      scene.add(line);
      objects.push( line );
    }

    // Put Faces
    var xmin = -200, xmax = 200, ymin = -200, ymax = 200;
    for (i = 0 ; i < model.faces.length ; i++) {
      var f = model.faces[i];
      var pts = f.points;

      // Triangle FAN can be used only because of convex CCW face
      // Triangle are made of 3 points : origin, first, second
      var origin = pts[0]; // center of the FAN
      var originVector = new THREE.Vector3(origin.x, origin.y, origin.z);

      var first = pts[1]; // first
      var second; // second point, third and last point of triangle
      for (var j = 2; j < pts.length; j++) { // pts.length
        second = pts[j]; // second starts à 2

        var firstVector = new THREE.Vector3(first.x, first.y, first.z);
        var secondVector = new THREE.Vector3(second.x, second.y, second.z);

        // Front Fan triangle : center, first, second
        var geometry = new THREE.Geometry();
        geometry.vertices.push(originVector);
        geometry.vertices.push(firstVector);
        geometry.vertices.push(secondVector);

        geometry.faceVertexUvs[0] = [];
        geometry.faceVertexUvs[0].push([
          new THREE.Vector2((origin.x - xmin) / (xmax - xmin), (origin.y - ymin) / (ymax - ymin)),
          new THREE.Vector2((first.x - xmin) / (xmax - xmin), (first.y - ymin) / (ymax - ymin)),
          new THREE.Vector2((second.x - xmin) / (xmax - xmin), (second.y - ymin) / (ymax - ymin))
        ]);

        // Front Face pushed in geometry.faces
        var face = new THREE.Face3(0, 1, 2);
        geometry.faces.push(face);

        // Object mesh with geometry for this triangle
        var mesh = new THREE.Mesh(geometry, materialFront);
        scene.add(mesh);

        // Back Fan triangle : center, second, first
        var geometryBack = new THREE.Geometry();
        geometryBack.vertices.push(originVector);
        geometryBack.vertices.push(secondVector);
        geometryBack.vertices.push(firstVector);

        geometryBack.faceVertexUvs[0] = [];
        geometryBack.faceVertexUvs[0].push([
          new THREE.Vector2((origin.x - xmin) / (xmax - xmin), (origin.y - ymin) / (ymax - ymin)),
          new THREE.Vector2((second.x - xmin) / (xmax - xmin), (second.y - ymin) / (ymax - ymin)),
          new THREE.Vector2((first.x - xmin) / (xmax - xmin), (first.y - ymin) / (ymax - ymin))
        ]);

        // Back Face pushed in geometry.faces
        var faceBack = new THREE.Face3(0, 1, 2);
        geometryBack.faces.push(faceBack);

        // Object mesh with geometry for this triangle, and materialBack
        var meshBack = new THREE.Mesh(geometryBack, materialBack);
        scene.add(meshBack);

        // Next triangle second becomes the first for the next triangle.
        first = second;
      }
    }
  }

  function init() {
    canvas3d = window.document.getElementById('canvas3d');
    setStyles();

// Perspective
    camera = new THREE.PerspectiveCamera( 40, canvas3d.clientWidth / canvas3d.clientHeight, 1, 10000 );
    camera.position.z = 700;

// Controls
    controls = new THREE.TrackballControls( camera , canvas3d);
    controls.rotateSpeed = 4.0;

// Scenes
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xf0f0f0 );

// Lights
    var light = new THREE.DirectionalLight( 0xffffff, 0.8 );
    light.position.set( 0, 0, 2000 );
    light.castShadow = true;

// Textures
    var textureFront = new THREE.TextureLoader().load('textures/cocotte256x256.jpg');
    // textureFront.repeat.set(1, 1);
    materialFront = new THREE.MeshPhongMaterial({
      map:textureFront,
      side:THREE.FrontSide,
      flatShading:THREE.SmoothShading
    });
    var textureBack = new THREE.TextureLoader().load('textures/back256x256.jpg');
    // textureBack.repeat.set(1, 1);
    materialBack = new THREE.MeshPhongMaterial({
      map:textureBack,
      side:THREE.FrontSide,
      flatShading:THREE.SmoothShading
    });

// Points
    materialPoint = new THREE.PointsMaterial({size:20, color:0x0000ff});
    materialPointSelected = new THREE.PointsMaterial({size:40, color:0xff0000});

// Lines
    materialLine = new THREE.LineBasicMaterial({color:0x0000ff, linewidth:3});
    materialLineSelected = new THREE.LineBasicMaterial({color:0xff0000, linewidth:6});

// Shadows
    light.shadow = new THREE.LightShadow( new THREE.PerspectiveCamera( 50, 1, 200, 10000 ) );
    light.shadow.bias = - 0.0022;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;
    scene.add( light );

// Renderer
    renderer = new THREE.WebGLRenderer( { canvas: canvas3d, antialias: true } );
    // noinspection Annotator
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize(canvas3d.clientWidth, canvas3d.clientHeight);

// Select
    var selectPoints = [];
    var selectLines = [];
    var selectControls = new SelectControls( objects, camera, renderer.domElement );
    selectControls.addEventListener( 'selectPt', function ( event, object ) {
        var pt = event.object;
        if (selectPoints.length === 0){
          // Select
          selectPoints[0] = pt;
          selectPoints[0].material.size = 40;
          selectPoints[0].material.color.r = 1.0;
        }
        else if (selectPoints[0] === pt) {
          // Deselect
          selectPoints[0].material.color.r = 0.0;
          selectPoints.splice( 0, 1 );
        }
        else {
          // Got two
          selectPoints[1] = pt;
          selectPoints[1].material.size = 40;
          selectPoints[1].material.color.r = 1.0;
          console.log("AddLine");
          // Do
          var addline = new THREE.Geometry();
          addline.vertices.push(new THREE.Vector3(
            selectPoints[0].geometry.vertices[0].x,
            selectPoints[0].geometry.vertices[0].y,
            selectPoints[0].geometry.vertices[0].z));
          addline.vertices.push(new THREE.Vector3(
            selectPoints[1].geometry.vertices[0].x,
            selectPoints[1].geometry.vertices[0].y,
            selectPoints[1].geometry.vertices[0].z));
          var addMaterialLine = new THREE.LineBasicMaterial( { color: 0xff00ff,linewidth: 6} );
          var line = new THREE.LineSegments( addline, addMaterialLine );
          scene.add( line );
          selectPoints.splice( 0, 1 );
          selectPoints.splice( 0, 1 );
        }
        console.dir(pt);
      }
    );
    selectControls.activate();

// dat.GUI
   var gui = new dat.GUI();
   var params = {
     reset: function () {
       controls.reset();
       scene.rotation.y = 0;
     },
     play: function () {
       // Expect a tag <script id="cocotte.txt" type="not-javascript">d ...< /script> in html file
       var tag = document.getElementById("cocotte.txt");
       if (tag){
         var model = tag.textContent;
         // Global var : orisim3d
         if (typeof orisim3d !== "undefined"){
           orisim3d.command.command(model);
         }
       }
     }
   };
   gui.add( params, 'reset' );
   gui.add( params, 'play' );

// Resize
    window.addEventListener( 'resize', onWindowResize, false );
  }

  function onWindowResize() {
    setStyles();
    camera.aspect = canvas3d.clientWidth / canvas3d.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas3d.clientWidth, canvas3d.clientHeight);
    renderer.render( scene, camera );
  }

  function setStyles() {
    var height80 = window.document.getElementById('height80').style;
    height80.position = 'relative';
    height80.width = Number(window.innerWidth * 1.0)+'px';
    height80.height = Number(window.innerHeight * 0.8)+'px';

    var height20 = window.document.getElementById('height20').style;
    height20.width = Number(window.innerWidth)+'px';
    height20.height = Number(window.innerHeight * 0.2)+'px';
  }

  function render() {
    controls.update();
    renderer.render( scene, camera );
  }

  // API
  this.init = init;
  this.buildObjects = buildObjects;
  this.render = render;
};

// Class methods
View3dThree.prototype.constructor = View3dThree;

// For NodeJS, will be discarded by uglify
if (NODE_ENV === true && typeof module !== 'undefined') {
  module.exports = View3dThree;
}