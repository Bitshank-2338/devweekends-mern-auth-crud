import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/api.js';
import ErrorMessage from '../components/ErrorMessage.jsx';

export function Login({ notice, onAuthSuccess }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.email || !form.password) {
      setError('Email and password are required');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      // The API answers with { user, token }; App saves both and the router
      // then sends us to the dashboard.
      const data = await api.post('/api/auth/login', form);
      onAuthSuccess(data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      // Runs whether the request worked or failed, so the button is never
      // left stuck on "Logging in...".
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="brand-mark">{'</>'}</span>
          <h1>DevBoard</h1>
        </div>
        <p className="auth-subtitle">Log in to your project board.</p>

        {notice && <div className="alert alert-notice">{notice}</div>}
        <ErrorMessage message={error} onDismiss={() => setError('')} />

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          <div className="form-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Your password"
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={isSubmitting}>
            {isSubmitting ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <p className="auth-switch">
          No account yet? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
