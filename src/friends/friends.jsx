import React from 'react';

export function Friends() {
  return (
    <main className="container">
      <section>
        <h2>Add a Friend</h2>
        <form action="#" method="post">
          <label htmlFor="friend-username">Username</label>
          <input type="text" id="friend-username" name="username" placeholder="username to add" />
          <button type="submit">Send Request</button>
        </form>
      </section>

      <section>
        <h2>Your Friends</h2>
        <ul id="friends-list" className="friends-list">
          <li>
            <span className="avatar" aria-hidden="true">DK</span>
            David Kim
          </li>
          <li>
            <span className="avatar" aria-hidden="true">NL</span>
            Nancy Lee
          </li>
        </ul>
      </section>

      <section>
        <h2>Live Friend Activity</h2>
        <p>
          This feed updates in real time over a WebSocket connection whenever a friend
          logs a new entry.
        </p>
        <ul id="activity-feed">
          <li>David Kim logged 8 hours of sleep - just now</li>
          <li>Nancy Lee logged a 5k run - 12 minutes ago</li>
          <li>Waiting for more live updates&hellip;</li>
        </ul>
      </section>
    </main>
  );
}