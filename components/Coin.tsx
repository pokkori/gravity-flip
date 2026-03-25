'use client';

import React from 'react';
import { COIN_SIZE } from '@/lib/constants';

interface CoinProps {
  x: number;
  y: number;
  collected: boolean;
}

export default function Coin({ x, y, collected }: CoinProps) {
  if (collected) return null;

  return (
    <div
      className="absolute z-15"
      style={{
        left: `${x}px`,
        top: `${y}%`,
        width: `${COIN_SIZE}px`,
        height: `${COIN_SIZE}px`,
        backgroundColor: '#FBBF24',
        borderRadius: '50%',
        boxShadow: '0 0 8px #FBBF24',
        transform: 'translate(-50%, -50%)',
        animation: 'coin-spin 1s linear infinite',
        zIndex: 15,
      }}
    />
  );
}
