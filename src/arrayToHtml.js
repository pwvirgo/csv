"use strict";
// requires csv.js (currently handled in HTML)

// generate code for html table filled from an array 

var testdata = ['the', 5, 'green', 'leaves'];


/*  returns html table of a 1 or 2 dimensional array */
function htmlTable(myray) {
	let table='<table>\n';

	for (let row=0; row < myray.length; row++) {
		for (let col=0; col < myray[row].length; col++) {
			table=table.concat('\t<td>' + myray[row][col] + '</td>\n');
		}
		table+='</tr>\n'
	}
	table+='</table>'
	
	console.log(table);
	return table;	

}



/*
*  produce an html table documenting the actual rules of the 
*  finite state machine used by csv.js - by accessing csv.js
*
*  requires: csv.fsmRules, csv.stateNames, and csv.chrType in scope
*
*/
function showRules() {
	let table='<table>\n<tr>\n\t<th>Event</th><th colspan="4">State</th>' +
		'</tr>\n<tr>\n\t<th></th>';
	for (let row=0; row < stateNames.length; row++) {
		table+='\t<th>' + stateNames[row] + '</th>\n'; 
	}
	table += '</tr>\n'

	let fsm=fsmRules; // save some typing
	let event = Object.getOwnPropertyNames(chrType);
	for (let row=0; row < event.length; row++) {
		table+='<tr>\n\t<th>'  + event[row] + '</th>\n';
		for (let col=0; col < fsm[0].length; col++) {
			let fname= fsm[row][col][0].name;
			if (fname == "") fname = "no action";
			table=table.concat('\t<td>' + fname + ' -> ' +
				stateNames[fsm[row][col][1]] + '</td>\n');
		}
		table+='</tr>\n'
	}
	table+='</table>'
	
	console.log(table);
	return table;	
}


