// File src/Origami.js
// export { Point } from './Point.js';
// export { Segment } from './Segment.js';
// export { Face } from './Face.js';
// export { Plane } from './Plane.js';
// export { Vec3 } from './Vec3.js';
// export { Model } from './Model.js';
// export { Interpolator } from './Interpolator.js';
// export { Command } from './Command.js';
//

import {Model} from "./Model.js";
import {OrigamiObject} from "./OrigamiObject.js";

let renderer, scene, camera, controls;
let gui;
let model, origamiObject;
let particleLight;

init();
animate();

function init() {

  // Renderer adds a domElement
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  window.document.body.appendChild(renderer.domElement);

  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0xf0f0f0 );

  // Lights
  scene.add( new THREE.AmbientLight( 0x808080 ) );

  const light = new THREE.SpotLight(0xffffff, 0.5);
  light.position.set( 0, 0, 2000 );
  light.castShadow = true;

  light.shadow = new THREE.LightShadow( new THREE.PerspectiveCamera( 50, 1, 200, 10000 ) );
  light.shadow.bias = - 0.00022;
  light.shadow.mapSize.width = 2048;
  light.shadow.mapSize.height = 2048;

  scene.add( light );

  particleLight = new THREE.Mesh(
    new THREE.SphereBufferGeometry( 10, 8, 8 ),
    new THREE.MeshBasicMaterial( { color: 0xffffff } ) );
  scene.add( particleLight );
  var pointLight = new THREE.PointLight( 0xffffff, 5, 400 );
  particleLight.add( pointLight );

  // Origami model
  model = new Model();
  model.init([-200,-200, 200,-200, 200,200, -200,200]);
  model.splitCross(model.points[0],model.points[1]);
  model.rotate(model.segments[6],-45,[model.points[1],model.points[2]]);

  // Origami object inherits from Object3D
  origamiObject = new OrigamiObject(model);
  scene.add( origamiObject );

  // Perspective cameras
  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 10, 4000);
  camera.position.set(-40, 0, 500);

  // Orbit control
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.minDistance = 200;
  controls.maxDistance = 2000;

  // Listeners
  window.addEventListener('resize', onWindowResize, false);
  onWindowResize();

  initGui();

}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);

}

function animate() {

  requestAnimationFrame(animate);

  controls.update();
  origamiObject.update();

  var timer = Date.now() * 0.00025;
  particleLight.position.x = Math.sin( timer * 5 ) * 400;
  particleLight.position.z = Math.cos( timer * 5 ) * 400;

  // renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
  renderer.render(scene, camera);

}

// dat.GUI
function initGui() {

  gui = new dat.GUI();

  gui.add( { size: 12 }, 'size', 0, 360 ).step( 0.1 ).onChange( function( value ){
    console.log("value:"+value);
    model.rotate(model.segments[6], 1 ,[model.points[1],model.points[2]]);
    origamiObject.update();
  });

  gui.add({ wireframe: false}, 'wireframe').onChange(function (flag) { origamiObject.test(flag); });
  gui.add({ reset: function () { controls.reset(); }}, 'reset');

}