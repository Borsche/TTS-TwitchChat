import config from './config.json' with { type: 'json' };
import tmi from 'tmi.js';
import say from 'say';
import { ElevenLabsClient, stream } from 'elevenlabs';
import { Readable } from 'stream';


export default class ChatReader {

    #opts;
    #msgBus = [];
    #lastMsgContext = null;
    #client = null;
    #elevenLabsClient = null;

    constructor() {
        this.#opts = {
            channels: config.channels
        };

        this.#client = new tmi.client(this.#opts);

        this.#client.on('message', this.#onMessageHandler.bind(this));
        this.#client.on('connected', this.#onConnectedHandler.bind(this));

        this.#client.connect();

        if(!config.elevenlabsApiKey) return;

        this.#elevenLabsClient = new ElevenLabsClient({  apiKey: config.elevenlabsApiKey });
    }
  

    #onMessageHandler (target, context, msg, self) {
      // Ignore messages from the bot or commands
      if (self 
          || config.blockedUsernames.includes(context.username.toLowerCase()) 
          || this.#containsBlockedPrefix(msg) 
          || msg == ''
          || (config.customRewardId && context['custom-reward-id'] !== config.customRewardId)) { return; }
  
      const msgContext = {
          username: context.username,
          msg: msg // .replaceAll(/[^a-zA-Z0-9_., ]/g, ' ')
      }

      console.log(context);
  
      this.#msgBus.push(msgContext);
  
      // start the read
      if(this.#msgBus.length == 1) {
          this.#readMessage();
      }
  
  }
  
  #containsBlockedPrefix(msg) {
      config.blockedPrefixes.forEach(prefix => {
          if (msg.startsWith(prefix)) return true;
      })
  
      return false;
  }
  
  // Called every time the bot connects to Twitch chat
  #onConnectedHandler (addr, port) {
    console.log(`* Connected to ${addr}:${port}`);
  }
  
  async #readMessage() {
  
      if(this.#msgBus.length == 0) return;
      const msgContext = this.#msgBus[0]
  
      // if the user is already talking to you (send the previous msg)
      // dont include his name again
      const sameUserLastMessage = this.#lastMsgContext && this.#lastMsgContext.username === msgContext.username;
      this.#lastMsgContext = msgContext
      const text = sameUserLastMessage ? this.#applyTemplate(config.messageTemplates.consecutiveMessage, msgContext) : this.#applyTemplate(config.messageTemplates.firstMessage, msgContext);
  
      if(this.#elevenLabsClient !== null) {
        const audioStream = await this.#elevenLabsClient.textToSpeech.convertAsStream("g5CIjZEefAph4nQFvHAz", {
            text: text,
            model_id: 'eleven_flash_v2_5',
        })
        await stream(Readable.from(audioStream));
        this.#msgBus.shift()
        this.#readMessage();
      } else {
          say.speak(text, null, 1.0,  (err) => {
              if(err) {
                  return console.error(err);
              }
              this.#msgBus.shift()
              this.#readMessage()
          });
      }
  
  }
  
  #applyTemplate(template, msgContext) {
      const text = template;
      return text
          .replace('{message}', msgContext.msg)
          .replace('{username}', msgContext.username);
  }
}