// Some refs.:
// - 09-UDPThermometer
// 	https://github.com/HEIGVD-Course-DAI/CodeExamples/tree/main/09-UDPThermometers
// - Diff. between VAR, LET & CONST:
// 	https://www.geeksforgeeks.org/difference-between-var-let-and-const-keywords-in-javascript/
// - Find existance in JSON:
// 	https://stackoverflow.com/questions/18363618/how-to-check-if-a-json-string-has-a-value-in-javascript/18363819#18363819
// - Simple TCP server example:
//	https://riptutorial.com/node-js/example/22405/a-simple-tcp-server

var protocol = require('./concert-protocol');

// We use a standard Node.js module to work with UDP
var dgram = require('dgram');

const NET = require('net');

// *** Constants ***
// Musician kept if he has played in the interval
const INTERVAL_UPPER_LIMIT = 5000;

// Keeping track of active musicians
function Musician(uuid, instrument) {
    this.uuid = uuid;
    this.instrument = instrument;
    this.activeSince = new Date();
}

var musicians = new Map();

function hasStoppedPlaying(musician) {
    return (new Date() - musician.lastSeen) > INTERVAL_UPPER_LIMIT;
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

/*
 * Let's create a datagram socket. We will use it to listen for datagrams published in the
 * multicast group by thermometers and containing measures
 */
const socket = dgram.createSocket('udp4');
socket.bind(protocol.PROTOCOL_PORT, function () {
    console.log("Joining multicast group");
    socket.addMembership(protocol.PROTOCOL_MULTICAST_ADDRESS);
});

// This call back is invoked when a new datagram has arrived.
socket.on('message', function (msg, source) {
    console.log("Data has arrived: " + msg + ". Source port: " + source.port);
    msg = JSON.parse(msg);
    if (musicians.has(msg.uuid)) {
        musicians.get(msg.uuid).lastSeen = new Date();
        console.log("Updated musician " + msg.uuid);
    } else {
        musicians.set(msg.uuid, new Musician(msg.uuid, getInstrument(msg.sound)));
        console.log("Added musician " + msg.uuid);
    }
});

const server = NET.createServer()

// The server listens for any incoming connection requests.
server.listen(protocol.TCP_PROTOCOL_PORT, function () {
    console.log(`Server listening for connection requests on socket localhost:${protocol.TCP_PROTOCOL_PORT}.`);
});

// New connection event.
server.on('connection', function (socket) {
    console.log('A new connection has been established.');
    console.log('All musicians: ' + JSON.stringify(Array.from(musicians.values())));

    for (const [key, value] of musicians)
        if (hasStoppedPlaying(value))
            musicians.delete(key);

    socket.write(JSON.stringify(Array.from(musicians.values())));
    console.log('Sent the list of active musicians to the client: ' + JSON.stringify(Array.from(musicians.values())));

    // Catch errors.
    socket.on('error', function (err) {
        console.log(`Error: ${err}`);
    });

    socket.end();
});



