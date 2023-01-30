// Some refs.:
// - Diff. between VAR, LET & CONST:
// 	https://www.geeksforgeeks.org/difference-between-var-let-and-const-keywords-in-javascript/
// - Find existance in JSON:
//	https://stackoverflow.com/questions/18363618/how-to-check-if-a-json-string-has-a-value-in-javascript/18363819#18363819
// - Simple TCP server example:
//	https://riptutorial.com/node-js/example/22405/a-simple-tcp-server

// *** IMPORT CONFIGS ***
const PROTOCOL = require('./protocol');
const INSTRUMENTS = require('./instruments');

// ***  Modules  ***
// To work with UDP Datagram
const DGRAM = require('dgram');
// To work with TCP server
const NET = require('net');

// *** Constants ***
// Musician kept if he has played in the interval
const INTERVAL_UPPER_LIMIT = 5000;

/*
 * Let's create a datagram socket. We will use it to listen for datagrams published in the
 * multicast group by thermometers and containing measures
 */
const SOCKET = DGRAM.createSocket('udp4');

SOCKET.bind(PROTOCOL.PORT, function () {
    console.log("Joining multicast group");
    SOCKET.addMembership(PROTOCOL.MULTICAST_ADDRESS);
});

// Keeping track of active musicians
function Musician(uuid, instrument) {
    this.uuid = uuid;
    this.instrument = instrument;
    this.activeSince = new Date();
}

var musicians = new Map();

function isAlive(musician) {
    return (new Date() - musician.lastSeen) < 5000;
}

function getInstrument(sound) {
    switch (sound) {
        case 'ti-ta-ti':
            return 'piano';
        case 'pouet':
            return 'trumpet';
        case 'trulu':
            return 'flute';
        case 'gzi-gzi':
            return 'violin';
        case 'boum-boum':
            return 'drum';
        default:
            return 'unknown';
    }
}

// This call back is invoked when a new datagram has arrived.
SOCKET.on('message', function (msg, source) {
	const data = {
		...JSON.parse(msg),
		lastActive: Date.now(),
	};

	data.instrument = Object.keys(INSTRUMENTS.INSTRUMENTS).find((instru) => INSTRUMENTS.INSTRUMENTS[instru] === data.sound);
	data.activeSince = musicians.has(data.uuid) ? musicians.get(data.uuid).activeSince : data.lastActive;
	delete data.sound;

	musicians.set(data.uuid, data);

	console.log('Data has arrived: ' + msg + '. Source port: ' + source.port);
});

// Create a new TCP server.

const SERVER = new NET.Server();

// The server listens for any incoming connection requests.
SERVER.listen(PROTOCOL.TCP_PORT);

// New connection event.
SERVER.on('connection', function (SOCKET) {
	const now = Date.now();
	const content = Array.from(musicians.entries())
		.filter(([uuid, musician]) => {
			const toRemove = now - musician.lastActive > ACTIVE_INTERVAL;
			if (toRemove) musicians.delete(uuid);
			return !toRemove;
		})
		.map(([uuid, musician]) => ({
			uuid,
			instrument: musician.instrument,
			activeSince: new Date(musician.activeSince),
		}));
	SOCKET.write(`${JSON.stringify(content)}\n`);
	SOCKET.end();
});



