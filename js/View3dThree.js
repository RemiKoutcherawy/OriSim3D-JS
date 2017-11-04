// File: js/View3dThree.js
// Dependencies : import them before View3d.js in browser
if (NODE_ENV === true && typeof module !== 'undefined') {
  var THREE = require('three');
  var Model = require('./Model.js');
  var Orisim3d = require('./Orisim3dThree.js');
}

var View3dThree = function (model) {
  var canvas3d, camera, controls, scene, renderer;
  var materialFront, materialBack;
  var materialPoint, materialPointSelected;
  var materialLine,  materialLineSelected;
  var anim = false;
  var objects = [];
  // Three objects
  var points;
  var lines;
  var faces;

  // Set Points positions
  var setPointsPositions = function (model, geometryPoint) {
    var positionsPoint = geometryPoint.attributes.position.array;
    for (var i = 0; i < model.points.length; i++) {
      var pt                    = model.points[i];
      positionsPoint[3 * i]     = pt.x;
      positionsPoint[3 * i + 1] = pt.y;
      positionsPoint[3 * i + 2] = pt.z;
      // Keep a reference to THREE.Points in this pt
      pt.point                  = this.points;
    }
    geometryPoint.setDrawRange(0, model.points.length);
  };

  // Set Segments positions
  var setSegmentsPositions = function (model, geometryline) {
    var positionsLine = geometryline.attributes.position.array;
    for (var i = 0; i < model.segments.length; i++) {
      var s = model.segments[i];
      positionsLine[6 * i]     = s.p1.x;
      positionsLine[6 * i + 1] = s.p1.y;
      positionsLine[6 * i + 2] = s.p1.z;
      positionsLine[6 * i + 3] = s.p2.x;
      positionsLine[6 * i + 4] = s.p2.y;
      positionsLine[6 * i + 5] = s.p2.z;

      // Keep a reference to THREE.Line in segment
      s.lines                  = this.lines;
    }
    geometryline.setDrawRange(0, model.segments.length * 2);
  };

  // Set Faces vertices positions
  var setFacesPositions = function (model, geometryFace) {
    var pos = geometryFace.attributes.position.array;
    var uv = geometryFace.attributes.uv.array;
    // var indices = geometryFace.getIndex();

    // Put all points with UV coords in 'pos'
    var allPoints = model.points;
    for (var i = 0; i < allPoints.length; i++) {
      var pt          = model.points[i];
      pos[ 3 * i]     = pt.x;
      pos[ 3 * i + 1] = pt.y;
      pos[ 3 * i + 2] = pt.z;
      // UV are just flat coordinates on crease pattern
      uv[ 2 * i]      = (200.0 + pt.xf) / 400.0;
      uv[ 2 * i + 1 ] = (200.0 + pt.yf) / 400.0;
    }

    // Count points
    var count = 0;
    for (var iface = 0; iface < model.faces.length; iface++) {
      var f   = model.faces[iface];
      var pts = f.points;
      // Each point adds a new triangle
      for (var ipoint = 2; ipoint < pts.length; ipoint++) {
        count += 3;
        // Next triangle, second becomes the first for the next triangle.
        first = second;
      }
    };
    var indices = new Uint32Array( count );

    var index = 0;
    for (var iface = 0; iface < model.faces.length; iface++) {
      var f   = model.faces[iface];
      var pts = f.points;

      // Triangle FAN can be used only because of convex face
      // Triangle are made of 3 points : origin, first, second
      var origin = pts[0]; // center of the FAN
      var first  = pts[1]; // first point
      var second;          // second point, third and last point of triangle

      // Each point adds a new triangle
      for (var ipoint = 2; ipoint < pts.length; ipoint++) {
        second = pts[ipoint];  // second starts à 2
        // Front Fan triangle : center, first, second
        indices[index++] = allPoints.indexOf(origin);
        indices[index++] = allPoints.indexOf(first);
        indices[index++] = allPoints.indexOf(second);
        // Next triangle, second becomes the first for the next triangle.
        first = second;
      }
      // Keep a reference to THREE.Mesh in model face
      f.mesh = this.faces;
    }
    // Set index
    geometryFace.setIndex( new THREE.BufferAttribute( indices, 1 ) );
  };

  // Build all objects
  var buildObjects = function  (model) {
    var MAX_POINTS = 500;

    // Build Points
    var geometryPoint = new THREE.BufferGeometry();
    var positionsArrayPoint = new Float32Array( MAX_POINTS * 3 ); // 3 vertices per point
    geometryPoint.addAttribute( 'position', new THREE.BufferAttribute( positionsArrayPoint, 3 ) );
    // Mesh
    this.points         = new THREE.Points(geometryPoint, materialPoint);
    setPointsPositions.call(this, model, geometryPoint);
    scene.add(this.points);

    // Build Segments
    var geometryline = new THREE.BufferGeometry();
    var positionsArrayLine = new Float32Array( MAX_POINTS * 3 ); // 3 vertices per point
    geometryline.addAttribute( 'position', new THREE.BufferAttribute( positionsArrayLine, 3 ) );
    // Mesh
    this.lines = new THREE.LineSegments( geometryline,  materialLine );
    setSegmentsPositions.call(this, model, geometryline);
    scene.add( this.lines );

    // Build Faces
    var geometryFace = new THREE.BufferGeometry();
    var positionsArrayFace = new Float32Array( MAX_POINTS * 3 ); // 3 vertices per point
    geometryFace.addAttribute( 'position', new THREE.BufferAttribute( positionsArrayFace, 3 ) );
    var uvFaces = new Float32Array( MAX_POINTS * 2 ); // 2 UV per point
    geometryFace.addAttribute( 'uv', new THREE.BufferAttribute( uvFaces, 2 ) );
    // var indices = new Uint32Array( MAX_POINTS * 3); // Number of indices is the sum of point of faces
    // geometryFace.setIndex( new THREE.BufferAttribute( indices, 1 ) );
    // Mesh
    this.faces = new THREE.Mesh( geometryFace,  materialFront );
    setFacesPositions.call(this, model, geometryFace);
    scene.add( this.faces );

    // // TEST
    // var quad_vertices = [-200.0,200.0,0.0, 200.0,200.0,0.0, 200.0,-200.0,0.0, -200.0,-200.0,0.0];
    // var quad_uvs = [0.0,0.0, 1.0,0.0, 1.0,1.0, 0.0,1.0];
    // var quad_indices = [0,2,1, 0,3,2];
    // var geometry = new THREE.BufferGeometry();
    // // itemSize = 3 because there are 3 values (components) per vertex
    // // var vertices = new Float32Array( quad_vertices );
    // // geometry.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
    // var postest = new Float32Array( 12 ); // 3 vertices per point
    // geometry.addAttribute( 'position', new THREE.BufferAttribute( postest, 3 ).setDynamic(true) );
    // var pos = geometry.attributes.position.array;
    // for (var k = 0; k < quad_vertices.length; k++ ){
    //   pos[k] = quad_vertices[k];
    // };
    //
    // // Each vertex has one uv coordinate for texture mapping
    // // var uvs = new Float32Array( quad_uvs);
    // // geometry.addAttribute( 'uv', new THREE.BufferAttribute( uvs, 2 ) );
    // var uvs = new Float32Array( 8 ); // 2 UV per point
    // geometry.addAttribute( 'uv', new THREE.BufferAttribute( uvs, 2 ).setDynamic(true) );
    // var uv = geometry.attributes.uv.array;
    // for (var l = 0; l < uvs.length; l++ ) {
    //   uv[l]      = quad_uvs[l];
    // };
    //
    // // Use the four vertices to draw the two triangles that make up the square.
    // // var indicestest = new Uint32Array( quad_indices );
    // // geometry.setIndex( new THREE.BufferAttribute( indicestest, 1 ) );
    // var indicestest = new Uint32Array( 6 );
    // geometry.setIndex( new THREE.BufferAttribute( indicestest, 1 ) );
    // var indices = geometry.getIndex();
    // var indices = new Uint32Array( 6 );
    // console.log("indicestest:"+indicestest+" indices:"+indices);
    // for (var m = 0; m < quad_indices.length; m++ ) {
    //   // indicestest[m]      = quad_indices[m];
    //   indices[m]      = quad_indices[m];
    // };
    // geometry.setIndex( new THREE.BufferAttribute( indices, 1 ) );
    //
    // var mesh = new THREE.Mesh( geometry, materialFront );
    // mesh.position.z = -100;
    //
    // scene.add(mesh);
  };

  // Update all objects positions
  var update  = function  (model) {
    // Updates Points
    setPointsPositions.call(this, model, this.points.geometry );
    this.points.geometry.attributes.position.needsUpdate = true;

    // Update Segments
    setSegmentsPositions.call(this, model, this.lines.geometry );
    this.lines.geometry.attributes.position.needsUpdate = true;

    // Update Faces
    setFacesPositions.call(this, model, this.faces.geometry );
    this.faces.geometry.attributes.position.needsUpdate = true;
  };

  // Initialize Scene, Lights, Textures, Materials
  var init = function () {
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
    textureFront.repeat.set(1, 1);
    materialFront = new THREE.MeshPhongMaterial({
      map:textureFront,
      side:THREE.FrontSide,
      flatShading:THREE.SmoothShading
    });
    // var materialFront = new THREE.MeshPhongMaterial( {
    //   color: 0xaaaaaa, specular: 0xffffff, shininess: 250,
    //   side: THREE.DoubleSide, vertexColors: THREE.VertexColors
    // } );

    // var textureBack = new THREE.TextureLoader().load('textures/back256x256.jpg');
    // materialBack = new THREE.MeshPhongMaterial({
    //   map:textureBack,
    //   side:THREE.FrontSide,
    //   flatShading:THREE.SmoothShading
    // });

// Points Materials
    materialPoint = new THREE.PointsMaterial({size:20, color:0x0000ff});
    materialPointSelected = new THREE.PointsMaterial({size:40, color:0xff0000});

// Lines Materials
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
//     var selectPoints = [];
//     var selectLines = [];
//     var selectControls = new SelectControls( objects, camera, renderer.domElement );
//     selectControls.addEventListener( 'selectPt', function ( event, object ) {
//         var pt = event.object;
//         if (selectPoints.length === 0){
//           // Select
//           selectPoints[0] = pt;
//           selectPoints[0].material.size = 40;
//           selectPoints[0].material.color.r = 1.0;
//         }
//         else if (selectPoints[0] === pt) {
//           // Deselect
//           selectPoints[0].material.color.r = 0.0;
//           selectPoints.splice( 0, 1 );
//         }
//         else {
//           // Got two
//           selectPoints[1] = pt;
//           selectPoints[1].material.size = 40;
//           selectPoints[1].material.color.r = 1.0;
//           console.log("AddLine");
//           // Do
//           var addline = new THREE.Geometry();
//           addline.vertices.push(new THREE.Vector3(
//             selectPoints[0].geometry.vertices[0].x,
//             selectPoints[0].geometry.vertices[0].y,
//             selectPoints[0].geometry.vertices[0].z));
//           addline.vertices.push(new THREE.Vector3(
//             selectPoints[1].geometry.vertices[0].x,
//             selectPoints[1].geometry.vertices[0].y,
//             selectPoints[1].geometry.vertices[0].z));
//           var addMaterialLine = new THREE.LineBasicMaterial( { color: 0xff00ff,linewidth: 6} );
//           var line = new THREE.LineSegments( addline, addMaterialLine );
//           scene.add( line );
//           selectPoints.splice( 0, 1 );
//           selectPoints.splice( 0, 1 );
//         }
//         console.dir(pt);
//       }
//     );
//     selectControls.activate();

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
  };

  var onWindowResize = function () {
    setStyles();
    camera.aspect = canvas3d.clientWidth / canvas3d.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas3d.clientWidth, canvas3d.clientHeight);
    renderer.render( scene, camera );
  };

  var setStyles = function () {
    var height80 = window.document.getElementById('height80').style;
    height80.position = 'relative';
    height80.width = Number(window.innerWidth * 1.0)+'px';
    height80.height = Number(window.innerHeight * 0.8)+'px';

    var height20 = window.document.getElementById('height20').style;
    height20.width = Number(window.innerWidth)+'px';
    height20.height = Number(window.innerHeight * 0.2)+'px';
  };

  var render = function () {
    controls.update();
    renderer.render( scene, camera );
  };

  // Initialize renderer
  init.call(this);
  // Build objects if a model is provided
  model ? buildObjects.call(this, model) : null;

  // API
  this.init = init;
  this.buildObjects = buildObjects;
  this.update = update;
  this.render = render;
};

// Class methods
View3dThree.prototype.constructor = View3dThree;

// For NodeJS, will be discarded by uglify
if (NODE_ENV === true && typeof module !== 'undefined') {
  module.exports = View3dThree;
}