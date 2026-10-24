import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { hashDemoPassword, readStorage, STORAGE_KEYS, writeStorage } from '../lib/storage.js';

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
          <div className="form-panel">
            <h3>Login</h3>
            <form onSubmit={handleLogin}>
              <label htmlFor="login-username">Username</label>
              <input id="login-username" name="username" autoComplete="username" value={loginForm.username} onChange={(event) => setLoginForm({ ...loginForm, username: event.target.value })} placeholder="your username" required />
              <label htmlFor="login-password">Demo password</label>
              <input id="login-password" name="password" type="password" autoComplete="current-password" value={loginForm.password} onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })} placeholder="your demo password" required />
              <button type="submit" disabled={busy}>{busy ? 'Please wait…' : 'Login'}</button>
            </form>
          </div>
        </section>
        <section className="col-md-6">
          <div className="form-panel">
            <h3>Create an account</h3>
            <form onSubmit={handleRegister}>
              <label htmlFor="register-username">Username</label>
              <input id="register-username" name="username" autoComplete="username" minLength={3} value={registerForm.username} onChange={(event) => setRegisterForm({ ...registerForm, username: event.target.value })} placeholder="choose a username" required />
              <label htmlFor="register-email">Email</label>
              <input id="register-email" name="email" type="email" autoComplete="email" value={registerForm.email} onChange={(event) => setRegisterForm({ ...registerForm, email: event.target.value })} placeholder="you@example.com" required />
              <label htmlFor="register-password">Demo password</label>
              <input id="register-password" name="password" type="password" autoComplete="new-password" minLength={6} value={registerForm.password} onChange={(event) => setRegisterForm({ ...registerForm, password: event.target.value })} placeholder="at least 6 characters" required />
              <button type="submit" disabled={busy}>{busy ? 'Please wait…' : 'Create account'}</button>
            </form>
          </div>
        </section>
      </div>
      <p className="small-print">Do not use a real password. The browser hash and local account list are only for demonstrating UI state; a real app needs server-side identity, authorization, and secure storage.</p>
    </main>
  );
}
