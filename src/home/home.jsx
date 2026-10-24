import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { loadEntries, readStorage, STORAGE_KEYS } from '../lib/storage.js';
import { INITIAL_FRIENDS } from '../data/demoData.js';

export function Home({ user }) {
  const [entries, setEntries] = useState(() => loadEntries());
  const [friends, setFriends] = useState(() => readStorage(STORAGE_KEYS.friends, INITIAL_FRIENDS));

  useEffect(() => {
    setEntries(loadEntries());
    setFriends(readStorage(STORAGE_KEYS.friends, INITIAL_FRIENDS));
  }, []);

  const acceptedFriends = friends.filter((friend) => friend.status === 'friend').length;
  return (
    <main className="container body">
      <section className="hero row g-4 align-items-start">
        <div className="col-lg-7">
          <p className="eyebrow">YOUR HEALTH, IN CONTEXT</p>
          <h2>Track your health habits, together</h2>
          <p>Small daily check-ins can make patterns easier to notice. VitalLog brings sleep, movement, nutrition, friends, and research into one calm space.</p>
          <div className="hero-actions">
            <Link className="button-link" to="/dashboard">Log today's habits</Link>
            <Link className="text-link" to="/articles">Explore research <span aria-hidden="true">→</span></Link>
          </div>
          <p className="welcome-note">{user ? `Welcome back, ${user.username}. Your demo session is active on this browser.` : 'Explore the demo, or register a local account to personalize your session.'}</p>
        </div>
        <aside className="vitals-panel col-lg-5" aria-label="VitalLog at a glance">
          <h3>Your VitalLog at a glance</h3>
          <div className="stat"><span className="stat-value">{entries.length}</span><span className="stat-label">health entries saved</span></div>
          <div className="stat"><span className="stat-value">{acceptedFriends}</span><span className="stat-label">friends connected</span></div>
          <div className="stat"><span className="stat-value">3</span><span className="stat-label">research topics to explore</span></div>
        </aside>
      </section>

      <section>
        <h2>A simple daily rhythm</h2>
        <div className="feature-cards">
          <article className="feature-card"><span className="feature-number">01</span><h3>Log your day</h3><p>Record sleep, exercise, and nutrition. Your history and snapshot update immediately.</p><Link to="/dashboard">Open dashboard →</Link></article>
          <article className="feature-card"><span className="feature-number">02</span><h3>Stay connected</h3><p>Add friends and see a simulated activity feed while the future WebSocket service is mocked.</p><Link to="/friends">Visit friends →</Link></article>
          <article className="feature-card"><span className="feature-number">03</span><h3>Keep learning</h3><p>Search the sample fitness and nutrition research feed and open matching PubMed results.</p><Link to="/articles">Browse research →</Link></article>
        </div>
      </section>

      <section className="card source-card">
        <h2>Built for CS 260</h2>
        <p>Created by <strong>Brit Richardson</strong>. VitalLog is being developed as a React startup project with interactive mock functionality.</p>
        <p className="source-link"><a href="https://github.com/BrittonER01/startup" target="_blank" rel="noopener noreferrer">github.com/BrittonER01/startup</a></p>
      </section>
    </main>
  );
}