import { Edit } from '@mui/icons-material';
import { Button, CircularProgress, IconButton, TextareaAutosize } from '@mui/material';
import React, { useState } from 'react';
import { Message } from 'types/MessageTypes';

type Props = {
  message: Message,
  user: string|undefined,
  editMessage?: (newMessage: string) => void
}

function getMessageContent(messageContent: string, isEditing: boolean, setCurrentMessage: (messageText: string) => void) {
  // TODO someone could spoof this
  if (messageContent === 'loading response...') {
    return <><CircularProgress/> Generating DM response...</>;
  } else if (isEditing) {
    return <TextareaAutosize value={messageContent} onChange={(event) => setCurrentMessage(event.target.value)}/>
  } else {
    return messageContent.split('\n').map((line) => <p style={{fontSize: '0.7em', margin: 0}}>{line}</p>)
  }
}

function getEditButton(isEditing: boolean, setIsEditing: (isEditing: boolean) => void, saveEdit: () => void) {
  if (isEditing) {
    return <Button
      onClick={() => {
        saveEdit();
        setIsEditing(!isEditing)
      }}
      style={{top:'0', right:'0', position: 'relative'}}
    >
      Save
    </Button>
  } else {
    return <IconButton
        onClick={() => {
          setIsEditing(!isEditing)
        }}
        style={{top:'0', right:'0', position: 'relative'}}
      ><Edit/></IconButton>
  }
}

export default function ChatMessage({ message, user, editMessage }: Props) {
  const [ isEditing, setIsEditing ] = useState(false);
  const [ currentMessage, setCurrentMessage ] = useState(message.content);

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
    {message.character && message.character === user && editMessage &&
      getEditButton(isEditing, setIsEditing, () => editMessage(currentMessage))
    }
    {message.audioId &&
      <audio controls src={`${window.location.href}audio.wav?id=${message.audioId}`} autoPlay={true}>
        Your browser does not support the audio element.
      </audio>}
    {getMessageContent(currentMessage, isEditing, setCurrentMessage)}
  </div>;
}
