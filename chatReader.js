import config from './config.json' with { type: 'json' };
import tmi from 'tmi.js';


export default class ChatReader {

    #lastUsername = '';
    #client = null;
    
    constructor(channels) {        
        this.#client = new tmi.client({channels});
        
        this.#client.on('message', this.#onMessageHandler.bind(this));
        this.#client.on('connected', this.#onConnectedHandler.bind(this));
        
        this.#client.connect();
    }
    
    onProcessMessage = (target, username, message) => { console.error('function not defined') };

    #onMessageHandler (target, context, msg, self) {
        // Ignore messages from the bot or commands
        // if (self 
        //     || config.blockedUsernames.includes(context.username.toLowerCase()) 
        //     || this.#containsBlockedPrefix(msg) 
        //     || msg == ''
        //     || (config.customRewardId && context['custom-reward-id'] !== config.customRewardId)) { return; }
        if (this.#containsBlockedPrefix(msg) || config.blockedUsernames.includes(context.username.toLowerCase())) return;
        if (self) return;

        console.log(msg)
    
        this.#processMessage(context.username, msg);
    }
  
    #containsBlockedPrefix(msg) {
        let containsBlockedPrefix = false;

        config.blockedPrefixes.forEach(prefix => {
            if (msg.startsWith(prefix)) containsBlockedPrefix = true;
        })
    
        return containsBlockedPrefix;
    }
  
    // Called every time the bot connects to Twitch chat
    #onConnectedHandler (addr, port) {
        console.log(`* Connected to ${addr}:${port}`);
    }
    
    async #processMessage(username, message) {
        // if the user is already talking to you (send the previous msg)
        // dont include his name again
        const sameUserLastMessage = this.#lastUsername === username;
        this.#lastUsername = username
        // const text = sameUserLastMessage ? this.#applyTemplate(config.messageTemplates.consecutiveMessage, username, message) : this.#applyTemplate(config.messageTemplates.firstMessage, username, message);
    
        this.onProcessMessage(this, username, message);
    }
    
    #applyTemplate(template, username, message) {
        const text = template;
        return text
            .replace('{message}', message)
            .replace('{username}', username);
    }
}