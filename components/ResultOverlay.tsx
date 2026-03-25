'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { shareResult } from '@/lib/share';

interface ResultOverlayProps {
  score: number;
  highScore: number;
  isNewRecord: boolean;
  onRestart: () => void;
}

export default function ResultOverlay({ score, highScore, isNewRecord, onRestart }: ResultOverlayProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(async (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    try {
      await shareResult(score, window.location.href);
      if (!navigator.share) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // share cancelled
    }
  }, [score]);

  return (
    <div
      className="absolute inset-0 z-50 flex flex-col items-center justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}
      onTouchStart={onRestart}
      onMouseDown={onRestart}
    >
      {/* GAME OVER */}
      <h2
        className="text-4xl font-bold mb-8"
        style={{
          color: '#EC4899',
          textShadow: '0 0 20px #EC4899, 0 0 40px #EC4899',
          animation: 'game-over-flash 1.5s ease-in-out infinite',
        }}
      >
        GAME OVER
      </h2>

      {/* NEW RECORD */}
      {isNewRecord && (
        <div className="mb-4 relative">
          <p
            className="text-2xl font-bold"
            style={{
              color: '#FFD700',
              textShadow: '0 0 15px #FFD700',
              animation: 'neon-pulse 0.8s ease-in-out infinite',
            }}
          >
            NEW RECORD!
          </p>
          {/* 金色パーティクル */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: '4px',
                  height: '4px',
                  backgroundColor: '#FFD700',
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `neon-pulse ${0.5 + Math.random() * 1}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 0.5}s`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* スコア */}
      <p className="text-6xl font-bold text-white mb-2">{score}</p>
      <p className="text-lg text-gray-400 mb-8">
        Best: {highScore}
      </p>

      {/* シェアボタン */}
      <button
        className="mb-6 px-6 py-3 rounded-lg font-bold text-white min-h-[44px] min-w-[44px]"
        aria-label={copied ? 'スコアをコピーしました' : 'スコアをシェアする'}
        style={{
          backgroundColor: '#06B6D4',
          boxShadow: '0 0 15px #06B6D4',
        }}
        onTouchStart={handleShare}
        onMouseDown={handleShare}
      >
        {copied ? 'Copied!' : 'Share'}
      </button>

      {/* TAP TO RETRY */}
      <p
        className="text-lg text-gray-300"
        style={{ animation: 'tap-hint 1.5s ease-in-out infinite' }}
      >
        TAP TO RETRY
      </p>

      {/* フッターリンク */}
      <div className="absolute bottom-4 text-xs text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>
        <Link href="/legal" className="hover:underline" aria-label="特定商取引法に基づく表記" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>特定商取引法</Link>
        {' / '}
        <Link href="/privacy" className="hover:underline" aria-label="プライバシーポリシー" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>プライバシーポリシー</Link>
        {' / '}
        <Link href="/terms" className="hover:underline" aria-label="利用規約" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>利用規約</Link>
      </div>
    </div>
  );
}
