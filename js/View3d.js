// File: js/View3d.js
// Dependencies : import them before View3d.js in browser
if (NODE_ENV === true && typeof module !== 'undefined' && module.exports) {
  var Model = require('./Model.js');
}

// View3d
function View3d (modele, canvas3dElt) {
  // Instance variables
  var model        = modele;
  var canvas3d     = canvas3dElt;
  var nbFacesVertice = 0;
  var gl           = canvas3d.getContext('webgl') || canvas3d.getContext('experimental-webgl');
  var scope = this;

  // Initialisation
  initWebGL();

  // Intialization
  function initWebGL () {
    initShaders();
    initTextures();
    initPerspective();
    initMouseListeners();
    // this.initBuffers(); // No need here, will be called by requestAnimationFrame
  }

  // Shaders
  function initShaders () {
    // Vertex
    const vxShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vxShader, vsSource);
    gl.compileShader(vxShader);
    if (!gl.getShaderParameter(vxShader, gl.COMPILE_STATUS)) {
      alert("An error occurred compiling the shader: " + gl.getShaderInfoLog(vxShader));
      gl.deleteShader(vxShader);
    }

    // Fragment
    const fgShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fgShader, fsSource);
    gl.compileShader(fgShader);
    if (!gl.getShaderParameter(fgShader, gl.COMPILE_STATUS)) {
      alert("An error occurred compiling the shader: " + gl.getShaderInfoLog(fgShader));
      gl.deleteShader(fgShader);
    }

    // Create the shader program
    const program = gl.createProgram();
    gl.attachShader(program, vxShader);
    gl.attachShader(program, fgShader);
    gl.linkProgram(program);

    // Use it and copy it in an attribute of gl
    gl.useProgram(program);
    gl.program  = program;
  }
  // Buffers
  function initBuffers () {
    // Faces
    var vtx   = []; // vertex
    var ftx   = []; // front texture coords
    var btx   = []; // back texture coords
    var fnr   = []; // front normals coords
    var bnr   = []; // back normals coords Not used for now
    var fin   = []; // front indices
    var bin   = []; // back indices
    var index = 0;

    for (var iFace = 0; iFace < model.faces.length; iFace++) {
      var f   = model.faces[iFace];
      var pts = f.points;
      // Normal needed for Offset and used for lightning
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
    initArrayBuffer(gl, vertices, 3, gl.FLOAT, 'aVertexPosition');
    initArrayBuffer(gl, texCoordsFront, 2, gl.FLOAT, 'aTexCoordFront');
    initArrayBuffer(gl, texCoordsBack,  2, gl.FLOAT, 'aTexCoordBack');

    // Indices buffer
    var faceVertexIndicesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, faceVertexIndicesBuffer);
    var faceVertexIndicesArray = new Uint8Array(fin);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, faceVertexIndicesArray, gl.STATIC_DRAW);

    // Normals buffer
    var normals  = new Float32Array(fnr);
    initArrayBuffer(gl, normals, 3, gl.FLOAT, 'aVertexNormal');

    // Used in draw()
    nbFacesVertice = faceVertexIndicesArray.length;
  }
  // Create Buffer Arrays and assign to attribute
  function initArrayBuffer (gl, data, num, type, attribute) {
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    var a_attribute = gl.getAttribLocation(gl.program, attribute);
    gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
    gl.enableVertexAttribArray(a_attribute);
  }
  // Textures
  function initTextures () {
    // Create a texture object Front
    var textureFront = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textureFront);
    // Placeholder One Pixel Color Blue 70ACF3
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0x70, 0xAC, 0xF3, 255]));
    var samplerFront = gl.getUniformLocation(gl.program, 'uSamplerFront');
    gl.uniform1i(samplerFront, 0);

    View3d.imageFront = new Image();
    View3d.imageFront.onload = function() {
      gl.activeTexture(gl.TEXTURE0);
      // Flip the image Y coordinate
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
      gl.bindTexture(gl.TEXTURE_2D, textureFront);
      // One of the dimensions is not a power of 2, so set the filtering to render it.
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, View3d.imageFront);
      // Textures dimensions
      View3d.wTexFront = View3d.imageFront.width;
      View3d.hTexFront = View3d.imageFront.height;
      // Recompute texture coords
      initBuffers();
    };
    // Require CORS
    // View3d.imageFront.src = './textures/front.jpg';
    // Does not require CORS, use if image is inlined in html
    if (window.document.getElementById("front")){
      View3d.imageFront.src = window.document.getElementById("front").src;
    }

    // Create a texture object Back
    var textureBack = gl.createTexture();
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, textureBack);
    // Placeholder One Pixel Color Yellow FDEC43
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0xFD, 0xEC, 0x43, 0xFF]));
    var samplerBack = gl.getUniformLocation(gl.program, 'uSamplerBack');
    gl.uniform1i(samplerBack, 1);

    View3d.imageBack = new Image();
    View3d.imageBack.onload = function(){
      gl.activeTexture(gl.TEXTURE1);
      // Flip the image Y coordinate
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
      gl.bindTexture(gl.TEXTURE_2D, textureBack);
      // One of the dimensions is not a power of 2, so set the filtering to render it.
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, View3d.imageBack);
      // Textures dimensions
      View3d.wTexBack = View3d.imageBack.width;
      View3d.hTexBack = View3d.imageBack.height;
      // Recompute texture coords
      initBuffers();
    };
    // Require CORS
    // View3d.imageBack.src = './textures/back.jpg';
    // Does not require CORS if image is inlined
    if (window.document.getElementById("back")) {
      View3d.imageBack.src = window.document.getElementById("back").src;
    }
  }
  // Perspective and background
  function initPerspective () {
    // Set the clear color and enable the depth test
    gl.clearColor(0xCC/0xFF, 0xE4/0xFF, 0xFF/0xFF, 0xFF/0xFF);  // Clear to light blue, 0xCCE4FF fully opaque
    gl.clearDepth(1.0);                 // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

    // Set view projection matrix
    resizeCanvasToDisplaySize();//, window.devicePixelRatio);
    gl.viewport(0, 0, canvas3d.width, canvas3d.height);
    gl.viewport(0, 0, canvas3d.width, canvas3d.height);

    // Model View Projection Matrix
    var mvp = View3d.projectionMatrix;

    // Choose portrait or landscape
    var ratio = canvas3d.width / canvas3d.height;
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

    // Step back
    mvp[15] += 700;

    // Set projection matrix
    var projectionMatrix = gl.getUniformLocation(gl.program, 'uProjectionMatrix');
    gl.uniformMatrix4fv(projectionMatrix, false, mvp);
  }

  // Resize canvas with client dimensions
  function resizeCanvasToDisplaySize (multiplier) {
    multiplier   = multiplier || 1;
    const width  = canvas3d.clientWidth * multiplier | 0;
    const height = canvas3d.clientHeight * multiplier | 0;
    if (canvas3d.width !== width || canvas3d.height !== height) {
      canvas3d.width  = width;
      canvas3d.height = height;
    }
  }

  // Mouse Handler
  function initMouseListeners () {
    // Last position of the mouse
    View3d.lastX = -1;
    View3d.lastY = -1;
    View3d.touchtime = 0;
    canvas3d.addEventListener("mousedown", mousedown);
    canvas3d.addEventListener("mouseup", mouseup);
    canvas3d.addEventListener("mousemove", mousemove);
    canvas3d.addEventListener("touchstart", mousedown, {capture: true, passive: false} ); // For tactile screen
    canvas3d.addEventListener("touchend", mouseup, {capture: true, passive: false} );
    canvas3d.addEventListener("touchmove", mousemove, {capture: true, passive: false} );
  }

  // Mouse pressed
  function mousedown (ev) {
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
  }

  // Mouse released
  function mouseup (ev) {
    ev.preventDefault();
    View3d.dragging = false;
  }

  // Mouse move
  function mousemove (ev) {
    ev.preventDefault();
    var touches = ev.changedTouches ? ev.changedTouches[ 0 ] : ev;
    const x    = touches.clientX;
    const y    = touches.clientY;
    if (View3d.dragging) {
      // Zoom with Shift on destop, two fingers on tactile
      if (ev.shiftKey || (ev.scale !== undefined && ev.scale !== 1) ) {
        if (ev.scale === undefined){
          // Zoom on desktop
          View3d.scale += (y - View3d.lastY) / 300.0;
          View3d.scale = Math.max(View3d.scale, 0.0);
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
  }

  // Draw
  function draw () {
    resizeCanvasToDisplaySize();//, window.devicePixelRatio);

    // Faces with texture shader
    gl.useProgram(gl.program);

    // Current Model View for object
    var e = View3d.modelViewMatrix;

    // Rotation around X axis -> e
    var s = Math.sin(View3d.currentAngle[0]/200);
    var c = Math.cos(View3d.currentAngle[0]/200);
    e[0] = 1; e[4] = 0;  e[8] = 0;  e[12] = 0;
    e[1] = 0; e[5] = c;  e[9] = -s; e[13] = 0;
    e[2] = 0; e[6] = s; e[10] = c;  e[14] = 0;
    e[3] = 0; e[7] = 0; e[11] = 0;  e[15] = 1;

    // Rotation around Y axis e -> f
    var f = e.slice(0); // or new Float32Array(16);
    s = Math.sin(View3d.currentAngle[1]/100);
    c = Math.cos(View3d.currentAngle[1]/100);
    f[0] = c*e[0]-s*e[8];  f[4] = e[4]; f[8]  = c*e[8]+s*e[0];  f[12] = e[12];
    f[1] = c*e[1]-s*e[9];  f[5] = e[5]; f[9]  = c*e[9]+s*e[1];  f[13] = e[13];
    f[2] = c*e[2]-s*e[10]; f[6] = e[6]; f[10] = c*e[10]+s*e[2]; f[14] = e[14];
    f[3] = c*e[3]-s*e[11]; f[7] = e[7]; f[11] = c*e[11]+s*e[3]; f[15] = e[15];

    // Scale f -> e and use e
    var sc = View3d.scale;
    e[0] = sc*f[0]; e[4] = sc*f[4]; e[8] = sc*f[8];   e[12] = f[12];
    e[1] = sc*f[1]; e[5] = sc*f[5]; e[9] = sc*f[9];   e[13] = f[13];
    e[2] = sc*f[2]; e[6] = sc*f[6]; e[10] = sc*f[10]; e[14] = f[14];
    e[3] = f[3]; e[7] = f[7]; e[11] = f[11]; e[15] = f[15];
    var umv = gl.getUniformLocation(gl.program, 'uModelViewMatrix');
    gl.uniformMatrix4fv(umv, false, e);

    // Clear and draw triangles
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Front faces
    gl.activeTexture(gl.TEXTURE0);
    gl.cullFace(gl.BACK);
    gl.drawElements(gl.TRIANGLES, nbFacesVertice, gl.UNSIGNED_BYTE, 0);

    // Back faces
    gl.activeTexture(gl.TEXTURE1);
    gl.cullFace(gl.FRONT);
    gl.drawElements(gl.TRIANGLES, nbFacesVertice, gl.UNSIGNED_BYTE, 0);
  }

  // API
  this.initBuffers = initBuffers;
  this.draw = draw;

}
// Vertex shader program
const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec3 aVertexNormal;
    attribute vec2 aTexCoordFront;
    attribute vec2 aTexCoordBack;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying highp vec2 vTexCoordFront;
    varying highp vec2 vTexCoordBack;
    varying highp vec3 vLighting;
    varying vec4 vPos;

    void main(void) {
      // Vertex position
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vPos = gl_Position;

      // Pass to fragment
      vTexCoordFront = aTexCoordFront;
      vTexCoordBack  = aTexCoordBack;

      // Lighting transform normal and dot with direction
      highp vec3 lightColor = vec3(0.8, 0.8, 0.8); 
      highp vec3 direction = vec3(0.0, 0.0, 1.0);  
      highp vec4 normal = normalize(uModelViewMatrix * vec4(aVertexNormal, 1.0));
      // dot product is negative for back face
      highp float dot = dot(normal.xyz, direction);
      
      // Pass to fragment
      vLighting = lightColor * dot;
    }
  `;

// Fragment shader program
const fsSource = `
    precision highp float;

    varying highp vec2 vTexCoordFront;
    varying highp vec2 vTexCoordBack;
    varying highp vec3 vLighting;
    
    uniform sampler2D uSamplerFront;
    uniform sampler2D uSamplerBack;

    void main(void) {
      highp vec4 texelColor;
      vec3 normal;
      if (gl_FrontFacing) {
        texelColor = texture2D(uSamplerFront, vTexCoordFront);
        normal = texelColor.rgb * vLighting;
      } else {
        texelColor = texture2D(uSamplerBack,  vTexCoordBack);
        normal = texelColor.rgb * vLighting * -1.0;
      }
      // Ambiant
      vec3 ambiant = texelColor.rgb * 0.5;
      // Ambiant + normal
      gl_FragColor = vec4(ambiant + normal, texelColor.a);
    }
  `;

// Current rotation angle ([x-axis, y-axis] degrees)
View3d.currentAngle = [0.0, 0.0];
View3d.scale        = 1.0;

// Projection and model view matrix for Perspective and Current
View3d.projectionMatrix = new Float32Array(16);
View3d.modelViewMatrix  = new Float32Array(16);

// Textures dimensions
View3d.wTexFront = 1;
View3d.hTexFront = 1;
View3d.wTexBack  = 1;
View3d.hTexBack  = 1;

// Just for Node.js
if (NODE_ENV === true && typeof module !== 'undefined' && module.exports) {
  module.exports = View3d;
}