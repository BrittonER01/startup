import { Fragment, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API } from '../lib/api.js';

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
      const response = await fetch(API.auth.create, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username: registerForm.username.trim(),
          email: registerForm.email.trim().toLowerCase(),
          password: registerForm.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'Registration failed.');
      }

      onAuthenticate({
        username: data.username,
        email: data.email,
      });

      showMessage('Account created. You are now signed in.');
      navigate('/dashboard');
    } catch (error) {
      showMessage(error.message || 'Could not create your account.', 'error');
    } finally {
      setBusy(false);
    }
  }



  async function handleLogin(event) {
    event.preventDefault();
    setBusy(true);
    setMessage('');

    try {
      const response = await fetch(API.auth.login, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username: loginForm.username.trim(),
          password: loginForm.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'Login failed.');
      }

      onAuthenticate({
        username: data.username,
        email: data.email,
      });

      showMessage('You are signed in.');
      navigate('/dashboard');
    } catch (error) {
      showMessage(error.message || 'Could not sign in.', 'error');
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
    </main>
  );
}
