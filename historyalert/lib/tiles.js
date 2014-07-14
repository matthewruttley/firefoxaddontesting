//Module to analyze tile interaction
//mruttley 2014-07-10
const {Cu} = require("chrome");
Cu.import("resource://gre/modules/Services.jsm");

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

function killed_tiles(){
    //tiles that the user has removed
    //Input: none
    //Output: a list of URLs
    //TODO
    urls = []
    return urls
}