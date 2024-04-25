import React, { useCallback, useEffect, useState } from 'react';
import './App.css';
import ChatMessage from './components/ChatMessage';
import { useCookies } from 'react-cookie'
import CreateCharacterModal from 'components/CreateCharacterModal';
import { Button, TextField } from '@mui/material';
import LobbyList from 'components/LobbyList';
import Badge from '@mui/material/Badge';
import { useErrorHook } from 'components/ErrorHook';
import { ErrorPopUps } from 'components/ErrorPopUps';
import { Message, User } from 'types/MessageTypes';

function App() {
  const [ messages, setMessages ] = useState<Message[]>([]);
  const [ currentMessage, setCurrentMessage ] = useState('');
  const [ isDMLoading, setIsDMLoading ] = useState(false);
  const [ loggedInCharacters, setLoggedInCharacters ] = useState([]);
  const [ triggerDM, setTriggerDM ] = useState(() => () => {});
  const [ sendMessage, setSendMessage ] = useState(() => (character:string, content:string) => {});
  const [ sendCharUpdate, setSendCharUpdate ] = useState(() => (character:User, oldName:string|undefined) => {});
  const [ sendMessageUpdate, setSendMessageUpdate ] = useState(() => (oldMessage:string, newMessage:string, index:number) => {});
  const [ numVoted, setNumVoted ] = useState(0);
  const { errors, pushError, cancelError } = useErrorHook([]);

  // User specific data
  const [ characterName, setCharacterName ] = useState<string|undefined>();
  const [ characterDescription, setCharacterDescription ] = useState<string|undefined>();
  const [ oldName, setOldName ] = useState<string|undefined>();
  const [ cookies, setCookie ] = useCookies(['user'])
  const [ connected, setConnected ] = useState(false);
  const [ shouldRefreshChar, setShouldRefreshChar ] = useState(false);

  useEffect(() => {
    const socket = new WebSocket("ws://" + window.location.host);

    socket.addEventListener('open', function (event) {
      console.log("Connected to server");
      setConnected(true);
    });

    socket.addEventListener('message', function (event) {
      console.log("Message from server ", event.data);
      const data = JSON.parse(event.data);
      if (data.type && data.type === 'MESSAGE_UPDATE') {
        setMessages(data.messages);
      } else if (data.type && data.type === 'DM_LOADING') {
        setIsDMLoading(data.isDMLoading);
      } else if (data.type && data.type === 'CHARACTER_UPDATE') {
        setLoggedInCharacters(data.characters);
      } else if (data.type && data.type === 'REFRESH_CHARACTERS') {
        setShouldRefreshChar(true);
      } else if (data.type && data.type === 'UPDATE_VOTES') {
        setNumVoted(data.votes.length);
      } else if (data.type && data.type === 'ERROR') {
        pushError(data.message);
      }
    })

    // Make it so sending a message send over socket
    setSendMessage(() => {
      return (character:string, content:string) => {
        socket.send(JSON.stringify({
          type: "SEND_MESSAGE",
          character,
          content
        }));
      }
    });

    // Trigger the chatgpt response
    setTriggerDM(() => {
      return () => {
        socket.send(JSON.stringify({
          type: "TRIGGER_DM",
          name: characterName
        }));
      }
    });

    // Trigger character update
    setSendCharUpdate(() => {
      return (character:User, oldName:string) => {
        socket.send(JSON.stringify({
          type: "SET_CHARACTER",
          character: {
            name: character.name,
            description: character.description,
            oldName
          }
        }));
      }
    });

    // Trigger message edit
    setSendMessageUpdate(() => {
      return (oldMessage:string, newMessage:string, index:number) => {
        socket.send(JSON.stringify({
          type: "EDIT_MESSAGE", newMessage, oldMessage, index
        }));
      }
    });
  }, []);

  useEffect(() => {
    if (shouldRefreshChar) {
      console.log("Sending char back to server");
      sendCharUpdate({
        name: characterName,
        description: characterDescription
      }, oldName);
      setShouldRefreshChar(false);
    }
  }, [characterDescription, characterName, oldName, sendCharUpdate, shouldRefreshChar])

  useEffect(() => {
    if (connected){
      sendCharUpdate({
        name: characterName,
        description: characterDescription
      }, oldName);
    }
  }, [connected, characterName, characterDescription, sendCharUpdate, oldName]);

  useEffect(() => {
    if (cookies.user) {
      if (cookies.user.name) {
        setOldName(cookies.user.name)
        setCharacterName(cookies.user.name)
      }
      if (cookies.user.desc) {
        setCharacterDescription(cookies.user.desc)
      }
    }
  }, [cookies])

  const handleCharacterChange = useCallback((name:string|undefined, desc:string|undefined) => {
    setCookie('user', { name, desc }, { path: '/' });
    setOldName(characterName);
    setCharacterName(name);
    setCharacterDescription(desc);
  }, [setCharacterName, setOldName, setCharacterDescription, setCookie, characterName]);

  return <div className="App">
      { errors && <ErrorPopUps errors={errors} cancelError={cancelError} /> }
      <CreateCharacterModal
        characterName={characterName}
        characterDescription={characterDescription}
        handleCharacterChange={handleCharacterChange}
      />
      <header className="App-header">
        <LobbyList users={loggedInCharacters}/>
        {messages
          .filter((message:Message) => message.content && message.content.length > 0)
          .map((message:Message, i:number) => <ChatMessage
            message={message}
            user={characterName}
            editMessage={(newMessage) => sendMessageUpdate(message.content, newMessage, i)}
          />)
        }
        {isDMLoading &&
          <ChatMessage
            message={{
              role: 'DM',
              content: 'loading response...'
            }}
            user={characterName}
          />
        }
        <form onSubmit={(e) => {
            e.preventDefault();
            if (currentMessage == null || currentMessage.length <= 0) {
              pushError('Cannot send empty message');
            } else if(!characterName) {
              pushError('No character name');
            } else {
              const pendingMessages = [
                ...messages,
                {
                  role: 'user',
                  content: characterName + ": " + currentMessage
                }
              ];
              setMessages(pendingMessages);
              setCurrentMessage('');
              sendMessage(characterName, characterName + ": " +currentMessage);
            }
        }}>
          <TextField
            multiline
            style={{backgroundColor: 'white', width: '400px', borderRadius: '10px', marginRight: '20px'}}
            value={currentMessage}
            disabled={!characterName}
            onChange={(e) => setCurrentMessage(e.target.value)}
          />
          <Button
            disabled={isDMLoading || !characterName}
            type="submit"
            variant="outlined"
          >
            Submit
          </Button>
          {numVoted > 0 ?
          <Badge badgeContent={numVoted + "/" + loggedInCharacters.length} color="primary">
            <Button
              disabled={isDMLoading || !characterName}
              onClick={() => triggerDM()}
              variant="outlined"
            >
              Trigger DM
            </Button>
          </Badge>
          : <Button
            disabled={isDMLoading || !characterName}
            onClick={() => triggerDM()}
            variant="outlined"
          >
            Trigger DM
          </Button>
}
        </form>
      </header>
    </div>;
}

export default App;
