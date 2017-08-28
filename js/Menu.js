// File: js/Menu.js
// Menu Constructor
function Menu(element) {
  element.addEventListener('click', this.click);
}
// Class methods
Menu.prototype = {
  constructor:Menu,
  click:function (ev) {
    var menu  = window.document.getElementsByClassName('menu')[0];
    var items = menu.children;
    // Menu open if click on first
    if (ev.target === items[0] || ev.target.parentNode === items[0]) {
      // Show all items
      for (var i = 0; i < items.length; i++) {
        items[i].style.display = "block";
      }
      // Hide first item (☰)
      items[0].style.display = "none";
    }
    // Menu Close if click on second item
    else if (ev.target === items[1] || ev.target.parentNode === items[1]) {
      // Hide all
      for (var j = 0; j < items.length; j++) {
        items[j].style.display = "none";
      }
      // Show first item (x)
      items[0].style.display = "block";
    }
    // Select item
    for (var k = 2; k < items.length; k++) {
      if (items[k] === ev.target || items[k] === ev.target.parentNode || items[k] === ev.target.parentNode.parentNode) {
        // Highlight
        items[k].getElementsByTagName("rect")[0].style['stroke-width'] = "2px";
        // Search attribute <svg model="cocotte.txt".../>
        var modelattr = items[k].getAttribute("model");
        if (modelattr) {
          // Expect a tag <script id="cocotte.txt" type="not-javascript">d ...< /script> in html file
          var tag = document.getElementById(modelattr);
          if (tag){
            // Global var : orisim3d
            var model = tag.textContent;
            if (typeof orisim3d !== "undefined"){
              orisim3d.command.command(model);
            }
          }
        }
      }
      else {
        items[k].getElementsByTagName("rect")[0].style['stroke-width'] = "0.4px";
      }
    }
  }
};

// New Menu on load
if (typeof window !== 'undefined') {
  window.addEventListener("load", function () {
    var nemuElement = window.document.getElementsByClassName('menu')[0];
    if (nemuElement){
      new Menu(nemuElement);
    }
  })
}
