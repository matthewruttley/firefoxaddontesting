//Creates an alert button that displays the last 5 history items the user looked at to the console
//Created on 2014-07-03 by mruttley
//for tutorial purposes only, I'm sure there are much more efficient ways of doing this

const {Cc,Ci} = require("chrome");
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

function historyCount(){
	//how long is the user's browsing history?
	var historyService = Cc["@mozilla.org/browser/nav-history-service;1"].getService(Ci.nsINavHistoryService);
    var result = historyService.executeQuery(historyService.getNewQuery(), historyService.getNewQueryOptions());
    var cont = result.root;
    cont.containerOpen = true;
	return cont.childCount;
    cont.containerOpen = false;
}

function getHistory(){
	//Generator that yields the most recent history urls
	
	//create the history service
	var historyService = Cc["@mozilla.org/browser/nav-history-service;1"].getService(Ci.nsINavHistoryService);

	//make a blank query
	var options = historyService.getNewQueryOptions();
	var query = historyService.getNewQuery();
	var result = historyService.executeQuery(query, options);

	//open up the results
	var cont = result.root;
	cont.containerOpen = true;
	
	//yield whatever there is
	for(var i=0; i < cont.childCount; i++){
		var node = cont.getChild(i);
		yield node.uri;
	}
	
	//close the results container
	cont.containerOpen = false;
}

