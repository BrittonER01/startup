const express = require('express');

const router = express.Router();

// Search PubMed through the backend.
router.get('/', async (req, res) => {
  const term = typeof req.query.term === 'string'
    ? req.query.term.trim()
    : '';

  if (!term || term.length > 200) {
    return res.status(400).send({
      msg: 'Enter a valid research search term.',
    });
  }

  try {
    // Search PubMed for article IDs.
    const searchParams = new URLSearchParams({
      db: 'pubmed',
      term,
      retmax: '4',
      sort: 'pub_date',
      retmode: 'json',
    });

    // Optionally use an NCBI API key stored on the server.
    if (process.env.NCBI_API_KEY) {
      searchParams.set('api_key', process.env.NCBI_API_KEY);
    }

    const searchResponse = await fetch(
      `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?${searchParams}`
    );

    if (!searchResponse.ok) {
      return res.status(502).send({
        msg: 'PubMed search is currently unavailable.',
      });
    }

    const searchData = await searchResponse.json();
    const ids = searchData.esearchresult?.idlist ?? [];

    if (ids.length === 0) {
      return res.send({ articles: [] });
    }

    // Retrieve summaries for the article IDs.
    const summaryParams = new URLSearchParams({
      db: 'pubmed',
      id: ids.join(','),
      retmode: 'json',
    });

    if (process.env.NCBI_API_KEY) {
      summaryParams.set('api_key', process.env.NCBI_API_KEY);
    }

    const summaryResponse = await fetch(
      `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?${summaryParams}`
    );

    if (!summaryResponse.ok) {
      return res.status(502).send({
        msg: 'Unable to retrieve PubMed article information.',
      });
    }

    const summaryData = await summaryResponse.json();

    // Format the results for the React frontend.
    const articles = ids.map((id) => {
      const article = summaryData.result[id];

      return {
        id,
        title: article.title,
        journal: article.fulljournalname || article.source,
        year: article.pubdate,
        authors: article.authors
          ?.slice(0, 3)
          .map((author) => author.name)
          .join(', ') || 'Authors not listed',
        url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
      };
    });

    res.send({ articles });

  } catch (error) {
    console.error('PubMed API error:', error);

    res.status(502).send({
      msg: 'Unable to retrieve research articles.',
    });
  }
});
module.exports = router;