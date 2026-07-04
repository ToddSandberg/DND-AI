"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useErrorHook = exports.MAX_ERRORS = void 0;
const react_1 = require("react");
const uuid_1 = require("uuid");
exports.MAX_ERRORS = 20;
function useErrorHook(initialState) {
    const [errors, setErrors] = (0, react_1.useState)(initialState);
    const pushError = (0, react_1.useCallback)((errorMessage, isSuccess = false) => {
        if (errors.length < exports.MAX_ERRORS) {
            //const errorMessage = (typeof error === 'string' || error instanceof String) ? error : error.message;
            console.error(errorMessage);
            const errorId = (0, uuid_1.v4)();
            setErrors([...errors, { message: errorMessage, disabled: false, id: errorId, isSuccess }]);
        }
    }, [errors, setErrors]);
    const cancelError = (id) => {
        const newErrors = [...errors];
        const index = newErrors.findIndex((error) => error.id === id);
        newErrors[index].disabled = true;
        setErrors(newErrors);
    };
    return { errors, pushError, cancelError };
}
exports.useErrorHook = useErrorHook;
