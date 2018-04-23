// File: src/Face.js
// Dependencies : Point

// Face contains points, segments, normal

function Face() {
  this.points = [];
  this.normal = [0, 0, 1];
  this.select = 0;
  this.highlight = false;
  this.offset = 0;
}

Object.assign(Face.prototype, {

  // Compute Face normal
  computeFaceNormal: function computeFaceNormal() {
    if (this.points.length < 3) {
      console.log("Warn Face < 3pts:" + this);
      return null;
    }

    for (let i = 0; i < this.points.length - 2; i++) {
      // Take triangles until p2p1 x p1p3 > 0.1
      const p1 = this.points[i];
      const p2 = this.points[i + 1];
      const p3 = this.points[i + 2];
      const u = [p2.x - p1.x, p2.y - p1.y, p2.z - p1.z];
      const v = [p3.x - p1.x, p3.y - p1.y, p3.z - p1.z];
      this.normal[0] = u[1] * v[2] - u[2] * v[1];
      this.normal[1] = u[2] * v[0] - u[0] * v[2];
      this.normal[2] = u[0] * v[1] - u[1] * v[0];
      if (Math.abs(this.normal[0]) + Math.abs(this.normal[1]) + Math.abs(this.normal[2]) > 0.1) {
        break;
      }
    }

    const n = this.normal;
    const d = Math.sqrt(n[0] * n[0] + n[1] * n[1] + n[2] * n[2]);
    n[0] /= d;
    n[1] /= d;
    n[2] /= d;

    return n;
  },

  // String representation
  toString: function toString() {
    let str = "F" + "(";
    this.points.forEach(function (p, i, a) {
      str = str + "P" + i + p.toString() + (i === a.length - 1 ? "" : " ");
    });
    str = str + ")";
    return str;
  },

});

export {Face};
