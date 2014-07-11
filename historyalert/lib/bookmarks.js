//Module to analyze the users current bookmarks
//mruttley 2014-07-10
const {Cc, Ci, Cu} = require("chrome");
const {DBUtils} = require("DBUtils");

Cu.import("resource://gre/modules/commonjs/sdk/core/promise.js");

exports.all_current_bookmarks = function() {
    let deferred = Promise.defer();
    let bookmarks = [];

    DBUtils.getBookmarks(item => {
        if (item["url"].slice(0, 6) != "place:") {
            bookmarks.push(item);
        }
    }).then(() => { deferred.resolve(bookmarks); });
    return deferred.promise;
}

function bookmark_tree(){
    //A structured JSON object of the user's current bookmarks
    //Input: none
    //Output: an object with nested folders and urls
    //TODO
    tree = {}
    return tree
}

function LDA_cluster_bookmarks(bookmarks){
    //Tries to use LDA to cluster the user's current bookmarks based on their titles
    //Input: Accepts a list of lists from `all current bookmarks`
    //Output: a list of lists, this time the lists are clusters
    //TODO
    clusters = []
    return clusters
}

