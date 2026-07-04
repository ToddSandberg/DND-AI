"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorAlert = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const Alert_1 = __importDefault(require("@mui/material/Alert"));
function ErrorAlert({ error, index, cancelError, isSuccess }) {
    const marginTop = `${(index + 1) * 60}px`;
    return (0, jsx_runtime_1.jsx)(Alert_1.default, { severity: isSuccess ? 'success' : 'error', onClose: cancelError, style: {
            position: 'fixed',
            top: 10,
            marginTop: marginTop,
            zIndex: 200,
            marginRight: '10px',
            right: 0
        }, children: error });
}
exports.ErrorAlert = ErrorAlert;
