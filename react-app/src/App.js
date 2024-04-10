import React, { useCallback, useEffect, useState } from 'react';
import './App.css';
import ChatMessage from './components/ChatMessage';
import { useCookies } from 'react-cookie'
import CreateCharacterModal from 'components/CreateCharacterModal';
import { Button, TextField } from '@mui/material';
import LobbyList from 'components/LobbyList';
import Badge from '@mui/material/Badge';

function App() {
  const [ messages, setMessages ] = useState([]);
  const [ currentMessage, setCurrentMessage ] = useState('');
  const [ isDMLoading, setIsDMLoading ] = useState(false);
  const [ loggedInCharacters, setLoggedInCharacters ] = useState([]);
  const [ triggerDM, setTriggerDM ] = useState(() => () => undefined);
  const [ sendMessage, setSendMessage ] = useState(() => () => undefined);
  const [ sendCharUpdate, setSendCharUpdate ] = useState(() => () => undefined);
  const [ numVoted, setNumVoted ] = useState(0);

  // User specific data
  const [ characterName, setCharacterName ] = useState();
  const [ characterDescription, setCharacterDescription ] = useState();
  const [ oldName, setOldName ] = useState();
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
        setNumVoted(data.numVoted);
      }
    })

    // Make it so sending a message send over socket
    setSendMessage(() => {
      return (role, content) => {
        socket.send(JSON.stringify({
          type: "SEND_MESSAGE",
          role,
          content
        }));
      }
    });

    // Trigger the chatgpt response
    setTriggerDM(() => {
      return () => {
        socket.send(JSON.stringify({
          type: "TRIGGER_DM"
        }));
      }
    });

    // Trigger character update
    setSendCharUpdate(() => {
      return (character, oldName) => {
        socket.send(JSON.stringify({
          type: "SET_CHARACTER",
          character: {
            name: character.name,
            description: character.description,
            oldName: oldName
          }
        }));
      }
    });
  }, []);

  useEffect(() => {
    if (shouldRefreshChar) {
      console.log("Sending char back to server");
      sendCharUpdate({
        name: characterName,
        description: characterDescription,
        oldName: characterName
      });
      setShouldRefreshChar(false);
    }
  }, [characterDescription, characterName, sendCharUpdate, shouldRefreshChar])

  useEffect(() => {
    console.log("New char: " + characterName + " " + characterDescription);
    if (connected){
      console.log("Connected is true");
      sendCharUpdate({
        name: characterName,
        description: characterDescription,
        oldName
      });
    }
  }, [connected, characterName, characterDescription, sendCharUpdate, oldName]);

  useEffect(() => {
    if (cookies.user) {
      if (cookies.user.name) {
        setCharacterName(cookies.user.name)
      }
      if (cookies.user.desc) {
        setCharacterDescription(cookies.user.desc)
      }
    }
  }, [cookies, sendCharUpdate])

  const handleCharacterChange = useCallback((name, desc) => {
    console.log("Saving new char info: " + name +" " + desc);
    setCookie('user', { name, desc }, { path: '/' });
    setOldName(characterName);
    setCharacterName(name);
    setCharacterDescription(desc);
  }, [setCharacterName, setCharacterDescription, setCookie, characterName]);

  return <div className="App">
      <CreateCharacterModal
        characterName={characterName}
        characterDescription={characterDescription}
        handleCharacterChange={handleCharacterChange}
      />
      <header className="App-header">
        <LobbyList users={loggedInCharacters}/>
        {messages
          .filter((message) => message.content && message.content.length > 0)
          .map((message) => <ChatMessage
            message={message}
          />)
        }
        {isDMLoading &&
          <ChatMessage
            message={{
              role: 'DM',
              content: 'loading response...'
            }}
          />
        }
        <form onSubmit={(e) => {
            e.preventDefault();
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
            //submit(currentMessage).then(response => setMessages(response.data.messages));
        }}>
          <TextField
            variant="filled"
            style={{backgroundColor: 'white'}}
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
