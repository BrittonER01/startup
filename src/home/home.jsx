import React from 'react';

export function Home() {
  return (
    <main className="container">
      <section className="hero row g-4 align-items-start">
        <div className="col-lg-7">
          <h2>Track your health habits, together</h2>
          <p>
            VitalLog is a health habit tracking application. This deliverable represents the basic structure
            of the application. Styling and interactivity will come in later deliverables.
          </p>
        </div>
        <aside className="vitals-panel col-lg-5">
          <h3>Sample Vitals</h3>
          <div className="stat">
            <span className="stat-value">7</span>
            <span className="stat-label">day streak</span>
          </div>
          <div className="stat">
            <span className="stat-value">3</span>
            <span className="stat-label">friends active today</span>
          </div>
          <div className="stat">
            <span className="stat-value">128</span>
            <span className="stat-label">entries logged</span>
          </div>
        </aside>
      </section>

      <section>
        <h2>What VitalLog will do</h2>
        <ul className="feature-list">
          <li>Log daily sleep, exercise, and nutrition entries</li>
          <li>Create an account and log in to save your data</li>
          <li>Connect with friends and see their recent activity in real time</li>
          <li>View your own logged history stored in the database</li>
          <li>Browse recent PubMed research headlines related to fitness and nutrition</li>
        </ul>
      </section>

      <section className="card">
        <h2>Source Code</h2>
        <p>
          View the source for this project on GitHub:{' '}
          <a href="https://github.com/BrittonER01/startup" target="_blank" rel="noopener noreferrer">
            github.com/BrittonER01/startup
          </a>
        </p>
      </section>
    </main>
  );
}