// File: js/CommandArea
// Dependencies : import them before CommandArea.js in browser
if (NODE_ENV === true && typeof module !== 'undefined' && module.exports) {
  var Command = require ('./Command.js');
}

// CommandArea constructor
function CommandArea(command, textArea) {
  // Add Key press EventListener
  textArea.addEventListener('keypress', CommandArea.keypress);
  // Static variables
  CommandArea.textArea = textArea;
  CommandArea.cde      = command;
}

// Static methods
// Key Press listener
CommandArea.keypress = function (e) {
  var el             = e.target; // HTMLTextAreaElement
  var val            = e.key ? e.key : String.fromCharCode(Number(e.charCode));
  val                = e.keyCode === 13 ? 'Enter' : val;
  e.target.scrollTop = e.target.scrollHeight;
  if (val === 'Enter') {
    var caretPos = el.selectionStart;
    var value    = el.value;
    var start    = value.lastIndexOf('\n', caretPos - 1) + 1;
    var end      = value.indexOf('\n', caretPos);
    if (end === -1) {
      el.value += '\n';
      end = value.length;
    }
    var line = value.substring(start, end);
    // Do not let TextArea handle Enter
    e.preventDefault();
    // Recall only if not on last line
    if (end !== value.length) {
      el.value += line + '\n';
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
if (NODE_ENV === true && typeof module !== 'undefined' && module.exports) {
  module.exports = CommandArea;
}


