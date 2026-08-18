import { render, screen } from '@testing-library/react';
import LobbyList from './LobbyList';

describe('LobbyList', () => {
  it('renders the header with no players', () => {
    render(<LobbyList users={[]} />);

    expect(screen.getByText('Current Players')).toBeInTheDocument();
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
  });

  it('renders a list item per logged in character', () => {
    render(<LobbyList users={[
      { name: 'Gandalf', description: 'A wizard' },
      { name: 'Frodo', description: 'A hobbit' }
    ]} />);

    const players = screen.getAllByRole('listitem');
    expect(players.map((player) => player.textContent)).toEqual(['Gandalf', 'Frodo']);
  });
});
