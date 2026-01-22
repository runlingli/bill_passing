import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Header, Footer } from '@/components/layout';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'California Proposition Predictor',
  description:
    'A data-driven tool for estimating the probability that California statewide propositions pass, based on historical data, campaign finances, demographics, and ballot wording.',
  keywords: [
    'California',
    'propositions',
    'ballot measures',
    'predictions',
    'elections',
    'voting',
    'campaign finance',
    'demographics',
  ],
  authors: [{ name: 'CA Prop Predictor Team' }],
  openGraph: {
    title: 'California Proposition Predictor',
    description: 'Predict the outcome of California ballot propositions',
    type: 'website',
    locale: 'en_US',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
