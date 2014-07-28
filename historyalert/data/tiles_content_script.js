document.addEventListener('dragstart', function(e) {
    self.port.emit("dragstart", {"url": String(e.originalTarget), "title": String(e.originalTarget.children[1].innerHTML)});
});

document.addEventListener('dragend', function(e) {
    self.port.emit("dragend", {"url": String(e.originalTarget), "title": String(e.originalTarget.children[1].innerHTML)});
});