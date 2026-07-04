"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const material_1 = require("@mui/material");
const styleConstants_1 = require("constants/styleConstants");
function CreateCharacterModal({ characterName, characterDescription, handleCharacterChange }) {
    const [modalOpen, setModalOpen] = (0, react_1.useState)(!characterName || characterName.length < 1);
    const [currentName, setCurrentName] = (0, react_1.useState)(characterName);
    const [currentDescription, setCurrentDescription] = (0, react_1.useState)(characterDescription);
    // If updated from cookies, want modal to update too
    (0, react_1.useEffect)(() => {
        setCurrentName(characterName);
        setCurrentDescription(characterDescription);
    }, [characterName, characterDescription]);
    (0, react_1.useEffect)(() => {
        // Idk if the below is a good idea, basically trying to automatically close modal if already registered
        if (characterName && currentName === characterName && currentDescription === characterDescription) {
            setModalOpen(false);
        }
    }, [characterDescription, characterName, currentDescription, currentName]);
    return (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(material_1.Button, { variant: "contained", style: { top: '10px', right: '20px', position: 'fixed', textAlign: 'left' }, onClick: () => setModalOpen(true), children: "Change character" }), (0, jsx_runtime_1.jsx)(material_1.Modal, { open: modalOpen, onClose: () => setModalOpen(false), "aria-labelledby": "modal-modal-title", "aria-describedby": "modal-modal-description", children: (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: styleConstants_1.modalStyle, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { id: "modal-modal-title", variant: "h6", component: "h2", children: "Set character name and description" }), (0, jsx_runtime_1.jsx)(material_1.TextField, { label: 'Name', value: currentName, onChange: (e) => {
                                setCurrentName(e.target.value);
                            } }), (0, jsx_runtime_1.jsx)(material_1.TextField, { label: 'Description', value: currentDescription, style: { minWidth: '400px' }, multiline: true, rows: 4, onChange: (e) => setCurrentDescription(e.target.value) }), (0, jsx_runtime_1.jsx)(material_1.Button, { onClick: () => {
                                console.log(currentName);
                                handleCharacterChange(currentName, currentDescription);
                                setModalOpen(false);
                            }, children: "Save" })] }) })] });
}
exports.default = CreateCharacterModal;
