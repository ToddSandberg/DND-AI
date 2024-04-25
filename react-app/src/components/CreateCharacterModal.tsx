import React, { useEffect, useState } from 'react';
import { Box, Button, Modal, TextField, Typography } from '@mui/material';
import { modalStyle } from 'constants/styleConstants';

type Props = {
    characterName: string|undefined,
    characterDescription: string|undefined,
    handleCharacterChange: (name: string|undefined, description: string|undefined) => void
}

export default function CreateCharacterModal({
    characterName,
    characterDescription,
    handleCharacterChange
}: Props) {
    const [ modalOpen, setModalOpen ] = useState(!characterName || characterName.length < 1);
    const [ currentName, setCurrentName ] = useState(characterName);
    const [ currentDescription, setCurrentDescription ] = useState(characterDescription);

    // If updated from cookies, want modal to update too
    useEffect(() => {
      setCurrentName(characterName);
      setCurrentDescription(characterDescription);
    }, [characterName, characterDescription]);

    useEffect(() => {
      // Idk if the below is a good idea, basically trying to automatically close modal if already registered
      if (characterName && currentName === characterName && currentDescription === characterDescription){
        setModalOpen(false);
      }
    }, [characterDescription, characterName, currentDescription, currentName])

    
        return <><Button
        variant="contained"
        style={{top: '10px', right: '20px', position: 'fixed', textAlign: 'left'}}
        onClick={() => setModalOpen(true)}
      >
        Change character
      </Button>
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Set character name and description
          </Typography>
          <TextField
            label={'Name'}
            value={currentName}
            onChange={(e) => {
              setCurrentName(e.target.value);
            }}
          />
          <TextField
            label={'Description'}
            value={currentDescription}
            style={{minWidth: '400px'}}
            multiline
            rows={4}
            onChange={(e) => setCurrentDescription(e.target.value)}
          />
          <Button onClick={() => {
            console.log(currentName);
            handleCharacterChange(currentName, currentDescription);
            setModalOpen(false);
          }}>Save</Button>
        </Box>
      </Modal>
      </>;
}
  