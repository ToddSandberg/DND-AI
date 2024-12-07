import React from 'react';
import { ErrorAlert } from './ErrorAlert';
import type { UserError } from 'types/MessageTypes';

type Props = {
    errors: UserError[],
    cancelError: (id: string) => void
};

export function ErrorPopUps({ errors, cancelError }: Props) {
    return <>{errors.filter((error) => !error.disabled).map((error, index) => <ErrorAlert
        key={`${error.id}error`}
        error={error.message}
        index={index}
        isSuccess={error.isSuccess}
        cancelError={() => cancelError(error.id)}
    />)}</>;
}