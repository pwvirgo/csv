"use strict";
// requires csv.js (currently handled in HTML)

// generate code for html table filled from an array 

var testdata = ['the', 5, 'green', 'leaves'];

function htmlTable(myray) {
	let tmp='';

	for (let j=0; j < myray.length; j++ ) 
		tmp = tmp.concat(myray[j] + ', ');
	
	console.log(tmp);
}


/*
*  produce an html table documenting the actual rules of the 
*  finite state machine used by csv.js - by accessing csv.js
*
*  requires: csv.fsmRules, csv.stateNames, and csv.chrType in scope
*/
function showRules() {
	let table='<table><tr><th>Event</th><th colspan="4">State</th></tr>' +
			'<tr><th></th>';
	for (let row=0; row < stateNames.length; row++) {
		table+='<th>' + stateNames[row] + '</th>'; 
	}
	table += '</tr>'

	/*	table +='</tr><th></th><th></th><th>inCell</th><th>inQuote</th>' +
			'<th>QinQ</th><tr>'; */
	let fsm=fsmRules; // save some typing
	let event = Object.getOwnPropertyNames(chrType);
	for (let row=0; row < event.length; row++) {
		table+='<tr><th>'  + event[row] + '</th>';
		for (let col=0; col < fsm[0].length; col++) {
			let fname= fsm[row][col][0].name;
			if (fname == "") fname = "no action";
			table=table.concat('<td>' + fname + ' -> ' +
				stateNames[fsm[row][col][1]] + '</td>');
		}
		table+='</tr>'
	}

	table=table.concat('</table>');
	console.log(table);
	return table;	
}


