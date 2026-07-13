import Login from '..';
import { loginKeyGenerator } from '@api/loginMutation';
import type { LoginRequestData, LoginResponse } from '@api/loginMutation';
import userEvent from '@testing-library/user-event';

import { makeTestQueryClient, render, screen, waitFor } from '@/__tests__/test-utils';

const user: LoginResponse['user'] = {
  id: 1,
  email: 'me@example.com',
  name: 'Me',
  isDemo: false,
  onboardedAt: '2026-01-01T00:00:00Z',
  checklistDismissedAt: null,
};

function renderLogin(mutationFn = jest.fn().mockResolvedValue({ user })) {
  const queryClient = makeTestQueryClient();
  queryClient.setMutationDefaults([...loginKeyGenerator()], {
    mutationFn: mutationFn as (data: LoginRequestData) => Promise<LoginResponse>,
  });
  render(<Login />, { queryClient });
  return { mutationFn, queryClient };
}

describe('Login page', () => {
  it('does not submit when the email is invalid', async () => {
    const { mutationFn } = renderLogin();

    await userEvent.type(screen.getByLabelText('Email'), 'nope');
    await userEvent.type(screen.getByLabelText('Password'), 'secret123');
    await userEvent.click(screen.getByRole('button', { name: 'Sign In' }));

    expect(await screen.findByText('Invalid email address')).toBeInTheDocument();
    expect(mutationFn).not.toHaveBeenCalled();
  });

  it('submits credentials and caches the user', async () => {
    const { mutationFn, queryClient } = renderLogin();

    await userEvent.type(screen.getByLabelText('Email'), 'me@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'secret123');
    await userEvent.click(screen.getByRole('button', { name: 'Sign In' }));

    await waitFor(() => {
      expect(mutationFn).toHaveBeenCalledWith({ email: 'me@example.com', password: 'secret123' }, expect.anything());
    });
    await waitFor(() => {
      expect(queryClient.getQueryData(['auth', 'me'])).toEqual(user);
    });
  });

  it('shows the server error when login fails', async () => {
    const { mutationFn } = renderLogin(jest.fn().mockRejectedValue(new Error('Invalid credentials')));

    await userEvent.type(screen.getByLabelText('Email'), 'me@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'wrong-pass');
    await userEvent.click(screen.getByRole('button', { name: 'Sign In' }));

    expect(await screen.findByText('Invalid credentials')).toBeInTheDocument();
    expect(mutationFn).toHaveBeenCalled();
  });
});
