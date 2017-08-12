// File: js/View3d.js
// Dependencies : import them before View3d.js in browser
if (typeof module !== 'undefined' && module.exports) {
  var Model = require('./Model.js');
  var Matrix4 = require('./Matrix4.js');
}

// View3d Constructor
function View3d(model, canvas3d, canvas3dtext) {
  // Instance variables
  this.model        = model;
  this.canvas3d     = canvas3d;
  this.canvas3dtext = canvas3dtext;
  this.gl           = this.canvas3d.getContext('webgl');

  // Initialisation
  this.initWebGL();

  // Textures dimensions
  this.wTexFront = 0; //640/2; // 640x905 ou 400x566 ou 256x256
  this.hTexFront = 0; // 905/2;
  this.wTexBack  = 0; //640/2; // Bizarre 256 normalement
  this.hTexBack  = 0; //905/2;
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

// Static methods
// Texture image load callback
View3d.loadTexture = function (gl, texture, u_Sampler, image) {
  // Flip the image Y coordinate
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  // One of the dimensions is not a power of 2, so set the filtering to render it.
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
};

// Static variables
// Current rotation angle ([x-axis, y-axis] degrees)
View3d.currentAngle = [0.0, 0.0];
View3d.scale        = 1.0;
// Model view projection matrix for Perspective and Current
View3d.g_MvpMatrix       = new Matrix4();
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
    // this.initBuffers(); // No need here, will be called by requestAnimationFrame
  },
  // Shaders
  initShaders:function () {
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
        ftx.push((200 + c.xf) / this.wTexFront);
        ftx.push((200 + c.yf) / this.hTexFront);
        btx.push((200 + c.xf) / this.wTexBack);
        btx.push((200 + c.yf) / this.hTexBack);
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
        ftx.push((200 + s.xf) / this.wTexFront);
        ftx.push((200 + s.yf) / this.hTexFront);
        btx.push((200 + s.xf) / this.wTexBack);
        btx.push((200 + s.yf) / this.hTexBack);
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

    // Create a texture object Front
    var textureFront = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, textureFront);
    // Placeholder One Pixel Color Blue A5CAFF 70ACF3 145, 199, 255
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0x70, 0xAC, 0xF3, 255]));
    var image_front = new Image();
    var that  = this;
    image_front.onload = function(){
      gl.useProgram(gl.faceShaderProgram);
      var u_SamplerFront = gl.getUniformLocation(gl.faceShaderProgram, 'u_SamplerFront');
      gl.uniform1i(u_SamplerFront, 0);
      gl.activeTexture(gl.TEXTURE0);
      View3d.loadTexture(gl, textureFront, u_SamplerFront, image_front, 0 );
      // Textures dimensions
      // TODO Fix me
      // console.log("front w:"+image_front.width+" h:"+image_front.height);
      that.wTexFront = 400; //image_front.width;
      that.hTexFront = 400; //image_front.height;
    };
    // Require CORS
    image_front.src = './textures/front.jpg';
    // Do not require CORS
    // image_front.src = window.document.getElementById("front").src;

    // Create a texture object Back
    var textureBack = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, textureBack);
    // Placeholder One Pixel Color Yellow FFFF7A F3EE1B 255, 249, 145
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0xF3, 0xEE, 0x145, 255]));
    var image_back = new Image();
    image_back.onload = function(){
      gl.useProgram(gl.faceShaderProgram);
      var u_SamplerBack = gl.getUniformLocation(gl.faceShaderProgram, 'u_SamplerBack');
      gl.uniform1i(u_SamplerBack, 1);
      gl.activeTexture(gl.TEXTURE1);
      View3d.loadTexture(gl, textureBack, u_SamplerBack, image_back, 1 );
      // Textures dimensions
      // TODO Fix me
      // console.log("back w:"+image_back.width+" h:"+image_back.height);
      that.wTexBack = 400; //image_back.width;
      that.hTexBack = 400; //image_back.height;
    };
    // Require CORS
    image_back.src = './textures/back.jpg';
    // Do not require CORS
    // image_back.src = window.document.getElementById("back").src;
  },

  // Perspective and background
  initPerspective:function () {
    const gl = this.gl;
    // Set the clear color and enable the depth test
    gl.clearColor(0xAB/255.0, 0xD1/255.0, 0xFF/255.0, 0xFF/255.0);  // Clear to light blue, fully opaque
    gl.clearDepth(1.0);                 // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

    // Set view projection matrix
    this.resizeCanvasToDisplaySize(this.canvas3d);//, window.devicePixelRatio);
    gl.viewport(0, 0, this.canvas3d.width, this.canvas3d.height);
    gl.viewport(0, 0, this.canvas3d.width, this.canvas3d.height);

    var viewProjMatrix = new Matrix4();
    if (this.canvas3d.width > this.canvas3d.height) {
      viewProjMatrix.setPerspective(50.0, this.canvas3d.width / this.canvas3d.height, 1.0, 10000.0);
    } else {
      viewProjMatrix.setPerspective(70.0, this.canvas3d.width / this.canvas3d.height, 1.0, 10000.0);
    }

    // From EyeX, EyeY, EyeZ to 0,0,0 Up 0,1,0
    viewProjMatrix.lookAt(0,0,500, 0,0,0, 0,1,0);
    View3d.g_MvpMatrix.set(viewProjMatrix);
  },

  // Resize canvas with client dimensions
  resizeCanvasToDisplaySize:function (canvas, multiplier) {
    multiplier   = multiplier || 1;
    const width  = canvas.clientWidth * multiplier | 0;
    const height = canvas.clientHeight * multiplier | 0;
    if (canvas.width !== width || canvas.height !== height) {
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
    View3d.touchtime = 0;
    this.canvas3dtext.addEventListener("mousedown", this.mousedown);
    this.canvas3dtext.addEventListener("mouseup", this.mouseup);
    this.canvas3dtext.addEventListener("mousemove", this.mousemove);
    this.canvas3dtext.addEventListener("touchstart", this.mousedown, false ); // For tactile screen
    this.canvas3dtext.addEventListener("touchend", this.mouseup, false );
    this.canvas3dtext.addEventListener("touchmove", this.mousemove, false );
  },
  // Mouse pressed
  mousedown:function (ev) {
    // For tactile devices "dblclick"
    if (View3d.touchtime == 0) {
      View3d.touchtime = new Date().getTime();
    } else {
      if (( (new Date().getTime()) - View3d.touchtime) < 800) {
        View3d.currentAngle[0] = 0;
        View3d.currentAngle[1] = 0;
        View3d.scale           = 1.0;
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

    // Static ModelViewProjection Matrix updated with currentAngle
    View3d.g_MvCurrentMatrix.set(View3d.g_MvpMatrix);
    View3d.g_MvCurrentMatrix.rotate(View3d.currentAngle[0], 1.0, 0.0, 0.0);
    View3d.g_MvCurrentMatrix.rotate(View3d.currentAngle[1], 0.0, 1.0, 0.0);
    View3d.g_MvCurrentMatrix.scale(View3d.scale, View3d.scale, View3d.scale);
    var u_MvMatrix = gl.getUniformLocation(gl.faceShaderProgram, 'u_MvMatrix');
    gl.uniformMatrix4fv(u_MvMatrix, false, View3d.g_MvCurrentMatrix.elements);

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
if (typeof module !== 'undefined' && module.exports) {
  module.exports = View3d;
}