// File: src/OrigamiObjectSimple.js
// Makes an Object3D from model

import {
  BackSide, FrontSide, BufferGeometry, BufferAttribute,
  Object3D, Mesh, Points, SmoothShading, MeshPhongMaterial, PointsMaterial, LineBasicMaterial,
  LineSegments, TextureLoader,
} from "../libs/three.module.js";

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

    // Textures
    let textureFront = new TextureLoader().load('textures/cocotte256x256.jpg');
    textureFront.repeat.set(1, 1);

    this.materialFront = new MeshPhongMaterial({
      map: textureFront,
      side: FrontSide,
      flatShading: SmoothShading,
      polygonOffset: true, polygonOffsetFactor: -0.5, polygonOffsetUnits: 1

    });

    let textureBack = new TextureLoader().load('textures/back256x256.jpg');
    this.materialBack = new MeshPhongMaterial({
      map: textureBack,
      side: BackSide,
      flatShading: SmoothShading,
      // polygonOffset: true, polygonOffsetFactor: -0.5, polygonOffsetUnits: 1
    });

    // Points Materials
    this.materialPoint = new PointsMaterial({
      size: 20,
      color: 0x0000ff
    });
    this.materialPointSelected = new PointsMaterial({size: 40, color: 0xff0000});

    // Lines Materials
    this.materialLine = new LineBasicMaterial({
      color: 0x0000ff,
      linewidth: 6
    });
    this.materialLineSelected = new LineBasicMaterial({color: 0xff0000, linewidth: 6});
  },

  // Build Object3Ds
  buildObjects: function () {
    console.log('buildObjects');
    // Number of points
    let nbPoints = this.model.points.length;

    // Points Coordinates array
    this.pointsPositionsArray = new Float32Array(nbPoints * 3);

    // Number of indices for Triangle fan
    let nbFaceIndices = 0;
    let faces = this.model.faces;
    for (let i = 0; i < faces.length; i++) {
      // Each face adds a triangle for each point after second point
      nbFaceIndices += (faces[i].points.length - 2) * 3;
    }

    // Points Indices array for faces
    this.facesIndicesArray = new Uint32Array(nbFaceIndices);

    // Clean eventually
    if (this.points3d !== undefined) {
      this.remove(this.points3d);
      this.remove(this.faces3dFront);
      this.remove(this.faces3dBack);
      this.remove(this.lines3d);
    }

    // Geometry for points and faces
    const geometry = new BufferGeometry();
    geometry.addAttribute('position', new BufferAttribute(this.pointsPositionsArray, 3).setDynamic(true));
    geometry.computeVertexNormals();

    this.uvFaces = new Float32Array(nbPoints * 2); // 2 UV per point
    geometry.addAttribute('uv', new BufferAttribute(this.uvFaces, 2).setDynamic(true));

    // Points3d from geometry
    this.points3d = new Points(geometry, this.materialPoint);

    this.add(this.points3d);

    // Faces Mesh : Indices only, faces use the points geometry
    const indicesFacesBuffer = new BufferAttribute(this.facesIndicesArray, 1).setDynamic(true);
    geometry.setIndex(indicesFacesBuffer);

    // Faces indexed geometry
    this.faces3dFront = new Mesh(geometry, this.materialFront);
    this.faces3dFront.castShadow = true;
    this.faces3dFront.receiveShadow = true; // needed for self
    this.add(this.faces3dFront);

    this.faces3dBack = new Mesh(geometry, this.materialBack);
    this.faces3dBack.castShadow = true; // needed for ground
    this.faces3dBack.receiveShadow = true;
    this.add(this.faces3dBack);

    // Segments Mesh : Points and indices
    const geometrySeg = new BufferGeometry();
    this.positionsArraySeg = new Float32Array(nbPoints * 3);
    geometrySeg.addAttribute('position', new BufferAttribute(this.positionsArraySeg, 3).setDynamic(true));

    // Indices
    let nbSegIndices = this.model.segments.length * 2;
    this.indicesSegmentArray = new Uint32Array(nbSegIndices);
    const indicesSegmentBuffer = new BufferAttribute(this.indicesSegmentArray, 1).setDynamic(true);
    geometrySeg.setIndex(indicesSegmentBuffer);

    // Create object, and add it to this group
    this.lines3d = new LineSegments(geometrySeg, this.materialLine);

    this.add(this.lines3d);
  },

  // Set Points positions for points3d and faces3d
  setPointsPositions: function () {

    let pos = this.pointsPositionsArray; // this.points3d.geometry.attributes.position.array;
    let uv = this.uvFaces; // this.points3d.geometry.attributes.uv.array;

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

    let pos = this.positionsArraySeg; // this.lines3d.geometry.attributes.position.array;
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

    let indices = this.indicesSegmentArray;
    let allPoints = this.model.points;
    let segments = this.model.segments;

    for (let i = 0; i < segments.length; i++) {

      let s = segments[i];

      indices[2 * i] = allPoints.indexOf(s.p1);
      indices[2 * i + 1] = allPoints.indexOf(s.p2);

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

    // Update Segments
    this.setSegmentPointsPositions();
    this.setSegmentsIndices();
    this.lines3d.geometry.attributes.position.needsUpdate = true;
    this.lines3d.geometry.index.needsUpdate = true;

    // Update Faces
    this.setFacesIndices(this.faces3dFront.geometry);
    this.faces3dFront.geometry.attributes.position.needsUpdate = true;
    // this.faces3dFront.geometry.attributes.uv.needsUpdate = true;
    // this.faces3dFront.geometry.index.needsUpdate = true;

    this.setFacesIndices(this.faces3dBack.geometry);
    this.faces3dBack.geometry.attributes.position.needsUpdate = true;
    // this.faces3dBack.geometry.attributes.uv.needsUpdate = true;
    // this.faces3dBack.geometry.index.needsUpdate = true;
  },

});

OrigamiObject.constructor = OrigamiObject;

export { OrigamiObject };
