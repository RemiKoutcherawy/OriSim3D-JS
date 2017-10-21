function View3d(t,e){function n(){const t=d.createShader(d.VERTEX_SHADER);d.shaderSource(t,vsSource),d.compileShader(t),d.getShaderParameter(t,d.COMPILE_STATUS)||(alert("An error occurred compiling the shader: "+d.getShaderInfoLog(t)),d.deleteShader(t));const e=d.createShader(d.FRAGMENT_SHADER);d.shaderSource(e,fsSource),d.compileShader(e),d.getShaderParameter(e,d.COMPILE_STATUS)||(alert("An error occurred compiling the shader: "+d.getShaderInfoLog(e)),d.deleteShader(e));const n=d.createProgram();d.attachShader(n,t),d.attachShader(n,e),d.linkProgram(n),d.useProgram(n),d.program=n}function i(){for(var e=[],n=[],i=[],o=[],a=[],s=[],h=[],l=0,c=0;c<t.faces.length;c++){var u=t.faces[c],f=u.points;u.computeFaceNormal();for(var g=u.normal,m=f[0],x=f[1],v=2;v<f.length;v++){var y=u.points[v];e.push(m.x+u.offset*g[0]),e.push(m.y+u.offset*g[1]),e.push(m.z+u.offset*g[2]),o.push(g[0]),o.push(g[1]),o.push(g[2]),a.push(-g[0]),a.push(-g[1]),a.push(-g[2]),n.push((200+m.xf)/View3d.wTexFront),n.push((200+m.yf)/View3d.hTexFront),i.push((200+m.xf)/View3d.wTexBack),i.push((200+m.yf)/View3d.hTexBack),s.push(l),h.push(l),l++,e.push(x.x+u.offset*g[0]),e.push(x.y+u.offset*g[1]),e.push(x.z+u.offset*g[2]),o.push(g[0]),o.push(g[1]),o.push(g[2]),a.push(-g[0]),a.push(-g[1]),a.push(-g[2]),n.push((200+x.xf)/View3d.wTexFront),n.push((200+x.yf)/View3d.hTexFront),i.push((200+x.xf)/View3d.wTexBack),i.push((200+x.yf)/View3d.hTexBack),s.push(l),h.push(l+1),l++,e.push(y.x+u.offset*g[0]),e.push(y.y+u.offset*g[1]),e.push(y.z+u.offset*g[2]),o.push(g[0]),o.push(g[1]),o.push(g[2]),a.push(-g[0]),a.push(-g[1]),a.push(-g[2]),n.push((200+y.xf)/View3d.wTexFront),n.push((200+y.yf)/View3d.hTexFront),i.push((200+y.xf)/View3d.wTexBack),i.push((200+y.yf)/View3d.hTexBack),s.push(l),h.push(l-1),l++,x=y}}var w=new Float32Array(e),P=new Float32Array(n),S=new Float32Array(i);r(d,w,3,d.FLOAT,"aVertexPosition"),r(d,P,2,d.FLOAT,"aTexCoordFront"),r(d,S,2,d.FLOAT,"aTexCoordBack");var E=d.createBuffer();d.bindBuffer(d.ELEMENT_ARRAY_BUFFER,E);var T=new Uint8Array(s);d.bufferData(d.ELEMENT_ARRAY_BUFFER,T,d.STATIC_DRAW);var A=new Float32Array(o);r(d,A,3,d.FLOAT,"aVertexNormal"),p=T.length}function r(t,e,n,i,r){var o=t.createBuffer();t.bindBuffer(t.ARRAY_BUFFER,o),t.bufferData(t.ARRAY_BUFFER,e,t.STATIC_DRAW);var a=t.getAttribLocation(t.program,r);t.vertexAttribPointer(a,n,i,!1,0,0),t.enableVertexAttribArray(a)}function o(){var t=d.createTexture();d.activeTexture(d.TEXTURE0),d.bindTexture(d.TEXTURE_2D,t),d.texImage2D(d.TEXTURE_2D,0,d.RGBA,1,1,0,d.RGBA,d.UNSIGNED_BYTE,new Uint8Array([112,172,243,255]));var e=d.getUniformLocation(d.program,"uSamplerFront");d.uniform1i(e,0),View3d.imageFront=new Image,View3d.imageFront.onload=function(){d.activeTexture(d.TEXTURE0),d.pixelStorei(d.UNPACK_FLIP_Y_WEBGL,1),d.bindTexture(d.TEXTURE_2D,t),d.texParameteri(d.TEXTURE_2D,d.TEXTURE_WRAP_S,d.CLAMP_TO_EDGE),d.texParameteri(d.TEXTURE_2D,d.TEXTURE_WRAP_T,d.CLAMP_TO_EDGE),d.texParameteri(d.TEXTURE_2D,d.TEXTURE_MIN_FILTER,d.LINEAR),d.texImage2D(d.TEXTURE_2D,0,d.RGB,d.RGB,d.UNSIGNED_BYTE,View3d.imageFront),View3d.wTexFront=View3d.imageFront.width,View3d.hTexFront=View3d.imageFront.height,i()},window.document.getElementById("front")&&(View3d.imageFront.src=window.document.getElementById("front").src);var n=d.createTexture();d.activeTexture(d.TEXTURE1),d.bindTexture(d.TEXTURE_2D,n),d.texImage2D(d.TEXTURE_2D,0,d.RGBA,1,1,0,d.RGBA,d.UNSIGNED_BYTE,new Uint8Array([253,236,67,255]));var r=d.getUniformLocation(d.program,"uSamplerBack");d.uniform1i(r,1),View3d.imageBack=new Image,View3d.imageBack.onload=function(){d.activeTexture(d.TEXTURE1),d.pixelStorei(d.UNPACK_FLIP_Y_WEBGL,1),d.bindTexture(d.TEXTURE_2D,n),d.texParameteri(d.TEXTURE_2D,d.TEXTURE_WRAP_S,d.CLAMP_TO_EDGE),d.texParameteri(d.TEXTURE_2D,d.TEXTURE_WRAP_T,d.CLAMP_TO_EDGE),d.texParameteri(d.TEXTURE_2D,d.TEXTURE_MIN_FILTER,d.LINEAR),d.texImage2D(d.TEXTURE_2D,0,d.RGB,d.RGB,d.UNSIGNED_BYTE,View3d.imageBack),View3d.wTexBack=View3d.imageBack.width,View3d.hTexBack=View3d.imageBack.height,i()},window.document.getElementById("back")&&(View3d.imageBack.src=window.document.getElementById("back").src)}function a(){d.clearColor(.8,228/255,1,1),d.clearDepth(1),d.enable(d.DEPTH_TEST),d.depthFunc(d.LEQUAL),s(),d.viewport(0,0,e.width,e.height),d.viewport(0,0,e.width,e.height);var t=View3d.projectionMatrix,n=e.width/e.height,i=30,r=-30,o=-30,a=30;n>=1?(o=(r=-(i=50*Math.tan(Math.PI/360*40)))*n,a=i*n):(i=(a=50*Math.tan(Math.PI/360*40))/n,r=(o=-a)/n);var h=a-o,l=i-r;t[0]=100/h,t[1]=0,t[2]=0,t[3]=0,t[4]=0,t[5]=100/l,t[6]=0,t[7]=0,t[8]=(o+a)/h,t[9]=(i+r)/l,t[10]=-1250/1150,t[11]=-1,t[12]=0,t[13]=0,t[14]=-12e4/1150,t[15]=0,t[15]+=700;var c=d.getUniformLocation(d.program,"uProjectionMatrix");d.uniformMatrix4fv(c,!1,t)}function s(t){t=t||1;const n=e.clientWidth*t|0,i=e.clientHeight*t|0;e.width===n&&e.height===i||(e.width=n,e.height=i)}function h(){View3d.lastX=-1,View3d.lastY=-1,View3d.touchtime=0,e.addEventListener("mousedown",l),e.addEventListener("mouseup",c),e.addEventListener("mousemove",u),e.addEventListener("touchstart",l,{capture:!0,passive:!1}),e.addEventListener("touchend",c,{capture:!0,passive:!1}),e.addEventListener("touchmove",u,{capture:!0,passive:!1})}function l(t){0===View3d.touchtime?View3d.touchtime=(new Date).getTime():(new Date).getTime()-View3d.touchtime<800?(View3d.currentAngle[0]=0,View3d.currentAngle[1]=0,View3d.scale=1,View3d.touchtime=0):View3d.touchtime=(new Date).getTime(),t.preventDefault();var e=t.changedTouches?t.changedTouches[0]:t;const n=e.clientX,i=e.clientY,r=t.target.getBoundingClientRect();r.left<=n&&n<r.right&&r.top<=i&&i<r.bottom&&(View3d.lastX=n,View3d.lastY=i,View3d.dragging=!0)}function c(t){t.preventDefault(),View3d.dragging=!1}function u(t){t.preventDefault();var e=t.changedTouches?t.changedTouches[0]:t;const n=e.clientX,i=e.clientY;if(View3d.dragging)if(t.shiftKey||void 0!==t.scale&&1!==t.scale)void 0===t.scale?(View3d.scale+=(i-View3d.lastY)/300,View3d.scale=Math.max(View3d.scale,0)):View3d.scale=t.scale;else{const e=300/t.target.height,r=e*(n-View3d.lastX),o=e*(i-View3d.lastY);View3d.currentAngle[0]=View3d.currentAngle[0]+o,View3d.currentAngle[1]=View3d.currentAngle[1]+r}View3d.lastX=n,View3d.lastY=i}var t=t,p=p,d=(e=e).getContext("webgl")||e.getContext("experimental-webgl");n(),o(),a(),h(),this.initBuffers=i,this.draw=function(){s(),d.useProgram(d.program);var t=View3d.modelViewMatrix,e=Math.sin(View3d.currentAngle[0]/200),n=Math.cos(View3d.currentAngle[0]/200);t[0]=1,t[4]=0,t[8]=0,t[12]=0,t[1]=0,t[5]=n,t[9]=-e,t[13]=0,t[2]=0,t[6]=e,t[10]=n,t[14]=0,t[3]=0,t[7]=0,t[11]=0,t[15]=1;var i=t.slice(0);e=Math.sin(View3d.currentAngle[1]/100),n=Math.cos(View3d.currentAngle[1]/100),i[0]=n*t[0]-e*t[8],i[4]=t[4],i[8]=n*t[8]+e*t[0],i[12]=t[12],i[1]=n*t[1]-e*t[9],i[5]=t[5],i[9]=n*t[9]+e*t[1],i[13]=t[13],i[2]=n*t[2]-e*t[10],i[6]=t[6],i[10]=n*t[10]+e*t[2],i[14]=t[14],i[3]=n*t[3]-e*t[11],i[7]=t[7],i[11]=n*t[11]+e*t[3],i[15]=t[15];var r=View3d.scale;t[0]=r*i[0],t[4]=r*i[4],t[8]=r*i[8],t[12]=i[12],t[1]=r*i[1],t[5]=r*i[5],t[9]=r*i[9],t[13]=i[13],t[2]=r*i[2],t[6]=r*i[6],t[10]=r*i[10],t[14]=i[14],t[3]=i[3],t[7]=i[7],t[11]=i[11],t[15]=i[15];var o=d.getUniformLocation(d.program,"uModelViewMatrix");d.uniformMatrix4fv(o,!1,t),d.clear(d.COLOR_BUFFER_BIT|d.DEPTH_BUFFER_BIT),d.activeTexture(d.TEXTURE0),d.cullFace(d.BACK),d.drawElements(d.TRIANGLES,p,d.UNSIGNED_BYTE,0),d.activeTexture(d.TEXTURE1),d.cullFace(d.FRONT),d.drawElements(d.TRIANGLES,p,d.UNSIGNED_BYTE,0)}}function CommandArea(t,e){e.addEventListener("keypress",CommandArea.keypress),CommandArea.textArea=e,CommandArea.cde=t}function completed(){window.removeEventListener("load",completed);var t=new Model;t.init([-200,-200,200,-200,200,200,-200,200]);var e=new Command(t),n=window.document.getElementById("canvas2d"),i=n?new View2d(t,n):null,r=window.document.getElementById("canvas3d"),o=r?new View3d(t,r):null,a=window.document.getElementById("commandarea");a&&new CommandArea(e,a),orisim3d=new Orisim3d(t,i,o,e),requestAnimationFrame(loop)}function loop(){orisim3d.model.change&&(null!==orisim3d.view2d&&orisim3d.view2d.draw(),null!==orisim3d.view3d&&orisim3d.view3d.initBuffers(),orisim3d.model.change=!!orisim3d.command.anim()),orisim3d.view3d.draw(),requestAnimationFrame(loop)}(Point=function(t,e,n,i,r){3===arguments.length?(this.x=t,this.y=e,this.z=n,this.xf=t,this.yf=e):2===arguments.length?(this.xf=t,this.yf=e,this.x=t,this.y=e,this.z=0):(this.xf=0|t,this.yf=0|e,this.x=0|n,this.y=0|i,this.z=0|r),this.select=!1,this.set5d=function(t,e,n,i,r){return this.xf=0|t,this.yf=0|e,this.x=0|n,this.y=0|i,this.z=0|r,this},this.set3d=function(t,e,n){return this.x=0|t,this.y=0|e,this.z=0|n,this},this.set2d=function(t,e){return this.xf=0|t,this.yf=0|e,this},this.length=function(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)},this.scale=function(t){return this.x*=t,this.y*=t,this.z*=t,this},this.norm=function(){var t=this.length();return this.scale(1/t)},this.toString=function(){return"["+Math.round(this.x)+","+Math.round(this.y)+","+Math.round(this.z)+"  "+Math.round(this.xf)+","+Math.round(this.yf)+"]"},this.toXYZString=function(){return"["+Math.round(this.x)+","+Math.round(this.y)+","+Math.round(this.z)+"]"},this.toXYString=function(){return"["+Math.round(this.xf)+","+Math.round(this.yf)+"]"}}).prototype.constructor=Point,Point.dot=function(t,e){return t.x*e.x+t.y*e.y+t.z*e.z},Point.add=function(t,e){return new Point(t.x+e.x,t.y+e.y,t.z+e.z)},Point.sub=function(t,e){return new Point(t.x-e.x,t.y-e.y,t.z-e.z)},Point.compare3d=function(t,e,n,i){if(2===arguments.length){var r=(t.x-e.x)*(t.x-e.x),o=(t.y-e.y)*(t.y-e.y),a=(t.z-e.z)*(t.z-e.z),s=r+o+a;s=s>1?s:0}else s=(s=(r=(t.x-e)*(t.x-e))+(o=(t.y-n)*(t.y-n))+(a=(t.z-i)*(t.z-i)))>1?s:0;return s},Point.compare2d=function(t,e){var n=(t.xf-e.xf)*(t.xf-e.xf),i=(t.yf-e.yf)*(t.yf-e.yf);return Math.sqrt(n+i)};var Point;(Plane=function(t,e){this.r=t,this.n=e,this.isOnPlane=function(t){var e=Point.sub(t,this.r),n=Point.dot(e,this.n);return Math.abs(n)<.1},this.intersectPoint=function(t,e){var n=new Point(e.x-t.x,e.y-t.y,e.z-t.z),i=Point.dot(n,this.n);if(0===i)return null;var r=(Point.dot(this.r,this.n)-Point.dot(t,this.n))/i;return r>=0&&r<=1?Point.add(t,n.scale(r)):null},this.intersectSeg=function(t){var e=new Point(t.p2.x-t.p1.x,t.p2.y-t.p1.y,t.p2.z-t.p1.z),n=Point.dot(e,this.n);if(0===n)return null;var i=(Point.dot(this.r,this.n)-Point.dot(t.p1,this.n))/n;return i>=0&&i<=1?Point.add(t.p1,e.scale(i)):null},this.classifyPointToPlane=function(t){var e=Point.dot(this.r,this.n)-Point.dot(this.n,t);return e>Plane.THICKNESS?1:e<-Plane.THICKNESS?-1:0},this.toString=function(){return"Pl[r:"+this.r+" n:"+this.n+"]"}}).prototype.constructor=Plane,Plane.THICKNESS=1,Plane.across=function(t,e){var n=new Point((t.x+e.x)/2,(t.y+e.y)/2,(t.z+e.z)/2),i=new Point(e.x-t.x,e.y-t.y,e.z-t.z);return new Plane(n,i)},Plane.by=function(t,e){var n=new Point(t.x,t.y,t.z),i=new Point(e.y-t.y,-(e.x-t.x),0);return new Plane(n,i)},Plane.ortho=function(t,e){var n=new Point(e.x,e.y,e.z),i=new Point(t.p2.x-t.p1.x,t.p2.y-t.p1.y,t.p2.z-t.p1.z);return new Plane(n,i)};var Point;(Segment=function(t,e,n){this.p1=t,this.p2=e,this.type=Segment.PLAIN|n,this.angle=0,this.select=!1,this.reverse=function(){const t=this.p1;this.p1=this.p2,this.p2=t},this.length3d=function(){return Math.sqrt((this.p1.x-this.p2.x)*(this.p1.x-this.p2.x)+(this.p1.y-this.p2.y)*(this.p1.y-this.p2.y)+(this.p1.z-this.p2.z)*(this.p1.z-this.p2.z))},this.length2d=function(){return Math.sqrt((this.p1.xf-this.p2.xf)*(this.p1.xf-this.p2.xf)+(this.p1.yf-this.p2.yf)*(this.p1.yf-this.p2.yf))},this.toString=function(){return"S(P1:"+this.p1.toXYZString()+" "+this.p1.toXYString()+", P2:"+this.p2.toXYZString()+" "+this.p2.toXYString()+")"}}).prototype.constructor=Segment,Segment.PLAIN=0,Segment.EDGE=1,Segment.MOUNTAIN=2,Segment.VALLEY=3,Segment.TEMPORARY=-1,Segment.EPSILON=.01,Segment.compare=function(t,e){var n=Point.compare3d(t.p1,e.p1)+Point.compare3d(e.p2,e.p2);return n>1?n:0},Segment.distanceToSegment=function(t,e){var n=t.p1.x,i=t.p1.y,r=t.p2.x,o=t.p2.y,a=e.x,s=e.y,h=(n-r)*(n-r)+(i-o)*(i-o),l=((i-s)*(i-o)+(n-a)*(n-r))/h,c=((i-s)*(r-n)-(n-a)*(o-i))/h;return l<=0?Math.sqrt((a-n)*(a-n)+(s-i)*(s-i)):l>=1?Math.sqrt((a-r)*(a-r)+(s-o)*(s-o)):Math.abs(c)*Math.sqrt(h)},Segment.closestSeg=function(t,e){var n,i,r,o=new Point(t.p2.x-t.p1.x,t.p2.y-t.p1.y,t.p2.z-t.p1.z),a=new Point(e.p2.x-e.p1.x,e.p2.y-e.p1.y,e.p2.z-e.p1.z),s=new Point(t.p1.x-e.p1.x,t.p1.y-e.p1.y,t.p1.z-e.p1.z),h=Point.dot(o,o),l=Point.dot(a,a),c=Point.dot(a,s);if(h<=Segment.EPSILON&&l<=Segment.EPSILON)n=i=0,r=new Segment(t.p1,e.p1,Segment.TEMPORARY);else{if(h<=Segment.EPSILON)n=0,i=(i=c/l)<0?0:i>1?1:i;else{var u=Point.dot(o,s);if(l<=Segment.EPSILON)i=0,n=(n=-u/h)<0?0:n>1?1:n;else{var p=Point.dot(o,a),d=h*l-p*p;(i=(p*(n=0!==d?(n=(p*c-u*l)/d)<0?0:n>1?1:n:0)+c)/l)<0?(i=0,n=(n=-u/h)<0?0:n>1?1:n):i>1&&(i=1,n=(n=(p-u)/h)<0?0:n>1?1:n)}}var f=Point.add(t.p1,o.scale(n)),g=Point.add(e.p1,a.scale(i));r=new Segment(f,g)}return r},Segment.closestLine=function(t,e){var n,i,r,o=new Point(t.p2.x-t.p1.x,t.p2.y-t.p1.y,t.p2.z-t.p1.z),a=new Point(e.p2.x-e.p1.x,e.p2.y-e.p1.y,e.p2.z-e.p1.z),s=new Point(t.p1.x-e.p1.x,t.p1.y-e.p1.y,t.p1.z-e.p1.z),h=Point.dot(o,o),l=Point.dot(a,a),c=Point.dot(a,s);if(h<=Segment.EPSILON&&l<=Segment.EPSILON)n=i=0,r=new Segment(t.p1,e.p1,Segment.TEMPORARY,-1);else{if(h<=Segment.EPSILON)n=0,i=c/l;else{var u=Point.dot(o,s);if(l<=Segment.EPSILON)i=0,n=-u/h;else{var p=Point.dot(o,a),d=h*l-p*p;i=(p*(n=0!==d?(p*c-u*l)/d:0)+c)/l}}var f=Point.add(t.p1,o.scale(n)),g=Point.add(e.p1,a.scale(i));r=new Segment(f,g)}return r},(Face=function(){function t(t){let e=Math.sqrt(t[0]*t[0]+t[1]*t[1]+t[2]*t[2]);t[0]/=e,t[1]/=e,t[2]/=e}this.points=[],this.normal=[0,0,1],this.select=0,this.highlight=!1,this.offset=0,this.computeFaceNormal=function(){if(this.points.length<3)return console.log("Warn Face < 3pts:"+this),null;for(let t=0;t<this.points.length-2;t++){let e=this.points[t],n=this.points[t+1],i=this.points[t+2],r=[n.x-e.x,n.y-e.y,n.z-e.z],o=[i.x-e.x,i.y-e.y,i.z-e.z];if(this.normal[0]=r[1]*o[2]-r[2]*o[1],this.normal[1]=r[2]*o[0]-r[0]*o[2],this.normal[2]=r[0]*o[1]-r[1]*o[0],Math.abs(this.normal[0])+Math.abs(this.normal[1])+Math.abs(this.normal[2])>.1)break}return t(this.normal),this.normal},this.toString=function(){let t="F(";return this.points.forEach(function(e,n,i){t=t+"P"+n+e.toString()+(n===i.length-1?"":" ")}),t+=")"}}).prototype.constructor=Face;var Point,Segment,Face,Plane;(Model=function(){this.points=[],this.segments=[],this.faces=[],this.init=function(t){this.points=[],this.segments=[],this.faces=[],this.change=!0;for(var e=new Face,n=null,i=0;i<t.length;i+=2){var r=this.addPointXYZ(t[i],t[i+1],t[i],t[i+1],0);e.points.push(r),null!==n&&this.addSegment(n,r,Segment.EDGE),n=r}this.addSegment(n,e.points[0],Segment.EDGE),this.addFace(e)},this.addPointXYZ=function(t,e,n,i,r){var o=null;return 2===arguments.length?o=new Point(t,e):3===arguments.length?o=new Point(n,i,r):5===arguments.length?o=new Point(t,e,n,i,r):console.log("Warn wrong number of Args for addPointXYZ"),this.points.push(o),o},this.addPoint=function(t){for(var e=0;e<this.points.length;e++)if(Point.compare3d(this.points[e],t)<1)return this.points[e];return this.points.push(t),t},this.addSegment=function(t,e,n){if(0===Point.compare3d(t,e))return console.log("Warn Add degenerate segment:"+t),null;var i=new Segment(t,e,n);return this.segments.push(i),i},this.addFace=function(t){return this.faces.push(t),t},this.searchSegmentsOnePoint=function(t){var e=[];return this.segments.forEach(function(n){n.p1!==t&&n.p2!==t||e.push(n)}),e},this.searchSegmentTwoPoints=function(t,e){var n=[];return this.segments.forEach(function(i){(0===Point.compare3d(i.p1,t)&&0===Point.compare3d(i.p2,e)||0===Point.compare3d(i.p2,t)&&0===Point.compare3d(i.p1,e))&&n.push(i)}),n.length>1&&console.log("Error More than one segment on 2 points:"+n.length+" "+n[0].p1+n[0].p2+" "+n[1].p1+n[1].p2),0===n.length?null:n[0]},this.align2dFrom3d=function(t,e){var n=Math.sqrt((e.p1.x-t.x)*(e.p1.x-t.x)+(e.p1.y-t.y)*(e.p1.y-t.y)+(e.p1.z-t.z)*(e.p1.z-t.z))/e.length3d();t.xf=e.p1.xf+n*(e.p2.xf-e.p1.xf),t.yf=e.p1.yf+n*(e.p2.yf-e.p1.yf)},this.faceLeft=function(t,e){void 0===e&&(e=t.p2,t=t.p1);var n,i,r=null;return this.faces.forEach(function(o){(n=o.points.indexOf(t))>=0&&(i=o.points.indexOf(e))>=0&&(i===n+1||n===o.points.length-1&&0===i)&&(r=o)}),r},this.faceRight=function(t,e){void 0===e&&(e=t.p2,t=t.p1);var n=0,i=0,r=null;return this.faces.forEach(function(o){(n=o.points.indexOf(t))>=0&&(i=o.points.indexOf(e))>=0&&(n===i+1||i===o.points.length-1&&0===n)&&(r=o)}),r},this.splitFacesByPlane=function(t,e){for(var n=(e=void 0!==e?e:this.faces).length-1;n>-1;n--){var i=e[n];this.splitFaceByPlane(i,t)}},this.splitFaceByPlane=function(t,e){for(var n=[],i=[],r=!1,o=!1,a=null,s=t.points[t.points.length-1],h=e.classifyPointToPlane(s),l=0;l<t.points.length;l++){var c=t.points[l],u=e.classifyPointToPlane(c);if(1===u){if(-1===h){var p=e.intersectPoint(c,s),d=this.addPoint(p);n.push(d),i.push(d);var f=this.searchSegmentTwoPoints(s,c),g=this.segments.indexOf(f);-1!==g&&(this.align2dFrom3d(d,f),this.addSegment(d,c,Segment.PLAIN),f.p1===s?f.p2=d:f.p1=d),null!==a?(this.addSegment(a,d,Segment.PLAIN),a=null):a=d}else 0===h&&(a=s);n.push(c),r=!0}else-1===u?(1===h?(p=e.intersectPoint(c,s),d=this.addPoint(p),n.push(d),i.push(d),f=this.searchSegmentTwoPoints(s,c),-1!==(g=this.segments.indexOf(f))&&(this.align2dFrom3d(d,f),this.addSegment(d,c,Segment.PLAIN),f.p1===s?f.p2=d:f.p1=d),null!==a&&d!==a?(this.addSegment(a,d),a=null):a=d):0===h&&(i[i.length-1]!==s&&i.push(s),null!==a&&a!==s?(this.addSegment(a,s,Segment.PLAIN),a=null):a=s),i.push(c),o=!0):0===u&&(-1===h&&(i.push(c),null!==a&&a!==c?(null===(f=this.searchSegmentTwoPoints(a,c))&&this.addSegment(a,c,Segment.PLAIN),a=null):a=c),n.push(c));s=c,h=u}if(r&&(t.points=n,t=null),o)if(null!==t)t.points=i;else{var m=new Face;m.points=i,this.faces.push(m)}},this.searchFace=function(t,e){var n=t.p1,i=t.p2,r=null;return this.faces.forEach(function(t){null===e&&t.points.indexOf(n)>-1&&t.points.indexOf(i)>-1?r=t:t!==e&&t.points.indexOf(n)>-1&&t.points.indexOf(i)>-1&&(r=t)}),r},this.splitSegmentByPoint=function(t,e){if(0===Point.compare3d(t.p1,e)||0===Point.compare3d(t.p2,e))return t;var n=this.addSegment(e,t.p2,t.type);return t.p2=e,t.length2d(),t.length3d(),n},this.splitSegmentOnPoint=function(t,e){var n=null,i=null;this.align2dFrom3d(e,t);var r=this.searchFace(t,null);if(null!==r&&-1===r.points.indexOf(e))for(n=r.points,i=0;i<n.length;i++){if(n[i]===t.p1&&n[i===n.length-1?0:i+1]===t.p2){n.splice(i+1,0,e);break}if(n[i]===t.p2&&n[i===n.length-1?0:i+1]===t.p1){n.splice(i+1,0,e);break}}var o=this.searchFace(t,r);if(null!==o&&-1===o.points.indexOf(e))for(n=o.points,i=0;i<n.length;i++){if(n[i]===t.p1&&n[i===n.length-1?0:i+1]===t.p2){n.splice(i+1,0,e);break}if(n[i]===t.p2&&n[i===n.length-1?0:i+1]===t.p1){n.splice(i+1,0,e);break}}return this.addPoint(e),this.splitSegmentByPoint(t,e),t},this.splitSegmentByRatio=function(t,e){var n=new Point;n.set3d(t.p1.x+e*(t.p2.x-t.p1.x),t.p1.y+e*(t.p2.y-t.p1.y),t.p1.z+e*(t.p2.z-t.p1.z)),this.splitSegmentOnPoint(t,n)},this.splitCross=function(t,e,n){var i=Plane.across(t,e);this.splitFacesByPlane(i,n)},this.splitBy=function(t,e,n){var i=Plane.by(t,e);this.splitFacesByPlane(i,n)},this.splitOrtho=function(t,e,n){var i=Plane.ortho(t,e);this.splitFacesByPlane(i,n)},this.splitLineToLine=function(t,e,n){var i=Segment.closestLine(t,e);if(i.length3d()<1){var r=i.p1,o=Point.sub(t.p1,r).length()>Point.sub(t.p2,r).length()?t.p1:t.p2,a=Point.sub(e.p1,r).length()>Point.sub(e.p2,r).length()?e.p1:e.p2;this.splitLineToLineByPoints(o,r,a,n)}else{var s=Plane.across(i.p1,i.p2);this.splitFacesByPlane(s,n)}},this.splitLineToLineByPoints=function(t,e,n,i){var r=Math.sqrt((e.x-t.x)*(e.x-t.x)+(e.y-t.y)*(e.y-t.y)+(e.z-t.z)*(e.z-t.z))/Math.sqrt((e.x-n.x)*(e.x-n.x)+(e.y-n.y)*(e.y-n.y)+(e.z-n.z)*(e.z-n.z)),o=e.x+r*(n.x-e.x),a=e.y+r*(n.y-e.y),s=e.z+r*(n.z-e.z),h=new Point(o,a,s),l=Plane.by(t,h);this.splitFacesByPlane(l,i)},this.computeAngle=function(t){var e=t.p1,n=t.p2,i=this.faceLeft(e,n),r=this.faceRight(e,n);if(t.type===Segment.EDGE)return console.log("Warn Angle on Edge:"+t),0;if(null===r||null===i)return console.log("Warn No right and left face for:"+t+" left:"+i+" right:"+r),0;var o=i.computeFaceNormal(),a=r.computeFaceNormal(),s=o[1]*a[2]-o[2]*a[1],h=o[2]*a[0]-o[0]*a[2],l=o[0]*a[1]-o[1]*a[0],c=t.p2.x-t.p1.x,u=t.p2.y-t.p1.y,p=t.p2.z-t.p1.z,d=(s*c+h*u+l*p)/Math.sqrt(c*c+u*u+p*p),f=o[0]*a[0]+o[1]*a[1]+o[2]*a[2];return f>1&&(f=1),f<-1&&(f=-1),t.angle=Math.acos(f)/Math.PI*180,Number.isNaN(t.angle)&&(t.angle=0),d<0&&(t.angle=-t.angle),t.angle=-t.angle,t.angle},this.rotate=function(t,e,n){var i=e*Math.PI/180,r=t.p1.x,o=t.p1.y,a=t.p1.z,s=t.p2.x-r,h=t.p2.y-o,l=t.p2.z-a,c=1/Math.sqrt(s*s+h*h+l*l);s*=c,h*=c,l*=c;var u=Math.sin(i),p=Math.cos(i),d=1-p,f=d*s*s+p,g=d*s*h-l*u,m=d*s*l+h*u,x=d*h*s+l*u,v=d*h*h+p,y=d*h*l-s*u,w=d*l*s-h*u,P=d*l*h+s*u,S=d*l*l+p;n.forEach(function(t){var e=t.x-r,n=t.y-o,i=t.z-a;t.x=r+f*e+g*n+m*i,t.y=o+x*e+v*n+y*i,t.z=a+w*e+P*n+S*i})},this.turn=function(t,e){e*=Math.PI/180;var n=0,i=0,r=0;1===t?n=1:2===t?i=1:3===t&&(r=1);var o=1/Math.sqrt(n*n+i*i+r*r);n*=o,i*=o,r*=o;var a=Math.sin(e),s=Math.cos(e),h=1-s,l=h*n*n+s,c=h*n*i-r*a,u=h*n*r+i*a,p=h*i*n+r*a,d=h*i*i+s,f=h*i*r-n*a,g=h*r*n-i*a,m=h*r*i+n*a,x=h*r*r+s;this.points.forEach(function(t){var e=t.x-0,n=t.y-0,i=t.z-0;t.x=0+l*e+c*n+u*i,t.y=0+p*e+d*n+f*i,t.z=0+g*e+m*n+x*i})},this.adjust=function(t,e){for(var n=e||this.searchSegmentsOnePoint(t),i=100,r=0;i>.001&&r<20;r++){i=0;for(var o=new Point(0,0,0),a=0;a<n.length;a++){var s=n[a],h=s.length3d(),l=s.length2d(),c=l-h;Math.abs(c)>i&&(i=Math.abs(c));var u=l/h;s.p2===t?(o.x+=s.p1.x+(s.p2.x-s.p1.x)*u,o.y+=s.p1.y+(s.p2.y-s.p1.y)*u,o.z+=s.p1.z+(s.p2.z-s.p1.z)*u):s.p1===t&&(o.x+=s.p2.x+(s.p1.x-s.p2.x)*u,o.y+=s.p2.y+(s.p1.y-s.p2.y)*u,o.z+=s.p2.z+(s.p1.z-s.p2.z)*u)}0!==n.length&&(t.x=o.x/n.length,t.y=o.y/n.length,t.z=o.z/n.length)}return i},this.adjustList=function(t){for(var e=100,n=0;e>.001&&n<100;n++){e=0;for(var i=0;i<t.length;i++){var r=t[i],o=this.searchSegmentsOnePoint(r),a=this.adjust(r,o);Math.abs(a)>e&&(e=Math.abs(a))}}return e},this.evaluate=function(){for(var t=0;t<this.segments.length;t++){var e=this.segments[t],n=Math.abs(e.length2d()-e.length3d());e.highlight=n>=.1}},this.move=function(t,e,n,i){(i=null===i?this.points:void 0===i?this.points:i).forEach(function(i){i.x+=t,i.y+=e,i.z+=n})},this.moveOn=function(t,e,n,i){i.forEach(function(i){i.x=t.x*e+i.x*n,i.y=t.y*e+i.y*n,i.z=t.z*e+i.z*n})},this.flat=function(t){(void 0===t?this.points:t).forEach(function(t){t.z=0})},this.offset=function(t,e){e.forEach(function(e){e.offset+=t})},this.selectSegs=function(t){t.forEach(function(t){t.select=!t.select})},this.selectPts=function(t){t.forEach(function(t){t.select=!t.select})},this.get2DBounds=function(){var t=-100,e=100,n=-100,i=100;this.points.forEach(function(r){var o=r.xf,a=r.yf;o>t&&(t=o),o<e&&(e=o),a>n&&(n=a),a<i&&(i=a)});var r={};return r.xmin=e,r.ymin=i,r.xmax=t,r.ymax=n,r},this.get3DBounds=function(){var t=-200,e=200,n=-200,i=200;this.points.forEach(function(r){var o=r.x,a=r.y;o>t&&(t=o),o<e&&(e=o),a>n&&(n=a),a<i&&(i=a)});var r={};return r.xmin=e,r.ymin=i,r.xmax=t,r.ymax=n,r},this.zoomFit=function(){var t=this.get3DBounds(),e=400/Math.max(t.xmax-t.xmin,t.ymax-t.ymin),n=-(t.xmin+t.xmax)/2,i=-(t.ymin+t.ymax)/2;this.move(n,i,0,null),this.scaleModel(e)},this.scaleModel=function(t){this.points.forEach(function(e){e.x*=t,e.y*=t,e.z*=t})}}).prototype.constructor=Model;var Interpolator={LinearInterpolator:function(t){return t},AccelerateDecelerateInterpolator:function(t){return Math.cos((t+1)*Math.PI)/2+.5},SpringOvershootInterpolator:function(t){return t<.1825?((-237.11*t+61.775)*t+3.664)*t+0:t<.425?((74.243*t-72.681)*t+21.007)*t-.579:t<.6875?((-16.378*t+28.574)*t-15.913)*t+3.779:t<1?((5.12*t-12.8)*t+10.468)*t-1.788:((-176.823*t+562.753)*t-594.598)*t+209.669},SpringBounceInterpolator:function(t){var e=0;return(e=t<.185?((-94.565*t+28.123)*t+2.439)*t+0:t<.365?((-3.215*t-4.89)*t+5.362)*t+.011:t<.75?((5.892*t-10.432)*t+5.498)*t+.257:t<1?((1.52*t-2.48)*t+.835)*t+1.125:((-299.289*t+945.19)*t-991.734)*t+346.834)>1?2-e:e},GravityBounceInterpolator:function(t){var e=0;return(e=t<.29?((-14.094*t+9.81)*t-.142)*t+0:t<.62?((-16.696*t+21.298)*t-6.39)*t+.909:t<.885?((31.973*t-74.528)*t+56.497)*t-12.844:t<1?((-37.807*t+114.745)*t-114.938)*t+39:((-7278.029*t+22213.034)*t-22589.244)*t+7655.239)>1?2-e:e},BounceInterpolator:function(t){function e(t){return t*t*8}return(t*=1.1226)<.3535?e(t):t<.7408?e(t-.54719)+.7:t<.9644?e(t-.8526)+.9:e(t-1.0435)+.95},OvershootInterpolator:function(t){return(t-=1)*t*(3*t+2)+1},AnticipateInterpolator:function(t){return t*t*(1*t-0)},AnticipateOvershootInterpolator:function(t){return t<.5?.5*function(t,e){return t*t*((e+1)*t-e)}(2*t,1.5):.5*(function(t,e){return t*t*((e+1)*t+e)}(2*t-2,1.5)+2)}},Interpolator,Command=function(t){function e(t){var e=t.replace(/[\);]/g," rparent");return e=e.replace(/,/g," "),e=e.replace(/\/\/.*$/gm,""),c=e.split(/\s+/),p=0,y.toko=c,c}function n(t){var e=null;{const n=new XMLHttpRequest;n.onreadystatechange=function(){n.readyState===XMLHttpRequest.DONE&&200===n.status?n.getResponseHeader("Content-Type").match(/^text/)&&(e=n.responseText):n.readyState!==XMLHttpRequest.OPENED&&console.log("Error ? state:"+n.readyState+" status:"+n.status)},n.open("GET",t,!1),n.send(null)}return null===e&&console.log("Error reading:"+t),e}function i(){var e=[],n=null,i=null,a=null,s=null,h=null;if("d"===c[p]||"define"===c[p]){for(p++;Number.isInteger(Number(c[p]));)e.push(c[p++]);t.init(e)}else if("b"===c[p]||"by"===c[p])p++,n=t.points[c[p++]],i=t.points[c[p++]],t.splitBy(n,i);else if("c"===c[p]||"cross"===c[p])p++,n=t.points[c[p++]],i=t.points[c[p++]],t.splitCross(n,i);else if("p"===c[p]||"perpendicular"===c[p])p++,s=t.segments[c[p++]],h=t.points[c[p++]],t.splitOrtho(s,h);else if("lol"===c[p]||"lineonline"===c[p]){p++;var l=t.segments[c[p++]],u=t.segments[c[p++]];t.splitLineToLine(l,u)}else if("s"===c[p]||"split"===c[p]){p++,s=t.segments[c[p++]];var d=c[p++],x=c[p++];t.splitSegmentByRatio(s,d/x)}else if("r"===c[p]||"rotate"===c[p])p++,s=t.segments[c[p++]],a=c[p++]*(f-g),e=r(),t.rotate(s,a,e);else if("f"===c[p]||"fold"===c[p])p++,s=t.segments[c[p++]],0===g&&(angleBefore=t.computeAngle(s)),a=(c[p++]-angleBefore)*(f-g),e=r(),0===g&&-1!==t.faceRight(s.p1,s.p2).points.indexOf(e[0])&&s.reverse(),t.rotate(s,a,e);else if("a"===c[p]||"adjust"===c[p]){p++;var w=0===(e=r()).length?t.points:e;t.adjustList(w)}else if("o"===c[p]||"offset"===c[p]){p++;var P=c[p++]*v;e=o(),t.offset(P,e)}else if("m"===c[p]||"move"===c[p])p++,t.move(c[p++]*(f-g),c[p++]*(f-g),c[p++]*(f-g),t.points);else if("mo"===c[p]){p++;var S=t.points.get(c[p++]),E=(1-f)/(1-g),T=f-g*E;t.moveOn(S,T,E,t.points)}else if("tx"===c[p])p++,t.turn(1,Number(c[p++])*(f-g));else if("ty"===c[p])p++,t.turn(2,Number(c[p++])*(f-g));else if("tz"===c[p])p++,t.turn(3,Number(c[p++])*(f-g));else if("z"===c[p]){p++;var A=c[p++],M=c[p++],z=c[p++],I=(1+f*(A-1))/(1+g*(A-1)),B=A*(f/I-g);t.move(M*B,z*B,0,null),t.scaleModel(I)}else if("zf"===c[p]){if(p++,0===g){i=t.get3DBounds();m[0]=400/Math.max(i[2]-i[0],i[3]-i[1]),m[1]=-(i[0]+i[2])/2,m[2]=-(i[1]+i[3])/2}A=(1+f*(m[0]-1))/(1+g*(m[0]-1)),B=m[0]*(f/A-g),t.move(m[1]*B,m[2]*B,0,null),t.scaleModel(A)}else if("il"===c[p])p++,y.interpolator=Interpolator.LinearInterpolator;else if("ib"===c[p])p++,y.interpolator=Interpolator.BounceInterpolator;else if("io"===c[p])p++,y.interpolator=Interpolator.OvershootInterpolator;else if("ia"===c[p])p++,y.interpolator=Interpolator.AnticipateInterpolator;else if("iao"===c[p])p++,y.interpolator=Interpolator.AnticipateOvershootInterpolator;else if("iad"===c[p])p++,y.interpolator=Interpolator.AccelerateDecelerateInterpolator;else if("iso"===c[p])p++,y.interpolator=Interpolator.SpringOvershootInterpolator;else if("isb"===c[p])p++,y.interpolator=Interpolator.SpringBounceInterpolator;else if("igb"===c[p])p++,y.interpolator=Interpolator.GravityBounceInterpolator;else if("pt"===c[p])p++,t.selectPts(t.points);else if("seg"===c[p])p++,t.selectSegs(t.segments);else if("end"===c[p])p=c.length;else{if("t"===c[p]||"rparent"===c[p]||"u"===c[p]||"co"===c[p])return console.log("Warn unnecessary token :"+c[p]+"\n"),p++,-1;p++}return p}function r(){for(var e=[];Number.isInteger(Number(c[p]));)e.push(t.points[c[p++]]);return e}function o(){for(var e=[];Number.isInteger(Number(c[p]));)e.push(t.faces[c[p++]]);return e}function a(){for(;p<c.length;){if("t"===c[p])return u.push(c[p++]),u.push(c[p]),duration=c[p++],pauseDuration=0,d=State.anim,void s();if("rparent"!==c[p]){var e=p,n=i();for(h();e<n;)u.push(c[e++]);t.change=!0}else u.push(c[p++])}d===State.run&&(d=State.idle)}function s(){t.change=!0,tstart=(new Date).getTime(),g=0}function h(){}function l(){}var t=t,c=[],u=[],p=0,d=State.idle,f=1,g=0,m=[0,0,0,0],x=Interpolator.LinearInterpolator,v=1,y=this;this.tokenize=e,this.readfile=n,this.execute=i,this.interpolator=x,this.toko=c,this.listPoints=r,this.command=function(t){if(d===State.idle){if("u"===t)return c=u.slice().reverse(),void undo();if(t.startsWith("read")){var i=t.substring(5);if(-1!==i.indexOf("script")){var r=i.substring(7);t=document.getElementById(r).text}else t=n(i.trim());if(null===t)return;u=[],undo=[]}else{if("co"===t||"pa"===t)return;t.startsWith("d")&&(u=[],undo=[])}return c=e(t),d=State.run,p=0,void a()}d!==State.run?d!==State.anim?d!==State.pause?d===State.undo&&!1===undoInProgress&&("u"===t?undo():"co"===t?(d=State.run,a()):"pa"===t||(p--,c=e(t),d=State.run,p=0,a())):"co"===t?(pauseDuration=(new Date).getTime()-pauseStart,d=State.anim):"u"===t&&(d=State.undo,undo()):"pa"===t&&(d=State.pause):a()},this.commandLoop=a,this.anim=function(){if(d===State.undo){var t=l()>p;return!1===t&&(undoInProgress=!1),t}if(d===State.pause)return pauseStart=(new Date).getTime(),!1;if(d!==State.anim)return!1;var e=((new Date).getTime()-tstart-pauseDuration)/duration;for(e>1&&(e=1),f=y.interpolator(e),iBeginAnim=p;"rparent"!==c[p];)if(i(),p===c.length){console.log("Warning missing parent !");break}if(h(),g=f,e>=1){for(f=1,g=0;iBeginAnim<p;)u.push(c[iBeginAnim++]);return d=State.run,a(),d===State.anim}return p=iBeginAnim,!0}};const State={idle:0,run:1,anim:2,pause:3,undo:4};Command.prototype.constructor=Command;var Model,Point,Segment;(View2d=function(t,e){this.model=t,this.canvas2d=e,this.canvas2d.view2d=this,null!==this.canvas2d&&(this.ctx=this.canvas2d.getContext("2d"),this.scale=1,this.xOffset=0,this.yOffset=0,function(t){var e=t.model.get2DBounds(),n=e.xmax-e.xmin,i=e.ymax-e.ymin,r=t.canvas2d.clientWidth,o=t.canvas2d.clientHeight;t.canvas2d.width=r,t.canvas2d.height=o;const a=r/n,s=o/i;t.scale=Math.min(a,s)/1.1,t.xOffset=r/2,t.yOffset=o/2}(this),this.canvas2d.addEventListener("mousedown",this.mouseDown),this.drawPoint=function(){var t=this.ctx,e=this.scale,n=this.xOffset,i=this.yOffset,r=this.model.points;t.font="18px serif",t.strokeStyle="blue",r.forEach((r,o)=>{var a=r.xf*e+n,s=-r.yf*e+i;t.fillStyle="skyblue",t.beginPath(),t.arc(a,s,12,0,2*Math.PI),t.stroke(),t.fill(),t.fillStyle="black",o<10?t.fillText(String(o),a-4,s+5):t.fillText(String(o),a-8,s+5)})},this.drawSegment=function(){var t=this.ctx,e=this.scale,n=this.xOffset,i=this.yOffset,r=this.model.segments;t.font="18px serif",t.strokeStyle="green",r.forEach((r,o)=>{var a=r.p1.xf*e+n,s=-r.p1.yf*e+i,h=r.p2.xf*e+n,l=-r.p2.yf*e+i,c=(a+h)/2,u=(s+l)/2;r.highlight?t.strokeStyle="red":t.strokeStyle="green",t.beginPath(),t.moveTo(a,s),t.lineTo(h,l),t.closePath(),t.stroke(),t.fillStyle="lightgreen",t.beginPath(),t.arc(c,u,12,0,2*Math.PI),t.stroke(),t.fill(),t.fillStyle="black",o<10?t.fillText(String(o),c-4,u+5):t.fillText(String(o),c-8,u+5)})},this.drawFaces=function(){var t=this.ctx,e=this.scale,n=this.xOffset,i=this.yOffset,r=this.model.faces;t.font="18px serif",t.strokeStyle="black",r.forEach((r,o)=>{var a=r.points,s=0,h=0;t.beginPath();var l=a[0].xf*e+n,c=-a[0].yf*e+i;t.moveTo(l,c),a.forEach(function(r){l=r.xf*e+n,c=-r.yf*e+i,t.lineTo(l,c),s+=l,h+=c}),t.closePath(),t.fillStyle="lightblue",t.fill(),s/=a.length,h/=a.length,t.beginPath(),t.arc(s,h,12,0,2*Math.PI),t.stroke(),t.fillStyle="lightcyan",t.fill(),t.fillStyle="black",o<10?t.fillText(String(o),s-4,h+5):t.fillText(String(o),s-8,h+5)})},this.draw=function(){null!==this.canvas2d&&(this.ctx.clearRect(0,0,this.canvas2d.width,this.canvas2d.height),this.drawFaces(),this.drawSegment(),this.drawPoint())})}).prototype.constructor=View2d;var Model;const vsSource=`\n    attribute vec4 aVertexPosition;\n    attribute vec3 aVertexNormal;\n    attribute vec2 aTexCoordFront;\n    attribute vec2 aTexCoordBack;\n\n    uniform mat4 uModelViewMatrix;\n    uniform mat4 uProjectionMatrix;\n\n    varying highp vec2 vTexCoordFront;\n    varying highp vec2 vTexCoordBack;\n    varying highp vec3 vLighting;\n    varying vec4 vPos;\n\n    void main(void) {\n      // Vertex position\n      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;\n      vPos = gl_Position;\n\n      // Pass to fragment\n      vTexCoordFront = aTexCoordFront;\n      vTexCoordBack  = aTexCoordBack;\n\n      // Lighting transform normal and dot with direction\n      highp vec3 lightColor = vec3(0.8, 0.8, 0.8); \n      highp vec3 direction = vec3(0.0, 0.0, 1.0);  \n      highp vec4 normal = normalize(uModelViewMatrix * vec4(aVertexNormal, 1.0));\n      // dot product is negative for back face\n      highp float dot = dot(normal.xyz, direction);\n      \n      // Pass to fragment\n      vLighting = lightColor * dot;\n    }\n  `,fsSource=`\n    precision highp float;\n\n    varying highp vec2 vTexCoordFront;\n    varying highp vec2 vTexCoordBack;\n    varying highp vec3 vLighting;\n    \n    uniform sampler2D uSamplerFront;\n    uniform sampler2D uSamplerBack;\n\n    void main(void) {\n      highp vec4 texelColor;\n      vec3 normal;\n      if (gl_FrontFacing) {\n        texelColor = texture2D(uSamplerFront, vTexCoordFront);\n        normal = texelColor.rgb * vLighting;\n      } else {\n        texelColor = texture2D(uSamplerBack,  vTexCoordBack);\n        normal = texelColor.rgb * vLighting * -1.0;\n      }\n      // Ambiant\n      vec3 ambiant = texelColor.rgb * 0.5;\n      // Ambiant + normal\n      gl_FragColor = vec4(ambiant + normal, texelColor.a);\n    }\n  `;View3d.currentAngle=[0,0],View3d.scale=1,View3d.projectionMatrix=new Float32Array(16),View3d.modelViewMatrix=new Float32Array(16),View3d.wTexFront=1,View3d.hTexFront=1,View3d.wTexBack=1,View3d.hTexBack=1,View3d.prototype.constructor=View3d;var Command;CommandArea.keypress=function(t){var e=t.target,n=t.key?t.key:String.fromCharCode(Number(t.charCode));if(n=13===t.keyCode?"Enter":n,t.target.scrollTop=t.target.scrollHeight,"Enter"===n){var i=e.selectionStart,r=e.value,o=r.lastIndexOf("\n",i-1)+1,a=r.indexOf("\n",i);-1===a&&(e.value+="\n",a=r.length);var s=r.substring(o,a);t.preventDefault(),a!==r.length&&(e.value+=s+"\n"),CommandArea.cde.command(s)}},CommandArea.prototype={constructor:CommandArea};var Model,View2d,View3d,Command,CommandArea,Orisim3d=function(t,e,n,i){this.model=t,this.view2d=e,this.view3d=n,this.command=i};Orisim3d.prototype.constructor=Orisim3d,"undefined"!=typeof window&&window.addEventListener("load",completed);var Menu=function(t){t.addEventListener("click",function(t){var e=window.document.getElementsByClassName("menu")[0].children;if(t.target===e[0]||t.target.parentNode===e[0]){for(var n=0;n<e.length;n++)e[n].style.display="block";e[0].style.display="none"}else if(t.target===e[1]||t.target.parentNode===e[1]){for(var i=0;i<e.length;i++)e[i].style.display="none";e[0].style.display="block"}for(var r=2;r<e.length;r++)if(e[r]===t.target||e[r]===t.target.parentNode||e[r]===t.target.parentNode.parentNode){e[r].getElementsByTagName("rect")[0].style["stroke-width"]="2px";var o=e[r].getAttribute("model");if(o){var a=document.getElementById(o);if(a){var s=a.textContent;"undefined"!=typeof orisim3d&&orisim3d.command.command(s)}}}else e[r].getElementsByTagName("rect")[0].style["stroke-width"]="0.4px"})};Menu.prototype.constructor=Menu,"undefined"!=typeof window&&window.addEventListener("load",function(){var t=window.document.getElementsByClassName("menu")[0];t&&new Menu(t)});