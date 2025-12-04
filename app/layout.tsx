import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Becoming Everyone',
  description: 'An interactive performance installation',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
