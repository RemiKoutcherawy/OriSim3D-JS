// File: src/OrigamiGeometry.js
// Inspired by PlaneBufferGeometry.js

import { BufferGeometry } from '../libs/three.module.js';
import {Float32BufferAttribute} from "../libs/three.module.js";

// OrigamiGeometry

function OrigamiGeometry( model ) {

	BufferGeometry.call( this );

	this.type = 'OrigamiGeometry';

  // buffers
  const indices = [];
  const vertices = [];
  const normals = [];
  const uvs = [];

  // Positions, normals, uv
  genVertices();

  // Indices for faces
  genIndices();

  // build geometry
  this.setIndex( indices );
  this.addAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );
  this.addAttribute( 'normal', new Float32BufferAttribute( normals, 3 ) );
  this.addAttribute( 'uv', new Float32BufferAttribute( uvs, 2 ) );

  function genVertices() {

    for (let i = 0; i < model.points.length; i++) {

      const pt = model.points[i];

      // Vertices
      vertices.push( pt.x, pt.y, pt.z );

      // Normals
      normals.push( 0, 0, 1 );

      // UV are just flat coordinates on crease pattern
      uvs[2 * i] = (200.0 + pt.xf) / 400.0;
      uvs[2 * i + 1] = (200.0 + pt.yf) / 400.0;
    }
  }

  function genIndices() {

    const pts = model.points;

    for (let i = 0; i < model.faces.length; i++) {

      // Face points
      const facePts = model.faces[i].points;

      // Triangle FAN can be used only because of convex face
      // Triangle are made of 3 points : origin, first, second
      let origin = facePts[0]; // center of the FAN
      let first = facePts[1];  // first point
      let second;              // second point, third and last point of triangle

      // Each point adds a new triangle
      for (let j = 2; j < facePts.length; j++) {

        // second starts à 2
        second = facePts[j];

        // Front Fan triangle : center, first, second
        let a = pts.indexOf(origin);
        let b = pts.indexOf(first);
        let c = pts.indexOf(second);

        // Indices for triangle
        indices.push( a, b, c );

        // Next triangle, second becomes the first for the next triangle.
        first = second;
      }
    }
  }

}

OrigamiGeometry.prototype = Object.create( BufferGeometry.prototype );
OrigamiGeometry.prototype.constructor = OrigamiGeometry;

export {OrigamiGeometry};
