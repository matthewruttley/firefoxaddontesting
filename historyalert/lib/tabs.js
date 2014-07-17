//Module to analyze user tab time open
//(assumes that there is a correlation between tab time open and focus of interest)
//mruttley 2014-07-10
let tabs = require("sdk/tabs");

exports.tab_time = function() {
  // TODO: Does this analyze per session? historically?
}

exports.pinned_tabs = function() {
  let pinned_tabs = [];
  for each (let tab in tabs) {
    if (tab.isPinned) {
      pinned_tabs.push({"title": tab.title, "url": tab.url});
    }
  }
  return pinned_tabs;
}