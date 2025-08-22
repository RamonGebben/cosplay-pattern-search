import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Footer from './components/Footer';
import Script from 'next/script';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Cosplay Pattern Search',
  description: 'Discover quality cosplay patterns faster than ever',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ scrollBehavior: 'smooth' }}>
        <Script defer data-domain="pattern-finder.masquerademedia.nl" src="https://plausible.io/js/script.js" />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-brand-background text-brand-text`}
      >
        {children}
        <Footer />
      </body>
    </html>
  );
}
