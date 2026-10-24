import { useEffect, useMemo, useState } from 'react';
import { SAMPLE_ARTICLES } from '../data/demoData.js';

export function Articles() {
  const [query, setQuery] = useState('');
  const [articles, setArticles] = useState([]);
  const [refreshedAt, setRefreshedAt] = useState(null);
  const [showNotice, setShowNotice] = useState(false);

  useEffect(() => {
    // Mock the future NCBI E-utilities request with predictable local sample records.
    setArticles(SAMPLE_ARTICLES);
    setRefreshedAt(new Date());
  }, []);

  const filteredArticles = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) return articles;
    return articles.filter((article) => `${article.title} ${article.summary} ${article.terms}`.toLowerCase().includes(cleanQuery));
  }, [articles, query]);

  function refreshSamples() {
    setArticles([...SAMPLE_ARTICLES].sort(() => Math.random() - 0.5));
    setRefreshedAt(new Date());
    setShowNotice(true);
  }

  return (
    <main className="container body">
      <section className="page-intro research-intro">
        <p className="eyebrow">EVIDENCE, NOT GUESSWORK</p>
        <h2>Fitness &amp; nutrition research</h2>
        <p>Search sample research topics and open a matching query on PubMed. The card content is mocked for this deliverable; later, it can be replaced by live NCBI E-utilities responses.</p>
      </section>
      <section className="research-tools" aria-label="Research feed controls">
        <div className="research-search"><label htmlFor="article-search">Search topics</label><input id="article-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try sleep, exercise, nutrition…" /></div>
        <button type="button" className="button-quiet" onClick={refreshSamples}>Refresh sample feed</button>
      </section>
      <div className="research-meta" aria-live="polite">{showNotice ? 'Sample feed refreshed.' : 'Demo research topics'}{refreshedAt && ` · Last refreshed ${refreshedAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`}</div>
      {filteredArticles.length ? <div className="article-grid">{filteredArticles.map((article) => (
        <article key={article.id} className="research-card">
          <div className="article-topline"><span className="article-tag">{article.journal}</span><time dateTime={String(article.year)}>{article.year}</time></div>
          <h3>{article.title}</h3>
          <p className="article-journal">{article.journal}</p>
          <p>{article.summary}</p>
          <a href={`https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(article.query)}`} target="_blank" rel="noopener noreferrer">Find related papers on PubMed <span aria-hidden="true">↗</span></a>
        </article>
      ))}</div> : <div className="empty-state"><h3>No sample topics found</h3><p>Try a broader search such as “health” or clear the search field.</p><button type="button" className="button-text" onClick={() => setQuery('')}>Clear search</button></div>}
      <p className="small-print research-disclaimer">The descriptions above are illustrative summaries, not abstracts of specific papers. Open PubMed to review actual research records.</p>
    </main>
  );
}