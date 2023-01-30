// Some refs.:
// - Diff. between VAR, LET & CONST:
// 	https://www.geeksforgeeks.org/difference-between-var-let-and-const-keywords-in-javascript/
// - Find existance in JSON:
//	https://stackoverflow.com/questions/18363618/how-to-check-if-a-json-string-has-a-value-in-javascript/18363819#18363819

// *** IMPORT CONFIGS ***
const PROTOCOL  = require('./protocol');
const ORCHESTRE = require('./instruments');

// ***  Modules  ***
// To create UUIDs
const {v4: uuidv4} = require('uuid');
// To work with UDP Datagram
const DGRAM = require('dgram');

// *** Constants ***
// Playing duration of an instrument in [ms]
const DURATION = 1000;

// *****************
// Recover instrument name through argument & try to get its sound
const INSTRU = process.argv[2];

if (INSTRU == null) {
	console.log('Error: <%s> is not a valid key in INSTRUMENTS', INSTRU);
	return;
} else if (ORCHESTRE.INSTRUMENTS.hasOwnProperty(INSTRU) == false) {
	console.log('Given key has not a valid value in INSTRUMENTS: <%s:%s>', INSTRU, ORCHESTRE.INSTRUMENTS[INSTRU]);
	return;
} else {
	console.log('Could read in INSTRUMENTS: <%s:%s> with sound: %s', INSTRU, ORCHESTRE.INSTRUMENTS[INSTRU]);
}

// Datagram socket used to send our UDP datagrams
const SOCKET = DGRAM.createSocket('udp4');

/* Preparing Payload */ 
var tmpPayload = {};
tmpPayload.uuid = uuidv4();
tmpPayload.sound = ORCHESTRE.INSTRUMENTS[INSTRU];

const PAYLOAD = JSON.stringify(tmpPayload);
const MSG = new Buffer(PAYLOAD);

function musicianIsPlaying() {
	// Send payload via UDP (in MULTICAST)
	SOCKET.send(MSG, 0, MSG.length, PROTOCOL.PORT, PROTOCOL.MULTICAST_ADDRESS, function (err) {
		if (err)
			console.log("Error: ${err}");
		else
			console.log("Sending payload: " + PAYLOAD + " via port " + SOCKET.address().port);
	});
}

// Play the music every <DURATION> [ms]
setInterval(musicianIsPlaying, DURATION);
