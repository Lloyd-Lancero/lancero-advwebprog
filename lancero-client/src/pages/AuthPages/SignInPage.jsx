import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';

const inputClasses = 'field';

const actionButtonClassName = 'w-full rounded-xl py-3 text-[11px] tracking-[0.2em]';

const SignInPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { id, value } = event.target;
    setForm((prev) => ({ ...prev, [id === 'signin-email' ? 'email' : 'password']: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const user = await login(form.email, form.password);
      const redirectTo = location.state?.from?.pathname || (user.role === 'Admin' ? '/admin' : '/');
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">Log In</h1>
      <p className="mt-3 text-sm leading-6 text-zinc-600">
        Access your store account to review orders, saved items, and pickup details.
      </p>

      {error && (
        <div className="alert-error mt-6">
          {error}
        </div>
      )}

      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="signin-email" className="field-label">
            Email Address
          </label>
          <input
            id="signin-email"
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
          <label htmlFor="signin-password" className="field-label">
            Password
          </label>
          <input
            id="signin-password"
            type="password"
            placeholder="Password"
            autoComplete="current-password"
            className={inputClasses}
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>

        <Button type="submit" variant="primary" className={actionButtonClassName} disabled={submitting}>
          {submitting ? 'Logging In...' : 'Log In'}
        </Button>
      </form>

      <div className="mt-8 border-t-2 border-zinc-200 pt-6 text-sm text-zinc-600">
        No account yet?{' '}
        <Link to="/auth/signup" className="font-semibold text-brand underline transition hover:text-brand-dark">
          Sign Up
        </Link>
      </div>
    </>
  );
};

export default SignInPage;