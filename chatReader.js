const tmi = require('tmi.js');
const say = require('say');
const config = require('./config.json');

// Define configuration options
const opts = {
  channels: config.channels
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
    // Ignore messages from the bot or commands
    if (self 
        || config.blockedUsernames.includes(context.username.toLowerCase()) 
        || containsBlockedPrefix(msg) 
        || msg == '') { return; }

    msgContext = {
        username: context.username,
        msg: msg.replaceAll(/[^a-zA-Z0-9_., ]/g, ' ')
    }

    msgBus.push(msgContext);

    // start the read
    if(msgBus.length == 1) {
        readMessage();
    }

}

function containsBlockedPrefix(msg) {
    config.blockedPrefixes.forEach(prefix => {
        if (msg.startsWith(prefix)) return true;
    })

    return false;
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler (addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}

function readMessage() {

    if(msgBus.length == 0) return;
    msgContext = msgBus[0]

    // if the user is already talking to you (send the previous msg)
    // dont include his name again
    const sameUserLastMessage = lastMsgContext != undefined && lastMsgContext.username === msgContext.username;
    lastMsgContext = msgContext
    const text = sameUserLastMessage ? applyTemplate(config.messageTemplates.consecutiveMessage, msgContext) : applyTemplate(config.messageTemplates.firstConsecutive, msgContext);

    say.speak(text, null, 1.0,  (err) => {
        if(err) {
            return console.error(err);
        }
        msgBus.shift()
        readMessage()
    });

}

function applyTemplate(template, msgContext) {
    const text = template;
    return text
        .replace('{message}', msgContext.msg)
        .replace('{username}', msgContext.username);
}