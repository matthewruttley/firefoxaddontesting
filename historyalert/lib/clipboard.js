const {storage} = require("sdk/simple-storage");

let clipboard = require("sdk/clipboard");
let tabs = require("sdk/tabs");

exports.add_clipboard_logging = function() {
  if (!storage.clipboard) {
    storage.clipboard = [];
  }
  let contentScriptString =
    "document.addEventListener('copy', function(e) {" +
      "self.port.emit('message');" +
    "});" +
    "document.addEventListener('cut', function(e) {" +
      "self.port.emit('message');" +
    "});"

  tabs.on('ready', function(tab) {
    let worker = tab.attach({
      contentScript: contentScriptString
    });
    worker.port.on("message", function() {
      storage.clipboard.push({"text": clipboard.get(), "timestamp": Date.now()});
    });
  });
}