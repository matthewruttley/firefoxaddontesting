function historyCount(){
	//returns the length of the user's history
	var historyService = Cc["@mozilla.org/browser/nav-history-service;1"].getService(Ci.nsINavHistoryService);
    var result = historyService.executeQuery(historyService.getNewQuery(), historyService.getNewQueryOptions());
    var cont = result.root;
    cont.containerOpen = true;
	count = cont.childCount;
    cont.containerOpen = false;
    return count
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
