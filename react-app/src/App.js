"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
require("./App.css");
const ChatMessage_1 = __importDefault(require("./components/ChatMessage"));
const react_cookie_1 = require("react-cookie");
const CreateCharacterModal_1 = __importDefault(require("components/CreateCharacterModal"));
const material_1 = require("@mui/material");
const LobbyList_1 = __importDefault(require("components/LobbyList"));
const Badge_1 = __importDefault(require("@mui/material/Badge"));
const ErrorHook_1 = require("components/ErrorHook");
const ErrorPopUps_1 = require("components/ErrorPopUps");
function IsScrolledNearBottom() {
    const threshold = document.body.clientHeight - window.innerHeight - 200;
    return document.documentElement.scrollTop > threshold;
}
function App() {
    const [messages, setMessages] = (0, react_1.useState)([]);
    const [currentMessage, setCurrentMessage] = (0, react_1.useState)('');
    const [isDMLoading, setIsDMLoading] = (0, react_1.useState)(false);
    const [loggedInCharacters, setLoggedInCharacters] = (0, react_1.useState)([]);
    const [triggerDM, setTriggerDM] = (0, react_1.useState)(() => () => { });
    const [sendMessage, setSendMessage] = (0, react_1.useState)(() => (character, content) => { });
    const [sendCharUpdate, setSendCharUpdate] = (0, react_1.useState)(() => (character, oldName) => { });
    const [sendMessageUpdate, setSendMessageUpdate] = (0, react_1.useState)(() => (oldMessage, newMessage, index) => { });
    const [numVoted, setNumVoted] = (0, react_1.useState)(0);
    const { errors, pushError, cancelError } = (0, ErrorHook_1.useErrorHook)([]);
    // User specific data
    const [characterName, setCharacterName] = (0, react_1.useState)();
    const [characterDescription, setCharacterDescription] = (0, react_1.useState)();
    const [oldName, setOldName] = (0, react_1.useState)();
    const [cookies, setCookie] = (0, react_cookie_1.useCookies)(['user']);
    const [connected, setConnected] = (0, react_1.useState)(false);
    const [shouldRefreshChar, setShouldRefreshChar] = (0, react_1.useState)(false);
    const [shouldScroll, setShouldScroll] = (0, react_1.useState)(true);
    const messagesEndRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        const socket = new WebSocket("ws://" + window.location.host);
        socket.addEventListener('open', function (event) {
            console.log("Connected to server");
            setConnected(true);
        });
        socket.addEventListener('message', function (event) {
            console.log("Message from server ", event.data);
            const data = JSON.parse(event.data);
            if (data.type && data.type === 'MESSAGE_UPDATE') {
                setShouldScroll(IsScrolledNearBottom());
                setMessages(data.messages);
            }
            else if (data.type && data.type === 'DM_LOADING') {
                setIsDMLoading(data.isDMLoading);
            }
            else if (data.type && data.type === 'CHARACTER_UPDATE') {
                setLoggedInCharacters(data.characters);
            }
            else if (data.type && data.type === 'REFRESH_CHARACTERS') {
                setShouldRefreshChar(true);
            }
            else if (data.type && data.type === 'UPDATE_VOTES') {
                setNumVoted(data.votes.length);
            }
            else if (data.type && data.type === 'ERROR') {
                pushError(data.message);
            }
        });
        // Make it so sending a message send over socket
        setSendMessage(() => {
            return (character, content) => {
                socket.send(JSON.stringify({
                    type: "SEND_MESSAGE",
                    character,
                    content
                }));
            };
        });
        // Trigger the chatgpt response
        setTriggerDM(() => {
            return () => {
                socket.send(JSON.stringify({
                    type: "TRIGGER_DM",
                    name: characterName
                }));
            };
        });
        // Trigger character update
        setSendCharUpdate(() => {
            return (character, oldName) => {
                socket.send(JSON.stringify({
                    type: "SET_CHARACTER",
                    character: {
                        name: character.name,
                        description: character.description,
                        oldName
                    }
                }));
            };
        });
        // Trigger message edit
        setSendMessageUpdate(() => {
            return (oldMessage, newMessage, index) => {
                socket.send(JSON.stringify({
                    type: "EDIT_MESSAGE", newMessage, oldMessage, index
                }));
            };
        });
    }, []);
    (0, react_1.useEffect)(() => {
        if (messagesEndRef.current && shouldScroll) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
            setShouldScroll(false);
        }
    }, [messagesEndRef, messages, shouldScroll]);
    (0, react_1.useEffect)(() => {
        if (shouldRefreshChar) {
            console.log("Sending char back to server");
            sendCharUpdate({
                name: characterName,
                description: characterDescription
            }, oldName);
            setShouldRefreshChar(false);
        }
    }, [characterDescription, characterName, oldName, sendCharUpdate, shouldRefreshChar]);
    (0, react_1.useEffect)(() => {
        if (connected) {
            sendCharUpdate({
                name: characterName,
                description: characterDescription
            }, oldName);
        }
    }, [connected, characterName, characterDescription, sendCharUpdate, oldName]);
    (0, react_1.useEffect)(() => {
        if (cookies.user) {
            if (cookies.user.name) {
                setOldName(cookies.user.name);
                setCharacterName(cookies.user.name);
            }
            if (cookies.user.desc) {
                setCharacterDescription(cookies.user.desc);
            }
        }
    }, [cookies]);
    const handleCharacterChange = (0, react_1.useCallback)((name, desc) => {
        setCookie('user', { name, desc }, { path: '/' });
        setOldName(characterName);
        setCharacterName(name);
        setCharacterDescription(desc);
    }, [setCharacterName, setOldName, setCharacterDescription, setCookie, characterName]);
    return (0, jsx_runtime_1.jsxs)("div", { className: "App", children: [errors && (0, jsx_runtime_1.jsx)(ErrorPopUps_1.ErrorPopUps, { errors: errors, cancelError: cancelError }), (0, jsx_runtime_1.jsx)(CreateCharacterModal_1.default, { characterName: characterName, characterDescription: characterDescription, handleCharacterChange: handleCharacterChange }), (0, jsx_runtime_1.jsxs)("header", { className: "App-header", children: [(0, jsx_runtime_1.jsx)(LobbyList_1.default, { users: loggedInCharacters }), messages
                        .filter((message) => message.content && message.content.length > 0)
                        .map((message, i) => (0, jsx_runtime_1.jsx)(ChatMessage_1.default, { message: message, user: characterName, editMessage: (newMessage) => sendMessageUpdate(message.content, newMessage, i) })), isDMLoading &&
                        (0, jsx_runtime_1.jsx)(ChatMessage_1.default, { message: {
                                role: 'DM',
                                content: 'loading response...'
                            }, user: characterName }), (0, jsx_runtime_1.jsxs)("form", { onSubmit: (e) => {
                            e.preventDefault();
                            if (currentMessage == null || currentMessage.length <= 0) {
                                pushError('Cannot send empty message');
                            }
                            else if (!characterName) {
                                pushError('No character name');
                            }
                            else {
                                const pendingMessages = [
                                    ...messages,
                                    {
                                        role: 'user',
                                        content: characterName + ": " + currentMessage
                                    }
                                ];
                                setMessages(pendingMessages);
                                setCurrentMessage('');
                                sendMessage(characterName, characterName + ": " + currentMessage);
                            }
                        }, children: [(0, jsx_runtime_1.jsx)(material_1.TextField, { multiline: true, style: { backgroundColor: 'white', width: '400px', borderRadius: '10px', marginRight: '20px', marginBottom: '40px' }, value: currentMessage, disabled: !characterName, onChange: (e) => setCurrentMessage(e.target.value) }), (0, jsx_runtime_1.jsx)(material_1.Button, { disabled: isDMLoading || !characterName, type: "submit", variant: "outlined", children: "Submit" }), numVoted > 0 ?
                                (0, jsx_runtime_1.jsx)(Badge_1.default, { badgeContent: numVoted + "/" + loggedInCharacters.length, color: "primary", children: (0, jsx_runtime_1.jsx)(material_1.Button, { disabled: isDMLoading || !characterName, onClick: () => triggerDM(), variant: "outlined", children: "Trigger DM" }) })
                                : (0, jsx_runtime_1.jsx)(material_1.Button, { disabled: isDMLoading || !characterName, onClick: () => triggerDM(), variant: "outlined", children: "Trigger DM" })] }), (0, jsx_runtime_1.jsx)("div", { ref: messagesEndRef })] })] });
}
exports.default = App;
