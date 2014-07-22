//Creates an alert button that displays the last 5 history items the user looked at to the console
//Created on 2014-07-03 by mruttley
//for tutorial purposes only, I'm sure there are much more efficient ways of doing this

const {Cc, Ci, Cu} = require("chrome");
const {all_current_bookmarks} = require("bookmarks");
const {current_pinned_tiles, killed_tiles} = require("tiles");
const {get_form_history} = require("formHistory");
const {pinned_tabs, add_tab_logging, page_duration} = require("tabs");

Cu.import("resource://gre/modules/Task.jsm");

var buttons = require("sdk/ui/button/action")

var button = buttons.ActionButton({
	id: "history-button",
	label: "Log the last 5 history items",
	icon: {
		"16": "./icon-16.png",
		"32": "./icon-32.png",
		"64": "./icon-64.png"
	},
	onClick: logTheLastFiveHistoryItems
})

exports.main = function(options, callbacks) {
  add_tab_logging();
};

function logTheLastFiveHistoryItems(){
	//Shows the last five history items in the console

	history = getHistory()

	//wang some stuff to the console
	var hCount = historyCount()
	if(hCount.length>5){
		hCount = 5
	}
	for(var x=0;x<hCount;x++){
		nextItem = history.next()
		if(typeof(nextItem)=="string"){
			console.log(nextItem)
		}
	}
}

function logBookmarks() {
	Task.spawn(function* () {
		return yield all_current_bookmarks();
	}).then((bookmarks) => {
		console.log(JSON.stringify(bookmarks));
	});
}

function logPinnedTiles() {
	console.log(JSON.stringify(current_pinned_tiles()));
}

function logKilledTiles() {
	Task.spawn(function* () {
		return yield killed_tiles();
	}).then((killed_tiles) => {
		console.log(JSON.stringify(killed_tiles));
	});
}

function logPinnedTabs() {
	console.log(JSON.stringify(pinned_tabs()));
}

function logFormHistory() {
	Task.spawn(function* () {
		return yield get_form_history();
	}).then((formHistory) => {
		console.log(JSON.stringify(formHistory));
	});
}

function logPageDuration() {
	console.log(page_duration());
}
