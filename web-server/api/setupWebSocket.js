// setupWebSocket.js
const WebSocket = require("ws");
const axios = require('axios');
const fs = require('fs');

const messages = [
    {
        'role': 'DND',
        'content': "And so, the adventure continues...",
        'audioId': '1710822196'
    }
];

var characters = []

var isDMLoading = false;

const instance = axios.create({
    baseURL: 'http://127.0.0.1:5000',
    responseType: 'json'
});

// TODO extract all the socket data.type fields to constants

// accepts an http server (covered later)
module.exports = function (server) {
  // ws instance
  const wss = new WebSocket.Server({ server: server });

  // what to do after a connection is established
  wss.on("connection", (ctx) => {
    // print number of active connections
    console.log("connected", wss.clients.size);

    // handle message events
    // receive a message and echo it back
    ctx.on("message", (dataString) => {
        const data = JSON.parse(dataString);
        console.log(data);
        if (data.type && data.type == 'SEND_MESSAGE' && !isDMLoading) {
                console.log('Type is SEND_MESSAGE');
                if (data.content.length > 0) {
                    // Add to existing messages
                    console.log('Message length is good');
                    messages.push({
                        "role": "user",
                        "content": data.content
                    });
                }
                sendMessagesToClients(wss);
        } else if(data.type && data.type == 'TRIGGER_DM') {
            setDMLoading(wss, true);
            generateGPTResponse(wss);
        } else if(data.type && data.type == 'SET_CHARACTER') {
            pushCharacter(wss, data.character)
        }
    });

    // handle close event
    ctx.on("close", () => {
      console.log("closed", wss.clients.size);
    });

    // sent a message that we're good to proceed
    ctx.send(JSON.stringify({ type: 'MESSAGE_UPDATE', messages }));
    ctx.send(JSON.stringify({ type: 'DM_LOADING', isDMLoading }));
    ctx.send(JSON.stringify({ type: 'CHARACTER_UPDATE', characters }));
  });
}

function generateGPTResponse(wss) {
    var context = "";
    const baseContext = fs.readFileSync('./context.txt', 'utf8');
    context += baseContext;
    context += '\n {{user}} are the player characters. The player characters are ';
    context += characters.map((char) => char.name + ': ' + char.description.replace('.', ',')).join(', ') + "\n\n";
    context += 'Describe all npc appearances that talk in a scene in detail. Do not include dialogue from ' + characters.map((char) => char.name).join(', ') + ', {{user}}, or the players in your responses.';

    console.log(context);
    // Call your openai api
    instance({
        method: 'post',
        url: '/v1/chat/completions',
        headers: {
            'Content-Type': 'application/json',
        },
        data: {
            "messages": messages,
            "mode": "chat",
            "character": "DND",
            "context": context
        }
    })
    .then((response) => {
        console.log(response.data);
        const messageText = response.data.choices[0].message.content;

        // TODO this method of doing it sucks
        // Check for a pending audioFile, files are required to be put in pending
        var audioId;
        fs.readdir('./audioFiles/pending/', (err, files) => {
            if (err) {
                console.error(err);
            }

            if (files && files.length > 1) {
                console.error('More than one pending file hmmmm');
                messages.push({
                    "role": "DND",
                    "content": messageText
                });
                setDMLoading(wss, false);
                sendMessagesToClients(wss);
            } else if (!files || files.length < 1) {
                console.log('No audio file in pending, assuming thats intended');
                messages.push({
                    "role": "DND",
                    "content": messageText
                });
                setDMLoading(wss, false);
                sendMessagesToClients(wss);
            } else {
                // TODO maybe its better to just save filename?
                const file = files[0];
                audioId = extractAudioIdFromFile(file);
                fs.rename(`./audioFiles/pending/${file}`, `./audioFiles/${file}`, function (err) {
                    if (err) console.error("Unable to move audio file!");
                    console.log('Successfully renamed - AKA moved! ' + audioId)
                    messages.push({
                        "role": "DND",
                        "content": messageText,
                        "audioId": audioId
                    });
                    setDMLoading(wss, false);
                    sendMessagesToClients(wss);
                })
            }
        })
    })
    .catch((error) => console.log(error));
}

function pushCharacter(wss, character) {
    if (character.oldName) {
        // If updating from old name, remove old character
        characters = characters.filter(char => char.name !== character.oldName);
    }
    if (characters.find(char => char.name === character.name)) {
        console.log("Character already exists, will update instead");
        // If there is an existing character, filter it out and add new one
        characters = characters.filter(char => char.name !== character.name);
    }
    if (character.name && character.name.length > 0) {
        characters.push({
            name: character.name,
            description: character.description
        });
    }

    wss.clients.forEach(function each(client) {
        if (client !== wss && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'CHARACTER_UPDATE', characters }));
        }
    });
}

function sendMessagesToClients(wss) {
    console.log("Sending messages to clients");
    wss.clients.forEach(function each(client) {
        if (client !== wss && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'MESSAGE_UPDATE', messages }));
        }
    });
}

function setDMLoading(wss, isLoading) {
    isDMLoading = isLoading;
    console.log("Sending messages to clients");
    wss.clients.forEach(function each(client) {
        if (client !== wss && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'DM_LOADING', isDMLoading }));
        }
    });
}

function extractAudioIdFromFile(fileName) {
    const splitString = fileName.split('_');
    console.log(splitString);
    const ending = splitString[splitString.length-1];
    console.log("ending: " + ending);
    return ending.split('.')[0];
}