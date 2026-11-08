import { useEffect, useState } from 'react';
import { API } from './lib/api.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import { SiteHeader } from './components/SiteHeader.jsx';
import { Home } from './home/home.jsx';
import { Login } from './login/login.jsx';
import { Dashboard } from './dashboard/dashboard.jsx';
import { Articles } from './articles/articles.jsx';
import { Friends } from './friends/friends.jsx';

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function checkAuthentication() {
      try {
        const response = await fetch(API.profile, {
          credentials: 'include',
        });

        if (!response.ok) {
          setUser(null);
          return;
        }

        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error('Could not verify authentication:', error);
        setUser(null);
      }
    }

    checkAuthentication();
  }, []);

  async function handleLogout() {
    try {
      const response = await fetch(API.auth.logout, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Logout failed.');
      }

      setUser(null);
    } catch (error) {
      console.error(error);
    }
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
          <p className="footer-note">Classroom prototype</p>
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
