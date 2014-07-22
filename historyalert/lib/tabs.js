//Module to analyze user tab time open
//(assumes that there is a correlation between tab time open and focus of interest)
//mruttley 2014-07-10
const {storage} = require("sdk/simple-storage");
let tabs = require("sdk/tabs");

function page_closed(tabID) {
  if (!storage.tabs[tabID].url && !storage.tabs[tabID].title) {
    return;
  }
  let tab = storage.tabs[tabID];
  storage.pages.push({"url": tab.url,
                      "title": tab.title,
                      "timeOpen": tab.timeOpen,
                      "timeClosed": Date.now(),
                      "totalActiveTime":  tab.totalActiveTime});
}

exports.add_tab_logging = function() {
  if (!storage.tabs) {
    storage.tabs = {};
  }
  if (!storage.pages) {
    storage.pages = [];
  }

  tabs.on('close', function onOpen(tab) {
    if (!storage.tabs[tab.id]) {
      return; // Ignore closed tabs that we don't know when they were open.
    }
    page_closed(tab.id);
    delete storage.tabs[tab.id];
  });

  tabs.on('ready', function(tab) {
    if (!storage.tabs[tab.id]) {
      storage.tabs[tab.id] = {};
    }

    if (tab.url == storage.tabs[tab.id].url &&
        tab.title == storage.tabs[tab.id].title) {
      // We're simply refreshing the page. Nothing to log.
      return;
    }

    page_closed(tab.id);
    storage.tabs[tab.id]["url"] = tab.url;
    storage.tabs[tab.id]["title"] = tab.title;
    storage.tabs[tab.id]["timeOpen"] = Date.now();
  });

  tabs.on('activate', function () {
    let activeTab = tabs.activeTab;
    if (!storage.tabs[activeTab.id]) {
      storage.tabs[activeTab.id] = {};
    }

    storage.tabs[activeTab.id]["activateTime"] = Date.now();
  });

  tabs.on('deactivate', function (tab) {
    let deactivateTime = Date.now();
    if (!storage.tabs[tab.id]["totalActiveTime"]) {
      storage.tabs[tab.id]["totalActiveTime"] = 0;
    }
    storage.tabs[tab.id]["totalActiveTime"] +=
      deactivateTime - storage.tabs[tab.id]["activateTime"]
  });
}

exports.page_duration = function() {
  let pages = [];
  for (let closedPage of storage.pages) {
    if (!closedPage.totalActiveTime) continue;
    pages.push({"url": closedPage.url, "title": closedPage.title, "activeTime": closedPage.totalActiveTime});
  }
  for (let openPageID in storage.tabs) {
    let openPage = storage.tabs[openPageID];

    // Some tabs may have been previously loaded but have no active time.
    if (!openPage.totalActiveTime) {
      openPage.totalActiveTime = 0;
    }

    // Account for active time of the currently active tab.
    if (openPageID == tabs.activeTab.id) {
      openPage.totalActiveTime += (Date.now() - openPage.activateTime);
    }
    pages.push({"url": openPage.url, "title": openPage.title, "activeTime": openPage.totalActiveTime});
  }
  return pages;
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