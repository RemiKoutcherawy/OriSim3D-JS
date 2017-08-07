// File: js/CommandArea
"use strict";

// Dependencies : import them before View2d.js in browser
if (typeof module !== 'undefined' && module.exports) {
  var Command = require ('./Command.js');
}

// CommandArea constructor
function CommandArea(command, textArea) {
  if (textArea === null){
    return
  }
  // Add Key press EventListener
  textArea.addEventListener('keypress', CommandArea.keypress);
  // Static variables
  CommandArea.textArea = textArea;
  CommandArea.cde = command;
}

// Static methods
// Key Press listener
CommandArea.keypress = function (e) {
  let el = e.target; // HTMLTextAreaElement
  let val = e.key ? e.key : String.fromCharCode(Number(e.charCode));
  val = e.keyCode === 13 ? 'Enter' : val;
  e.target.scrollTop = e.target.scrollHeight;
  if (val === 'Enter') {
    let caretPos = el.selectionStart;
    let value = el.value;
    let start = value.lastIndexOf('\n', caretPos - 1) + 1;
    let end = value.indexOf('\n', caretPos);
    if (end === -1 ) {
      el.value += '\n';
      end = value.length;
    }
    let line = value.substring(start, end);
    // Do not let TextArea handle Enter
    e.preventDefault();
    // Recall only if not on last line
    if (end !== value.length){
      el.value += line +'\n';
    }
    // Execute
    CommandArea.cde.command(line);
  }
};

// Class methods
CommandArea.prototype = {
  constructor:CommandArea
};

// Just for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CommandArea;
}


