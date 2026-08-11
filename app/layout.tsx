import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Rent A Boat Cadaqués',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ca">
      <body>{children}</body>
    </html>
  );
}
