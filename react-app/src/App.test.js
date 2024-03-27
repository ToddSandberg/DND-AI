import { render, screen } from '@testing-library/react';
import App from './App';

// TODO add some basic tests
test('renders page', () => {
  render(<App />);
  const linkElement = screen.getByText(/Current Players/i);
  expect(linkElement).toBeInTheDocument();
});
