import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';

import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import { Home } from './home/home';
import { Login } from './login/login';
import { Dashboard } from './dashboard/dashboard';
import { Articles } from './articles/articles';
import { Friends } from './friends/friends';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <header className="site-header">
          <div className="site-header-inner">
            <div className="brand">
              <img src="/logo.png" alt="VitalLog logo" />
              <div>
                <h1>VitalLog</h1>
                <p className="session-status">Built by Brit Richardson</p>
              </div>
            </div>
            <nav className="primary-nav">
              <menu className="nav-menu">
                <li><NavLink to="/">Home</NavLink></li>
                <li><NavLink to="/login">Login / Register</NavLink></li>
                <li><NavLink to="/dashboard">Dashboard</NavLink></li>
                <li><NavLink to="/friends">Friends</NavLink></li>
                <li><NavLink to="/articles">Research Feed</NavLink></li>
              </menu>
            </nav>
          </div>
        </header>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/articles" element={<Articles />} />
          <Route path="*" element={<NotFound />} />
        </Routes>

        <footer>
          <p>&copy; 2026 Brit Richardson — CS 260 Startup Project</p>
          <p>
            <a href="https://github.com/BrittonER01/startup" target="_blank" rel="noopener noreferrer">GitHub Repository</a>
          </p>
        </footer>
      </div>
    </BrowserRouter>
  );
}

function NotFound() {
  return <main className="body">404: Return to sender. Address unknown.</main>;
}