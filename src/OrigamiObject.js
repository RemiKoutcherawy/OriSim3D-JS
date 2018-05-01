// File: src/OrigamiObject.js

// import {
//   THREE.Object3D,
//   BufferGeometry, BufferAttribute,
//   TextureLoader,
//   Mesh,
//   Points,
//   FrontSide,
//   SmoothShading,
//   BackSide,
//   PointsMaterial,
//   LineBasicMaterial,
//   LineSegments,
//   MeshPhongMaterial
// } from '../libs/three.js';

import {Model} from "./Model.js";

// OrigamiObject

function OrigamiObject(model) {

  // Build like a THREE.Group
  THREE.Object3D.call(this);

  this.type = 'Group';

  // Model
  this.model = model;

  // Initialize
  this.buildMaterials();
  this.buildObjects();
  this.update();
}

OrigamiObject.prototype = Object.assign(Object.create(THREE.Object3D.prototype), {

  constructor: OrigamiObject,

  isGroup: true,

  // Build materials
  buildMaterials: function () {

    // Textures
    let textureFront = new THREE.TextureLoader().load('textures/cocotte256x256.jpg');
    textureFront.repeat.set(1, 1);

    this.materialFront = new THREE.MeshPhongMaterial({
      map: textureFront,
      side: THREE.FrontSide,
      flatShading: THREE.SmoothShading
    });

    let textureBack = new THREE.TextureLoader().load('textures/back256x256.jpg');
    this.materialBack = new THREE.MeshPhongMaterial({
      map: textureBack,
      side: THREE.BackSide,
      flatShading: THREE.SmoothShading
    });

    // Points Materials
    this.materialPoint = new THREE.PointsMaterial({size: 20, color: 0x0000ff});
    this.materialPointSelected = new THREE.PointsMaterial({size: 40, color: 0xff0000});

    // Lines Materials
    this.materialLine = new THREE.LineBasicMaterial({color: 0x0000ff, linewidth: 3});
    this.materialLineSelected = new THREE.LineBasicMaterial({color: 0xff0000, linewidth: 6});
  },

  // Build Buffers and THREE.Object3Ds
  buildObjects: function () {

    // Clean eventually
    if (this.points3d !== undefined) {
      this.remove(this.points3d);
      this.remove(this.faces3dFront);
      this.remove(this.faces3dBack);
      this.remove(this.lines3d);
    }

    const MAX_POINTS = 512;

    // Build Points Mesh
    const geometry = new THREE.BufferGeometry();
    const positionsArrayPoint = new Float32Array(MAX_POINTS * 3);
    geometry.addAttribute('position', new THREE.BufferAttribute(positionsArrayPoint, 3).setDynamic(true));
    geometry.computeVertexNormals();

    const uvFaces = new Float32Array(MAX_POINTS * 2); // 2 UV per point
    geometry.addAttribute('uv', new THREE.BufferAttribute(uvFaces, 2).setDynamic(true));

    // Create object, and add it to this group
    this.points3d = new THREE.Points(geometry, this.materialPoint);

    this.add(this.points3d);

    // Build Faces Mesh : Indices only, faces share the same geometry
    const indicesArray = new Uint32Array(MAX_POINTS * 3);
    const indicesFacesBuffer = new THREE.BufferAttribute(indicesArray, 1).setDynamic(true);
    geometry.setIndex(indicesFacesBuffer);

    // Create object, same geometry, and add it to scene
    this.faces3dFront = new THREE.Mesh(geometry, this.materialFront);
    this.add(this.faces3dFront);
    this.faces3dBack = new THREE.Mesh(geometry, this.materialBack);

    this.add(this.faces3dBack);

    // Build Segments Mesh : Points and indices
    const geometryline = new THREE.BufferGeometry();
    const positionsArrayLine = new Float32Array(MAX_POINTS * 3);
    geometryline.addAttribute('position', new THREE.BufferAttribute(positionsArrayLine, 3).setDynamic(true));

    // Indices
    const indicesSegmentArray = new Uint32Array(MAX_POINTS * 2);
    const indicesSegmentBuffer = new THREE.BufferAttribute(indicesSegmentArray, 1).setDynamic(true);
    geometryline.setIndex(indicesSegmentBuffer);

    // Create object, and add it to this group
    this.lines3d = new THREE.LineSegments(geometryline, this.materialLine);

    this.add(this.lines3d);
  },

  // Set Points positions for points3d and faces3d
  setPointsPositions: function () {
    let pos = this.points3d.geometry.attributes.position.array;
    let uv = this.points3d.geometry.attributes.uv.array;
    let points = this.model.points;

    for (let i = 0; i < points.length; i++) {

      let pt = points[i];

      pos[3 * i] = pt.x;
      pos[3 * i + 1] = pt.y;
      pos[3 * i + 2] = pt.z;

      // UV are just flat coordinates on crease pattern
      uv[2 * i] = (200.0 + pt.xf) / 400.0;
      uv[2 * i + 1] = (200.0 + pt.yf) / 400.0;


    }
  },

  // Set Points positions for segments
  setSegmentPointsPositions: function () {
    let pos = this.points3d.geometry.attributes.position.array;
    let points = this.model.points;

    for (let i = 0; i < points.length; i++) {
      let pt = points[i];
      pos[3 * i] = pt.x;
      pos[3 * i + 1] = pt.y;
      pos[3 * i + 2] = pt.z;
    }
  },

  // Set Segments indices
  setSegmentsIndices: function () {
    let indices = this.points3d.geometry.getIndex().array;
    let allPoints = this.model.points;
    let segments = this.model.segments;

    for (let i = 0; i < segments.length; i++) {
      let s = segments[i];
      indices[2 * i] = allPoints.indexOf(s.p1);
      indices[2 * i + 1] = allPoints.indexOf(s.p2);
    }
  },

  // Set Faces indices
  setFacesIndices: function (geometry) {
    let indices = geometry.getIndex().array;
    let allPoints = this.model.points;
    let faces = this.model.faces;

    let index = 0;

    for (let i = 0; i < faces.length; i++) {

      // Face points
      let pts = faces[i].points;

      // Triangle FAN can be used only because of convex face
      // Triangle are made of 3 points : origin, first, second
      let origin = pts[0]; // center of the FAN
      let first = pts[1];  // first point
      let second;          // second point, third and last point of triangle

      // Each point adds a new triangle
      for (let j = 2; j < pts.length; j++) {

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
  },

  // Update all objects positions
  update: function () {

    // Rebuild if needed
    if (this.model.needRebuild) {
      console.log("needRebuild");
      this.buildObjects()
    }

    // Updates Points
    this.setPointsPositions();
    this.points3d.geometry.attributes.position.needsUpdate = true;

    // Update Segments
    this.setSegmentPointsPositions();
    this.setSegmentsIndices();
    this.lines3d.geometry.attributes.position.needsUpdate = true;
    this.lines3d.geometry.index.needsUpdate = true;

    // Update Faces
    this.setFacesIndices(this.faces3dFront.geometry);
    this.faces3dFront.geometry.attributes.position.needsUpdate = true;
    this.faces3dFront.geometry.attributes.uv.needsUpdate = true;
    this.faces3dFront.geometry.index.needsUpdate = true;

    this.setFacesIndices(this.faces3dBack.geometry);
    this.faces3dBack.geometry.attributes.position.needsUpdate = true;
    this.faces3dBack.geometry.attributes.uv.needsUpdate = true;
    this.faces3dBack.geometry.index.needsUpdate = true;
  },

  test(flag){console.log("flag:"+flag)},

});

OrigamiObject.constructor = OrigamiObject;

export {OrigamiObject};
