import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';

const inputClasses = 'field';

const actionButtonClassName = 'w-full rounded-xl py-3 text-[11px] tracking-[0.2em]';

const SignUpPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fieldByInputId = {
    'first-name': 'firstName',
    'last-name': 'lastName',
    'signup-email': 'email',
    'signup-password': 'password',
  };

  const handleChange = (event) => {
    const { id, value } = event.target;
    const field = fieldByInputId[id];
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const fullName = `${form.firstName} ${form.lastName}`.trim();
      await register(fullName, form.email, form.password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">Sign Up</h1>
      <p className="mt-3 text-sm leading-6 text-zinc-600">
        Create a store account for faster checkout, order updates, and pickup details.
      </p>

      {error && (
        <div className="alert-error mt-6">
          {error}
        </div>
      )}

      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="first-name" className="field-label">
              First Name
            </label>
            <input
              id="first-name"
              type="text"
              placeholder="First name"
              autoComplete="given-name"
              className={inputClasses}
              value={form.firstName}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="last-name" className="field-label">
              Last Name
            </label>
            <input
              id="last-name"
              type="text"
              placeholder="Last name"
              autoComplete="family-name"
              className={inputClasses}
              value={form.lastName}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="signup-email" className="field-label">
            Email
          </label>
          <input
            id="signup-email"
            type="email"
            placeholder="student@email.com"
            autoComplete="email"
            className={inputClasses}
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="signup-password" className="field-label">
            Password
          </label>
          <input
            id="signup-password"
            type="password"
            placeholder="Password"
            autoComplete="new-password"
            className={inputClasses}
            value={form.password}
            onChange={handleChange}
            minLength={6}
            required
          />
          <p className="mt-2 text-xs leading-5 text-zinc-500">
            Use a secure password with at least 6 characters.
          </p>
        </div>

        <Button type="submit" variant="primary" className={actionButtonClassName} disabled={submitting}>
          {submitting ? 'Creating Account...' : 'Create Account'}
        </Button>
      </form>

      <div className="mt-8 border-t-2 border-zinc-200 pt-6 text-sm text-zinc-600">
        Already have an account?{' '}
        <Link to="/auth/signin" className="font-semibold text-brand underline transition hover:text-brand-dark">
          Log In
        </Link>
      </div>
    </>
  );
};

export default SignUpPage;