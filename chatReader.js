const tmi = require('tmi.js');
const say = require('say');

// Define configuration options
const opts = {
  channels: [
    "blasaj"
  ]
};

var msgBus = [];
var lastMsgContext;

// Create a client with our options
const client = new tmi.client(opts);

// Register our event handlers (defined below)
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

// Connect to Twitch:
client.connect();

// Called every time a message comes in
function onMessageHandler (target, context, msg, self) {
    if (self) { return; } // Ignore messages from the bot

    if(context.username === "blasajs_bot" && msg.startsWith("##TTS:")){
    
        msgBus.push(msg.substr(6));
        // this makes a wierd problem
        // the shift and pushing in asynchronous manner makes the instances behave strange
    
        if(msgBus.length == 1) {
            readMessage();
        }
    }

}

// Called every time the bot connects to Twitch chat
function onConnectedHandler (addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}

function readMessage() {

    if(msgBus.length == 0) return;
    msg = msgBus[0]

    say.speak(msg, null, 1.0,  (err) => {
        if(err) {
            return console.error(err);
        }
        msgBus.shift()
        readMessage()
    } );
}