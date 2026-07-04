"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const icons_material_1 = require("@mui/icons-material");
const material_1 = require("@mui/material");
const react_1 = require("react");
function getMessageContent(messageContent, isEditing, setCurrentMessage) {
    // TODO someone could spoof this
    if (messageContent === 'loading response...') {
        return (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(material_1.CircularProgress, {}), " Generating DM response..."] });
    }
    else if (isEditing) {
        return (0, jsx_runtime_1.jsx)(material_1.TextareaAutosize, { value: messageContent, onChange: (event) => setCurrentMessage(event.target.value) });
    }
    else {
        return messageContent.split('\n').map((line) => (0, jsx_runtime_1.jsx)("p", { style: { fontSize: '0.7em', margin: 0 }, children: line }));
    }
}
function getEditButton(isEditing, setIsEditing, saveEdit) {
    if (isEditing) {
        return (0, jsx_runtime_1.jsx)(material_1.Button, { onClick: () => {
                saveEdit();
                setIsEditing(!isEditing);
            }, style: { top: '0', right: '0', position: 'relative' }, children: "Save" });
    }
    else {
        return (0, jsx_runtime_1.jsx)(material_1.IconButton, { onClick: () => {
                setIsEditing(!isEditing);
            }, style: { top: '0', right: '0', position: 'relative' }, children: (0, jsx_runtime_1.jsx)(icons_material_1.Edit, {}) });
    }
}
function ChatMessage({ message, user, editMessage }) {
    const [isEditing, setIsEditing] = (0, react_1.useState)(false);
    const [currentMessage, setCurrentMessage] = (0, react_1.useState)(message.content);
    return (0, jsx_runtime_1.jsxs)("div", { style: {
            backgroundColor: 'white',
            borderRadius: '15px',
            width: '60%',
            color: 'black',
            margin: '25px',
            padding: '25px',
            minHeight: '50px',
            textAlign: 'left'
        }, children: [message.character && message.character === user && editMessage &&
                getEditButton(isEditing, setIsEditing, () => editMessage(currentMessage)), message.audioId &&
                (0, jsx_runtime_1.jsx)("audio", { controls: true, src: `${window.location.href}audio.wav?id=${message.audioId}`, autoPlay: true, children: "Your browser does not support the audio element." }), getMessageContent(currentMessage, isEditing, setCurrentMessage)] });
}
exports.default = ChatMessage;
