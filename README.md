## Simple TTS for Twitch Chat Messages

This is a TwitchChat Text To Speech Bot which reads the messages send in the Chat.
The channels the bot listens to can be configured inte the `config.json`.

Aswell as the output of consecutive messages which improves the flow.

Take a look at the `example.config.json`:
```json
{
    "channels": [
        "blasaj"
    ],
    "blockedUsernames": [
        "streamlabs"          // this will prevent the bot to read out messages which where send from the streamlabs bot (this check if performed in lowercase)
    ],
    "blockedPrefixes": [
        "!"                   // this will prevent the bot to read out chat commands
    ],
    "messageTemplates": {
        "firstConsecutive": "{username} sagt: {message}",  // the template for the first consecutive message
        "consecutiveMessage": "{message}"                  // the template for all the other uninteruppted messages from the same use
    } 
}
```

This config will make the bot listen to messages from the channel 'blasaj'.
While ignoring all messages from the user "streamlabs", "Streamlabs" etc. and messages starting with "!" (usually commands).
The template setting will cause the following result:

**Twitch Chat:**  
Blasaj: Hallo Welt  
Blasaj: Seid ihr gut drauf?  
BorscheTV: Ja und du?  
Blasaj: Auch!  

**The Bot will read it as:**  
Blasaj sagt: Hallo Welt.  
Seid ihr gut drauf?  
BorscheTV sagt: Ja und du?  
Blasaj sagt: Auch!  
