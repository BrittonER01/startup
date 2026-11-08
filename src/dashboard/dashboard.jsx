import { useEffect, useMemo, useState } from 'react';
import {
  formatEntryAmount,
  formatEntryValue,
  todayISO,
  TYPE_LABELS,
} from '../lib/storage.js';

const CATEGORY_ORDER = ['sleep', 'exercise', 'nutrition'];
const BAR_LIMITS = { sleep: 12, exercise: 120, nutrition: 3000 };

export function Dashboard({ user }) {
  const [entries, setEntries] = useState([]);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [savingEntry, setSavingEntry] = useState(false);
  const [form, setForm] = useState({ type: 'sleep', amount: '', notes: '' });
  const [feedback, setFeedback] = useState('');
  const [filter, setFilter] = useState('all');

  // Retrieve health entries from the backend.
  useEffect(() => {
    const controller = new AbortController();

    async function fetchEntries() {
      try {
        const response = await fetch('/api/entries', {
          credentials: 'include',
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error('Unable to retrieve health entries.');
        }

        const data = await response.json();

        setEntries(data);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error(error);
          setFeedback(error.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingEntries(false);
        }
      }
    }

    fetchEntries();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!feedback) return;

    const timeoutId = window.setTimeout(() => {
      setFeedback('');
    }, 4000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [feedback]);

  const today = todayISO();
  const todayEntries = entries.filter((entry) => entry.date === today);
  const totals = useMemo(() => Object.fromEntries(CATEGORY_ORDER.map((type) => [
    type,
    todayEntries.filter((entry) => entry.type === type).reduce((sum, entry) => sum + Number(entry.amount || 0), 0),
  ])), [todayEntries]);
  const visibleEntries = entries
    .filter((entry) => filter === 'all' || entry.type === filter)
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date));


  async function handleSubmit(event) {
    event.preventDefault();

    const amount = Number(form.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setFeedback('Enter a number greater than zero.');
      return;
    }

    setSavingEntry(true);

    try {
      const response = await fetch('/api/entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          date: today,
          type: form.type,
          amount,
          notes: form.notes.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'Unable to save entry.');
      }

      setEntries((current) => [data, ...current]);

      setForm({
        ...form,
        amount: '',
        notes: '',
      });

      setFeedback(
        `${TYPE_LABELS[form.type].label} entry saved.`
      );
    } catch (error) {
      console.error(error);
      setFeedback(error.message || 'Unable to save entry.');
    } finally {
      setSavingEntry(false);
    }
  }



  async function removeEntry(id) {
    try {
      const response = await fetch(`/api/entries/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.msg || 'Unable to delete entry.');
      }

      setEntries((current) =>
        current.filter((entry) => entry.id !== id)
      );

      setFeedback('Entry removed successfully.');
    } catch (error) {
      console.error(error);
      setFeedback(error.message || 'Unable to delete entry.');
    }
  }


  return (
    <main className="container body">
      <section className="page-intro dashboard-intro">
        <p className="eyebrow">YOUR PERSONAL LOG</p>
        <h2>{user ? `${user.username}'s dashboard` : 'Your health dashboard'}</h2>
        <p>Record a habit and watch today's snapshot and history update instantly. Your health entries are securely associated with your account..</p>
      </section>
      <div className="dashboard-grid row g-4 align-items-start">
        <section className="col-lg-5">
          <h2>Log a New Entry</h2>
          <form onSubmit={handleSubmit}>
            <label htmlFor="entry-type">Type</label>
            <select id="entry-type" value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>
              {CATEGORY_ORDER.map((type) => <option key={type} value={type}>{TYPE_LABELS[type].label}</option>)}
            </select>
            <label htmlFor="entry-value">Amount ({TYPE_LABELS[form.type].unit})</label>
            <input id="entry-value" type="number" min="0.1" step="any" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} placeholder={TYPE_LABELS[form.type].placeholder} required />
            <label htmlFor="entry-notes">Notes (optional)</label>
            <textarea id="entry-notes" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="How did it go?" maxLength={240} />
            <button type="submit" disabled={savingEntry}>
              {savingEntry ? 'Saving...' : 'Save entry'}
            </button>
          </form>
          {feedback && <p className="form-feedback" role="status">{feedback}</p>}
        </section>

        <section className="col-lg-7">
          <div className="snapshot-panel">
            <div className="section-heading-row"><div><p className="eyebrow">{today}</p><h3>Today's snapshot</h3></div><span className="today-count">{todayEntries.length} {todayEntries.length === 1 ? 'entry' : 'entries'}</span></div>
            <div className="metric-grid">
              {CATEGORY_ORDER.map((type) => {
                const config = TYPE_LABELS[type];
                const amount = totals[type];
                const width = Math.min(100, (amount / BAR_LIMITS[type]) * 100);
                const displayed = Number.isInteger(amount) ? amount : Number(amount.toFixed(2));
                return (
                  <div className={`metric-card metric-${type}`} key={type}>
                    <div className="metric-top"><span>{config.label}</span><strong>{formatEntryAmount(amount)} <small>{config.shortUnit}</small></strong></div>
                    <div className="metric-track" role="progressbar" aria-label={`${config.label} today`} aria-valuemin="0" aria-valuemax={BAR_LIMITS[type]} ariavaluenow={Math.min(amount, BAR_LIMITS[type])}><span style={{ width: `${width}%` }} /></div>
                    <small className="metric-helper">{type === 'sleep' ? 'Sleep logged today' : type === 'exercise' ? 'Movement logged today' : 'Calories logged today'}</small>
                  </div>
                );
              })}
            </div>
            <p className="small-print">These values summarize entries you recorded today. They are not medical recommendations.</p>
          </div>
        </section>
      </div>


      <section className="history-section">
        <div className="section-heading-row history-heading">
          <div>
            <p className="eyebrow">YOUR ACTIVITY</p>
            <h2>Entry history</h2>
          </div>

          <label className="filter-control" htmlFor="entry-filter">
            Show
            <select
              id="entry-filter"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            >
              <option value="all">All entries</option>
              {CATEGORY_ORDER.map((type) => (
                <option key={type} value={type}>
                  {TYPE_LABELS[type].label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {loadingEntries ? (
          <p>Loading your health entries...</p>
        ) : visibleEntries.length ? (
          <div className="table-wrap">
            <table id="entry-history">
              <caption>Saved health entries</caption>

              <thead>
                <tr>
                  <th scope="col">Date</th>
                  <th scope="col">Type</th>
                  <th scope="col">Value</th>
                  <th scope="col">Notes</th>
                  <th scope="col">
                    <span className="visually-hidden">Actions</span>
                  </th>
                </tr>
              </thead>

              <tbody>
                {visibleEntries.map((entry) => (
                  <tr key={entry.id}>
                    <td>{entry.date}</td>

                    <td>
                      {TYPE_LABELS[entry.type]?.label ?? entry.type}
                    </td>

                    <td>{formatEntryValue(entry)}</td>

                    <td>{entry.notes || '—'}</td>

                    <td>
                      <button
                        className="button-text"
                        type="button"
                        onClick={() => removeEntry(entry.id)}
                        aria-label={`Delete ${TYPE_LABELS[entry.type]?.label ?? 'health'
                          } entry from ${entry.date}`}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <h3>No entries match this filter</h3>
            <p>
              Choose another category or log your first entry above.
            </p>
          </div>
        )}
      </section>

    </main>
  );
}

