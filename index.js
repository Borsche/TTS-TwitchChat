import config from './config.json' with { type: 'json' };
import ChatReader from "./chatReader.js";
import { ElevenLabsClient } from 'elevenlabs';
import express from "express";
import { Server } from "socket.io";
import http from "http";


const chatReader = new ChatReader(config.channels);

const elevenLabsClient = config.elevenlabsApiKey ? new ElevenLabsClient({  apiKey: config.elevenlabsApiKey }) : null;

const VOICES = {
    WHISPER: 'g5CIjZEefAph4nQFvHAz',
    PATRICK: 'XvCP57PAoOIggYMP8Yvs',
    BLASAJ: '7VOCa3OKvOom4qbwuu0H',
    SCREAM: 'g4ucswVjPpazgbDDe327',
    PETRA: 'iJoeYUpAnk7y7qkEzmNU',
    BELLO: '22a7Gh6Zmscuaq9cfG65',
    BENJAMIN: 'nZpMT2RjIpaat0IaA7Sd',
    SANTA: 'M4zkunnpRihDKTNF0D7f',
    RUHBERT: 'TUKJhQmz3RPYBNAgC5A1',
} 

/**
 * Take voices from this pool first and remove every taken on so every gets a unique voice
 */
const firstAvailableVoices = Object.keys(VOICES).filter(voice => voice !== 'BELLO').map(voice => ({ voice, sort: Math.random() })).sort((a, b) => a.sort - b.sort).map(({ voice }) => voice);


const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

const messageQueue = [];
let isProcessing = false;

const userVoiceMap = new Map();


chatReader.onProcessMessage = async (reader, username, message) => {
    messageQueue.push({
        username,
        message,
    })

    if (!isProcessing) {
        processQueue();
    }
}

async function processQueue() {
    if (messageQueue.length === 0) {
        isProcessing = false;
        return
    }

    isProcessing = true;
    const current = messageQueue.shift();

    try {
        const voice = getUserVoice(current.username);

        const audioData = await getElevenLabsTTS(current.message, voice);

        io.emit('tts-message', {
            username: current.username,
            message: current.message,
            audio: audioData
        })

        console.log('Sent TTS for: ' + current.username);
    } catch (e) {
        console.error('Error processing TTS: ', e);
    }

    // Wait a bit before processing next (optional delay)
    setTimeout(() => {
        processQueue();
    }, 500);
}

function getUserVoice(username) {
    const lowerUsername = username.toLowerCase();

    if (!userVoiceMap.has(lowerUsername)) {

        let randomVoice;

        // first select from the list of voices so all voices are in use
        if(firstAvailableVoices.length != 0) {
            randomVoice = firstAvailableVoices.pop();
        } else {
            const voicesKeys = Object.keys(VOICES);
            randomVoice = voicesKeys[Math.floor(voicesKeys.length * Math.random())];
        }

        userVoiceMap.set(lowerUsername, VOICES[randomVoice]);
        console.log('Set Voice for: ' + lowerUsername + ' as ' + randomVoice);
    }

    return userVoiceMap.get(lowerUsername) ?? VOICES.WHISPER;
}

async function getElevenLabsTTS(text, voice) {
    try {
        const audioStream = await elevenLabsClient.textToSpeech.convert(voice, {
            text,
            model_id: 'eleven_flash_v2_5',
        });

        const chunks = [];
        for await (const chunk of audioStream) {
            chunks.push(chunk);
        }

        const audioBuffer = Buffer.concat(chunks);
        return audioBuffer.toString("base64");
    } catch (e) {
        console.error('ElevenLabs API error: ', e);
        throw error;
    }
}

io.on('connection', (socket) => {
    console.log('Browser source connected');

    socket.on('disconnect', () => {
        console.log('Browser source disconnected');
    })
})

server.listen(3000, () => {
    console.log(`Server running on http://localhost:${3000}`);
    console.log(`Add http://localhost:${3000} as OBS Browser Source`);
})


