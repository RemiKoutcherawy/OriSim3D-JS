// File: src/OrigamiObjectSimple.js
// Makes an Object3D from model

import {
  BackSide, FrontSide, DoubleSide, BufferGeometry, BufferAttribute,
  Object3D, Mesh, Points, SmoothShading, MeshPhongMaterial, PointsMaterial, TriangleFanDrawMode
} from "../libs/three.module.js" ;

// OrigamiObject

function OrigamiObject(model) {

  Object3D.call(this);

  this.type = 'Group';

  // Model
  this.model = model;

  // Initialize
  this.buildMaterials();
  this.buildObjects();
  this.update();
}

OrigamiObject.prototype = Object.assign(Object.create(Object3D.prototype), {

  constructor: OrigamiObject,

  isGroup: true,

  // Build materials
  buildMaterials: function () {

    this.materialFront = new MeshPhongMaterial({
      color: 0xe3738c,
      side: FrontSide,
      flatShading: SmoothShading,
      // polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: 1
    });

    this.materialBack = new MeshPhongMaterial({
      color: 0x37beff,
      side: BackSide,
      flatShading: SmoothShading,
      // polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1
    });

    // Points Materials
    this.materialPoint = new PointsMaterial({
      size: 20,
      color: 0x0000ff
    });
  },

  // Build Object3Ds
  buildObjects: function () {

    // Number of points
    let nbPoints = this.model.points.length;

    // Points Coordinates array
    this.positionsArrayPoint = new Float32Array(nbPoints * 3);

    // Number of indices for Triangle fan
    let nbFaceIndices = 0;
    let faces = this.model.faces;
    for (let i = 0; i < faces.length; i++) {
      // Each face adds a triangle for each point after second point
      nbFaceIndices += (faces[i].points.length - 2) * 3;
    }

    // Points Indices array for faces
    this.facesIndicesArray = new Uint32Array(nbFaceIndices);

    // Geometry for points and faces
    const geometry = new BufferGeometry();
    geometry.addAttribute('position', new BufferAttribute(this.positionsArrayPoint, 3).setDynamic(true));
    geometry.computeVertexNormals();

    // Points3d from geometry
    this.points3d = new Points(geometry, this.materialPoint);

    this.add(this.points3d);

    // Faces Mesh : Indices only, faces use the points geometry
    const indicesFacesBuffer = new BufferAttribute(this.facesIndicesArray, 1).setDynamic(true);
    geometry.setIndex(indicesFacesBuffer);

    // Faces indexed geometry
    this.faces3dFront = new Mesh(geometry, this.materialFront);
    this.faces3dFront.castShadow = true; // needed for self
    this.faces3dFront.receiveShadow = true;
    this.add(this.faces3dFront);

    this.faces3dBack = new Mesh(geometry, this.materialBack);
    this.faces3dBack.castShadow = true; // needed for ground
    // this.faces3dBack.receiveShadow = true;
    this.add(this.faces3dBack);

  },

  // Set Points positions for points3d and faces3d
  setPointsPositions: function () {

    let pos = this.positionsArrayPoint;
    let points = this.model.points;

    for (let i = 0; i < points.length; i++) {

      let pt = points[i];

      pos[3 * i] = pt.x;
      pos[3 * i + 1] = pt.y;
      pos[3 * i + 2] = pt.z;

    }
  },

  // Set Faces indices
  setFacesIndices: function () {

    let indices = this.facesIndicesArray;
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

    // Update Faces
    this.setFacesIndices(this.faces3dFront.geometry);
    this.faces3dFront.geometry.attributes.position.needsUpdate = true;
    this.faces3dFront.geometry.index.needsUpdate = true;

    this.setFacesIndices(this.faces3dBack.geometry);
    this.faces3dBack.geometry.attributes.position.needsUpdate = true;
    this.faces3dBack.geometry.index.needsUpdate = true;
  },

});

OrigamiObject.constructor = OrigamiObject;

export { OrigamiObject };
