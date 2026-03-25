import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const score = searchParams.get('score') || '0';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1a0033 0%, #0a0a0a 50%, #001a1a 100%)',
          position: 'relative',
        }}
      >
        {/* ネオンライン装飾 */}
        <div
          style={{
            position: 'absolute',
            top: '20%',
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, transparent 10%, #06B6D4 50%, transparent 90%)',
            opacity: 0.5,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '80%',
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, transparent 10%, #EC4899 50%, transparent 90%)',
            opacity: 0.5,
          }}
        />

        {/* タイトル */}
        <div
          style={{
            fontSize: '72px',
            fontWeight: 'bold',
            color: '#06B6D4',
            textShadow: '0 0 30px #06B6D4',
            letterSpacing: '8px',
            display: 'flex',
          }}
        >
          GRAVITY FLIP
        </div>

        {/* スコア */}
        {score !== '0' && (
          <div
            style={{
              fontSize: '120px',
              fontWeight: 'bold',
              color: 'white',
              marginTop: '20px',
              display: 'flex',
            }}
          >
            Score: {score}
          </div>
        )}

        {/* サブテキスト */}
        <div
          style={{
            fontSize: '28px',
            color: '#9CA3AF',
            marginTop: '30px',
            display: 'flex',
          }}
        >
          Tap to flip gravity. Avoid obstacles.
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
