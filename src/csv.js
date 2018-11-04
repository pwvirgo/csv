"use strict";

/* Convert a string of CSV file data into a 2 dimensional JS array
 * Handles any number of quotes and line feeds embedded with a cell corecctly.
 * There is no meaningful error handling.
 *  
 * uses a finite state machine.  
 * 
 *  pwvirgo  2018 */

var debug = true;
var currChr;		// object {current character, charType}
var currCell;   	// the cell currently being processed
var currRow;        // the row currently being processed
var delimit=",";	// the csv delimiter - only single character delimiters will work
var rslt = new Array();  // 2 dimensional array will hold the parsed rseults

// the event category names are here mapped to row indexes of of fsmRules
var chrType = {TEXT: 0, BLANK: 1, QUOTE: 2, DELIM: 3, EOL: 4};

// state names are here mapped to column indexes of fsmRules
var state = {NEWCELL: 0, INCELL: 1, INQCELL: 2, QQCELL: 3};

// the stateNames are here for use in debugging - not used in algorithm
var stateNames=['NEWCELL', 'INCELL', 'INQCELL', 'QQCELL'];
 
/* 2 dimensional array with rows indexed by events (chrType) and columns by state. 
 * Each cell contains a function and the next State
 */


var fsmRules = [
	[ //TEXT row
		[saveChr,  state.INCELL], [saveChr, state.INCELL],
		[saveChr, state.INQCELL], [error, state.INQCELL] 
	],  
	[  // Blank or Tab
		[function(){}, state.NEWCELL], [saveChr, state.INCELL],
		[saveChr, state.INQCELL], [function() {}, state.QQCELL],
	],
	[ // QUOTE
		[function() {}, state.INQCELL], [saveChr, state.INQCELL],
		[function() {}, state.QQCELL], [saveChr, state.INQCELL]
	], 

	[ // DELIMIT
		[saveCell, state.NEWCELL], [saveCell, state.NEWCELL],
		[saveChr, state.INQCELL], [saveCell, state.NEWCELL]
	],
	[	// end of line
		[eol, state.NEWCELL], [eol, state.NEWCELL],
		[saveChr, state.INQCELL], [saveRow, state.NEWCELL]
	]

];

// object to hold the current character, type, and location in the source
function chrObj(chr, type, cursor) {
	this.chr=chr;
	this.type=type;
	this.cursor=cursor;
}



/*  determine the category of an event
 * 
 * @param {character as string} s
 * @returns an the character type
 */
function getChrType(s) {
	switch (s) {
		case '"': return chrType.QUOTE;
		case delimit : return chrType.DELIM;
		case ' ': 
		case '\t':	return chrType.BLANK;
		case '\n': return chrType.EOL;
		default :		return chrType.TEXT;
	}
}

function error() {console.log('ERROR!');}

// return the next character - if there is not another character return null
function nextChr(source, chrp) {
	if (source.length > chrp.cursor) {
		var tmp=source.substr(chrp.cursor++, 1);
		chrp.chr=tmp;
		chrp.type=getChrType(tmp);
		return chrp;
	} else {
	    chrp.chr=null;
		return chrp;  // still need the type and cursor won't hurt
	}
}

function eol() {
	saveCell();
	saveRow();
}

function newRowCellChr() {
	saveCell();
	saveRow();
}

function saveCell() {
	//if (debug) console.log('saving cell: ' + currCell);
	currRow.push(currCell);
	currCell = '';
}

function saveChr() {
	currCell= currCell.concat(currChr.chr);
}

function saveRow() {
	rslt.push(currRow);
	currRow=[];
}

/*   ----------------------------------------------
 * Parse the (string) contents of a CSV file
 * @params	csv the string of CSV data
 *					delim the delimter used in the CSV data
 *					
 * @return a string which is an HTML table with no styling
 *   ---------------------------------------------- */
function csvToArray(csv, delim) {
	delimit = delim;
	csv=csv.trim();
	if (csv.length===0){ return "No data was found"; }
	
	rslt = [];    // the rslt is an array of rows
	// rslt[0]=[];   // the first column of the row
	var currState=state.NEWCELL;
	currCell="";
	currRow=[];
	currChr=new chrObj("", null, 0);

	currChr=nextChr(csv,currChr);
	let rule;   //less typing convenence
	// processes every char in the csv and fills the rslt array 
	while (currChr.chr !== null) {
		rule =	fsmRules[currChr.type][currState];
		rule[0](); // execute the appropriate function
		currState=rule[1]; // set the state
		currChr=nextChr(csv,currChr);
	}
	/*  do the last thing */
	rule =	fsmRules[chrType.EOL][currState];
	rule[0](); // execute the appropriate function

	console.log(rslt);
	
	return rslt;
}
