'use client';

import React, { useEffect, useState } from 'react';

interface ScoreDisplayProps {
  score: number;
}

export default function ScoreDisplay({ score }: ScoreDisplayProps) {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (score > 0) {
      setPulse(true);
      const timer = setTimeout(() => setPulse(false), 200);
      return () => clearTimeout(timer);
    }
  }, [score]);

  return (
    <div
      className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
    >
      <span
        className="text-8xl font-bold select-none"
        style={{
          color: 'rgba(255, 255, 255, 0.15)',
          animation: pulse ? 'score-pulse 0.2s ease-out' : 'none',
        }}
      >
        {score}
      </span>
    </div>
  );
}
