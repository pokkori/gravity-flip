import type { Metadata, Viewport } from 'next';
import './globals.css';

const SITE_URL = 'https://gravity-flip-game.vercel.app';

export const metadata: Metadata = {
  title: '重力反転 Gravity Flip',
  description: 'タップで重力を反転させて障害物を避けるサイバーパンクアクションゲーム',
  keywords: ['重力反転', 'アクションゲーム', 'サイバーパンク', 'タップゲーム', 'ブラウザゲーム'],
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: '重力反転 Gravity Flip',
    description: 'タップで重力を反転させて障害物を避けるサイバーパンクアクションゲーム',
    type: 'website',
    locale: 'ja_JP',
    url: SITE_URL,
    siteName: '重力反転 Gravity Flip',
    images: [{ url: `${SITE_URL}/api/og`, width: 1200, height: 630, alt: '重力反転 Gravity Flip' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '重力反転 Gravity Flip',
    description: 'タップで重力を反転させて障害物を避けるサイバーパンクアクションゲーム',
    images: [`${SITE_URL}/api/og`],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0a0a0a',
};


const _faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "このゲームは無料で遊べますか？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "はい、基本プレイは完全無料でお楽しみいただけます。ブラウザから即座にプレイ開始できます。"
      }
    },
    {
      "@type": "Question",
      "name": "スマートフォンでも遊べますか？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "はい、スマートフォン・タブレット・PCすべてに対応しています。ブラウザからそのままプレイできます。"
      }
    },
    {
      "@type": "Question",
      "name": "アプリのダウンロードは必要ですか？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "ダウンロード不要です。ブラウザを開いてアクセスするだけですぐに遊べます。"
      }
    }
  ]
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(_faqLd) }}
        />

        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="bg-black text-white antialiased">
        {children}
      </body>
    </html>
  );
}
