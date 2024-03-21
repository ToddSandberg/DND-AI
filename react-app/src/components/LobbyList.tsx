import { Card, Divider } from '@mui/material';
import React from 'react';
import { User } from 'types/MessageTypes';

type Props = {
    users: User[]
}

export default function LobbyList({users}: Props) {
  return <Card style={{top: '10px', left: '20px', position: 'fixed', textAlign: 'left'}}>
    <p style={{fontSize: '0.9em', margin: '0px 10px 0px'}}>Current Players</p>
    <Divider/>
    <ul style={{margin: '10px'}}>
        {users.map((user) => <li style={{fontSize: '0.7em'}}>{user.name}</li>)}
    </ul>
</Card>;
}
