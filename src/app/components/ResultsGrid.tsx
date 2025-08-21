import { PatternDoc } from '@/lib/types';

export default function ResultsGrid({ results }: { results: PatternDoc[] }) {
  if (results.length === 0) {
    return (
      <p className="text-center text-brand-muted mt-10">No results found.</p>
    );
  }

  return (
    <div className="mt-6 grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {results.map((item, i) => (
        <a
          key={i}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-brand-surface border border-brand-muted rounded-lg shadow hover:shadow-md transition overflow-hidden"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-48 object-cover"
          />
          <div className="p-4">
            <h3 className="text-lg font-semibold text-brand-text">
              {item.title}
            </h3>
            <p className="text-sm text-brand-muted">{item.source}</p>
            <p className="text-sm text-brand-link font-bold mt-1">
              {typeof item.price === 'number' ? `$${item.price}` : item.price}
            </p>

            {/* Tags */}
            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {item.tags.map(tag => (
                  <span
                    key={tag}
                    className="bg-brand-accent text-xs text-brand-surface px-2 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </a>
      ))}
    </div>
  );
}
