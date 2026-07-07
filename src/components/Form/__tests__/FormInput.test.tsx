import Form from '..';
import { zodResolver } from '@hookform/resolvers/zod';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { render, screen } from '@/__tests__/test-utils';

import FormInput from '../components/FormInput';

const schema = z.object({
  email: z.string().email('Invalid email address'),
});

const TestForm = ({ onSubmit = jest.fn() }: { onSubmit?: (data: { email: string }) => void }) => {
  const methods = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
    mode: 'all',
  });

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <FormInput name="email" label="Email" placeholder="you@example.com" />
      <button type="submit">Submit</button>
    </Form>
  );
};

describe('FormInput', () => {
  it('renders a labelled input', () => {
    render(<TestForm />);

    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
  });

  it('shows the zod validation message and blocks submit for invalid values', async () => {
    const onSubmit = jest.fn();
    render(<TestForm onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText('Email'), 'not-an-email');
    await userEvent.click(screen.getByText('Submit'));

    expect(await screen.findByText('Invalid email address')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits valid values', async () => {
    const onSubmit = jest.fn();
    render(<TestForm onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText('Email'), 'me@example.com');
    await userEvent.click(screen.getByText('Submit'));

    expect(onSubmit).toHaveBeenCalledWith({ email: 'me@example.com' }, expect.anything());
  });
});
