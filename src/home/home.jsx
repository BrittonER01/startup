import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { API } from '../lib/api.js';

export function Home({ user }) {
  const [stats, setStats] = useState({
    entries: 0,
    friends: 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    if (!user) {
      setStats({ entries: 0, friends: 0 });
      setError('');
      setLoading(false);
      return () => controller.abort();
    }

    async function loadStats() {
      setLoading(true);
      setError('');

      try {
        const [entriesResponse, friendsResponse] =
          await Promise.all([
            fetch(API.entries.list, {
              credentials: 'include',
              signal: controller.signal,
            }),
            fetch(API.friends.list, {
              credentials: 'include',
              signal: controller.signal,
            }),
          ]);

        if (!entriesResponse.ok || !friendsResponse.ok) {
          throw new Error('Unable to load your statistics.');
        }

        const [entries, friends] = await Promise.all([
          entriesResponse.json(),
          friendsResponse.json(),
        ]);

        if (controller.signal.aborted) return;

        setStats({
          entries: entries.length,
          friends: friends.filter(
            (friend) => friend.status === 'friend'
          ).length,
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          setError(error.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadStats();

    return () => controller.abort();
  }, [user?.username]);
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
          <p className="welcome-note">
            {user
              ? `Welcome back, ${user.username}. Your health data is connected to your account.`
              : 'Sign in or create an account to start tracking your health.'}
          </p>        </div>
        <aside className="vitals-panel col-lg-5" aria-label="VitalLog at a glance">
          <h3>Your VitalLog at a glance</h3>
          <div className="stat">
            <span className="stat-value">
              {loading ? '...' : user && !error ? stats.entries : '—'}
            </span>
            <span className="stat-label">
              health entries saved
            </span>
          </div>

          <div className="stat">
            <span className="stat-value">
              {loading ? '...' : user && !error ? stats.friends : '—'}
            </span>
            <span className="stat-label">
              friends connected
            </span>
          </div>

          {error && (
            <p className="form-feedback" role="alert">
              {error}
            </p>
          )}
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
        <p>Created by <strong>Brit Richardson</strong>. VitalLog is being developed as a React startup project with interactive functionality.</p>
        <p className="source-link"><a href="https://github.com/BrittonER01/startup" target="_blank" rel="noopener noreferrer">github.com/BrittonER01/startup</a></p>
      </section>
    </main>
  );
}