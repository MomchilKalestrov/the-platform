import type { Metadata } from 'next';
import './global.css';
import { Roboto } from 'next/font/google';

const roboto = Roboto({
  weight: '400',
  subsets: ['latin', 'cyrillic'],
});

export const metadata: Metadata = {
  title: 'The Platform',
  description: 'The best platform for your coding journey.'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' className={ roboto.className }>
      <body>
        { children }
      </body>
    </html>
  );
}
