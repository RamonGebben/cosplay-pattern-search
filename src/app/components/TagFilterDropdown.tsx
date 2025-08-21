'use client';


import { Tag, TAGS } from '@/lib/tags';
import { useState } from 'react';


export default function TagFilterDropdown() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Tag[]>([]);

  const toggleTag = (tag: Tag) => {
    setSelected((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const clearTags = () => setSelected([]);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="px-4 py-2 rounded-full border border-gray-400 bg-white text-black hover:bg-gray-100 transition"
      >
        Tags ▾
      </button>

      {open && (
        <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg z-50 p-3">
          {TAGS.map((tag) => (
            <label
              key={tag}
              className="flex items-center gap-2 py-1 text-sm text-gray-800 dark:text-gray-100 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selected.includes(tag)}
                onChange={() => toggleTag(tag)}
              />
              {tag}
            </label>
          ))}

          {selected.length > 0 && (
            <button
              onClick={clearTags}
              className="mt-3 text-xs text-blue-500 hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
