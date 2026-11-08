import { useEffect, useState } from 'react';
import {
  INITIAL_ACTIVITY,
  MOCK_ACTIVITY_EVENTS,
} from '../data/demoData.js';

function initials(name) {
  return name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
}

function clockLabel(date) {
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function Friends({ user }) {
  const [friends, setFriends] = useState([]);
  const [activity, setActivity] = useState(INITIAL_ACTIVITY);

  const [loadingFriends, setLoadingFriends] = useState(true);

  const safeFriends = Array.isArray(friends) ? friends : [];
  const safeActivity = Array.isArray(activity) ? activity : [];
  const [username, setUsername] = useState('');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    async function fetchFriends() {
      try {
        const response = await fetch('/api/friends', {
          credentials: 'include',
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error('Unable to retrieve friends.');
        }

        const data = await response.json();

        setFriends(data);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error(error);
          setFeedback(error.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingFriends(false);
        }
      }
    }

    fetchFriends();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    // Simulate server-pushed WebSocket events for this deliverable; clear the timer on unmount.
    let eventIndex = 0;
    const timer = window.setInterval(() => {
      const event = MOCK_ACTIVITY_EVENTS[eventIndex % MOCK_ACTIVITY_EVENTS.length];
      eventIndex += 1;
      const newItem = { id: `live-${Date.now()}`, from: event.from, message: event.message, time: clockLabel(new Date()) };
      setActivity((items) => [newItem, ...items].slice(0, 8));
    }, 15000);
    return () => window.clearInterval(timer);
  }, []);


  async function addFriend(event) {
    event.preventDefault();

    const cleanName = username.trim().replace(/^@/, '').toLowerCase();

    if (cleanName.length < 2) {
      setFeedback('Enter a username with at least 2 characters.');
      return;
    }

    if (cleanName === user?.username?.toLowerCase()) {
      setFeedback("You can't add your own account.");
      return;
    }

    if (
      safeFriends.some(
        (friend) => friend.username.toLowerCase() === cleanName
      )
    ) {
      setFeedback('That person is already in your friends list.');
      return;
    }

    try {
      const response = await fetch('/api/friends', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username: cleanName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'Unable to add friend.');
      }

      setFriends((current) => [...current, data]);
      setUsername('');
      setFeedback(`Friend request sent to ${data.name}.`);
    } catch (error) {
      console.error(error);
      setFeedback(error.message);
    }
  }


  async function acceptRequest(id) {
    try {
      const response = await fetch(`/api/friends/${id}`, {
        method: 'PATCH',
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'Unable to accept request.');
      }

      setFriends((current) =>
        current.map((friend) =>
          friend.id === id ? data : friend
        )
      );

      setFeedback('Friend request accepted.');
    } catch (error) {
      console.error(error);
      setFeedback(error.message);
    }
  }

  async function removeFriend(id) {
    try {
      const response = await fetch(`/api/friends/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.msg || 'Unable to remove friend.');
      }

      setFriends((current) =>
        current.filter((friend) => friend.id !== id)
      );

      setFeedback('Friend removed successfully.');
    } catch (error) {
      console.error(error);
      setFeedback(error.message);
    }
  }

  const connected = safeFriends.filter(
    (friend) => friend?.status === 'friend'
  );

  const pending = safeFriends.filter(
    (friend) => friend?.status === 'pending'
  );

  return (
    <main className="container body">
      <section className="page-intro">
        <p className="eyebrow">GOOD HABITS ARE SOCIAL</p>
        <h2>Friends &amp; activity</h2>
        <p>  Add people by username, manage friend requests, and see simulated activity appear every 15 seconds.</p>
      </section>
      <section className="friends-layout row g-4 align-items-start">
        <div className="col-lg-5">
          <div className="form-panel">
            <h3>Add a friend</h3>
            <form onSubmit={addFriend}>
              <label htmlFor="friend-username">Username</label>
              <input id="friend-username" value={username} onChange={(event) => setUsername(event.target.value)} placeholder="username to add" maxLength={40} required />
              <button type="submit">Send request</button>
            </form>
            {feedback && <p className="form-feedback" role="status">{feedback}</p>}
          </div>
          <div className="friend-group">
            <div className="section-heading-row"><h3>Your friends</h3><span className="count-pill">{connected.length}</span></div>
            {loadingFriends ? (
              <p>Loading your friends...</p>
            ) : connected.length ? (
              <ul className="friends-list">
                {connected.map((friend) => (
                  <li key={friend.id}>
                    <span className="avatar" aria-hidden="true">
                      {initials(friend.name)}
                    </span>

                    <span className="friend-name">
                      {friend.name}
                      <small>@{friend.username}</small>
                    </span>

                    <button
                      className="button-text"
                      type="button"
                      onClick={() => removeFriend(friend.id)}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="empty-state">
                <p>No connected friends yet. Add someone above.</p>
              </div>
            )}
          </div>
          {!!pending.length && <div className="friend-group"><div className="section-heading-row"><h3>Pending requests</h3><span className="count-pill">{pending.length}</span></div><ul className="friends-list">{pending.map((friend) => <li key={friend.id}><span className="avatar" aria-hidden="true">{initials(friend.name)}</span><span className="friend-name">{friend.name}<small>Request pending</small></span><button type="button" className="button-quiet" onClick={() => acceptRequest(friend.id)}>Accept</button><button type="button" className="button-text" onClick={() => removeFriend(friend.id)}>Cancel</button></li>)}</ul></div>}
        </div>
        <div className="col-lg-7">
          <section className="activity-panel">
            <div className="section-heading-row"><div><p className="eyebrow">LIVE DEMO FEED</p><h3>Recent activity</h3></div><span className="live-indicator"><span /> Simulated</span></div>
            <p className="small-print">In a later deliverable, a WebSocket service can replace this timer-based feed.</p>
            <ul className="activity-feed">{safeActivity.map((item) => <li key={item.id}><span className="activity-dot" aria-hidden="true" /><div><p><strong>{item.from}</strong> {item.message}</p><time>{item.time}</time></div></li>)}</ul>
          </section>
        </div>
      </section>
    </main>
  );
}