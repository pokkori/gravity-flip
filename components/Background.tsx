'use client';

import React from 'react';

interface BackgroundProps {
  speed: number;
}

export default function Background({ speed }: BackgroundProps) {
  const lines = [
    { top: '15%', duration: 8 },
    { top: '30%', duration: 12 },
    { top: '50%', duration: 6 },
    { top: '70%', duration: 10 },
    { top: '85%', duration: 14 },
  ];

  const speedFactor = Math.max(0.3, 1 / speed);

  return (
    <div className="absolute inset-0 z-0 bg-cyber overflow-hidden">
      {lines.map((line, i) => (
        <div
          key={i}
          className="neon-line"
          style={{
            top: line.top,
            '--speed': `${line.duration * speedFactor}s`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
