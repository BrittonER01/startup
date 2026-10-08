import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';

export default function App() {
  return <div className="body">
    <header className="site-header">
      <div className="site-header-inner">
        <div className="brand">
          <img src="logo.png" alt="VitalLog logo" />
          <div>
            <h1>VitalLog</h1>
            <p className="session-status">Built by Brit Richardson</p>
          </div>
        </div>
        <nav className="primary-nav">
          <menu className="nav-menu">
            <li><a href="index.html" className="active">Home</a></li>
            <li><a href="login.html">Login / Register</a></li>
            <li><a href="dashboard.html">Dashboard</a></li>
            <li><a href="friends.html">Friends</a></li>
            <li><a href="articles.html">Research Feed</a></li>
          </menu>
        </nav>
      </div>
    </header>

    <main className="container"> App components go here </main>

    <footer>
      <p>&copy; 2026 Brit Richardson — CS 260 Startup Project</p>
      <p>
        <a href="https://github.com/BrittonER01/startup" target="_blank" rel="noopener noreferrer">GitHub Repository</a>
      </p>
    </footer>
  </div>;
}