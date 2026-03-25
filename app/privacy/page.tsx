import Link from 'next/link';

export const metadata = {
  title: 'プライバシーポリシー | 重力反転 Gravity Flip',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen p-6" style={{ background: 'linear-gradient(135deg, #1a0033 0%, #0a0a0a 50%, #001a1a 100%)' }}>
      <div className="max-w-2xl mx-auto" style={{ backdropFilter: 'blur(12px)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(6,182,212,0.2)', borderRadius: '16px', padding: '32px' }}>
        <h1 className="text-2xl font-bold text-white mb-6">プライバシーポリシー</h1>
        <div style={{ fontSize: '0.9rem', lineHeight: 1.8, color: 'rgba(255,255,255,0.7)' }}>
          <p style={{ marginBottom: '16px' }}>ポッコリラボ（以下「当社」）は、重力反転 Gravity Flipにおける個人情報の取扱いについて、以下の通りプライバシーポリシーを定めます。</p>
          <h2 style={{ fontWeight: 700, marginBottom: '8px', color: '#06B6D4' }}>1. 収集する情報</h2>
          <p style={{ marginBottom: '16px' }}>本サービスはサーバーへの個人情報送信を行いません。ゲームのハイスコアはすべてお客様のブラウザ（localStorage）に保存されます。</p>
          <h2 style={{ fontWeight: 700, marginBottom: '8px', color: '#06B6D4' }}>2. Cookieの使用</h2>
          <p style={{ marginBottom: '16px' }}>本サービスはCookieを使用しません。</p>
          <h2 style={{ fontWeight: 700, marginBottom: '8px', color: '#06B6D4' }}>3. 第三者提供</h2>
          <p style={{ marginBottom: '16px' }}>個人情報を第三者に提供することはありません。</p>
          <h2 style={{ fontWeight: 700, marginBottom: '8px', color: '#06B6D4' }}>4. お問い合わせ</h2>
          <p>X(Twitter) @levona_design へのDMにてご連絡ください。</p>
          <p style={{ marginTop: '24px', color: 'rgba(255,255,255,0.4)' }}>2026年3月25日 制定</p>
        </div>
        <div className="mt-8 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
          <Link href="/" style={{ color: '#06B6D4' }} aria-label="ホームに戻る">ホームに戻る</Link>
          {' / '}
          <Link href="/legal" style={{ color: '#06B6D4' }} aria-label="特定商取引法に基づく表記を見る">特定商取引法</Link>
          {' / '}
          <Link href="/terms" style={{ color: '#06B6D4' }} aria-label="利用規約を見る">利用規約</Link>
        </div>
      </div>
    </main>
  );
}
