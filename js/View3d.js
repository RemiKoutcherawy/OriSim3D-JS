// File: js/View3d
"use strict";

// Dependencies : import them before View3d.js in browser
if (typeof module !== 'undefined' && module.exports) {
  var Model = require('./Model.js');
  var Matrix4 = require('./Matrix4.js');
}

// View3d Constructor
function View3d(model, canvas3d, canvas3dtext) {
  // Instance variables
  this.model  = model;
  this.canvas3d = canvas3d;
  this.canvas3dtext = canvas3dtext;
  this.gl = this.canvas3d.getContext('webgl');

  // Initialisation
  this.initWebGL();
  // Textures dimensions
  this.wTexFront = 0; //640/2; // 640x905 ou 400x566 ou 256x256
  this.hTexFront = 0; // 905/2;
  this.wTexBack = 0;  //640/2; // Bizarre 256 normalement
  this.hTexBack = 0;  //905/2;
}
// Face Vertex
View3d.FaceVertexShaderSrc =
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
      '  gl_FragColor = texture2D(u_SamplerFront, v_TexCoordFront);}\n'+
      'else { \n' +
      '  gl_FragColor = texture2D(u_SamplerBack, v_TexCoordBack); }\n' +
      '}\n';

// Static methods and variables
// Texture image load callback
View3d.loadTexture = function(gl, texture, u_Sampler, image) {
  // Flip the image Y coordinate
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  // One of the dimensions is not a power of 2, so set the filtering to render it.
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
};

// Current rotation angle ([x-axis, y-axis] degrees)
View3d.currentAngle = [0.0, 0.0];

// Model view projection matrix for Perspective and Current
View3d.g_MvpMatrix = new Matrix4();
View3d.g_MvCurrentMatrix = new Matrix4();

