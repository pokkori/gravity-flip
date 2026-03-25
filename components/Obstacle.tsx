'use client';

import React from 'react';

interface ObstacleProps {
  x: number;
  fromTop: boolean;
  height: number;    // %
  color: string;     // '#EC4899' or '#06B6D4'
}

export default function Obstacle({ x, fromTop, height, color }: ObstacleProps) {
  return (
    <div
      className="absolute z-10"
      style={{
        left: `${x}px`,
        ...(fromTop ? { top: 0 } : { bottom: 0 }),
        width: '15%',
        height: `${height}%`,
        background: `linear-gradient(to right, ${color}80, ${color})`,
        boxShadow: `0 0 15px ${color}`,
      }}
    />
  );
}
