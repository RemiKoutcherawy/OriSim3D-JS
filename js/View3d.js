// File: js/View3d.js
// Dependencies : import them before View3d.js in browser
if (NODE_ENV === true && typeof module !== 'undefined' && module.exports) {
  var Model = require('./Model.js');
}

// View3d Constructor
function View3d(model, canvas3d) {
  // Instance variables
  this.model        = model;
  this.canvas3d     = canvas3d;
  this.gl           = this.canvas3d.getContext('webgl') || canvas3d.getContext('experimental-webgl');

  // Initialisation
  this.initWebGL();
}
// Face Vertex
View3d.FaceVertexShaderSrc   =
  'attribute vec4 a_Position;\n' +
  'attribute vec2 a_TexCoordFront;\n' +
  'attribute vec2 a_TexCoordBack;\n' +
  'uniform mat4 u_MvMatrix;\n' +
  'varying vec2 v_TexCoordFront;\n' +
  'varying vec2 v_TexCoordBack;\n' +
  'void main() {\n' +
  '  gl_Position = u_MvMatrix * a_Position;\n' +
  '  v_TexCoordFront = a_TexCoordFront;\n' +
  '  v_TexCoordBack = a_TexCoordBack;\n' +
  '}\n';
// Face Fragment
View3d.FaceFragmentShaderSrc =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'uniform sampler2D u_SamplerFront;\n' +
  'uniform sampler2D u_SamplerBack;\n' +
  'varying vec2 v_TexCoordFront;\n' +
  'varying vec2 v_TexCoordBack;\n' +
  'void main() {\n' +
  'if (gl_FrontFacing){ \n' +
  '  gl_FragColor = texture2D(u_SamplerFront, v_TexCoordFront);}\n' +
  'else { \n' +
  '  gl_FragColor = texture2D(u_SamplerBack, v_TexCoordBack); }\n' +
  '}\n';

// Current rotation angle ([x-axis, y-axis] degrees)
View3d.currentAngle = [0.0, 0.0];
View3d.scale        = 1.0;
// Model view projection matrix for Perspective and Current
View3d.g_MvpMatrix = new Float32Array(16);
View3d.g_MvCurrentMatrix = new Float32Array(16);
// Textures dimensions
View3d.wTexFront = 1;
View3d.hTexFront = 1;
View3d.wTexBack  = 1;
View3d.hTexBack  = 1;

