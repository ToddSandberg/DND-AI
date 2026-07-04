"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const material_1 = require("@mui/material");
function LobbyList({ users }) {
    return (0, jsx_runtime_1.jsxs)(material_1.Card, { style: { top: '10px', left: '20px', position: 'fixed', textAlign: 'left' }, children: [(0, jsx_runtime_1.jsx)("p", { style: { fontSize: '0.9em', margin: '0px 10px 0px' }, children: "Current Players" }), (0, jsx_runtime_1.jsx)(material_1.Divider, {}), (0, jsx_runtime_1.jsx)("ul", { style: { margin: '10px' }, children: users.map((user) => (0, jsx_runtime_1.jsx)("li", { style: { fontSize: '0.7em' }, children: user.name })) })] });
}
exports.default = LobbyList;
