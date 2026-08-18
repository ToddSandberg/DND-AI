import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorAlert } from './ErrorAlert';

describe('ErrorAlert', () => {
  it('renders the message as an error by default', () => {
    render(<ErrorAlert error="Cannot send empty message" index={0} cancelError={() => {}} />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Cannot send empty message');
    expect(alert).toHaveClass('MuiAlert-colorError');
  });

  it('renders as a success when isSuccess is set', () => {
    render(<ErrorAlert error="Saved" index={0} cancelError={() => {}} isSuccess />);

    expect(screen.getByRole('alert')).toHaveClass('MuiAlert-colorSuccess');
  });

  it('stacks alerts by offsetting the top margin per index', () => {
    render(<ErrorAlert error="Second error" index={1} cancelError={() => {}} />);

    expect(screen.getByRole('alert')).toHaveStyle({ marginTop: '120px' });
  });

  it('calls cancelError when the close button is clicked', async () => {
    const cancelError = vi.fn();
    render(<ErrorAlert error="Boom" index={0} cancelError={cancelError} />);

    await userEvent.click(screen.getByRole('button', { name: /close/i }));

    expect(cancelError).toHaveBeenCalledTimes(1);
  });
});
