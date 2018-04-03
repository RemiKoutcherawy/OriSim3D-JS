// File: js/View3dThree.js
// Dependencies : import them before View3d.js in browser
if (NODE_ENV === true && typeof module !== 'undefined') {
  var THREE = require('three');
  var Model = require('./Model.js');
  var OriSim3dThree = require('./OriSim3dThree.js');
}

function View3dThree () {
  var canvas3d, camera, controls, scene, renderer;
  var materialFront, materialBack;
  var materialPoint, materialPointSelected;
  var materialLine,  materialLineSelected;

  // Three objects
  var points3d;
  var lines3d;
  var faces3d;
  var mesh;
  // Three mesh
  var faces3dFront;
  var faces3dBack;

  // Set Points positions for points3d and faces3d
  function setPointsPositions(model, geometry) {
    var pos = geometry.attributes.position.array;
    var uv  = geometry.attributes.uv.array;

    for (var i = 0; i < model.points.length; i++) {
      var pt         = model.points[i];
      pos[3 * i]     = pt.x;
      pos[3 * i + 1] = pt.y;
      pos[3 * i + 2] = pt.z;
      // UV are just flat coordinates on crease pattern
      uv[2 * i] = (200.0 + pt.xf) / 400.0;
      uv[2 * i + 1] = (200.0 + pt.yf) / 400.0;
    }
  }

  // Set Points positions for segments
  function setSegmentPointsPositions(model, geometry) {
    var pos = geometry.attributes.position.array;
    for (var i = 0; i < model.points.length; i++) {
      var pt         = model.points[i];
      pos[3 * i]     = pt.x;
      pos[3 * i + 1] = pt.y;
      pos[3 * i + 2] = pt.z;
    }
  }

  // Set Segments indices
  function setSegmentsIndices(model, geometry) {
    var indices   = geometry.getIndex().array;
    var allPoints = model.points;
    for (var i = 0; i < model.segments.length; i++) {
      var s              = model.segments[i];
      indices[2 * i]     = allPoints.indexOf(s.p1);
      indices[2 * i + 1] = allPoints.indexOf(s.p2);
    }
  }

  // Set Faces indices
  function setFacesIndices (model, geometry) {
    var indices = geometry.getIndex().array;
    var allPoints = model.points;
    var index = 0;
    for (var i = 0; i < model.faces.length; i++) {
      // Face points
      var pts = model.faces[i].points;

      // Triangle FAN can be used only because of convex face
      // Triangle are made of 3 points : origin, first, second
      var origin = pts[0]; // center of the FAN
      var first  = pts[1]; // first point
      var second;          // second point, third and last point of triangle

      // Each point adds a new triangle
      for (var j = 2; j < pts.length; j++) {
        // second starts à 2
        second = pts[j];

        // Front Fan triangle : center, first, second
        indices[index++] = allPoints.indexOf(origin);
        indices[index++] = allPoints.indexOf(first);
        indices[index++] = allPoints.indexOf(second);

        // Next triangle, second becomes the first for the next triangle.
        first = second;
      }
    }
  }

  // Build all objects
  function buildObjects (model) {
    if (points3d) {
      scene.remove(points3d);
      scene.remove(faces3dFront);
      scene.remove(faces3dBack);
      scene.remove(lines3d);
      scene.remove(mesh);
    }

    var MAX_POINTS = 512;

    // Build Points Mesh
    var geometry = new THREE.BufferGeometry();
    var positionsArrayPoint = new Float32Array( MAX_POINTS * 3 );
    geometry.addAttribute( 'position', new THREE.BufferAttribute( positionsArrayPoint, 3 ).setDynamic(true) );
    var uvFaces = new Float32Array( MAX_POINTS * 2 ); // 2 UV per point
    geometry.addAttribute( 'uv', new THREE.BufferAttribute( uvFaces, 2 ).setDynamic(true) );
    // Create object, and add it to scene
    points3d = new THREE.Points( geometry, materialPoint );
    scene.add( points3d );

    // Build Faces Mesh : Indices only, faces share the same geometry
    var indicesArray = new Uint32Array( MAX_POINTS * 3 );
    var indicesFacesBuffer = new THREE.BufferAttribute( indicesArray, 1 ).setDynamic(true);
    geometry.setIndex( indicesFacesBuffer );
    // Create object, same geometry, and add it to scene
    faces3dFront = new THREE.Mesh( geometry,  materialFront );
    scene.add( faces3dFront );
    faces3dBack = new THREE.Mesh( geometry,  materialBack );
    scene.add( faces3dBack );

    // Build Segments Mesh : Points and indices
    var geometryline = new THREE.BufferGeometry();
    var positionsArrayLine = new Float32Array( MAX_POINTS * 3 );
    geometryline.addAttribute( 'position', new THREE.BufferAttribute( positionsArrayLine, 3 ).setDynamic(true) );
    // Indices
    var indicesSegmentArray = new Uint32Array( MAX_POINTS * 2 );
    var indicesSegmentBuffer = new THREE.BufferAttribute( indicesSegmentArray, 1 ).setDynamic(true);
    geometryline.setIndex( indicesSegmentBuffer );
    // Create object, and add it to scene
    lines3d = new THREE.LineSegments( geometryline,  materialLine );
    scene.add( lines3d );

    model.needRebuild = false;
  }

  // Update all objects positions
  function update ( model ) {
    // Rebuild if needed
    if( model.needRebuild ){
      buildObjects(model)
    }

    // Updates Points
    setPointsPositions( model, points3d.geometry );
    points3d.geometry.attributes.position.needsUpdate = true;

    // Update Segments
    setSegmentPointsPositions( model, lines3d.geometry );
    setSegmentsIndices(model, lines3d.geometry);
    lines3d.geometry.attributes.position.needsUpdate = true;
    lines3d.geometry.index.needsUpdate = true;

    // Update Faces
    setFacesIndices( model, faces3dFront.geometry );
    faces3dFront.geometry.attributes.position.needsUpdate = true;
    faces3dFront.geometry.attributes.uv.needsUpdate = true;
    faces3dFront.geometry.index.needsUpdate = true;
    setFacesIndices( model, faces3dBack.geometry );
    faces3dBack.geometry.attributes.position.needsUpdate = true;
    faces3dBack.geometry.attributes.uv.needsUpdate = true;
    faces3dBack.geometry.index.needsUpdate = true;
  }

  // Initialize Scene, Lights, Textures, Materials
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
    var lightDir = new THREE.DirectionalLight( 0xffffff, 0.2 );
    lightDir.position.set( 0, 0, 2000 );
    lightDir.castShadow = true;
    scene.add(lightDir);
    var lightAmbiant = new THREE.AmbientLight( 0xffffff, 0.8 );
    scene.add(lightAmbiant);

// Textures
    var textureFront = new THREE.TextureLoader().load('textures/cocotte256x256.jpg');
    textureFront.repeat.set(1, 1);
    materialFront = new THREE.MeshPhongMaterial({
      map:textureFront,
      side:THREE.FrontSide,
      flatShading:THREE.SmoothShading
    });
    var textureBack = new THREE.TextureLoader().load('textures/back256x256.jpg');
    materialBack = new THREE.MeshPhongMaterial({
      map:textureBack,
      side:THREE.BackSide,
      flatShading:THREE.SmoothShading
    });

// Points Materials
    materialPoint = new THREE.PointsMaterial({size:20, color:0x0000ff});
    materialPointSelected = new THREE.PointsMaterial({size:40, color:0xff0000});

// Lines Materials
    materialLine = new THREE.LineBasicMaterial({color:0x0000ff, linewidth:3});
    materialLineSelected = new THREE.LineBasicMaterial({color:0xff0000, linewidth:6});

// Renderer
    renderer = new THREE.WebGLRenderer( { canvas: canvas3d, antialias: true } );
    // noinspection Annotator
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize(canvas3d.clientWidth, canvas3d.clientHeight);

// dat.GUI
    var gui = new dat.GUI();
    var params = {
      "Reset rotation":function () {
        controls.reset();
        scene.rotation.y = 0;
      },
      Cocotte:function () {
        // Expect a tag <script id="cocotte.txt" type="not-javascript">d ...< /script> in html file
        var tag = document.getElementById("cocotte.txt");
        if (tag) {
          var model = tag.textContent;
          // Global var : OR.orisim3d
          if (typeof OR.orisim3d !== "undefined") {
            OR.orisim3d.command.command(model);
          }
        }
      }
    };
    gui.add(params, 'Reset rotation');
    gui.add(params, 'Cocotte');
    gui.close();

// Resize
    window.addEventListener( 'resize', onWindowResize, false );
  }

  function onWindowResize () {
    setStyles();
    camera.aspect = canvas3d.clientWidth / canvas3d.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas3d.clientWidth, canvas3d.clientHeight);
    renderer.render( scene, camera );
  }

  function setStyles () {
    var height80 = window.document.getElementById('height80').style;
    height80.position = 'relative';
    height80.width = Number(window.innerWidth * 1.0)+'px';
    height80.height = Number(window.innerHeight * 0.8)+'px';

    var height20 = window.document.getElementById('height20').style;
    height20.width = Number(window.innerWidth)+'px';
    height20.height = Number(window.innerHeight * 0.2)+'px';
  }

  function render () {
    controls.update();
    renderer.render( scene, camera );
  }

  // API
  this.init = init;
  // this.buildObjects = buildObjects;
  this.update = update;
  this.render = render;

  // Initialize renderer
  this.init();
};

// Class methods
View3dThree.prototype.constructor = View3dThree;

// For NodeJS, will be discarded by uglify
if (NODE_ENV === true && typeof module !== 'undefined') {
  module.exports = View3dThree;
}