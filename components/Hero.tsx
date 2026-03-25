'use client';

import React from 'react';
import { HERO_SIZE, HERO_X_PERCENT } from '@/lib/constants';

interface HeroProps {
  y: number;        // 画面高さに対する%
  trail: number[];  // 過去5フレームのY位置
}

export default function Hero({ y, trail }: HeroProps) {
  return (
    <>
      {/* 残像 */}
      {trail.map((trailY, i) => (
        <div
          key={`trail-${i}`}
          className="absolute z-20"
          style={{
            left: `${HERO_X_PERCENT}%`,
            top: `${trailY}%`,
            width: `${HERO_SIZE}px`,
            height: `${HERO_SIZE}px`,
            backgroundColor: 'white',
            opacity: 0.6 - i * 0.1,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
      {/* 本体 */}
      <div
        className="absolute z-20"
        style={{
          left: `${HERO_X_PERCENT}%`,
          top: `${y}%`,
          width: `${HERO_SIZE}px`,
          height: `${HERO_SIZE}px`,
          backgroundColor: 'white',
          boxShadow: '0 0 10px #fff, 0 0 20px #06B6D4',
          transform: 'translate(-50%, -50%)',
        }}
      />
    </>
  );
}
