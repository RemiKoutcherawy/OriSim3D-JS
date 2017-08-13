// File: js/Menu.js
// Menu Constructor
function Menu() {
  // Static values initialized in constructor
  Menu.menuElement = window.document.getElementsByClassName('menu')[0];
  Menu.menuElement.addEventListener('click', this.click);
  Menu.hidden = true;
}
// Class methods
Menu.prototype = {
  constructor:Menu,
  click:function (ev) {
    var items = window.document.getElementsByClassName('item');
    // Menu open
    if (Menu.hidden){
      for(var i = 0; i < items.length; i++) {
        items[i].style.display = "block";
      }
      Menu.hidden = false;
    }
    // Menu Close if click on top
    else if (ev.target === Menu.menuElement) {
      for(var j = 0; j < items.length; j++) {
        items[j].style.display = "none";
      }
      Menu.hidden = true;
    }
    // In all cases look for a <script id="modele" type="not-javascript"/> named after item
    var modele = ev.target.innerText;
    var script = window.document.getElementById(modele);
    if (script){
      // Global variable
      orisim3d.command.command("read script "+modele);
    }
  }
};
// New Menu on load
if (typeof window !== 'undefined') {
  window.addEventListener("load", function () {
    new Menu();
  })
}
