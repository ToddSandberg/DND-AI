"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorPopUps = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const ErrorAlert_1 = require("./ErrorAlert");
function ErrorPopUps({ errors, cancelError }) {
    return (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: errors.filter((error) => !error.disabled).map((error, index) => (0, jsx_runtime_1.jsx)(ErrorAlert_1.ErrorAlert, { error: error.message, index: index, isSuccess: error.isSuccess, cancelError: () => cancelError(error.id) }, `${error.id}error`)) });
}
exports.ErrorPopUps = ErrorPopUps;
