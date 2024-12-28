// setupWebSocket.js
const WebSocket = require("ws");
const axios = require('axios');
const fs = require('fs');
var exec = require('child_process').exec;

// === USER VARIABLES ===
let characterName;
let apiUrl;
let piperPath;
let piperModel;
// =======================

const messages = [
    {
        'role': 'assistant',
        'content': 'And so, the adventure continues...',
        // TODO you need to manually change the first messages audio id
        'audioId': '1710822196'
    }
];

var characters = [];
var isDMLoading = false;
var triggerDMVotes = [];
var pendingTriggerDMVotes = [];
var triggerRegenerateVotes = [];
var pendingRegenerateVotes = [];

const REFRESH_CHARACTERS = 'REFRESH_CHARACTERS';
const TRIGGER_DM = 'TRIGGER_DM';
const UPDATE_VOTES = 'UPDATE_VOTES';
const EDIT_MESSAGE = 'EDIT_MESSAGE';
const VOTE_REGENERATE = 'VOTE_REGENERATE';
const UPDATE_REGENERATE_VOTES = 'UPDATE_REGENERATE_VOTES';
const ERROR = 'ERROR';

let instance;
let settings;

// TODO extract all the socket data.type fields to constants

// accepts an http server (covered later)
module.exports = function (server) {
    // ws instance
    const wss = new WebSocket.Server({ server: server });
    settings = JSON.parse(fs.readFileSync('./settings.json', 'utf8'));
    characterName = settings.characterName;
    apiUrl = settings.apiUrl;
    piperPath = settings.piperPath;
    piperModel = settings.piperModel;
    instance = axios.create({
        baseURL: apiUrl,
        responseType: 'json'
    });

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
                    messages.push({
                        "role": "user",
                        "content": data.content,
                        "character": data.character
                    });
                }
                sendMessagesToClients(wss);
            } else if (data.type && data.type == TRIGGER_DM) {
                // TODO check if votes already contains character
                triggerDMVotes.push(data.name);
                pendingTriggerDMVotes.push(data.name);
                sendVoteUpdate(wss);
                if (triggerDMVotes.length >= characters.length) {
                    triggerDMVotes = [];
                    pendingTriggerDMVotes = [];
                    setDMLoading(wss, true);
                    generateGPTResponse(wss);
                }
            } else if (data.type && data.type == VOTE_REGENERATE) {
                triggerRegenerateVotes.push(data.name);
                pendingRegenerateVotes.push(data.name);
                sendRegenerateVoteUpdate(wss);
                if (triggerRegenerateVotes.length >= characters.length) {
                    triggerRegenerateVotes = [];
                    pendingRegenerateVotes = [];
                    setDMLoading(wss, true);
                    // TODO generate response
                    //generateGPTResponse(wss);
                }
            } else if (data.type && data.type == 'SET_CHARACTER') {
                pushCharacter(wss, data.character)
            } else if (data.type && data.type == EDIT_MESSAGE) {
                if (messages[data.index].content === data.oldMessage) {
                    messages[data.index].content = data.newMessage;
                    sendMessagesToClients(wss);
                } else {
                    ctx.send(JSON.stringify({ type: ERROR, message: 'Message value changed before edit could be made.' }));
                }
            }
        });

        // handle close event
        ctx.on("close", () => {
            // TODO if there is a way to get information on the client that disconnected that would be better
            console.log("Client disconnected, requesting refresh of characters on server side.");
            requestCharacterRefresh(wss);
        });

        // Send all necessary info to client on connect
        ctx.send(JSON.stringify({ type: 'MESSAGE_UPDATE', messages }));
        ctx.send(JSON.stringify({ type: 'DM_LOADING', isDMLoading }));
        ctx.send(JSON.stringify({ type: 'CHARACTER_UPDATE', characters }));
        ctx.send(JSON.stringify({ type: UPDATE_VOTES, votes: triggerDMVotes }));
    });
}

