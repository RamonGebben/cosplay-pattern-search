'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

type Hit = {
  id: string;
  title: string;
  url: string;
  image: string;
  price: string;
  source: string;
  tags: string[];
};

export default function HomePage() {
  const [q, setQ] = useState('');
  const [hits, setHits] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSearch = useMemo(() => q.trim().length > 0, [q]);

  const doSearch = useCallback(async () => {
    if (!canSearch) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
        method: 'GET',
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Search failed');
      }
      setHits(data.hits || []);
    } catch (err: any) {
      setError(err.message || 'Search failed');
      setHits([]);
    } finally {
      setLoading(false);
    }
  }, [q, canSearch]);

  // Optional: press Enter to search
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && canSearch) {
      void doSearch();
    }
  };

  // OPTIONAL: quick admin scrape button (only in dev)
  const triggerScrape = useCallback(async () => {
    setScraping(true);
    setError(null);
    try {
      const res = await fetch('/api/scrape', { method: 'POST' });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Scrape failed');
      }
      // Optionally auto-search again after scraping
      if (canSearch) {
        await doSearch();
      }
    } catch (err: any) {
      setError(err.message || 'Scrape failed');
    } finally {
      setScraping(false);
    }
  }, [canSearch, doSearch]);

  // Simple debounce for typing
  useEffect(() => {
    if (!canSearch) {
      setHits([]);
      return;
    }
    const t = setTimeout(() => {
      void doSearch();
    }, 300);
    return () => clearTimeout(t);
  }, [q, canSearch, doSearch]);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.8rem' }}>Cosplay Pattern Search</h1>
        <span style={{ fontSize: '.9rem', color: '#666' }}>local Orama index</span>
      </header>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto auto',
          gap: '0.75rem',
          alignItems: 'center',
          marginBottom: '1rem',
        }}
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Search patterns (e.g., bodysuit, armor, foam)…"
          aria-label="Search patterns"
          style={{
            padding: '0.75rem 0.9rem',
            borderRadius: 10,
            border: '1px solid #ddd',
            outline: 'none',
          }}
        />
        <button
          onClick={() => void doSearch()}
          disabled={!canSearch || loading}
          style={{
            padding: '0.75rem 1rem',
            borderRadius: 10,
            border: '1px solid #222',
            background: '#111',
            color: '#fff',
            cursor: canSearch && !loading ? 'pointer' : 'default',
            opacity: !canSearch || loading ? 0.6 : 1,
          }}
        >
          {loading ? 'Searching…' : 'Search'}
        </button>

        {/* Dev-only scrape action */}
        {process.env.NODE_ENV === 'development' && (
          <button
            onClick={() => void triggerScrape()}
            disabled={scraping}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 10,
              border: '1px solid #666',
              background: '#f5f5f5',
              color: '#222',
              cursor: !scraping ? 'pointer' : 'default',
              opacity: scraping ? 0.6 : 1,
            }}
            title="Run scrapers and persist to local file (dev only)"
          >
            {scraping ? 'Scraping…' : 'Run Scraper'}
          </button>
        )}
      </section>

      {error && (
        <div
          style={{
            background: '#ffe9e9',
            border: '1px solid #ffbcbc',
            color: '#a40000',
            padding: '0.75rem 1rem',
            borderRadius: 10,
            marginBottom: '1rem',
          }}
        >
          {error}
        </div>
      )}

      <div style={{ marginBottom: '0.75rem', color: '#666' }}>
        {loading ? 'Loading…' : hits.length ? `${hits.length} result(s)` : canSearch ? 'No results' : 'Type to search'}
      </div>

      {/* Results grid: 3 per row on desktop, 2 on tablet, 1 on mobile */}
      <section
        style={{
          display: 'grid',
          gap: '1rem',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        }}
      >
        {hits.map((h) => (
          <article
            key={h.id}
            style={{
              border: '1px solid #eee',
              borderRadius: 12,
              overflow: 'hidden',
              background: '#fff',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <a href={h.url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div
                style={{
                  aspectRatio: '1 / 1',
                  overflow: 'hidden',
                  background: '#fafafa',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={h.image || '/vercel.svg'}
                  alt={h.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  loading="lazy"
                />
              </div>
            </a>
            <div style={{ padding: '0.9rem 1rem', display: 'grid', gap: '0.4rem' }}>
              <a href={h.url} target="_blank" rel="noreferrer" style={{ color: '#111', textDecoration: 'none' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', lineHeight: 1.35 }}>{h.title}</h3>
              </a>
              <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center', color: '#444' }}>
                <span style={{ fontWeight: 600 }}>{h.price || '—'}</span>
                <span style={{ fontSize: '.85rem', color: '#777' }}>{h.source}</span>
              </div>
              {h.tags?.length > 0 && (
                <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap', marginTop: 2 }}>
                  {h.tags.map((t) => (
                    <span
                      key={t}
                      style={{
                        fontSize: '.75rem',
                        padding: '.2rem .45rem',
                        borderRadius: 999,
                        background: '#f3f3f3',
                        border: '1px solid #eee',
                        color: '#555',
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </article>
        ))}
      </section>

      {/* Tiny responsive tweak */}
      <style jsx global>{`
        @media (max-width: 1024px) {
          section[style*='grid-template-columns: repeat(3'] {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }
        @media (max-width: 640px) {
          section[style*='grid-template-columns: repeat(3'] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
