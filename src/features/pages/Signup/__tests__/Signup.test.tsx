import Signup from '..';
import { signupKeyGenerator } from '@api/signupMutation';
import userEvent from '@testing-library/user-event';

import { makeTestQueryClient, render, screen, waitFor } from '@/__tests__/test-utils';

const pushMock = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

function renderSignup() {
  const queryClient = makeTestQueryClient();
  // Mutation resolves the normalized response shape: { email }
  const mutationFn = jest.fn().mockResolvedValue({ email: 'me@example.com' });
  queryClient.setMutationDefaults([...signupKeyGenerator()], { mutationFn });
  render(<Signup />, { queryClient });
  return { mutationFn };
}

async function fillForm(passwordConfirm: string) {
  await userEvent.type(screen.getByLabelText('Full Name'), 'Me');
  await userEvent.type(screen.getByLabelText('Email'), 'me@example.com');
  await userEvent.type(screen.getByLabelText('Password'), 'Secret123');
  await userEvent.type(screen.getByLabelText('Confirm Password'), passwordConfirm);
}

describe('Signup page', () => {
  it('shows a mismatch error when passwords differ', async () => {
    const { mutationFn } = renderSignup();

    await fillForm('Different123');
    await userEvent.click(screen.getByRole('button', { name: 'Create Account' }));

    expect(await screen.findByText('Passwords do not match')).toBeInTheDocument();
    expect(mutationFn).not.toHaveBeenCalled();
  });

  it('requires agreeing to the terms before submitting', async () => {
    const { mutationFn } = renderSignup();

    await fillForm('Secret123');
    await userEvent.click(screen.getByRole('button', { name: 'Create Account' }));

    expect(await screen.findByText('Please agree to the Terms of Service and Privacy Policy')).toBeInTheDocument();
    expect(mutationFn).not.toHaveBeenCalled();
  });

  it('submits once the form is valid and terms are accepted, then redirects to verify-email', async () => {
    const { mutationFn } = renderSignup();

    await fillForm('Secret123');
    await userEvent.click(screen.getByRole('checkbox'));
    await userEvent.click(screen.getByRole('button', { name: 'Create Account' }));

    await waitFor(() => {
      expect(mutationFn).toHaveBeenCalledWith(
        {
          name: 'Me',
          email: 'me@example.com',
          password: 'Secret123',
          passwordConfirm: 'Secret123',
        },
        expect.anything()
      );
    });

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith(`/verify-email?email=${encodeURIComponent('me@example.com')}`);
    });
  });

  it('renders the Google sign-in button', () => {
    renderSignup();
    expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument();
  });
});
