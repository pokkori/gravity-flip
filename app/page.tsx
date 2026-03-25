'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { Phase } from '@/lib/types';
import GameCanvas from '@/components/GameCanvas';
import ResultOverlay from '@/components/ResultOverlay';

const STORAGE_KEY = 'gravity-flip-highscore';

function loadHighScore(): number {
  if (typeof window === 'undefined') return 0;
  const val = localStorage.getItem(STORAGE_KEY);
  return val ? parseInt(val, 10) : 0;
}

function saveHighScore(score: number): void {
  const current = loadHighScore();
  if (score > current) {
    localStorage.setItem(STORAGE_KEY, score.toString());
  }
}

export default function Home() {
  const [phase, setPhase] = useState<Phase>('title');
  const [highScore, setHighScore] = useState(0);
  const [lastScore, setLastScore] = useState(0);
  const [isNewRecord, setIsNewRecord] = useState(false);

  useEffect(() => {
    setHighScore(loadHighScore());
  }, []);

  const handleGameOver = useCallback((score: number) => {
    setLastScore(score);
    const currentHigh = loadHighScore();
    const newRecord = score > currentHigh;
    if (newRecord) {
      saveHighScore(score);
      setHighScore(score);
    }
    setIsNewRecord(newRecord);
    setPhase('game-over');
  }, []);

  const handleStart = useCallback(() => {
    setPhase('playing');
  }, []);

  const handleRestart = useCallback(() => {
    setPhase('title');
    // Small delay to reset GameCanvas state
    setTimeout(() => setPhase('playing'), 50);
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full" style={{ background: '#0a0a0a' }}>
      {/* タイトル画面 */}
      {phase === 'title' && (
        <div
          className="absolute inset-0 z-50 flex flex-col items-center justify-center cursor-pointer"
          role="button"
          tabIndex={0}
          aria-label="重力反転ゲームを開始する。タップまたはクリックしてください"
          style={{
            background: 'linear-gradient(135deg, #1a0033 0%, #0a0a0a 50%, #001a1a 100%)',
          }}
          onTouchStart={handleStart}
          onMouseDown={handleStart}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleStart(); }}
        >
          <h1
            className="text-5xl font-bold mb-4 tracking-wider"
            style={{
              color: '#06B6D4',
              textShadow: '0 0 20px #06B6D4, 0 0 40px #06B6D4, 0 0 80px #06B6D4',
            }}
          >
            GRAVITY
          </h1>
          <h1
            className="text-5xl font-bold mb-8 tracking-wider"
            style={{
              color: '#EC4899',
              textShadow: '0 0 20px #EC4899, 0 0 40px #EC4899, 0 0 80px #EC4899',
            }}
          >
            FLIP
          </h1>

          {highScore > 0 && (
            <p className="text-lg text-gray-400 mb-8">
              Best: {highScore}
            </p>
          )}

          <p
            className="text-lg text-gray-300"
            style={{ animation: 'tap-hint 1.5s ease-in-out infinite' }}
          >
            TAP TO START
          </p>

          {/* 装飾ネオンライン */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[15, 35, 55, 75, 90].map((top, i) => (
              <div
                key={i}
                className="neon-line"
                style={{
                  top: `${top}%`,
                  '--speed': `${8 + i * 2}s`,
                  opacity: 0.3,
                } as React.CSSProperties}
              />
            ))}
          </div>
        </div>
      )}

      {/* ゲームプレイ画面 */}
      {(phase === 'playing' || phase === 'game-over') && (
        <GameCanvas onGameOver={handleGameOver} highScore={highScore} />
      )}

      {/* ゲームオーバーオーバーレイ */}
      {phase === 'game-over' && (
        <ResultOverlay
          score={lastScore}
          highScore={highScore}
          isNewRecord={isNewRecord}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}
