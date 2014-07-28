//Module to analyze tile interaction
//mruttley 2014-07-10
const {Cu} = require("chrome");
const {DBUtils} = require("DBUtils");
const {storage} = require("sdk/simple-storage");
const {data} = require("sdk/self");

Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://gre/modules/commonjs/sdk/core/promise.js");
Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/NewTabUtils.jsm");
Cu.import("resource://gre/modules/DirectoryLinksProvider.jsm");

let tabs = require("sdk/tabs");

function getEquivalentGridLinkPosition(msg, rowCount, columnCount) {
    let links = NewTabUtils.links.getLinks();
    let gridLinks = links.slice(0, (rowCount * columnCount + 1));
    for (let i = 0; i < gridLinks.length; i++) {
        if (gridLinks[i].url == msg.url && gridLinks[i].title == msg.title) {
            return i;
        }
    }
    return -1;
}

exports.add_moved_tiles_logging = function() {
    if (!storage.movedTiles) {
        storage.movedTiles = {};
    }
    let rowCount = NewTabUtils.gridPrefs.gridRows;
    let columnCount = NewTabUtils.gridPrefs.gridColumns;

    tabs.on('ready', function(tab) {
        if (tab.url == "about:newtab") {
            let worker = tab.attach({
                contentScriptFile: data.url("tiles_content_script.js"),
            });
            worker.port.on("dragstart", function(msg) {
                let i = getEquivalentGridLinkPosition(msg, rowCount, columnCount);
                if (i > -1) {
                    if (!storage.movedTiles[msg.url]) {
                        storage.movedTiles[msg.url] = [];
                    }
                    storage.movedTiles[msg.url].push({"startPosition": i});
                }
            });
            worker.port.on("dragend", function(msg) {
                let i = getEquivalentGridLinkPosition(msg, rowCount, columnCount);
                if (i > -1) {
                    let lastMoveIndex = storage.movedTiles[msg.url].length - 1;
                    storage.movedTiles[msg.url][lastMoveIndex]["endPosition"] = i;
                }
            });
        }
    });
}

exports.current_pinned_tiles = function() {
    let pinnedTiles = [];
    let pinnedArr = Services.prefs.getCharPref("browser.newtabpage.pinned");

    // The array has a bunch of nulls, filter it.
    let pinnedTiles = JSON.parse(pinnedArr).filter((tile) => { return tile != null; });
    return pinnedTiles;
}

function previously_pinned_tiles() {
    //tiles that used to be pinned
    //Input: none
    //Output: a list of URLs
    //TODO
    urls = []
    return urls
}

exports.killed_tiles = function() {
    let deferred = Promise.defer();
    let killed_directory_tiles = [];
    let killed_history_tiles = [];
    if (!storage.killedTiles) {
        storage.killedTiles = {};
    }

    // Check for killed directory tiles.
    let directoryTilesDeferred = Promise.defer();
    let callback = function(links) {
        for (let link of links) {
            link = {"title": link.title, "url": link.url};
            if (NewTabUtils.blockedLinks.isBlocked(link)) {
                killed_directory_tiles.push(link);
            }
        }
        directoryTilesDeferred.resolve(killed_directory_tiles);
    };
    DirectoryLinksProvider.getLinks(callback);

    // Check for killed history tiles.
    let historyTilesDeferred = Promise.defer();
    DBUtils.getTileURLS(item => {
        if (NewTabUtils.blockedLinks.isBlocked(item)) {
            killed_history_tiles.push(item);
        }
    }).then(() => { historyTilesDeferred.resolve(killed_history_tiles); });

    Promise.all([directoryTilesDeferred.promise, historyTilesDeferred.promise]).then(function(promises) {
        let killed_tiles = killed_history_tiles.concat(killed_directory_tiles);
        for (let killedTile of killed_tiles) {
            storage.killedTiles[killedTile.url] = killedTile.title; // Adding killed tiles to storage.
        }
        deferred.resolve(killed_tiles);
    });
    return deferred.promise;
}