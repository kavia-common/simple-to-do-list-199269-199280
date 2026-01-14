import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

test('renders todo header and add-task input', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /todo/i })).toBeInTheDocument();
  expect(screen.getByLabelText(/task name/i)).toBeInTheDocument();
});

test('shows All/Active/Completed filters and filters visible list', async () => {
  const user = userEvent.setup();
  render(<App />);

  // Filters are present and default selection is All.
  const allBtn = screen.getByRole('button', { name: 'All' });
  const activeBtn = screen.getByRole('button', { name: 'Active' });
  const completedBtn = screen.getByRole('button', { name: 'Completed' });

  expect(allBtn).toHaveAttribute('aria-pressed', 'true');
  expect(activeBtn).toHaveAttribute('aria-pressed', 'false');
  expect(completedBtn).toHaveAttribute('aria-pressed', 'false');

  // Add two tasks.
  const input = screen.getByLabelText(/task name/i);
  await user.type(input, 'Task A');
  await user.click(screen.getByRole('button', { name: /add/i }));
  await user.type(input, 'Task B');
  await user.click(screen.getByRole('button', { name: /add/i }));

  // Complete Task B (newest is at top).
  const checkboxes = screen.getAllByRole('checkbox');
  expect(checkboxes.length).toBe(2);
  await user.click(checkboxes[0]);

  // Active view should hide completed items.
  await user.click(activeBtn);
  expect(activeBtn).toHaveAttribute('aria-pressed', 'true');
  expect(screen.queryByText('Task B')).not.toBeInTheDocument();
  expect(screen.getByText('Task A')).toBeInTheDocument();

  // Completed view should show only completed items.
  await user.click(completedBtn);
  expect(completedBtn).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByText('Task B')).toBeInTheDocument();
  expect(screen.queryByText('Task A')).not.toBeInTheDocument();

  // All view shows both.
  await user.click(allBtn);
  expect(allBtn).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByText('Task A')).toBeInTheDocument();
  expect(screen.getByText('Task B')).toBeInTheDocument();
});