function generateGPTResponse(wss) {
    var context = "";
    const baseContext = fs.readFileSync('./context.txt', 'utf8');
    context += baseContext;
    // Adds character descriptions to the context
    context += '\n {{user}} are the player characters. The player characters are ';
    context += characters.map((char) => char.name + ': ' + char.description.replace('.', ',')).join(', ') + "\n\n";
    context += 'Do not include dialogue from ' + characters.map((char) => char.name).join(', ') + ', {{user}}, or the players in your responses. Do not include dialogue from User.';

    console.log('Chat context', context);

    const data = {};
    const headers = { 'Content-Type': 'application/json' };

    if (settings.type === 'gpt') {
        data.messages = [
            {
                "role": "developer",
                "content": [
                    { "type": "text", "text": context }
                ]
            },
            ...messages.map((message) => ({
                    "role": message.role,
                    "content": [
                        { "type": "text", "text": message.content }
                    ]
                }))
        ]
        data.model = settings.model;
        headers.Authorization = `Bearer ${settings.apiKey}`;
    } else if (settings.type === 'oobabooga') {
        data.messages = messages;
        data.mode = 'chat';
        data.character = characterName;
        data.context = context;
    } else {
        console.error('Invalid type in settings.json');
    }

    console.log('calling with data', data);
    console.log('calling with headers', headers);
    // Call your openai api
    instance({
        method: 'post',
        url: '/v1/chat/completions',
        headers,
        data
    })
        .then((response) => {
            console.log(response.data);
            const messageText = response.data.choices[0].message.content;

            // TODO piper
            if (piperPath && piperPath.length > 0) {
                const audioId = Date.now().toString();
                let piperCommand = `echo '${messageText}' | ${piperPath}`;
                piperCommand += " --sentence_silence 0.2";
                piperCommand += " --noise_scale 0.667";
                piperCommand += " --length_scale 1.0";
                piperCommand += " --noise_w 0.8";
                piperCommand += " --model ./piperModels/" + piperModel;
                piperCommand += ` --config ./piperModels/${piperModel}.json`;
                piperCommand += ` --output_file audioFiles/DND_${audioId}.wav`;
                console.log(`executing piper command ${piperCommand}`);

                let dir = exec(piperCommand, function (err, stdout, stderr) {
                    if (err) {
                        // should have err.code here?
                        console.error('was an error:', err);
                    }
                    messages.push({
                        "role": "assistant",
                        "content": messageText,
                        "audioId": audioId
                    });
                    setDMLoading(wss, false);
                    sendMessagesToClients(wss);
                    sendVoteUpdate(wss);
                });

                dir.on('exit', function (code) {
                    // exit code is code
                    console.log("Piper exited " + code);
                });
            }

            // TODO this method of doing it sucks
            // Check for a pending audioFile, files are required to be put in pending
            /*var audioId;
            fs.readdir('./audioFiles/pending/', (err, files) => {
                if (err) {
                    console.error(err);
                }

                if (files && files.length > 1) {
                    console.error('More than one pending file hmmmm');
                    messages.push({
                        "role": "assistant",
                        "content": messageText
                    });
                    setDMLoading(wss, false);
                    sendMessagesToClients(wss);
                    sendVoteUpdate(wss);
                } else if (!files || files.length < 1) {
                    console.log('No audio file in pending, assuming thats intended');
                    messages.push({
                        "role": "assistant",
                        "content": messageText
                    });
                    setDMLoading(wss, false);
                    sendMessagesToClients(wss);
                    sendVoteUpdate(wss);
                } else {
                    // TODO maybe its better to just save filename?
                    const file = files[0];
                    audioId = extractAudioIdFromFile(file);
                    fs.rename(`./audioFiles/pending/${file}`, `./audioFiles/${file}`, function (err) {
                        if (err) console.error("Unable to move audio file!");
                        console.log('Successfully renamed - AKA moved! ' + audioId)
                        messages.push({
                            "role": "assistant",
                            "content": messageText,
                            "audioId": audioId
                        });
                        setDMLoading(wss, false);
                        sendMessagesToClients(wss);
                        sendVoteUpdate(wss);
                    })
                }
            })*/
        })
        .catch((error) => console.log(error));
}

function pushCharacter(wss, character) {
    // Handle updating votes on character update
    if (character.oldName && character.name && character.oldName !== character.name) {
        const inPending = pendingTriggerDMVotes.includes(character.oldName);
        const inVotes = triggerDMVotes.includes(character.oldName);

        // if old name check if old name is in pending but not in votes
        if (inPending && !inVotes) {
            triggerDMVotes.push(character.name);
            pendingTriggerDMVotes = pendingTriggerDMVotes.filter(name => name !== character.oldName);
            pendingTriggerDMVotes.push(character.name);
        } else if (inPending && inVotes) {
            triggerDMVotes = triggerDMVotes.filter(name => name !== character.name);
            triggerDMVotes.push(character.name);
            pendingTriggerDMVotes = pendingTriggerDMVotes.filter(name => name !== character.oldName);
            pendingTriggerDMVotes.push(character.name);
        }
        // if oldName does not match, update name
    } else if ((!character.oldName && character.name) || (character.oldName === character.name)) {
        // If only new name, check if new name is in pending
        if (pendingTriggerDMVotes.includes(character.name) && !triggerDMVotes.includes(character.name)) {
            triggerDMVotes.push(character.name);
        }
    }

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
            client.send(JSON.stringify({ type: UPDATE_VOTES, votes: triggerDMVotes }));
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

function requestCharacterRefresh(wss) {
    characters = [];
    triggerDMVotes = [];
    wss.clients.forEach(function each(client) {
        if (client !== wss && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: REFRESH_CHARACTERS }));
        }
    });
}

function sendVoteUpdate(wss) {
    wss.clients.forEach(function each(client) {
        if (client !== wss && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: UPDATE_VOTES, votes: triggerDMVotes }));
        }
    });
}

// TODO vote regenerate WIP
function sendRegenerateVoteUpdate(wss) {
    wss.clients.forEach(function each(client) {
        if (client !== wss && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: UPDATE_REGENERATE_VOTES, votes: triggerRegenerateVotes }));
        }
    });
}

function extractAudioIdFromFile(fileName) {
    const splitString = fileName.split('_');
    console.log(splitString);
    const ending = splitString[splitString.length - 1];
    console.log("ending: " + ending);
    return ending.split('.')[0];
}