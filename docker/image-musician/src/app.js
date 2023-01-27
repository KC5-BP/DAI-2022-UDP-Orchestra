var protocol = require('./concert-protocol');

// We use a standard Node.js module to work with UDP
var dgram = require('dgram');

// Let's create a datagram socket. We will use it to send our UDP datagrams
var s = dgram.createSocket('udp4');

function Musician(sound) {
    this.sound = sound;

    Musician.prototype.playMusic = function () {
        // Serialize the sound to JSON
        const payload = JSON.stringify(this.sound);

        // Send the payload via UDP (multicast)
        message = new Buffer(payload);
        s.send(message, 0, message.length, protocol.PROTOCOL_PORT, protocol.PROTOCOL_MULTICAST_ADDRESS, function (err, bytes) {
            console.log("Sending payload: " + payload + " via port " + s.address().port);
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