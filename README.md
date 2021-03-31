## This Bot currently has no interface. Everything is currently hardcoded!


This is a TwitchChat Text To Speech Bot which reads the messages send in the Chat.
Currently The Bot only listens to the Channel "Blasaj".

The Bot appends the string " {username} sagt:" before every message send by a new user.
Every following message from the same user will not have the string appended.
Making for a better communication flow.

Consider the Following:


Blasaj: Hallo Welt  
Blasaj: Seid ihr gut drauf?  
BorscheTV: Ja und du?  
Blasaj: Auch!  

The Bot will read it as:

Blasaj sagt: Hallo Welt.  
Seid ihr gut drauf?  
BorscheTV sagt: Ja und du?  
Blasaj sagt: Auch!  