// Class methods
View3d.prototype = {
  constructor:View3d,

  // Intialization
  initWebGL:function () {
    this.initShaders();
    this.initTextures();
    this.initPerspective();
    this.initMouseListeners();
    // this.initBuffers();
  },
  // Shaders
  initShaders : function (){
    const gl = this.gl;
    // Face Shader Program
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
    gl.faceShaderProgram = faceShaderProgram;
    // Attributes
    const a_vertexPosAttribute = gl.getAttribLocation(faceShaderProgram, "a_Position");
    gl.enableVertexAttribArray(a_vertexPosAttribute);
    const textureCoordAttrFront = gl.getAttribLocation(faceShaderProgram, "a_TexCoordFront");
    gl.enableVertexAttribArray(textureCoordAttrFront);
    const textureCoordAttrBack = gl.getAttribLocation(faceShaderProgram, "a_TexCoordBack");
    gl.enableVertexAttribArray(textureCoordAttrBack);
  },
  // Buffers
  initBuffers : function (){
    const gl = this.gl;
    // Faces
    let vtx = []; // vertex
    let ftx = []; // front texture coords
    let btx = []; // back texture coords
    let fnr = []; // front normals coords
    let bnr = []; // back normals coords
    let fin = []; // front indices
    let bin = []; // back indices
    let index  = 0;

    for (let iFace = 0; iFace < this.model.faces.length ; iFace++ ) {
      let f = this.model.faces[iFace];
      let pts = f.points;
      // Normal needed for Offset
      f.computeFaceNormal();
      let n = f.normal;
      // Triangle FAN can be used only because of convex CCW face
      let c = pts[0]; // center
      let p = pts[1]; // previous
      for (let i = 2; i < pts.length; i++) {
        let s = f.points[i]; // second
        vtx.push(c.x + f.offset * n[0]);
        vtx.push(c.y + f.offset * n[1]);
        vtx.push(c.z + f.offset * n[2]);
        fnr.push(n[0]);  fnr.push(n[1]);  fnr.push(n[2]);
        bnr.push(-n[0]); bnr.push(-n[1]); bnr.push(-n[2]);
        // textures 
        ftx.push((200 + c.xf)/this.wTexFront);
        ftx.push((200 + c.yf)/this.hTexFront);
        btx.push((200 + c.xf)/this.wTexBack);
        btx.push((200 + c.yf)/this.hTexBack);
        // index
        fin.push(index);
        bin.push(index);
        index++;
        vtx.push(p.x + f.offset * n[0]);
        vtx.push(p.y + f.offset * n[1]);
        vtx.push(p.z + f.offset * n[2]);
        fnr.push(n[0]); fnr.push(n[1]); fnr.push(n[2]);
        bnr.push(-n[0]); bnr.push(-n[1]); bnr.push(-n[2]);
        // textures 
        ftx.push((200 + p.xf)/this.wTexFront);
        ftx.push((200 + p.yf)/this.hTexFront);
        btx.push((200 + p.xf)/this.wTexBack);
        btx.push((200 + p.yf)/this.hTexBack);
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
        ftx.push((200 + s.xf)/this.wTexFront);
        ftx.push((200 + s.yf)/this.hTexFront);
        btx.push((200 + s.xf)/this.wTexBack);
        btx.push((200 + s.yf)/this.hTexBack);
        // index Note -1 for back face index
        fin.push(index);
        bin.push(index - 1);
        index++;
        // next triangle
        p = s;
      }
    }

    // Face Buffers
    let vertices = new Float32Array(vtx);
    let texCoordsFront = new Float32Array(ftx);
    let texCoordsBack  = new Float32Array(btx);
    this.initArrayBuffer(gl, gl.faceShaderProgram, vertices, 3, gl.FLOAT, 'a_Position');
    this.initArrayBuffer(gl, gl.faceShaderProgram, texCoordsFront, 2, gl.FLOAT, 'a_TexCoordFront');
    this.initArrayBuffer(gl, gl.faceShaderProgram, texCoordsBack, 2, gl.FLOAT, 'a_TexCoordBack');
    // Indices buffer
    let faceVertexIndicesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,faceVertexIndicesBuffer);
    let faceVertexIndicesArray = new Uint8Array(fin);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, faceVertexIndicesArray, gl.STATIC_DRAW);

    // Used in draw()
    this.nbFacesVertice = faceVertexIndicesArray.length;
  },
  
  // Create Buffer Arrays and assign to attribute
   initArrayBuffer:function (gl, program, data, num, type, attribute) {
    let buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    let a_attribute = gl.getAttribLocation(program, attribute);
    gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
    gl.enableVertexAttribArray(a_attribute);
  },

  // Textures
  initTextures : function () {
    const gl = this.gl;

    // Create a texture object Front
    let textureFront = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, textureFront);
    // Placeholder One Pixel red
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 0, 0, 255]));
    let image_front = new Image();
    let that  = this;
    image_front.onload = function(){
      gl.useProgram(gl.faceShaderProgram);
      let u_SamplerFront = gl.getUniformLocation(gl.faceShaderProgram, 'u_SamplerFront');
      gl.uniform1i(u_SamplerFront, 0);
      gl.activeTexture(gl.TEXTURE0);
      View3d.loadTexture(gl, textureFront, u_SamplerFront, image_front, 0 );
      // Textures dimensions
      that.wTexFront = 400; //image_front.width;
      that.hTexFront = 400; //image_front.height;
    };
    // image_front.src = './textures/hulk400x566.jpg'; // PinUpBrown PinUpBlue
    image_front.src = './textures/PinUpBlue.jpg';

    // Create a texture object Back
    let textureBack = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, textureBack);
    // Placeholder OnePixel green
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 255, 0, 255]));
    let image_back = new Image();
    image_back.onload = function(){
      gl.useProgram(gl.faceShaderProgram);
      let u_SamplerBack = gl.getUniformLocation(gl.faceShaderProgram, 'u_SamplerBack');
      gl.uniform1i(u_SamplerBack, 1);
      gl.activeTexture(gl.TEXTURE1);
      View3d.loadTexture(gl, textureBack, u_SamplerBack, image_back, 1 );
      // Textures dimensions
      that.wTexBack = 400; //image_back.width;
      that.hTexBack = 400; //image_back.height;
    };
    // image_back.src = './textures/cocotte320x320.jpg';
    image_back.src = './textures/PinUpBrown.jpg';
  },

  // Perspective and background
  initPerspective:function () {
    const gl = this.gl;
    // Set the clear color and enable the depth test
    gl.clearColor(1.0, 1.0, 1.0, 1.0);  // Clear to white, fully opaque
    gl.clearDepth(1.0);                 // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

    // Set view projection matrix
    this.resizeCanvasToDisplaySize(this.canvas3d);//, window.devicePixelRatio);
    gl.viewport(0, 0, this.canvas3d.width, this.canvas3d.height);
    gl.viewport(0, 0, this.canvas3d.width, this.canvas3d.height);

    let viewProjMatrix = new Matrix4();
    viewProjMatrix.setPerspective(50.0, this.canvas3d.width / this.canvas3d.height, 1.0, 10000.0);

    // From EyeX, EyeY, EyeZ to 0,0,0 Up 0,1,0
    viewProjMatrix.lookAt(0,0,500, 0,0,0, 0,1,0);
    View3d.g_MvpMatrix.set(viewProjMatrix);
  },

  // Resize canvas with client dimensions
  resizeCanvasToDisplaySize : function (canvas, multiplier) {
    multiplier = multiplier || 1;
    const width  = canvas.clientWidth  * multiplier | 0;
    const height = canvas.clientHeight * multiplier | 0;
    if (canvas.width !== width ||  canvas.height !== height) {
      canvas.width  = width;
      canvas.height = height;
      return true;
    }
    return false;
  },

  // Mouse Handler
  initMouseListeners:function () {
    // Last position of the mouse
    View3d.lastX = -1;
    View3d.lastY = -1;
    this.canvas3dtext.addEventListener("mousedown", this.mousedown);
    this.canvas3dtext.addEventListener("mouseup", this.mouseup);
    this.canvas3dtext.addEventListener("mousemove", this.mousemove);
    this.canvas3dtext.addEventListener("dblclick", this.dblclick);
  },
  // Mouse pressed
  mousedown:function (ev) {
    const x    = ev.clientX;
    const y    = ev.clientY;
    // Start dragging
    const rect = ev.target.getBoundingClientRect();
    if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
      View3d.lastX    = x;
      View3d.lastY    = y;
      View3d.dragging = true;
    }
  },
  // Mouse released
  mouseup:function () {
    View3d.dragging = false;
  },
  // Mouse move
  mousemove:function (ev) {
    const x = ev.clientX;
    const y = ev.clientY;
    if (View3d.dragging) {
      const factor           = 200 / ev.target.height; // The rotation ratio
      const dx               = factor * (x - View3d.lastX);
      const dy               = factor * (y - View3d.lastY);
      // Limit x-axis rotation angle to -90 to 90 degrees
      View3d.currentAngle[0] = View3d.currentAngle[0] + dy; //Math.max(Math.min(View3d.currentAngle[0] + dy, 90.0), -90.0);
      View3d.currentAngle[1] = View3d.currentAngle[1] + dx;
    }
    View3d.lastX = x;
    View3d.lastY = y;
  },
  // Mouse double click
  dblclick:function () {
      View3d.currentAngle[0] = 0;
      View3d.currentAngle[1] = 0;
  },

  // Draw
  draw : function() {
    const gl = this.gl;
    this.resizeCanvasToDisplaySize(this.canvas3d);//, window.devicePixelRatio);

    // Faces with texture shader
    gl.useProgram(gl.faceShaderProgram);

    // Static ModelViewProjection Matrix
    View3d.g_MvCurrentMatrix.set(View3d.g_MvpMatrix);
    View3d.g_MvCurrentMatrix.rotate(View3d.currentAngle[0], 1.0, 0.0, 0.0);
    View3d.g_MvCurrentMatrix.rotate(View3d.currentAngle[1], 0.0, 1.0, 0.0);
    let u_MvMatrix = gl.getUniformLocation(gl.faceShaderProgram, 'u_MvMatrix');
    gl.uniformMatrix4fv(u_MvMatrix, false, View3d.g_MvCurrentMatrix.elements);

    // Clear and draw triangles
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // Front face
    gl.activeTexture(gl.TEXTURE0);
    gl.cullFace(gl.BACK);
    gl.drawElements(gl.TRIANGLES, this.nbFacesVertice, gl.UNSIGNED_BYTE, 0);
    // Back face
    gl.activeTexture(gl.TEXTURE1);
    gl.cullFace(gl.FRONT);
    gl.drawElements(gl.TRIANGLES, this.nbFacesVertice, gl.UNSIGNED_BYTE, 0);

    // text canvas overlapping
    let ctx = this.canvas3dtext.getContext("2d");
    const width  = this.canvas3d.clientWidth;
    const height = this.canvas3d.clientHeight; // 700 x 300
    if (this.canvas3dtext.width !== width ||  this.canvas3dtext.height !== height) {
      this.canvas3dtext.width  = width;
      this.canvas3dtext.height = height;
    }

    // var point = [100, 0, 0, 1];
    // var clipspace = View3d.g_MvCurrentMatrix.transformVector(point);
    // clipspace[0] /= clipspace[3];
    // clipspace[1] /= clipspace[3];
    // var pixelX = (clipspace[0] *  0.5 + 0.5) * gl.canvas.width;
    // var pixelY = (clipspace[1] * -0.5 + 0.5) * gl.canvas.height;
    // // ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillText("Message", 100, 100);
  }
};

// Just for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = View3d;
}