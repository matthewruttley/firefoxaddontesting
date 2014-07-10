//Module to analyze search keywords in a user's browsing history
//Created on 2014-07-09 by mruttley
//untested so far.

//var uri = require("URI")  // <-- will this work?

function LDA_cluster_searches(how_many_days_into_the_past){
    //tries to cluster a user's searches using LDA
    //input: an integer representing how many days of history to look into
    //output: a list of lists of clusters
    //TODO
    clusters = []
    return clusters
}

function discoverSearchVariables() {
    //Input: none
    //Output: a list of domains and their search GET variables
    
    //Process:
    //1.1 Iterate through all URLs
    //1.2 If there is anything with a value like kw+kw then attribute that to a domain
    //2. Return a dictionary of domains and get variables
    
	domainGetVars = {}
	
	//first scan to find domain-variable combos
	history = getHistory()
	for(var i in history){
		url = history[i]
        
        //verify that the url is worth looking at - must have some sort of get var in it
        if (url.indexOf("=") == -1) {
            continue; //skip it
        }
        
		//Need to detect if there's anything like domain.com?var=search+keyword
		//or domain.com?var=search%20keyword
		//using a regex
		var search_matcher = /.+(%20|\+).+/
		
        if (search_matcher.test(url)) {
            //If there is a positive match
            //get the domain
            domain = getDomain(url) //ok to get subdomain as well since search fields may be different
            //get the get variables and values
            get_vars = parseGetVariables(url)
            //iterate through variables, check if they look like searches
            for (var gv in get_vars) {
                if (search_matcher.test(get_vars[gv])) {
                    //looks like a search
                    //first make sure the dictionary is in order
                    if (domainGetVars[domain]==false) {
                        domainGetVars[domain] = {}
                    }
                    if (domainGetVars[domain][gv]==false) {
                        domainGetVars[domain][gv] = 0
                    }
                    //then finally add the variable entry
                    domainGetVars[domain][gv] += 1
                }
            }
        }
	}
    return domainGetVars
}

function occurrences(string, subString, allowOverlapping){
    //Functionality to calculate substring occurrences
    //http://stackoverflow.com/a/7924240
    string+=""; subString+="";
    if(subString.length<=0) return string.length+1;

    var n=0, pos=0;
    var step=(allowOverlapping)?(1):(subString.length);

    while(true){
        pos=string.indexOf(subString,pos);
        if(pos>=0){ n++; pos+=step; } else break;
    }
    return(n);
}

function getDomain(url) {
    //Input: A url
    //Output: The domain including subdomain
    return url.split("://")[1].split('/')[0]
}

function parseGetVariables(url) {
    //input: a url
    //output: an object containing all the get variables and values
    
    getVars = {}
    
    //get the domain
    domain = getDomain(url) //ok to get subdomain as well since search fields may be different
    
    //get the get variables and values
    rest_of_url = url.split(domain+"/")[1]
    hash = rest_of_url.indexOf("#") //iterate through all hash items?
    if (hash!=-1) {
        rest_of_url = rest_of_url.split("#")
    }
    
    for (var hashchunk in rest_of_url) {
        //iterate through each hashchunk
        chunk = rest_of_url[hashchunk]
        //gather the get variables
        chunk = chunk.split("&")
        for (var keyval_pair in chunk) {
            if (chunk[keyval_pair].indexOf('=')!=-1) {
                kvp = chunk[keyval_pair].split("=")
                variable = kvp[0]
                value = kvp[1]
                getVars[variable] = value
            }
        }
    }
    
    return getVars
}

function getSearchKeywords(searchGetVariables, howManyDays){
	//Input: an object of search get variables calculated by discoverSearchVariables()
    //Output: a flat list of the user's search keywords
    
    //Process: 
    //1. Iterate through entire history
    //1. If the domain is in the get variable object, 
	//then rescans, using the variables and domains learned

    //issues: often searches are kept as get variables throughout the entire session
    //on sites like Amazon. This means that we need to dedupe on a per-session basis. 
    
    searches = [];
    var history = getHistory();
    
    for (var url in history) {
        if (searchGetVariables[history[url]]) {
            //TODO
        }
    }
}