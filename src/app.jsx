import { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import { SiteHeader } from './components/SiteHeader.jsx';
import { Home } from './home/home.jsx';
import { Login } from './login/login.jsx';
import { Dashboard } from './dashboard/dashboard.jsx';
import { Articles } from './articles/articles.jsx';
import { Friends } from './friends/friends.jsx';
import { readStorage, STORAGE_KEYS, writeStorage } from './lib/storage.js';

export default function App() {
  const [user, setUser] = useState(() => readStorage(STORAGE_KEYS.user, null));

  useEffect(() => {
    if (user) writeStorage(STORAGE_KEYS.user, user);
    else {
      try { window.localStorage.removeItem(STORAGE_KEYS.user); } catch (error) {
        console.warn('Could not clear the demo session.', error);
      }
    }
  }, [user]);

  function handleLogout() {
    setUser(null);
  }

  return (
    <BrowserRouter>
      <div className="app-shell">
        <SiteHeader user={user} onLogout={handleLogout} />
        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/login" element={<Login user={user} onAuthenticate={setUser} />} />
          <Route path="/dashboard" element={<Dashboard user={user} />} />
          <Route path="/friends" element={<Friends user={user} />} />
          <Route path="/articles" element={<Articles />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <footer>
          <p>&copy; 2026 Brit Richardson — CS 260 Startup Project</p>
          <p><a href="https://github.com/BrittonER01/startup" target="_blank" rel="noopener noreferrer">View the VitalLog GitHub repository</a></p>
          <p className="footer-note">Classroom prototype: account, health, and friend data are stored in this browser only.</p>
        </footer>
      </div>
    </BrowserRouter>
  );
}

function NotFound() {
  return (
    <main className="container body">
      <section className="card">
        <h2>Page not found</h2>
        <p>That VitalLog page does not exist.</p>
        <NavLink to="/">Return home</NavLink>
      </section>
    </main>
  );
}
