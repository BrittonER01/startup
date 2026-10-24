import { useEffect, useState } from 'react';
import { INITIAL_ACTIVITY, INITIAL_FRIENDS, MOCK_ACTIVITY_EVENTS } from '../data/demoData.js';
import { readStorage, STORAGE_KEYS, writeStorage } from '../lib/storage.js';

function initials(name) {
  return name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
}

function clockLabel(date) {
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function Friends({ user }) {
  const [friends, setFriends] = useState(() => readStorage(STORAGE_KEYS.friends, INITIAL_FRIENDS));
  const [activity, setActivity] = useState(() => readStorage(STORAGE_KEYS.activity, INITIAL_ACTIVITY));
  const [username, setUsername] = useState('');
  const [feedback, setFeedback] = useState('');

  useEffect(() => { writeStorage(STORAGE_KEYS.friends, friends); }, [friends]);

  function addFriend(event) {
    event.preventDefault();
    const cleanName = username.trim().replace(/^@/, '');
    if (cleanName.length < 2) {
      setFeedback('Enter a username with at least 2 characters.');
      return;
    }
    if (cleanName.toLowerCase() === user?.username.toLowerCase()) {
      setFeedback("You can't add your own account.");
      return;
    }
    if (friends.some((friend) => friend.username.toLowerCase() === cleanName.toLowerCase())) {
      setFeedback('That person is already in your friends list or has a pending request.');
      return;
    }
    const displayName = cleanName.replace(/[._-]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
    setFriends((items) => [...items, { id: `friend-${Date.now()}`, username: cleanName, name: displayName, status: 'pending' }]);
    setUsername('');
    setFeedback(`Friend request sent to ${displayName}. This request is mocked locally.`);
  }

  function acceptRequest(id) {
    setFriends((items) => items.map((friend) => friend.id === id ? { ...friend, status: 'friend' } : friend));
    setFeedback('Friend request accepted in this local demo.');
  }

  function removeFriend(id) {
    setFriends((items) => items.filter((friend) => friend.id !== id));
    setFeedback('Friend removed from this browser.');
  }

  const connected = friends.filter((friend) => friend.status === 'friend');
  const pending = friends.filter((friend) => friend.status === 'pending');

  return (
    <main className="container body">
      <section className="page-intro">
        <p className="eyebrow">GOOD HABITS ARE SOCIAL</p>
        <h2>Friends &amp; activity</h2>
        <p>Add people by username, manage local demo requests, and see simulated activity appear every 15 seconds.</p>
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
            {connected.length ? <ul className="friends-list">{connected.map((friend) => <li key={friend.id}><span className="avatar" aria-hidden="true">{initials(friend.name)}</span><span className="friend-name">{friend.name}<small>@{friend.username}</small></span><button className="button-text" type="button" onClick={() => removeFriend(friend.id)}>Remove</button></li>)}</ul> : <div className="empty-state"><p>No connected friends yet. Add someone above.</p></div>}
          </div>
          {!!pending.length && <div className="friend-group"><div className="section-heading-row"><h3>Pending requests</h3><span className="count-pill">{pending.length}</span></div><ul className="friends-list">{pending.map((friend) => <li key={friend.id}><span className="avatar" aria-hidden="true">{initials(friend.name)}</span><span className="friend-name">{friend.name}<small>Request pending</small></span><button type="button" className="button-quiet" onClick={() => acceptRequest(friend.id)}>Accept</button><button type="button" className="button-text" onClick={() => removeFriend(friend.id)}>Cancel</button></li>)}</ul></div>}
        </div>
      </section>
    </main>
  );
}