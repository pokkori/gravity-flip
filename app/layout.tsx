import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '重力反転 Gravity Flip',
  description: 'タップで重力を反転させて障害物を避けるサイバーパンクアクションゲーム',
  openGraph: {
    title: '重力反転 Gravity Flip',
    description: 'タップで重力を反転させて障害物を避けるサイバーパンクアクションゲーム',
    images: ['/api/og'],
  },
  twitter: {
    card: 'summary_large_image',
    title: '重力反転 Gravity Flip',
    description: 'タップで重力を反転させて障害物を避けるサイバーパンクアクションゲーム',
    images: ['/api/og'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0a0a0a',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="bg-black text-white antialiased">
        {children}
      </body>
    </html>
  );
}