// Class methods
View3d.prototype = {
  constructor:View3d,

  // Intialization
  initWebGL:function () {
    this.initShaders();
    this.initTextures();
    this.initPerspective();
    this.initMouseListeners();
    // this.initBuffers(); // No need here, will be called by requestAnimationFrame
  },
  // Shaders
  initShaders:function () {
    const gl = this.gl;
    // Face Vertex
    const vxShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vxShader, View3d.FaceVertexShaderSrc);
    gl.compileShader(vxShader);
    if (!gl.getShaderParameter(vxShader, gl.COMPILE_STATUS)) {
      alert("An error occurred compiling the shader: " + gl.getShaderInfoLog(vxShader));
    }
    // Face Fragment
    const fgShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fgShader, View3d.FaceFragmentShaderSrc);
    gl.compileShader(fgShader);
    if (!gl.getShaderParameter(fgShader, gl.COMPILE_STATUS)) {
      alert("An error occurred compiling the shader: " + gl.getShaderInfoLog(fgShader));
    }
    // Face Shader Program
    const faceShaderProgram = gl.createProgram();
    gl.attachShader(faceShaderProgram, vxShader);
    gl.attachShader(faceShaderProgram, fgShader);
    gl.linkProgram(faceShaderProgram);
    // Use it
    gl.useProgram(faceShaderProgram);
    gl.faceShaderProgram       = faceShaderProgram;
    // Attributes
    const a_vertexPosAttribute = gl.getAttribLocation(faceShaderProgram, "a_Position");
    gl.enableVertexAttribArray(a_vertexPosAttribute);
    const textureCoordAttrFront = gl.getAttribLocation(faceShaderProgram, "a_TexCoordFront");
    gl.enableVertexAttribArray(textureCoordAttrFront);
    const textureCoordAttrBack = gl.getAttribLocation(faceShaderProgram, "a_TexCoordBack");
    gl.enableVertexAttribArray(textureCoordAttrBack);
  },

  // Buffers
  initBuffers:function () {
    const gl  = this.gl;
    // Faces
    var vtx   = []; // vertex
    var ftx   = []; // front texture coords
    var btx   = []; // back texture coords
    var fnr   = []; // front normals coords
    var bnr   = []; // back normals coords
    var fin   = []; // front indices
    var bin   = []; // back indices
    var index = 0;

    for (var iFace = 0; iFace < this.model.faces.length; iFace++) {
      var f   = this.model.faces[iFace];
      var pts = f.points;
      // Normal needed for Offset
      f.computeFaceNormal();
      var n = f.normal;
      // Triangle FAN can be used only because of convex CCW face
      var c = pts[0]; // center
      var p = pts[1]; // previous
      for (var i = 2; i < pts.length; i++) {
        var s = f.points[i]; // second
        vtx.push(c.x + f.offset * n[0]);
        vtx.push(c.y + f.offset * n[1]);
        vtx.push(c.z + f.offset * n[2]);
        fnr.push(n[0]);  fnr.push(n[1]);  fnr.push(n[2]);
        bnr.push(-n[0]); bnr.push(-n[1]); bnr.push(-n[2]);
        // textures
        ftx.push((200 + c.xf) / View3d.wTexFront);
        ftx.push((200 + c.yf) / View3d.hTexFront);
        btx.push((200 + c.xf) / View3d.wTexBack);
        btx.push((200 + c.yf) / View3d.hTexBack);
        // index
        fin.push(index);
        bin.push(index);
        index++;
        vtx.push(p.x + f.offset * n[0]);
        vtx.push(p.y + f.offset * n[1]);
        vtx.push(p.z + f.offset * n[2]);
        fnr.push(n[0]);  fnr.push(n[1]);  fnr.push(n[2]);
        bnr.push(-n[0]); bnr.push(-n[1]); bnr.push(-n[2]);
        // textures
        ftx.push((200 + p.xf) / View3d.wTexFront);
        ftx.push((200 + p.yf) / View3d.hTexFront);
        btx.push((200 + p.xf) / View3d.wTexBack);
        btx.push((200 + p.yf) / View3d.hTexBack);
        // index Note +1 for back face index
        fin.push(index);
        bin.push(index + 1);
        index++;
        vtx.push(s.x + f.offset * n[0]);
        vtx.push(s.y + f.offset * n[1]);
        vtx.push(s.z + f.offset * n[2]);
        fnr.push(n[0]);   fnr.push(n[1]); fnr.push(n[2]);
        bnr.push(-n[0]); bnr.push(-n[1]); bnr.push(-n[2]);
        // textures
        ftx.push((200 + s.xf) / View3d.wTexFront);
        ftx.push((200 + s.yf) / View3d.hTexFront);
        btx.push((200 + s.xf) / View3d.wTexBack);
        btx.push((200 + s.yf) / View3d.hTexBack);
        // index Note -1 for back face index
        fin.push(index);
        bin.push(index - 1);
        index++;
        // next triangle
        p = s;
      }
    }

    // Face Buffers
    var vertices       = new Float32Array(vtx);
    var texCoordsFront = new Float32Array(ftx);
    var texCoordsBack  = new Float32Array(btx);
    this.initArrayBuffer(gl, gl.faceShaderProgram, vertices, 3, gl.FLOAT, 'a_Position');
    this.initArrayBuffer(gl, gl.faceShaderProgram, texCoordsFront, 2, gl.FLOAT, 'a_TexCoordFront');
    this.initArrayBuffer(gl, gl.faceShaderProgram, texCoordsBack, 2, gl.FLOAT, 'a_TexCoordBack');
    // Indices buffer
    var faceVertexIndicesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, faceVertexIndicesBuffer);
    var faceVertexIndicesArray = new Uint8Array(fin);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, faceVertexIndicesArray, gl.STATIC_DRAW);

    // Used in draw()
    this.nbFacesVertice = faceVertexIndicesArray.length;
  },

  // Create Buffer Arrays and assign to attribute
  initArrayBuffer:function (gl, program, data, num, type, attribute) {
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    var a_attribute = gl.getAttribLocation(program, attribute);
    gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
    gl.enableVertexAttribArray(a_attribute);
  },

  // Textures
  initTextures:function () {
    const gl = this.gl;
    gl.useProgram(gl.faceShaderProgram);
    // Create a texture object Front
    var textureFront = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textureFront);
    // Placeholder One Pixel Color Blue 70ACF3
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0x70, 0xAC, 0xF3, 255]));
    var u_SamplerFront = gl.getUniformLocation(gl.faceShaderProgram, 'u_SamplerFront');
    gl.uniform1i(u_SamplerFront, 0);

    // View3d.image_front = new Image();
    // View3d.image_front.onload = function(){
    //   gl.useProgram(gl.faceShaderProgram);
    //   var u_SamplerFront = gl.getUniformLocation(gl.faceShaderProgram, 'u_SamplerFront');
    //   gl.uniform1i(u_SamplerFront, 0);
    //   gl.activeTexture(gl.TEXTURE0);
    //   // Flip the image Y coordinate
    //   gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    //   gl.bindTexture(gl.TEXTURE_2D, textureFront);
    //   // One of the dimensions is not a power of 2, so set the filtering to render it.
    //   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    //   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    //   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    //   // TODO fix texImage2D
    //   gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, View3d.image_front);
    //   // Textures dimensions
    //   View3d.wTexFront = View3d.image_front.width;
    //   View3d.hTexFront = View3d.image_front.height;
    // };
    // Require CORS
    // image_front.src = './textures/front.jpg';
    // Do not require CORS
    // View3d.image_front.src = window.document.getElementById("front").src;

    // Create a texture object Back
    var textureBack = gl.createTexture();
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, textureBack);
    // Placeholder One Pixel Color Yellow FDEC43
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0xFD, 0xEC, 0x43, 0xFF]));
    var u_SamplerBack = gl.getUniformLocation(gl.faceShaderProgram, 'u_SamplerBack');
    gl.uniform1i(u_SamplerBack, 1);

    // View3d.image_back = new Image();
    // View3d.image_back.onload = function(){
    //   gl.useProgram(gl.faceShaderProgram);
    //   var u_SamplerBack = gl.getUniformLocation(gl.faceShaderProgram, 'u_SamplerBack');
    //   gl.uniform1i(u_SamplerBack, 1);
    //   gl.activeTexture(gl.TEXTURE1);
    //   // Flip the image Y coordinate
    //   gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    //   gl.bindTexture(gl.TEXTURE_2D, textureBack);
    //   // One of the dimensions is not a power of 2, so set the filtering to render it.
    //   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    //   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    //   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    //   gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, View3d.image_back);
    //   // Textures dimensions
    //   View3d.wTexBack = View3d.image_back.width;
    //   View3d.hTexBack = View3d.image_back.height;
    // };
    // Require CORS
    // View3d.image_back.src = './textures/back.jpg';
    // Do not require CORS
    // View3d.image_back.src = window.document.getElementById("back").src;
  },

  // Perspective and background
  initPerspective:function () {
    const gl = this.gl;
    // Set the clear color and enable the depth test
    gl.clearColor(0xCC/0xFF, 0xE4/0xFF, 0xFF/0xFF, 0xFF/0xFF);  // Clear to light blue, 0xCCE4FF fully opaque
    gl.clearDepth(1.0);                 // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

    // Set view projection matrix
    this.resizeCanvasToDisplaySize(this.canvas3d);//, window.devicePixelRatio);
    gl.viewport(0, 0, this.canvas3d.width, this.canvas3d.height);
    gl.viewport(0, 0, this.canvas3d.width, this.canvas3d.height);
    // Model View Projection
    var mvp = View3d.g_MvpMatrix;
    // Choose
    var ratio = this.canvas3d.width / this.canvas3d.height;
    var fov = 40;
    var near = 50, far = 1200, top = 30, bottom = -30, left = -30, right = 30;
    if (ratio >= 1.0) {
      top = near * Math.tan(fov * (Math.PI / 360.0));
      bottom = -top;
      left = bottom * ratio;
      right = top * ratio;
    } else {
      right = near * Math.tan(fov * (Math.PI / 360.0));
      left = -right;
      top = right / ratio;
      bottom = left / ratio;
    }
    // Basic frustum at a distance of 700
    var dx = right - left;
    var dy = top - bottom;
    var dz = far - near;
    mvp[ 0] = 2*near/dx;       mvp[ 1] = 0;               mvp[ 2] = 0;                mvp[ 3] = 0;
    mvp[ 4] = 0;               mvp[ 5] = 2*near/dy;       mvp[ 6] = 0;                mvp[ 7] = 0;
    mvp[ 8] = (left+right)/dx; mvp[ 9] = (top+bottom)/dy; mvp[10] = -(far+near) / dz; mvp[11] = -1;
    mvp[12] = 0;               mvp[13] = 0;               mvp[14] = -2*near*far / dz; mvp[15] = 0;
  },

  // Resize canvas with client dimensions
  resizeCanvasToDisplaySize:function (canvas, multiplier) {
    multiplier   = multiplier || 1;
    const width  = canvas.clientWidth * multiplier | 0;
    const height = canvas.clientHeight * multiplier | 0;
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width  = width;
      canvas.height = height;
    }
  },

  // Mouse Handler
  initMouseListeners:function () {
    // Last position of the mouse
    View3d.lastX = -1;
    View3d.lastY = -1;
    View3d.touchtime = 0;
    this.canvas3d.addEventListener("mousedown", this.mousedown);
    this.canvas3d.addEventListener("mouseup", this.mouseup);
    this.canvas3d.addEventListener("mousemove", this.mousemove);
    this.canvas3d.addEventListener("touchstart", this.mousedown, {capture: true, passive: true} ); // For tactile screen
    this.canvas3d.addEventListener("touchend", this.mouseup, {capture: true, passive: true} );
    this.canvas3d.addEventListener("touchmove", this.mousemove, {capture: true, passive: true} );
  },
  // Mouse pressed
  mousedown:function (ev) {
    // For tactile devices no "dblclick"
    if (View3d.touchtime === 0) {
      View3d.touchtime = new Date().getTime();
    } else {
      if (( (new Date().getTime()) - View3d.touchtime) < 800) {
        View3d.currentAngle[0] = 0;
        View3d.currentAngle[1] = 0;
        View3d.scale           = 1;
        View3d.touchtime       = 0;
      } else {
        View3d.touchtime = new Date().getTime();
      }
    }
    ev.preventDefault();
    var touches = ev.changedTouches ? ev.changedTouches[0] : ev;
    const x     = touches.clientX;
    const y     = touches.clientY;
    // Start dragging
    const rect  = ev.target.getBoundingClientRect();
    if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
      View3d.lastX    = x;
      View3d.lastY    = y;
      View3d.dragging = true;
    }
  },
  // Mouse released
  mouseup:function (ev) {
    ev.preventDefault();
    View3d.dragging = false;
  },
  // Mouse move
  mousemove:function (ev) {
    ev.preventDefault();
    var touches = ev.changedTouches ? ev.changedTouches[ 0 ] : ev;
    const x    = touches.clientX;
    const y    = touches.clientY;
    if (View3d.dragging) {
      // Zoom with Shift on destop, two fingers on tactile
      if (ev.shiftKey || (ev.scale !== undefined && ev.scale !== 1) ) {
        if (ev.scale === undefined){
          // Zoom on desktop
          View3d.scale -= (y - View3d.lastY) / 300;
        } else {
          // Zoom on tactile
          View3d.scale = ev.scale;
        }
      } else {
        // Rotation
        const factor           = 300 / ev.target.height;
        const dx               = factor * (x - View3d.lastX);
        const dy               = factor * (y - View3d.lastY);
        View3d.currentAngle[0] = View3d.currentAngle[0] + dy;
        View3d.currentAngle[1] = View3d.currentAngle[1] + dx;
      }
    }
    View3d.lastX = x;
    View3d.lastY = y;
  },

  // Draw
  draw:function () {
    const gl = this.gl;
    this.resizeCanvasToDisplaySize(this.canvas3d);//, window.devicePixelRatio);

    // Faces with texture shader
    gl.useProgram(gl.faceShaderProgram);

    // Static ModelViewProjection Matrix multiply by X then Y then scale
    var m = View3d.g_MvpMatrix;
    var e = new Float32Array(16);
    // Rotation around X axis
    var s = Math.sin(View3d.currentAngle[0]/200);
    var c = Math.cos(View3d.currentAngle[0]/200);
    e[0] = m[0]; e[4] = c*m[4]+s*m[8];  e[8]  = c*m[8]-s*m[4];  e[12] = m[12];
    e[1] = m[1]; e[5] = c*m[5]+s*m[9];  e[9]  = c*m[9]-s*m[5];  e[13] = m[13];
    e[2] = m[2]; e[6] = c*m[6]+s*m[10]; e[10] = c*m[10]-s*m[9]; e[14] = m[14];
    e[3] = m[3]; e[7] = c*m[7]+s*m[11]; e[11] = c*m[11]-s*m[10];e[15] = m[15];
    // Rotation around Y axis
    var f = e.slice(0);
    s = Math.sin(View3d.currentAngle[1]/100);
    c = Math.cos(View3d.currentAngle[1]/100);
    f[0] = c*e[0]-s*e[8];  f[4] = e[4]; f[8]  = c*e[8]+s*e[0];  f[12] = e[12];
    f[1] = c*e[1]-s*e[9];  f[5] = e[5]; f[9]  = c*e[9]+s*e[1];  f[13] = e[13];
    f[2] = c*e[2]-s*e[10]; f[6] = e[6]; f[10] = c*e[10]+s*e[2]; f[14] = e[14];
    f[3] = c*e[3]-s*e[11]; f[7] = e[7]; f[11] = c*e[11]+s*e[3]; f[15] = e[15];
    // Scale
    s = View3d.scale;
    e[0] = s*f[0]; e[4] = s*f[4]; e[8] = s*f[8];   e[12] = s*f[12];
    e[1] = s*f[1]; e[5] = s*f[5]; e[9] = s*f[9];   e[13] = s*f[13];
    e[2] = s*f[2]; e[6] = s*f[6]; e[10] = s*f[10]; e[14] = s*f[14];
    e[3] = s*f[3]; e[7] = s*f[7]; e[11] = s*f[11]; e[15] = s*f[15];
    // Step back
    e[15] += 700;
    // Set matrix
    var u_MvMatrix = gl.getUniformLocation(gl.faceShaderProgram, 'u_MvMatrix');
    gl.uniformMatrix4fv(u_MvMatrix, false, e);

    // Clear and draw triangles
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // Front faces
    gl.activeTexture(gl.TEXTURE0);
    gl.cullFace(gl.BACK);
    gl.drawElements(gl.TRIANGLES, this.nbFacesVertice, gl.UNSIGNED_BYTE, 0);
    // Back faces
    gl.activeTexture(gl.TEXTURE1);
    gl.cullFace(gl.FRONT);
    gl.drawElements(gl.TRIANGLES, this.nbFacesVertice, gl.UNSIGNED_BYTE, 0);
  }
};

// Just for Node.js
if (NODE_ENV === true && typeof module !== 'undefined' && module.exports) {
  module.exports = View3d;
}