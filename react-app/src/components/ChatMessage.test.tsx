import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatMessage from './ChatMessage';

describe('ChatMessage', () => {
  it('renders each line of the message as its own paragraph', () => {
    const { container } = render(<ChatMessage
      message={{ role: 'assistant', content: 'You enter a cave.\nIt is dark.' }}
      user="Gandalf"
    />);

    const lines = Array.from(container.querySelectorAll('p'));
    expect(lines.map((line) => line.textContent)).toEqual(['You enter a cave.', 'It is dark.']);
  });

  it('renders a spinner while the DM response is loading', () => {
    render(<ChatMessage
      message={{ role: 'DM', content: 'loading response...' }}
      user="Gandalf"
    />);

    expect(screen.getByText(/Generating DM response/i)).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders an audio player when the message has audio', () => {
    const { container } = render(<ChatMessage
      message={{ role: 'assistant', content: 'Hark!', audioId: '1710822196' }}
      user="Gandalf"
    />);

    const audio = container.querySelector('audio');
    expect(audio).toBeInTheDocument();
    expect(audio?.getAttribute('src')).toContain('audio.wav?id=1710822196');
  });

  it('does not offer editing for another player\'s message', () => {
    render(<ChatMessage
      message={{ role: 'user', content: 'Frodo: hello', character: 'Frodo' }}
      user="Gandalf"
      editMessage={() => {}}
    />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('does not offer editing when no editMessage handler is given', () => {
    render(<ChatMessage
      message={{ role: 'user', content: 'Gandalf: hello', character: 'Gandalf' }}
      user="Gandalf"
    />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('saves an edit of the current user\'s own message', async () => {
    const editMessage = vi.fn();
    render(<ChatMessage
      message={{ role: 'user', content: 'Gandalf: hello', character: 'Gandalf' }}
      user="Gandalf"
      editMessage={editMessage}
    />);

    await userEvent.click(screen.getByRole('button'));

    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveValue('Gandalf: hello');

    await userEvent.type(textarea, '!');
    await userEvent.click(screen.getByRole('button', { name: /save/i }));

    expect(editMessage).toHaveBeenCalledWith('Gandalf: hello!');
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });
});
