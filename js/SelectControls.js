/*
 * Select on objects seen from camera in domelement
 * Hover change cursor to indicate selecting is possible
 */

SelectControls = function ( objects, camera, domElement ) {

	var _plane = new THREE.Plane();
	var _raycaster = new THREE.Raycaster();
	var _mouse = new THREE.Vector2();
	var _selected = null;
	var _hovered = null;

	//

	var scope = this;

	function activate() {
		domElement.addEventListener( 'mousedown', onDocumentMouseDown, false );
		domElement.addEventListener( 'mousemove', onDocumentMouseMove, false );
  }
	function deactivate() {
		domElement.removeEventListener( 'mousedown', onDocumentMouseDown, false );
		domElement.removeEventListener( 'mousemove', onDocumentMouseMove, false );
	}

	function dispose() {
		deactivate();
	}

	function onDocumentMouseDown( event ) {
    event.preventDefault();

    var rect = domElement.getBoundingClientRect();
    // Enlarge clic zone
    loop1: for (var dx = -6; dx < 6; dx += 1) {
      for (var dy = -6; dy < 6; dy += 1) {
        _mouse.x = ( ( event.clientX + dx - rect.left ) / rect.width ) * 2 - 1;
        _mouse.y = - ( ( event.clientY + dy - rect.top ) / rect.height ) * 2 + 1;
        // Raycast
        _raycaster.setFromCamera( _mouse, camera );
        var intersects = _raycaster.intersectObjects( objects );
        if ( intersects.length > 0 ) {
          _selected = intersects[0].object;
          scope.dispatchEvent({type:'selectPt', object:_selected});
          break loop1;
        }
      }
		}
	}

  function onDocumentMouseMove( event ) {
    event.preventDefault();

    var rect = domElement.getBoundingClientRect();
    // Enlarge click zone
    loop1: for (var dx = -6; dx < 6; dx += 1) {
      for (var dy = -6; dy < 6; dy += 1) {
        _mouse.x = ( ( event.clientX + dx - rect.left ) / rect.width ) * 2 - 1;
        _mouse.y = -( ( event.clientY + dy - rect.top ) / rect.height ) * 2 + 1;
        // Raycast
        _raycaster.setFromCamera(_mouse, camera);
        var intersects = _raycaster.intersectObjects(objects);
        if (intersects.length > 0) {
          var object = intersects[0].object;
          _plane.setFromNormalAndCoplanarPoint(camera.getWorldDirection(_plane.normal), object.position);
          if (_hovered !== object) {
            domElement.style.cursor = 'pointer';
            _hovered = object;
            break loop1;
          }
        } else {
          if (_hovered !== null) {
            domElement.style.cursor = 'auto';
            _hovered                 = null;
          }
        }
      }
    }
  }

	activate();

	// API
	this.enabled = true;
	this.activate = activate;
	this.deactivate = deactivate;
	this.dispose = dispose;

};

SelectControls.prototype = Object.create( THREE.EventDispatcher.prototype );
SelectControls.prototype.constructor = SelectControls;
