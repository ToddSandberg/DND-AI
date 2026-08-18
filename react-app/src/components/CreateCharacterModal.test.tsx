import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CreateCharacterModal from './CreateCharacterModal';

describe('CreateCharacterModal', () => {
  it('opens on mount when no character is set yet', () => {
    render(<CreateCharacterModal
      characterName={undefined}
      characterDescription={undefined}
      handleCharacterChange={() => {}}
    />);

    expect(screen.getByText('Set character name and description')).toBeInTheDocument();
  });

  it('stays closed when a character is already set', () => {
    render(<CreateCharacterModal
      characterName="Gandalf"
      characterDescription="A wizard"
      handleCharacterChange={() => {}}
    />);

    expect(screen.queryByText('Set character name and description')).not.toBeInTheDocument();
  });

  it('reopens when the change character button is clicked', async () => {
    render(<CreateCharacterModal
      characterName="Gandalf"
      characterDescription="A wizard"
      handleCharacterChange={() => {}}
    />);

    await userEvent.click(screen.getByRole('button', { name: /change character/i }));

    expect(screen.getByText('Set character name and description')).toBeInTheDocument();
  });

  it('reports the name and description on save and closes', async () => {
    const handleCharacterChange = vi.fn();
    render(<CreateCharacterModal
      characterName={undefined}
      characterDescription={undefined}
      handleCharacterChange={handleCharacterChange}
    />);

    await userEvent.type(screen.getByLabelText('Name'), 'Frodo');
    await userEvent.type(screen.getByLabelText('Description'), 'A hobbit');
    await userEvent.click(screen.getByRole('button', { name: /save/i }));

    expect(handleCharacterChange).toHaveBeenCalledWith('Frodo', 'A hobbit');
    expect(screen.queryByText('Set character name and description')).not.toBeInTheDocument();
  });

  it('picks up a character that arrives later from the cookie', () => {
    const { rerender } = render(<CreateCharacterModal
      characterName={undefined}
      characterDescription={undefined}
      handleCharacterChange={() => {}}
    />);

    expect(screen.getByText('Set character name and description')).toBeInTheDocument();

    rerender(<CreateCharacterModal
      characterName="Gandalf"
      characterDescription="A wizard"
      handleCharacterChange={() => {}}
    />);

    expect(screen.queryByText('Set character name and description')).not.toBeInTheDocument();
  });
});
