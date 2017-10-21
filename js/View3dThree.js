// File: js/View3dThree.js
// Dependencies : import them before View3d.js in browser
if (NODE_ENV === true && typeof module !== 'undefined') {
  var THREE = require('three');
  var Model = require('./Model.js');
}

var View3dThree = function () {
  // Create model, Command, then lookup view2d, view3d, textarea
  var model = new Model();
  model.init([-200, -200, 200, -200, 200, 200, -200, 200]);

  var camera, controls, scene, renderer, mesh, materialFace;
  var anim = false;
  var objects = [];

  function buildObjects () {
// Objects
    var pt  = [
      {x:-200, y:-200, z:0},
      {x:200, y:-200, z:0},
      {x:200, y:200, z:0},
      {x:-200, y:200, z:0}
    ];
    var pt0 = new THREE.Vector3(pt[0].x, pt[0].y, pt[0].z);
    var pt1 = new THREE.Vector3(pt[1].x, pt[1].y, pt[1].z);
    var pt2 = new THREE.Vector3(pt[2].x, pt[2].y, pt[2].z);
    var pt3 = new THREE.Vector3(pt[3].x, pt[3].y, pt[3].z);

// Points
    {
      var geometryPoint = new THREE.Geometry();
      geometryPoint.vertices.push(pt0);
      var materialPoint = new THREE.PointsMaterial({size:20, color:0x0000ff});
      var point         = new THREE.Points(geometryPoint, materialPoint);
      scene.add(point);
      objects.push(point);

      geometryPoint = new THREE.Geometry();
      geometryPoint.vertices.push(pt1);
      materialPoint = new THREE.PointsMaterial({size:20, color:0x0000ff});
      point         = new THREE.Points(geometryPoint, materialPoint);
      scene.add(point);
      objects.push(point);

      geometryPoint = new THREE.Geometry();
      geometryPoint.vertices.push(pt2);
      materialPoint = new THREE.PointsMaterial({size:20, color:0x0000ff});
      point         = new THREE.Points(geometryPoint, materialPoint);
      scene.add(point);
      objects.push(point);

      geometryPoint = new THREE.Geometry();
      geometryPoint.vertices.push(pt3);
      materialPoint = new THREE.PointsMaterial({size:20, color:0x0000ff});
      point         = new THREE.Points(geometryPoint, materialPoint);
      scene.add(point);
      objects.push(point);
    }
// Lines
    {
      var geometryline = new THREE.Geometry();
      geometryline.vertices.push(pt0);
      geometryline.vertices.push(pt1);
      var materialLine = new THREE.LineBasicMaterial({color:0x0000ff, linewidth:3});
      var line         = new THREE.LineSegments(geometryline, materialLine);
      scene.add(line);
//        objects.push( line );

      geometryline = new THREE.Geometry();
      geometryline.vertices.push(pt1);
      geometryline.vertices.push(pt2);
      materialLine = new THREE.LineBasicMaterial({color:0x0000ff, linewidth:3});
      line         = new THREE.LineSegments(geometryline, materialLine);
      scene.add(line);
//        objects.push( line );

      geometryline = new THREE.Geometry();
      geometryline.vertices.push(pt2);
      geometryline.vertices.push(pt3);
      materialLine = new THREE.LineBasicMaterial({color:0x0000ff, linewidth:3});
      line         = new THREE.LineSegments(geometryline, materialLine);
      scene.add(line);
//        objects.push( line );

      geometryline = new THREE.Geometry();
      geometryline.vertices.push(pt3);
      geometryline.vertices.push(pt0);
      materialLine = new THREE.LineBasicMaterial({color:0x0000ff, linewidth:3});
      line         = new THREE.LineSegments(geometryline, materialLine);
      scene.add(line);
//        objects.push( line );

      geometryline = new THREE.Geometry();
      geometryline.vertices.push(pt0);
      geometryline.vertices.push(pt2);
      materialLine = new THREE.LineBasicMaterial({color:0x0000ff, linewidth:3});
      line         = new THREE.LineSegments(geometryline, materialLine);
      scene.add(line);
      objects.push(line);
    }
// Faces
    {

// First triangle
      var geometry = new THREE.Geometry();
      geometry.vertices.push(pt0);
      geometry.vertices.push(pt1);
      geometry.vertices.push(pt2);

      var face = new THREE.Face3(0, 1, 2);
      geometry.faces.push(face);
      geometry.computeFaceNormals();
      geometry.computeVertexNormals();

// Textures coords
      var xmin = -200, xmax = 200, ymin = -200, ymax = 200;
      geometry.faceVertexUvs[0].push([
        new THREE.Vector2((pt0.x - xmin) / (xmax - xmin), (pt0.y - ymin) / (ymax - ymin)),
        new THREE.Vector2((pt1.x - xmin) / (xmax - xmin), (pt1.y - ymin) / (ymax - ymin)),
        new THREE.Vector2((pt2.x - xmin) / (xmax - xmin), (pt2.y - ymin) / (ymax - ymin))
      ]);

// Object
      mesh = new THREE.Mesh(geometry, materialFace);
      scene.add(mesh);

// Second triangle
      geometry = new THREE.Geometry();
      geometry.vertices.push(pt2);
      geometry.vertices.push(pt3);
      geometry.vertices.push(pt0);

      face = new THREE.Face3(0, 1, 2);
      geometry.faces.push(face);
      geometry.computeFaceNormals();
      geometry.computeVertexNormals();

// Textures coords
      geometry.faceVertexUvs[0] = [];
      geometry.faceVertexUvs[0].push([
        new THREE.Vector2((pt2.x - xmin) / (xmax - xmin), (pt2.y - ymin) / (ymax - ymin)),
        new THREE.Vector2((pt3.x - xmin) / (xmax - xmin), (pt3.y - ymin) / (ymax - ymin)),
        new THREE.Vector2((pt0.x - xmin) / (xmax - xmin), (pt0.y - ymin) / (ymax - ymin))
      ]);

// Object
      mesh = new THREE.Mesh(geometry, materialFace);
      scene.add(mesh);
    }
  };

  function init() {
    var canvas3d = window.document.getElementById('canvas3d');
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
    var texture = new THREE.TextureLoader().load('textures/cocotte256x256.jpg');
    texture.repeat.set(1, 1);
    materialFace = new THREE.MeshPhongMaterial({
      map:texture,
      side:THREE.FrontSide,
      flatShading:THREE.SmoothShading
    });

// Shadows
    light.shadow = new THREE.LightShadow( new THREE.PerspectiveCamera( 50, 1, 200, 10000 ) );
    light.shadow.bias = - 0.0022;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;
    scene.add( light );

    buildObjects();

// Renderer
    renderer = new THREE.WebGLRenderer( { canvas: canvas3d, antialias: true } );
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
        } else if (selectPoints[0] === pt) {
          // Deselect
          selectPoints[0].material.color.r = 0.0;
          selectPoints.splice( 0, 1 );
        } else {
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
     selectTwo: function () {
       alert('Select two points');
       anim = false;
       selectControls.activate();
     },
     endSelect: function () {
       alert('End Select');
       controls.enabled = true;
       selectControls.deactivate();
     },
     clearSelect: function () {
       controls.enabled = true;
       // Deselect
       for (var i = 0, l = scene.children.length; i < l; i++) {
         if (scene.children[i] instanceof THREE.Points) {
           scene.children[i].material.color.r = 0.0;
           scene.children[i].material.size = 20;
         } else if (scene.children[i] instanceof THREE.LineSegments) {
           scene.children[i].material.linewidth = 3;
           scene.children[i].material.color.r = 0.0;
         }
       }
     },
     reset: function () {
       controls.reset();
       scene.rotation.y = 0;
     },
     anim: function () {
       anim = ! anim;
     }
   };
   gui.add( params, 'selectTwo' );
   gui.add( params, 'endSelect' );
   gui.add( params, 'clearSelect' );
   gui.add( params, 'reset' );
   gui.add( params, 'anim' );
   gui.open();

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
    var height80 = window.document.getElementById('height100').style;
    height80.position = 'relative';
    height80.height = Number(window.innerHeight * 1.0)+'px';
    height80.width = Number(window.innerWidth * 1.0)+'px';

    // var height20 = window.document.getElementById('height20').style;
    // height20.height = Number(window.innerHeight * 0.2)+'px';
    // height20.width = Number(window.innerWidth)+'px';

    var canvas2d = window.document.getElementById('canvas2d').style;
    canvas2d.height = Number(window.innerHeight * 0.8)+'px';
    canvas2d.width = Number(window.innerWidth * 0.5)+'px';
    canvas2d.position = 'absolute';
    canvas2d.left = '0';
    canvas2d.top = '0';
    canvas2d.border='1px solid darkblue';

    var canvas3d = window.document.getElementById('canvas3d').style;
    canvas3d.width = Number(window.innerWidth * 0.5)+'px';
    canvas3d.height = Number(window.innerHeight * 0.8)+'px';
    canvas3d.position ='absolute';
    canvas3d.left = '50%';
    canvas3d.top = '0';
    canvas3d.border='1px solid darkblue';

    // var commandarea = window.document.getElementById('commandarea').style;
    // commandarea.fontSize='16px';
    // commandarea.position='relative';
    // commandarea.top = '0px';
    // commandarea.width='100%';
    // commandarea.height='100%';
    // commandarea.resize='none';
    // commandarea.border='1px solid darkblue';
  }

  // Main loop for testing standalone
  function loop(time) {
    requestAnimationFrame( loop );
    if (anim){
      scene.rotation.y += 0.01;
    }
    render();
  }

  function render() {
    controls.update();
    renderer.render( scene, camera );
  }

  // API
  this.init = init;
  this.initBuffers = buildObjects;
  this.buildObjects = buildObjects;
  this.loop = loop;
  this.draw = render;
};

// Class methods
View3dThree.prototype.constructor = View3dThree;

// For NodeJS, will be discarded by uglify
if (NODE_ENV === true && typeof module !== 'undefined') {
  module.exports = View3dThree;
}