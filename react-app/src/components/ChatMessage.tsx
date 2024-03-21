import { CircularProgress } from '@mui/material';
import React from 'react';
import { Message } from 'types/MessageTypes';

type Props = {
  message: Message
}

export default function ChatMessage({ message }: Props) {
  return <div style={{
    backgroundColor: 'white',
    borderRadius: '15px',
    width: '60%',
    color: 'black',
    margin: '25px',
    padding: '25px',
    minHeight: '50px',
    textAlign: 'left'
  }}>
    {message.audioId &&
    <audio controls src={`${window.location.href}audio.wav?id=${message.audioId}`} autoPlay={true}>
      Your browser does not support the audio element.
    </audio>}
    {message.content !== 'loading response...' ?
      message.content.split('\n').map((line) => <p style={{fontSize: '0.7em', margin: 0}}>{line}</p>)
      : <><CircularProgress/> Generating DM response...</>
    }
  </div>;
}
