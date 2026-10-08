import React from 'react';

export function Login() {
  return (
    <main className="container">
      <section className="card">
        <h2>Welcome back</h2>
        <p>Your session status is shown in the header above.</p>
      </section>

      <div className="form-grid row g-4">
        <section className="col-md-6">
          <h3>Login</h3>
          <form action="#" method="post">
            <label htmlFor="login-username">Username</label>
            <input type="text" id="login-username" name="username" placeholder="your username" required />

            <label htmlFor="login-password">Password</label>
            <input type="password" id="login-password" name="password" placeholder="your password" required />

            <button type="submit">Login</button>
          </form>
        </section>

        <section className="col-md-6">
          <h3>Create an Account</h3>
          <form action="#" method="post">
            <label htmlFor="register-username">Username</label>
            <input type="text" id="register-username" name="username" placeholder="choose a username" required />

            <label htmlFor="register-email">Email</label>
            <input type="email" id="register-email" name="email" placeholder="you@example.com" required />

            <label htmlFor="register-password">Password</label>
            <input type="password" id="register-password" name="password" placeholder="choose a password" required />

            <button type="submit">Create Account</button>
          </form>
        </section>
      </div>
    </main>
  );
}