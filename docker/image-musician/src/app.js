
// *** IMPORT CONFIGS ***
const PROTOCOL  = require('./protocol');
const ORCHESTRE = require('./instruments');

// ***  Modules  ***
// To create UUIDs
const {v4: uuidv4} = require('uuid');
// To work with UDP Datagram
const DGRAM = require('dgram');

// Let's create a datagram socket. We will use it to send our UDP datagrams
const SOCKET = DGRAM.createSocket('udp4');

// *** Constants ***
// Playing duration of an instrument in [ms]
const DURATION = 1000;

// *****************
// Recover instrument name through argument & try to get its sound
const INSTRU = process.argv[2];

function Musician(sound) {
    this.sound = sound;
    this.uuid = uuidv4();

    Musician.prototype.playMusic = function () {
        // Serialize the sound with the uuid to JSON
        var payloadBuilder = {};
        payloadBuilder.uuid = this.uuid;
        payloadBuilder.sound = this.sound;
        const payload = JSON.stringify(payloadBuilder);

        // Send payload via UDP (multicast)
        const MSG = Buffer.from(payload);
        SOCKET.send(MSG, 0, MSG.length, PROTOCOL.PORT, PROTOCOL.MULTICAST_ADDRESS, function (err, bytes) {
            console.log("Sending payload: " + payload + " via port " + SOCKET.address().port);
            console.log(`Error: ${err}`);
        });
    }

    // Play the music every <DURATION>
    setInterval(this.playMusic.bind(this), DURATION);
}

// Get the appropriate sound depending on the instrument
const SOUND = (function () {
    if (INSTRU == null)
        console.log('Error: <%s> is not a valid key in INSTRUMENTS', INSTRU);

    else if (ORCHESTRE.INSTRUMENTS.hasOwnProperty(INSTRU) == false)
        console.log('Key %s has no property in INSTRUMENTS', INSTRU);
    
    else
        console.log('Read in INSTRUMENTS: <%s:%s>', INSTRU, ORCHESTRE.INSTRUMENTS[INSTRU]);
    
    return ORCHESTRE.INSTRUMENTS[INSTRU];
})();

// Create a new musician
const MUSICIAN = new Musician(SOUND);