import { useCallback, useState } from 'react';
import { UserError } from 'types/MessageTypes';
import { v4 as uuidv4 } from 'uuid';

export const MAX_ERRORS = 20;

export function useErrorHook(initialState: UserError[]) {
    const [ errors, setErrors ] = useState(initialState);

    const pushError = useCallback((errorMessage: string, isSuccess: boolean = false) => {
        if (errors.length < MAX_ERRORS) {
            //const errorMessage = (typeof error === 'string' || error instanceof String) ? error : error.message;
            console.error(errorMessage);
            const errorId = uuidv4();
            setErrors([...errors, { message: errorMessage, disabled: false, id: errorId, isSuccess }]);
        }
    }, [ errors, setErrors ]);

    const cancelError = (id: string) => {
        const newErrors = [ ...errors ];
        const index = newErrors.findIndex((error) => error.id === id);
        newErrors[index].disabled = true;
        setErrors(newErrors);
    };

    return { errors, pushError, cancelError };
} 