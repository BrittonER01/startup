import { Fragment, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { hashDemoPassword, readStorage, STORAGE_KEYS, writeStorage } from '../lib/storage.js';

function AuthForm({
  title,
  fields,
  onSubmit,
  submitLabel,
  busy,
}) {
  return (
    <div className="form-panel">
      <h3>{title}</h3>

      <form onSubmit={onSubmit}>
        {fields.map((field) => (
          <Fragment key={field.id}>
            <label htmlFor={field.id}>
              {field.label}
            </label>

            <input
              id={field.id}
              name={field.name}
              type={field.type ?? 'text'}
              autoComplete={field.autoComplete}
              value={field.value}
              onChange={(event) =>
                field.onChange(event.target.value)
              }
              placeholder={field.placeholder}
              minLength={field.minLength}
              required
            />
          </Fragment>
        ))}

        <button type="submit" disabled={busy}>
          {busy ? 'Please wait…' : submitLabel}
        </button>
      </form>
    </div>
  );
}

export function Login({ user, onAuthenticate }) {
  const navigate = useNavigate();
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ username: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const [messageKind, setMessageKind] = useState('success');
  const [busy, setBusy] = useState(false);

  function showMessage(text, kind = 'success') {
    setMessage(text);
    setMessageKind(kind);
  }

  function clearMessage() {
    setMessage('');
    setMessageKind('success');
  }

  function updateLoginField(field, value) {
    setLoginForm((current) => ({
      ...current,
      [field]: value,
    }));

    clearMessage();
  }

  function updateRegisterField(field, value) {
    setRegisterForm((current) => ({
      ...current,
      [field]: value,
    }));

    clearMessage();
  }

  async function handleRegister(event) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      const username = registerForm.username.trim();
      const email = registerForm.email.trim().toLowerCase();
      if (username.length < 3) throw new Error('Choose a username with at least 3 characters.');
      if (registerForm.password.length < 6) throw new Error('Use a demo password with at least 6 characters.');
      const accounts = readStorage(STORAGE_KEYS.accounts, []);
      if (accounts.some((account) => account.username.toLowerCase() === username.toLowerCase())) {
        throw new Error('That username is already registered in this browser.');
      }
      const passwordHash = await hashDemoPassword(registerForm.password);
      const nextAccounts = [...accounts, { username, email, passwordHash }];
      if (!writeStorage(STORAGE_KEYS.accounts, nextAccounts)) throw new Error('Browser storage is unavailable. Check your browser privacy settings.');
      const nextUser = { username, email };
      onAuthenticate(nextUser);
      showMessage('Account created. You are now signed in on this browser.');
      navigate('/dashboard');
    } catch (error) {
      showMessage(error.message || 'Could not create this demo account.', 'error');
    } finally {
      setBusy(false);
    }
  }

  async function handleLogin(event) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      const username = loginForm.username.trim();
      const accounts = readStorage(STORAGE_KEYS.accounts, []);
      const account = accounts.find((candidate) => candidate.username.toLowerCase() === username.toLowerCase());
      if (!account) throw new Error('No local account was found. Create an account first in this browser.');
      const passwordHash = await hashDemoPassword(loginForm.password);
      if (passwordHash !== account.passwordHash) throw new Error('That password does not match this local demo account.');
      onAuthenticate({ username: account.username, email: account.email });
      showMessage('You are signed in.');
      navigate('/dashboard');
    } catch (error) {
      showMessage(error.message || 'Could not sign in to the demo account.', 'error');
    } finally {
      setBusy(false);
    }
  }

  const loginFields = [
    {
      id: 'login-username',
      name: 'username',
      label: 'Username',
      autoComplete: 'username',
      value: loginForm.username,
      onChange: (value) =>
        updateLoginField('username', value),
      placeholder: 'your username',
    },
    {
      id: 'login-password',
      name: 'password',
      label: 'Demo password',
      type: 'password',
      autoComplete: 'current-password',
      value: loginForm.password,
      onChange: (value) =>
        updateLoginField('password', value),
      placeholder: 'your demo password',
    },
  ];

  const registrationFields = [
    {
      id: 'register-username',
      name: 'username',
      label: 'Username',
      autoComplete: 'username',
      minLength: 3,
      value: registerForm.username,
      onChange: (value) =>
        updateRegisterField('username', value),
      placeholder: 'choose a username',
    },
    {
      id: 'register-email',
      name: 'email',
      label: 'Email',
      type: 'email',
      autoComplete: 'email',
      value: registerForm.email,
      onChange: (value) =>
        updateRegisterField('email', value),
      placeholder: 'you@example.com',
    },
    {
      id: 'register-password',
      name: 'password',
      label: 'Demo password',
      type: 'password',
      autoComplete: 'new-password',
      minLength: 6,
      value: registerForm.password,
      onChange: (value) =>
        updateRegisterField('password', value),
      placeholder: 'at least 6 characters',
    },
  ];

  if (user) {
    return (
      <main className="container body">
        <section className="card auth-current">
          <p className="eyebrow">LOCAL DEMO SESSION</p>
          <h2>Welcome back, {user.username}</h2>
          <p>You are currently signed in on this browser. Your sample data stays local to this browser and is not synced to a server.</p>
          {message && <p className={`notice notice-${messageKind}`} role="status">{message}</p>}
          <Link className="button-link" to="/dashboard">Go to your dashboard</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="container body">
      <section className="page-intro">
        <p className="eyebrow">MAKE IT YOURS</p>
        <h2>Welcome to VitalLog</h2>
        <p>Create a demo account or sign in to personalize the session. This is a client-only prototype, not production authentication.</p>
      </section>
      {message && <p className={`notice notice-${messageKind}`} role="status" aria-live="polite">{message}</p>}
      <div className="form-grid row g-4">
        <section className="col-md-6">
          <AuthForm
            title="Login"
            fields={loginFields}
            onSubmit={handleLogin}
            submitLabel="Login"
            busy={busy}
          />
        </section>

        <section className="col-md-6">
          <AuthForm
            title="Create an account"
            fields={registrationFields}
            onSubmit={handleRegister}
            submitLabel="Create account"
            busy={busy}
          />
        </section>
      </div>
      <p className="small-print">Do not use a real password. The browser hash and local account list are only for demonstrating UI state; a real app needs server-side identity, authorization, and secure storage.</p>
    </main>
  );
}
