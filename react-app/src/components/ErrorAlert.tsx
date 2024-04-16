import Alert from '@mui/material/Alert';
import React from 'react';

type Props = {
    error: string,
    index: number,
    cancelError: () => void,
    isSuccess?: boolean
};

export function ErrorAlert({ error, index, cancelError, isSuccess }: Props) {
    const marginTop = (index + 1) * 60 + 'px';

    return <Alert
        severity={isSuccess ? 'success' : 'error'}
        onClose={cancelError}
        style={{
            position: 'fixed',
            top: 10,
            marginTop: marginTop,
            zIndex: 200,
            marginRight: '10px',
            right: 0
        }}
    >
        {error}
    </Alert>;
}