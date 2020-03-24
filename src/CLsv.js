"use strict";

/* Convert a string of CSV file data into a 2 dimensional js array 
 * using a finite state machine.
 *
 * Handles any number of quotes and line feeds embedded with a cell corecctly.
 * There is no meaningful error handling.
 *  
 * Use like this xxx=new Csv; xxx.toArray(  
 * 
 *  pwvirgo  2018 */

class Csv {
	constructor() {
		this.debug = true;
		// the stateNames are used in documentation and debugging.
		this.stateNames=["NEWCELL", "INCELL", "INQCELL", "QQCELL"];
		
		// object to hold the current character, type, and location in the source
		this.currChr = {chr: "", type: null, cursor: 0};

		this.currCell="";   	// cell currently being processed
		this.currRow="";       // row currently being processed
		this.delimit=",";	// csv delimiter - only single character delimiters will work
		this.rslt = new Array();  // 2 dimensional array will hold the parsed rseults
		
		// the event category names are here mapped to row indexes of of fsmRules
		this.chrType = {TEXT: 0, BLANK: 1, QUOTE: 2, DELIM: 3, EOL: 4};
		
		// state names are here mapped to column indexes of fsmRules
		this.state = {NEWCELL: 0, INCELL: 1, INQCELL: 2, QQCELL: 3};
	
		 
		/* 2 dimensional array with rows indexed by events (chrType) and columns by state. 
		 * Each cell contains a function and the next State
		 */
		this.fsmRules = [
			[ //TEXT row
				[this.saveChr,  this.state.INCELL], [this.saveChr, this.state.INCELL],
				[this.saveChr, this.state.INQCELL], [this.error, this.state.INQCELL] 
			],  
			[  // Blank or Tab
				[function(){}, this.state.NEWCELL], [this.saveChr, this.state.INCELL],
				[this.saveChr, this.state.INQCELL], [function() {}, this.state.QQCELL],
			],
			[ // QUOTE
				[function() {}, this.state.INQCELL], [this.saveChr, this.state.INQCELL],
				[function() {}, this.state.QQCELL], [this.saveChr, this.state.INQCELL]
			], 
		
			[ // DELIMIT
				[this.saveCell, this.state.NEWCELL], [this.saveCell, this.state.NEWCELL],
				[this.saveChr, this.state.INQCELL], [this.saveCell, this.state.NEWCELL]
			],
			[	// end of line
				[this.eol, this.state.NEWCELL], [this.eol, this.state.NEWCELL],
				[this.saveChr, this.state.INQCELL], [this.eol, this.state.NEWCELL]
			]
		
		];
	}

	
	
	
	/*  determine the category of an event
	 * 
	 * @param {character as string} s
	 * @returns an the character type
	 */
	getChrType(s) {
		switch (s) {
			case '"':	return this.chrType.QUOTE;
			case this.delimit : return this.chrType.DELIM;
			case " ": 
			case "\t":	return this.chrType.BLANK;
			case "\n":	return this.chrType.EOL;
			default :	return this.chrType.TEXT;
		}
	}
	
	error() {console.log("ERROR!");}
	
	// return the next character - if there is not another character return null
	nextChr(source, chrp) {
		if (source.length > chrp.cursor) {
			var tmp=source.substr(chrp.cursor++, 1);
			chrp.chr=tmp;
			chrp.type=this.getChrType(tmp);
			return chrp;
		} else {
		    chrp.chr=null;
			return chrp;  // still need the type and cursor won't hurt
		}
	}
	
	eol(csx) {
		csx.saveCell(csx);
		csx.saveRow(csx);
	}
	
	newRowCellChr(csx) {
		csx.saveCell(csx);
		csx.saveRow(csx);
	}
	
	saveCell(csx) {
		//if (debug) console.log("saving cell: " + this.currCell);
		csx.currRow.push(csx.currCell);
		csx.currCell = "";
	}
	
	saveChr(csx) {
		//this.currCell= (this.currCell).concat(this.currChr.chr);
		csx.currCell= (csx.currCell).concat(csx.currChr.chr);
	}
	
	saveRow(csx) {
		csx.rslt.push(csx.currRow);
		csx.currRow=[];
	}
	
	/*   ----------------------------------------------
	 * Parse the (string) contents of a CSV file
	 * @params	csv the string of CSV data
	 *					delim the delimter used in the CSV data
	 *					
	 * @return a string which is an HTML table with no styling
	 *   ---------------------------------------------- */
	toArray(csvParm, delimParm) {
		this.delimit = delimParm;
		csvParm=csvParm.trim();
		if (csvParm.length===0){ return "No data was found"; }
		
		this.rslt = [];    // the rslt is an array of rows
		var currState=this.state.NEWCELL;
		this.currCell="";
		this.currRow=[];
	
		this.currChr=this.nextChr(csvParm,this.currChr);
		let rule;   //less typing convenence
		// processes every char in the csv and fills the rslt array 
		while (this.currChr.chr !== null) {
			//this.fsmRules[this.currChr.type][currState][0]();
			rule =	this.fsmRules[this.currChr.type][currState];
			rule[0](this);		// execute the appropriate function
			currState=rule[1];	// set the state
			this.currChr=this.nextChr(csvParm,this.currChr);
		}
		/*  do the last thing */
		rule =	this.fsmRules[this.chrType.EOL][currState];
		rule[0](this); // execute the appropriate function
	
		return this.rslt;
	}
}
