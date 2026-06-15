import type {Metadata} from 'next';
import { Inter, Caveat, Playfair_Display } from 'next/font/google';
import './globals.css'; // Global styles

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const caveat = Caveat({
  subsets: ['latin'],
  variable: '--font-cursive',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
});

export const metadata: Metadata = {
  title: 'My Custom Proposal',
  description: 'A special question with love',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${inter.variable} ${caveat.variable} ${playfair.variable}`}>
      <body suppressHydrationWarning className="bg-rose-50/30 text-rose-950 font-sans antialiased">{children}</body>
    </html>
  );
}
