import React from 'react';

const Footer: React.FC = () => (
  <footer className="fixed bottom-0 left-0 w-full bg-white shadow-md border-t border-gray-200">
    <div className="flex justify-center items-center py-4 space-x-6">
      <a
        href="/explore"
        className="text-gray-700 hover:text-blue-600 transition"
      >
        Explore
      </a>
      <a
        href="https://masquerademedia.nl/contact/"
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-700 hover:text-blue-600 transition"
      >
        Missing a good pattern provider, tell us
      </a>
    </div>
  </footer>
);

export default Footer;
