// Chat, this is epic
'use strict';
const axios = require('axios');
const fs = require('fs');

const messages = [
    {
        'role': 'DM',
        'content': "And so, the adventure continues...",
        'audioId': '1710822196'
    }
];

const instance = axios.create({
    baseURL: 'http://127.0.0.1:5000',
    responseType: 'json'
});

exports.submit = function(req, res) {
	console.log(req.body.message);
    
    if (req.body.message.length > 0) {
        // Add to existing messages
        messages.push({
            "role": "user",
            "content": req.body.message
        });
    }

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
            "character": "DND"
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
                    "role": "DM",
                    "content": messageText
                });
                res.send({ messages });
            } else if (!files || files.length < 1) {
                console.log('No audio file in pending, assuming thats intended');
                messages.push({
                    "role": "DM",
                    "content": messageText
                });
                res.send({ messages });
            } else {
                // TODO maybe its better to just save filename?
                const file = files[0];
                audioId = extractAudioIdFromFile(file);
                fs.rename(`./audioFiles/pending/${file}`, `./audioFiles/${file}`, function (err) {
                    if (err) console.error("Unable to move audio file!");
                    console.log('Successfully renamed - AKA moved! ' + audioId)
                    messages.push({
                        "role": "DM",
                        "content": messageText,
                        "audioId": audioId
                    });
                    res.send({ messages });
                })
            }
        })
    })
    .catch((error) => console.log(error));
};

exports.getHistory = function(req, res) {
    // TODO maybe generate starting of story if there are no messages
    console.log("Returning history...");
    res.send({ messages });
};

exports.getAudioFile = function(audioId) {
    // TODO relative path
    return "O:\\DND AI\\web-server\\audioFiles\\DND_"+audioId+".wav";
};

function extractAudioIdFromFile(fileName) {
    const splitString = fileName.split('_');
    console.log(splitString);
    const ending = splitString[splitString.length-1];
    console.log("ending: " + ending);
    return ending.split('.')[0];
}