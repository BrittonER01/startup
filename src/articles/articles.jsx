import React from 'react';

export function Articles() {
  return (
    <main className="container">
      <section>
        <h2>Latest Fitness &amp; Nutrition Research</h2>
        <p>
          Headlines below are pulled from PubMed via the NCBI E-utilities API. This is a
          placeholder for that third-party data.
        </p>

        <div className="article-grid row g-4">
          <article>
            <h3>Placeholder Article Title</h3>
            <p>Placeholder Journal &mdash; Published <time datetime="2026">2026</time></p>
            <p>Placeholder summary of the article abstract will appear here.</p>
            <a href="#" target="_blank" rel="noopener noreferrer">Read on PubMed</a>
          </article>

          <article>
            <h3>Placeholder Article Title 2</h3>
            <p>Placeholder Journal &mdash; Published <time datetime="2026">2026</time></p>
            <p>Placeholder summary of the article abstract will appear here.</p>
            <a href="#" target="_blank" rel="noopener noreferrer">Read on PubMed</a>
          </article>

          <article>
            <h3>Placeholder Article Title 3</h3>
            <p>Placeholder Journal &mdash; Published <time datetime="2026">2026</time></p>
            <p>Placeholder summary of the article abstract will appear here.</p>
            <a href="#" target="_blank" rel="noopener noreferrer">Read on PubMed</a>
          </article>
        </div>
      </section>
    </main>
  );
}