// Some refs.:
// - Diff. between VAR, LET & CONST:
// 	https://www.geeksforgeeks.org/difference-between-var-let-and-const-keywords-in-javascript/
// - Find existance in JSON:
//	https://stackoverflow.com/questions/18363618/how-to-check-if-a-json-string-has-a-value-in-javascript/18363819#18363819

// *** IMPORT CONFIGS ***
const PROTOCOL = require('./protocol');
const INSTRUMENTS = require('./instruments');

// ***  Modules  ***
// To create UUIDs
const {v4: uuidv4} = require('uuid');
// To work with UDP Datagram
const DGRAM = require('dgram');

// *** Constants ***
// Playing duration of an instrument in [ms]
const DURATION = 1000

// *****************
// Recover instrument name through argument & try to get its sound
const INSTRU = process.argv[2];
var instruSound;
if (INSTRU == null) {
	console.log('The %s: is not a valid key in INSTRUMENTS', instru);
	return;
} else if (INSTRUMENTS.INSTRUMENTS.hasOwnProperty(INSTRU) == false) {
	console.log('The given key has not a valid value in INSTRUMENTS: <%s:%s>', INSTRU, INSTRUMENTS.INSTRUMENTS[INSTRU]);
	return;
} else {
	instruSound = INSTRUMENTS.INSTRUMENTS[INSTRU];
}

// Datagram socket used to send our UDP datagrams
const SOCKET = DGRAM.createSocket('udp4');

var object = {};
object.uuid = uuidv4();
object.sound = instruSound;
const PAYLOAD = JSON.stringify(object);
const MSG = new Buffer(PAYLOAD);

function musicianIsPlaying(sound) {
	// Send the payload via UDP (multicast)
        s.send(MSG, 0, MSG.length, PROTOCOL.PORT, PROTOCOL.MULTICAST_ADDRESS, function (err) => {
		if (err)
			console.log("Error: ${err}");
		else
			console.log("Sending payload: " + PAYLOAD + " via port " + SOCKET.address().port);
	});
}

// Play the music every 1 second
setInterval(musicianIsPlaying(instruSound), DURATION);
