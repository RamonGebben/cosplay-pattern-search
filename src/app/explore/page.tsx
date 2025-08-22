'use client';

import { useEffect, useState } from 'react';
import ResultsGrid from '../components/ResultsGrid';
import { PatternDoc } from '@/lib/types';
import Link from 'next/link';

export default function ExplorePage() {
  const [groupedResults, setGroupedResults] = useState<
    Record<string, PatternDoc[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetch('/api/explore')
      .then(res => res.json())
      .then(data => {
        setGroupedResults(data.tags || {});
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <p className="text-center mt-10 text-brand-muted">
        Loading explore results...
      </p>
    );
  }

  const tagEntries = Object.entries(groupedResults).sort(([a], [b]) =>
    a.localeCompare(b, 'en', { sensitivity: 'base' }),
  );

  return (
    <div className="relative flex min-h-screen bg-brand-background text-brand-text">
      {/* Mobile Sidebar Toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-30 bg-brand-link text-brand-surface px-3 py-1 rounded shadow"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? 'Close Menu' : 'Menu'}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-60 bg-brand-background text-brand-text border-r border-gray-200 z-20 transform transition-transform duration-300 ease-in-out md:translate-x-0 bg-white ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          } md:block`}
      >
        <div className="h-full overflow-y-auto px-4 py-6">
          <a href="https://masquerademedia.nl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://masquerademedia.nl/wp-content/uploads/2025/08/Wide-logo-300x87.png"
              alt="Logo"
              className="w-full h-auto mb-4"
            />
          </a>
          <h1 className="text-2xl font-bold mb-2">Explore Patterns</h1>
          <nav className="space-y-2 text-sm">
            <Link
              href="/"
              className="block text-brand-link hover:underline font-semibold mb-4"
            >
              Back to Search
            </Link>
            <a
              href="#top"
              className="block text-brand-link hover:underline font-semibold mb-4"
            >
              ↑ Back to Top
            </a>
            {tagEntries.map(([tag]) => (
              <a
                key={tag}
                href={`#tag-${tag}`}
                className="block text-brand-link hover:underline capitalize"
                onClick={() => setMobileMenuOpen(false)}
              >
                {tag}
              </a>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main
        id="top"
        className="flex-1 ml-0 md:ml-60 px-6 md:px-10 py-12 bg-brand-surface"
      >
        <header className="mb-12">
          <h1 className="text-3xl font-bold mb-2">Explore Patterns</h1>
          <p className="text-brand-muted">
            Browse all cosplay and costume patterns by category. Use the
            navigation to jump between tags.
          </p>
        </header>

        {tagEntries.map(([tag, items]) => (
          <section key={tag} id={`tag-${tag}`} className="mb-20 scroll-mt-24">
            <h2 className="sticky top-0 z-10 bg-brand-surface text-2xl font-semibold mb-4 capitalize px-1 py-2 border-b border-brand-muted text-right md:text-left bg-white">
              {tag}
            </h2>
            <ResultsGrid results={items} />
          </section>
        ))}

        <div className="mt-20 text-center">
          <a
            href="#top"
            className="inline-block text-sm text-brand-link hover:underline"
          >
            ↑ Back to Top
          </a>
        </div>
      </main>
    </div>
  );
}
