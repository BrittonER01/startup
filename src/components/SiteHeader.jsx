import { NavLink } from 'react-router-dom';

export function SiteHeader({ user, onLogout }) {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <div className="brand">
          <img src="/logo.svg" alt="" aria-hidden="true" />
          <div>
            <h1>VitalLog</h1>
            <p className="session-status">
              {user ? <>Signed in as <span className="username">{user.username}</span></> : 'Health habits, together'}
            </p>
          </div>
        </div>
        <nav aria-label="Main navigation">
          <ul className="nav-menu">
            <li><NavLink to="/" end>Home</NavLink></li>
            <li><NavLink to="/login">Login / Register</NavLink></li>
            <li><NavLink to="/dashboard">Dashboard</NavLink></li>
            <li><NavLink to="/friends">Friends</NavLink></li>
            <li><NavLink to="/articles">Research Feed</NavLink></li>
            {user && <li><button type="button" onClick={onLogout}>Log out</button></li>}
          </ul>
        </nav>
      </div>
    </header>
  );
}
