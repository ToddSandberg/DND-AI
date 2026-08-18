import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

type Listener = (event: { data: string }) => void;

/** Minimal stand-in for the browser WebSocket so tests can drive the server side. */
class FakeWebSocket {
  static instances: FakeWebSocket[] = [];

  url: string;
  sent: any[] = [];
  private listeners: Record<string, Listener[]> = {};

  constructor(url: string) {
    this.url = url;
    FakeWebSocket.instances.push(this);
  }

  addEventListener(type: string, listener: Listener) {
    this.listeners[type] = [...(this.listeners[type] ?? []), listener];
  }

  send(data: string) {
    this.sent.push(JSON.parse(data));
  }

  close() {}

  /** Simulate the server pushing an event to this client. */
  emit(type: string, payload?: unknown) {
    act(() => {
      for (const listener of this.listeners[type] ?? []) {
        listener({ data: JSON.stringify(payload) });
      }
    });
  }

  sentOfType(type: string) {
    return this.sent.filter((message) => message.type === type);
  }
}

function renderApp() {
  render(<App />);
  const socket = FakeWebSocket.instances.at(-1);
  if (!socket) {
    throw new Error('App did not open a websocket');
  }
  socket.emit('open');
  return socket;
}

/** Fills in the character modal that the app opens on first load. */
async function createCharacter(name: string, description = 'A wizard') {
  await userEvent.type(screen.getByLabelText('Name'), name);
  await userEvent.type(screen.getByLabelText('Description'), description);
  await userEvent.click(screen.getByRole('button', { name: /save/i }));
}

describe('App', () => {
  beforeEach(() => {
    FakeWebSocket.instances = [];
    vi.stubGlobal('WebSocket', FakeWebSocket);
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    // Not implemented by jsdom, and the app scrolls to the newest message.
    Element.prototype.scrollIntoView = vi.fn();
    document.cookie = 'user=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('renders the lobby and opens a websocket to the server', () => {
    const socket = renderApp();

    expect(screen.getByText('Current Players')).toBeInTheDocument();
    expect(socket.url).toBe(`ws://${window.location.host}`);
  });

  it('sends the character to the server once connected', async () => {
    const socket = renderApp();

    await createCharacter('Gandalf');

    expect(socket.sentOfType('SET_CHARACTER').at(-1)).toMatchObject({
      character: { name: 'Gandalf', description: 'A wizard' }
    });
  });

  it('renders messages pushed by the server and skips empty ones', async () => {
    const socket = renderApp();
    await createCharacter('Gandalf');

    socket.emit('message', {
      type: 'MESSAGE_UPDATE',
      messages: [
        { role: 'assistant', content: 'And so, the adventure continues...' },
        { role: 'user', content: 'Gandalf: I look around' },
        { role: 'user', content: '' }
      ]
    });

    const chatLines = Array.from(document.querySelectorAll('.App-header p'))
      .map((line) => line.textContent)
      .filter((text) => text !== 'Current Players');
    expect(chatLines).toEqual([
      'And so, the adventure continues...',
      'Gandalf: I look around'
    ]);
  });

  it('shows the loading message while the DM is responding', () => {
    const socket = renderApp();

    socket.emit('message', { type: 'DM_LOADING', isDMLoading: true });

    expect(screen.getByText(/Generating DM response/i)).toBeInTheDocument();
  });

  it('lists the characters reported by the server', async () => {
    const socket = renderApp();
    await createCharacter('Gandalf');

    socket.emit('message', {
      type: 'CHARACTER_UPDATE',
      characters: [{ name: 'Gandalf' }, { name: 'Frodo' }]
    });

    expect(screen.getAllByRole('listitem').map((item) => item.textContent))
      .toEqual(['Gandalf', 'Frodo']);
  });

  it('shows an alert for server errors', async () => {
    const socket = renderApp();
    await createCharacter('Gandalf');

    socket.emit('message', {
      type: 'ERROR',
      message: 'Message value changed before edit could be made.'
    });

    expect(screen.getByRole('alert'))
      .toHaveTextContent('Message value changed before edit could be made.');
  });

  it('sends a chat message prefixed with the character name and clears the input', async () => {
    const socket = renderApp();
    await createCharacter('Gandalf');

    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'I look around');
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));

    expect(socket.sentOfType('SEND_MESSAGE')).toEqual([{
      type: 'SEND_MESSAGE',
      character: 'Gandalf',
      content: 'Gandalf: I look around'
    }]);
    expect(input).toHaveValue('');
    expect(screen.getByText('Gandalf: I look around')).toBeInTheDocument();
  });

  it('refuses to send an empty message', async () => {
    const socket = renderApp();
    await createCharacter('Gandalf');

    await userEvent.click(screen.getByRole('button', { name: /submit/i }));

    expect(socket.sentOfType('SEND_MESSAGE')).toHaveLength(0);
    expect(screen.getByRole('alert')).toHaveTextContent('Cannot send empty message');
  });

  it('votes to trigger the DM and shows how many players have voted', async () => {
    const socket = renderApp();
    await createCharacter('Gandalf');
    socket.emit('message', { type: 'CHARACTER_UPDATE', characters: [{ name: 'Gandalf' }, { name: 'Frodo' }] });

    await userEvent.click(screen.getByRole('button', { name: /trigger dm/i }));
    socket.emit('message', { type: 'UPDATE_VOTES', votes: ['Gandalf'] });

    // NOTE: the vote is sent without a name. App builds triggerDM inside a
    // mount-only effect, so it closes over the character name from before the
    // player picked one. Update this expectation if that gets fixed.
    expect(socket.sentOfType('TRIGGER_DM')).toEqual([{ type: 'TRIGGER_DM' }]);
    expect(screen.getByText('1/2')).toBeInTheDocument();
  });
});
