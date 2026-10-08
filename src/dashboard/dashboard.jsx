import React from 'react';

export function Dashboard() {
  return (
    <main className="container">
      <div className="dashboard-grid row g-4 align-items-start">
        <section className="col-md-6">
          <h2>Log a New Entry</h2>
          <form action="#" method="post">
            <label htmlFor="entry-type">Type</label>
            <select id="entry-type" name="type">
              <option value="sleep">Sleep</option>
              <option value="exercise">Exercise</option>
              <option value="nutrition">Nutrition</option>
            </select>

            <label htmlFor="entry-value">Value</label>
            <input type="text" id="entry-value" name="value" placeholder="example data entry" />

            <label htmlFor="entry-notes">Notes</label>
            <textarea id="entry-notes" name="notes" placeholder="Optional notes"></textarea>

            <button type="submit">Save Entry</button>
          </form>
        </section>

        <section className="col-md-6">
          <h2>Today's Snapshot</h2>
          <figure>
            <svg
              style={{ width: '100%', maxWidth: 300 }}
              viewBox="0 0 300 150"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="10" y="10" width="80" height="100" fill="MediumSeaGreen" />
              <text x="20" y="130">Sleep</text>
              <rect x="110" y="40" width="80" height="70" fill="DarkOrange" />
              <text x="115" y="130">Exercise</text>
              <rect x="210" y="60" width="80" height="50" fill="DarkViolet" />
              <text x="205" y="130">Nutrition</text>
            </svg>
            <figcaption>Placeholder chart of today's logged activity</figcaption>
          </figure>
        </section>
      </div>

      <section>
        <h2>Your Entry History</h2>
        <p>Data below is stored in and retrieved from the database.</p>
        <div className="table-wrap">
          <table>
            <caption>Your recent health entry history</caption>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Value</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody id="entry-history">
              <tr>
                <td>2026-09-20</td>
                <td>Sleep</td>
                <td>7.5 hours</td>
                <td>Woke up once</td>
              </tr>
              <tr>
                <td>2026-09-20</td>
                <td>Exercise</td>
                <td>30 min run</td>
                <td>Felt strong</td>
              </tr>
              <tr>
                <td>2026-09-19</td>
                <td>Nutrition</td>
                <td>2100 kcal</td>
                <td>-</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}