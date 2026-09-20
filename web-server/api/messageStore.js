// messageStore.js
// Keeps the chat log on disk so messages survive a server restart.
const fs = require('fs');

// Relative to the folder the server is started from, same as settings.json and context.txt
const MESSAGES_FILE = './messages.json';
const TEMP_FILE = './messages.json.tmp';

const DEFAULT_MESSAGES = [
    {
        'role': 'assistant',
        'content': 'And so, the adventure continues...',
        // TODO you need to manually change the first messages audio id
        'audioId': '1710822196'
    }
];

// Reads the saved chat log, falling back to the opening message for a fresh game
exports.loadMessages = function() {
    let fileContents;
    try {
        fileContents = fs.readFileSync(MESSAGES_FILE, 'utf8');
    } catch (error) {
        if (error.code !== 'ENOENT') {
            console.error('Unable to read saved messages, starting a new chat log:', error);
        } else {
            console.log(`No ${MESSAGES_FILE} found, starting a new chat log.`);
        }
        return [...DEFAULT_MESSAGES];
    }

    try {
        const savedMessages = JSON.parse(fileContents);
        if (!Array.isArray(savedMessages)) {
            console.error(`${MESSAGES_FILE} does not contain a list of messages, starting a new chat log.`);
            return [...DEFAULT_MESSAGES];
        }
        console.log(`Loaded ${savedMessages.length} saved messages from ${MESSAGES_FILE}`);
        return savedMessages;
    } catch (error) {
        console.error(`Unable to parse ${MESSAGES_FILE}, starting a new chat log:`, error);
        return [...DEFAULT_MESSAGES];
    }
};

// Writes to a temp file first so a crash mid write cannot leave a half written chat log
exports.saveMessages = function(messages) {
    try {
        fs.writeFileSync(TEMP_FILE, JSON.stringify(messages, null, 2));
        fs.renameSync(TEMP_FILE, MESSAGES_FILE);
    } catch (error) {
        console.error('Unable to save messages:', error);
    }
};
