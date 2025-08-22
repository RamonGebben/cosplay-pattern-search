'use client';

import { useState } from 'react';
import Link from 'next/link'; // <-- import Link
import ResultsGrid from './components/ResultsGrid';
import { PatternDoc } from '@/lib/types';

export default function HomePage() {
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<PatternDoc[] | null>(null);

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
    <main className="p-6 max-w-6xl mx-auto mb-16 font-body text-text min-h-screen flex justify-center items-center flex-col w-full">
      {/* Hero */}
      <header className="text-center mb-12">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://masquerademedia.nl/wp-content/uploads/2025/08/Wide-logo-300x87.png"
          alt="Cosplay Pattern Logo"
          className="w-48 h-auto mb-4 inline-block"
        />
        <h1 className="text-4xl sm:text-5xl font-heading font-semibold text-primary mb-2">
          Cosplay Pattern Search
        </h1>
        <p className="text-muted text-lg mb-4">
          Discover quality cosplay patterns faster than ever
        </p>
        <p className="text-muted text-sm inline-block mb-1">
          Looking for a foam or sewing pattern? Just type in your search query below, and search through patterns by known and beloved, quality pattern makers. </p>
        <p className="text-muted text-sm inline-block mb-1">Unfortunately it's not possible to look for character names. But you can look for e.g. braces, dresses, jackets, school uniforms, breastplates and more. </p>
        <p className="text-muted text-sm inline-block">Need inspiration? Click the Explore button and explore all patterns we currently have indexed!
        </p>
      </header>

      {/* Search Bar */}
      <section className="flex flex-wrap items-center gap-4 mb-6 w-full max-w-3xl">
        <input
          type="text"
          value={q}
          onChange={e => setQ(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Search patterns e.g bracers, dress, school uniform..."
          aria-label="Search patterns"
          className="flex-grow min-w-[250px] px-4 py-3 rounded-full border border-muted bg-white text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary"
        />

        <button
          onClick={doSearch}
          disabled={!canSearch || loading}
          className="px-5 py-3 rounded-full font-semibold bg-purple-800 text-white hover:bg-purple-600 cursor-pointer"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
        {/* Explore Link */}
        <Link
          href="/explore"
          className="px-5 py-3 rounded-full font-semibold bg-yellow-500 hover:bg-yellow-400 cursor-pointer text-header-black transition"
        >
          Explore Patterns
        </Link>
      </section>

      {/* Results */}
      {!results && !loading && (
        <>
          <p className="text-center text-muted">
            Start by entering a search term above.
          </p>
        </>
      )}
      {results !== null && <ResultsGrid results={results} />}
    </main>
  );
}
