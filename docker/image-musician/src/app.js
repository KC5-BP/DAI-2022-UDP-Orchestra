var protocol = require('./concert-protocol');

// We use a standard Node.js module to create UUIDs
const {v4: uuidv4} = require('uuid');

// We use a standard Node.js module to work with UDP
var dgram = require('dgram');

// Let's create a datagram socket. We will use it to send our UDP datagrams
var s = dgram.createSocket('udp4');

function Musician(sound) {
    this.sound = sound;
    this.uuid = uuidv4();

    Musician.prototype.playMusic = function () {
        // Serialize the sound to JSON
        var object = {};
        object.uuid = this.uuid;
        object.sound = this.sound;
        const payload = JSON.stringify(object);

        // Send the payload via UDP (multicast)
        message = new Buffer(payload);
        s.send(message, 0, message.length, protocol.PROTOCOL_PORT, protocol.PROTOCOL_MULTICAST_ADDRESS, function (err, bytes) {
            console.log("Sending payload: " + payload + " via port " + s.address().port);
            console.log(`Error: ${err}`);
        });
    }

    // Play the music every 1 second
    setInterval(this.playMusic.bind(this), 1000);
}

// Get the appropriate sound depending on the instrument
const sound = (function () {
    switch (process.argv[2]) {
        case 'piano':
            return 'ti-ta-ti';
        case 'trumpet':
            return 'pouet';
        case 'flute':
            return 'trulu';
        case 'violin':
            return 'gzi-gzi';
        case 'drum':
            return 'boum-boum';
        default:
            return 'unknown';
    }
})();

// Create a new musician
const musician = new Musician(sound);