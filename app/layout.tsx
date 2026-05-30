import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Dr. Saad El Mahdy — Book a Session',
  description: 'Book a 1-on-1 therapy session with Dr. Saad El Mahdy, MD Psychiatrist & Psychotherapist.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
