'use client';

import { useState } from 'react';
import Link from 'next/link'; // <-- import Link
import ResultsGrid from './components/ResultsGrid';
import { PatternDoc } from '@/lib/types';

export default function HomePage() {
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<PatternDoc[]>([]);

  const canSearch = q.trim().length > 0;

  const doSearch = async () => {
    if (!canSearch) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const json = await res.json();
      console.log('Search results:', json);

      if (json.success) {
        setResults(json.hits || []);
      }
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') doSearch();
  };

  return (
    <main className="p-6 max-w-6xl mx-auto font-body text-text min-h-screen flex justify-center items-center flex-col w-full">
      {/* Hero */}
      <header className="text-center mb-12">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://masquerademedia.nl/wp-content/uploads/2025/07/Wide-logo-1.png"
          alt="Cosplay Pattern Logo"
          className="w-48 h-auto mb-4 inline-block"
        />
        <h1 className="text-4xl sm:text-5xl font-heading font-semibold text-primary mb-2">
          Cosplay Pattern Search
        </h1>
        <p className="text-muted text-lg">
          Discover quality cosplay patterns faster than ever
        </p>
      </header>

      {/* Search Bar */}
      <section className="flex flex-wrap items-center gap-4 mb-6 w-full max-w-3xl">
        <input
          type="text"
          value={q}
          onChange={e => setQ(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Search patterns..."
          aria-label="Search patterns"
          className="flex-grow min-w-[250px] px-4 py-3 rounded-full border border-muted bg-white text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary"
        />

        <button
          onClick={doSearch}
          disabled={!canSearch || loading}
          className="px-5 py-3 rounded-full font-semibold bg-purple-800 text-white hover:bg-purple-900 cursor-pointer"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </section>

      {/* Explore Link */}
      <Link
        href="/explore"
        className="mb-10 inline-block px-5 py-3 rounded-full font-semibold bg-primary-gold text-header-black hover:bg-yellow-500 transition"
      >
        Explore Patterns
      </Link>

      {/* Results */}
      <ResultsGrid results={results} />
    </main>
  );
}
