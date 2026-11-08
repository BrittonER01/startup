import { useEffect, useState } from 'react';

// Search PubMed and retrieve matching article IDs.
async function searchPubMed(searchTerm, signal) {
  const searchParams = new URLSearchParams({
    db: 'pubmed',
    term: searchTerm,
    retmax: '4',
    sort: 'pub_date',
    retmode: 'json',
  });

  const searchResponse = await fetch(
    `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?${searchParams}`,
    { signal }
  );

  if (!searchResponse.ok) {
    throw new Error('Unable to search PubMed.');
  }

  const searchData = await searchResponse.json();

  const ids = searchData.esearchresult?.idlist ?? [];

  if (ids.length === 0) {
    return [];
  }

  // Retrieve summaries for the returned article IDs.
  const summaryParams = new URLSearchParams({
    db: 'pubmed',
    id: ids.join(','),
    retmode: 'json',
  });

  const summaryResponse = await fetch(
    `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?${summaryParams}`,
    { signal }
  );

  if (!summaryResponse.ok) {
    throw new Error('Unable to retrieve article information.');
  }

  const summaryData = await summaryResponse.json();

  return ids.map((id) => {
    const article = summaryData.result[id];

    const authors = article.authors
      ?.slice(0, 3)
      .map((author) => author.name)
      .join(', ');

    return {
      id,
      title: article.title,
      journal: article.fulljournalname || article.source,
      year: article.pubdate,
      authors: authors || 'Authors not listed',
      url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
    };
  });
}

export function Articles() {
  const [query, setQuery] = useState(
    'nutrition OR exercise OR sleep'
  );

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function loadArticles(searchTerm, signal) {
    setLoading(true);
    setError('');

    try {
      const results = await searchPubMed(searchTerm, signal);

      setArticles(results);
    } catch (error) {
      // Ignore requests intentionally cancelled by React.
      if (error.name === 'AbortError') {
        return;
      }

      console.error('PubMed API error:', error);
      setError(error.message || 'Something went wrong.');
      setArticles([]);
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }

  // Load recent research when the component first opens.
  useEffect(() => {
    const controller = new AbortController();

    loadArticles(
      'nutrition OR exercise OR sleep',
      controller.signal
    );

    return () => {
      controller.abort();
    };
  }, []);

  function handleSearch(event) {
    event.preventDefault();

    const searchTerm = query.trim();

    if (!searchTerm) {
      setError('Please enter a research topic.');
      return;
    }

    loadArticles(searchTerm);
  }

  return (
    <main className="container body">

      <section className="page-intro research-intro">
        <p className="eyebrow">EVIDENCE, NOT GUESSWORK</p>

        <h2>Fitness &amp; Nutrition Research</h2>

        <p>
          Explore recent scientific publications covering
          nutrition, exercise, sleep, and health.
          Research results are retrieved directly from PubMed.
        </p>
      </section>

      <section className="research-tools" aria-label="Research search">
        <form onSubmit={handleSearch} className="research-search">

          <label htmlFor="article-search">
            Search research topics
          </label>

          <input
            id="article-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try nutrition, exercise, or sleep..."
          />

          <button type="submit" disabled={loading}>
            {loading ? 'Searching...' : 'Search PubMed'}
          </button>

        </form>
      </section>

      <div className="research-meta" aria-live="polite">
        {loading
          ? 'Retrieving research from PubMed...'
          : `${articles.length} research articles found`}
      </div>

      {error && (
        <div className="notice notice-error" role="alert">
          {error}
        </div>
      )}

      {loading && (
        <p>Loading research articles...</p>
      )}

      {!loading && articles.length > 0 && (
        <div className="article-grid">

          {articles.map((article) => (
            <article key={article.id} className="research-card">

              <div className="article-topline">
                <span className="article-tag">
                  PubMed Research
                </span>

                <time>{article.year}</time>
              </div>

              <h3>{article.title}</h3>

              <p className="article-journal">
                {article.journal}
              </p>

              <p>
                <strong>Authors:</strong> {article.authors}
              </p>

              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Read article on PubMed
                <span aria-hidden="true"> ↗</span>
              </a>

            </article>
          ))}

        </div>
      )}

      {!loading && !error && articles.length === 0 && (
        <div className="empty-state">
          <h3>No articles found</h3>
          <p>Try searching for another research topic.</p>
        </div>
      )}

      <p className="small-print research-disclaimer">
        Article information is retrieved from the National
        Library of Medicine's PubMed database. Availability
        of full-text articles depends on the publication.
      </p>

    </main>
  );
}
