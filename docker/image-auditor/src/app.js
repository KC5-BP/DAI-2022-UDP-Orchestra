var protocol = require('./concert-protocol');

// We use a standard Node.js module to work with UDP
var dgram = require('dgram');

// Include Nodejs' net module for TCP server.
// const Net = require('net');

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
    if (musicians.has(msg.uuid)) {
        musicians.get(msg.uuid).lastSeen = new Date();
        console.log("Updated musician " + msg.uuid);
    } else {
        musicians.set(msg.uuid, new Musician(msg.uuid, getInstrument(msg.sound)));
        console.log("Added musician " + msg.uuid);
    }
});

// Create a new TCP server.
// Based on the example from https://riptutorial.com/node-js/example/22405/a-simple-tcp-server

// const server = new Net.Server();
const server = require('net').createServer()

// The server listens for any incoming connection requests.
server.listen(protocol.TCP_PROTOCOL_PORT, function () {
    console.log(`Server listening for connection requests on socket localhost:${protocol.TCP_PROTOCOL_PORT}.`);
});

// New connection event.
server.on('connection', function (socket) {
    console.log('A new connection has been established.');

    // Send the list of active musicians to the client.
    const activeMusicians = new Map(
        [...musicians].filter(isAlive) // Black js magic
    );
    socket.write(JSON.stringify(Array.from(activeMusicians.values())));
    console.log('Sent the list of active musicians to the client: ' + JSON.stringify(Array.from(activeMusicians.values())));

    // // On end event.
    // socket.on('end', function () {
    //     console.log('Closing connection with the client');
    // });
    //
    // // Catch errors.
    // socket.on('error', function (err) {
    //     console.log(`Error: ${err}`);
    // });

});



