import { render, screen } from '@testing-library/react';
import App from './App';

test('renders todo header and add-task input', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /todo/i })).toBeInTheDocument();
  expect(screen.getByLabelText(/task name/i)).toBeInTheDocument();
});
