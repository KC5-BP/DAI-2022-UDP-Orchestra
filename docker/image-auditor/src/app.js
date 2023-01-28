var protocol = require('./concert-protocol');

// We use a standard Node.js module to create UUIDs
import { v4 as uuidv4 } from 'uuid';

// We use a standard Node.js module to work with UDP
var dgram = require('dgram');

/*
 * Let's create a datagram socket. We will use it to listen for datagrams published in the
 * multicast group by thermometers and containing measures
 */
const socket = dgram.createSocket('udp4');
socket.bind(protocol.PROTOCOL_PORT, function() {
    console.log("Joining multicast group");
    socket.addMembership(protocol.PROTOCOL_MULTICAST_ADDRESS);
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
socket.on('message', function(msg, source) {
    console.log("Data has arrived: " + msg + ". Source port: " + source.port);
    if(musicians.has(source.port)) {
        musicians.get(source.port).lastSeen = new Date();
    } else {
        musicians.set(source.port, new Musician(uuidv4(), getInstrument(msg)));
    }

    // musicians = musicians.filter(isAlive);
});





