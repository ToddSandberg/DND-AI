import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorPopUps } from './ErrorPopUps';
import type { UserError } from 'types/MessageTypes';

const error = (overrides: Partial<UserError> = {}): UserError => ({
  id: 'error-1',
  disabled: false,
  message: 'Something went wrong',
  isSuccess: false,
  ...overrides
});

describe('ErrorPopUps', () => {
  it('renders nothing when there are no errors', () => {
    render(<ErrorPopUps errors={[]} cancelError={() => {}} />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('only renders errors that are not disabled', () => {
    render(<ErrorPopUps
      errors={[
        error({ id: 'a', message: 'Visible error' }),
        error({ id: 'b', message: 'Dismissed error', disabled: true })
      ]}
      cancelError={() => {}}
    />);

    expect(screen.getByText('Visible error')).toBeInTheDocument();
    expect(screen.queryByText('Dismissed error')).not.toBeInTheDocument();
  });

  it('cancels the error that was closed', async () => {
    const cancelError = vi.fn();
    render(<ErrorPopUps
      errors={[
        error({ id: 'a', message: 'First' }),
        error({ id: 'b', message: 'Second' })
      ]}
      cancelError={cancelError}
    />);

    const [, secondCloseButton] = screen.getAllByRole('button', { name: /close/i });
    await userEvent.click(secondCloseButton);

    expect(cancelError).toHaveBeenCalledWith('b');
  });
});
