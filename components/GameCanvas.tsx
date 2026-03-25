'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameLoop } from '@/lib/gameLoop';
import { checkObstacleCollision } from '@/lib/collision';
import { maybeGenerateObstacle, maybeGenerateCoin } from '@/lib/obstacleGenerator';
import { playFlipSound, playCoinSound, playGameOverSound } from '@/lib/sound';
import {
  HERO_SIZE,
  HERO_X_PERCENT,
  HERO_GROUND_Y,
  HERO_CEILING_Y,
  TRAIL_LENGTH,
  INITIAL_SPEED,
  MAX_SPEED_MULTIPLIER,
  COIN_SIZE,
  COIN_SCORE,
  INVERT_FLASH_DURATION,
} from '@/lib/constants';
import type { GravityState, Obstacle as ObstacleType, Coin as CoinType } from '@/lib/types';
import Background from './Background';
import Hero from './Hero';
import ObstacleComponent from './Obstacle';
import CoinComponent from './Coin';
import ScoreDisplay from './ScoreDisplay';

interface GameCanvasProps {
  onGameOver: (score: number) => void;
  highScore: number;
}

export default function GameCanvas({ onGameOver, highScore }: GameCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameStateRef = useRef<GravityState>({
    phase: 'playing',
    gravityDirection: 'down',
    heroY: HERO_GROUND_Y,
    heroTargetY: HERO_GROUND_Y,
    speed: 1,
    score: 0,
    highScore,
    obstacles: [],
    coins: [],
    frameCount: 0,
    lastObstacleFrame: 0,
  });
  const trailRef = useRef<number[]>([]);
  const nextIdRef = useRef(1);
  const gameLoopRef = useRef<GameLoop | null>(null);
  const invertTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Render state (low-frequency updates)
  const [renderScore, setRenderScore] = useState(0);
  const [renderHeroY, setRenderHeroY] = useState(HERO_GROUND_Y);
  const [renderTrail, setRenderTrail] = useState<number[]>([]);
  const [renderObstacles, setRenderObstacles] = useState<ObstacleType[]>([]);
  const [renderCoins, setRenderCoins] = useState<CoinType[]>([]);
  const [renderSpeed, setRenderSpeed] = useState(1);
  const [inverted, setInverted] = useState(false);

  const handleFlip = useCallback(() => {
    const state = gameStateRef.current;
    if (state.phase !== 'playing') return;

    // Flip gravity
    state.gravityDirection = state.gravityDirection === 'down' ? 'up' : 'down';
    state.heroTargetY = state.gravityDirection === 'down' ? HERO_GROUND_Y : HERO_CEILING_Y;

    playFlipSound();

    // Invert flash effect
    setInverted(true);
    if (invertTimerRef.current) clearTimeout(invertTimerRef.current);
    invertTimerRef.current = setTimeout(() => setInverted(false), INVERT_FLASH_DURATION);
  }, []);

  useEffect(() => {
    const state = gameStateRef.current;
    let lastRenderScore = 0;

    const loop = new GameLoop((deltaTime: number) => {
      if (state.phase !== 'playing') return;

      const container = containerRef.current;
      if (!container) return;
      const screenWidth = container.clientWidth;
      const screenHeight = container.clientHeight;

      // 1. frameCount++
      state.frameCount++;

      // 2. Move obstacles left
      const moveSpeed = INITIAL_SPEED * state.speed;
      const pxPerFrame = moveSpeed * deltaTime * 60; // normalize to ~60fps

      for (const obs of state.obstacles) {
        obs.x -= pxPerFrame;
      }

      // 3. Move coins left
      for (const coin of state.coins) {
        coin.x -= pxPerFrame;
      }

      // 4. Lerp heroY toward heroTargetY
      const lerpFactor = 1 - Math.pow(0.001, deltaTime / 0.15);
      state.heroY += (state.heroTargetY - state.heroY) * lerpFactor;

      // Update trail
      trailRef.current.unshift(state.heroY);
      if (trailRef.current.length > TRAIL_LENGTH) {
        trailRef.current.length = TRAIL_LENGTH;
      }

      // 5. Score: obstacle passed check
      const heroXpx = screenWidth * (HERO_X_PERCENT / 100);
      for (const obs of state.obstacles) {
        if (!obs.passed && obs.x + screenWidth * 0.15 < heroXpx) {
          obs.passed = true;
          state.score++;
        }
      }

      // 6. Coin collection
      const heroYpx = screenHeight * (state.heroY / 100);
      for (const coin of state.coins) {
        if (coin.collected) continue;
        const coinYpx = screenHeight * (coin.y / 100);
        const dx = coin.x - heroXpx;
        const dy = coinYpx - heroYpx;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < HERO_SIZE + COIN_SIZE) {
          coin.collected = true;
          state.score += COIN_SCORE;
          playCoinSound();
        }
      }

      // 7. Collision detection
      const heroRect = {
        x: heroXpx - HERO_SIZE / 2,
        y: heroYpx - HERO_SIZE / 2,
        width: HERO_SIZE,
        height: HERO_SIZE,
      };

      for (const obs of state.obstacles) {
        if (checkObstacleCollision(heroRect, obs, screenWidth, screenHeight)) {
          state.phase = 'game-over';
          playGameOverSound();
          onGameOver(state.score);
          return;
        }
      }

      // 8. Remove off-screen obstacles and coins
      state.obstacles = state.obstacles.filter((obs) => obs.x > -screenWidth * 0.2);
      state.coins = state.coins.filter((coin) => coin.x > -50);

      // 9. Generate new obstacles
      const newObs = maybeGenerateObstacle(
        state.frameCount,
        state.lastObstacleFrame,
        state.score,
        screenWidth,
        nextIdRef.current
      );
      if (newObs) {
        state.obstacles.push(newObs);
        state.lastObstacleFrame = state.frameCount;
        nextIdRef.current++;

        // Maybe generate coin with obstacle
        const newCoin = maybeGenerateCoin(newObs, screenWidth, screenHeight, nextIdRef.current);
        if (newCoin) {
          state.coins.push(newCoin);
          nextIdRef.current++;
        }
      }

      // 10. Speed update
      state.speed = Math.min(MAX_SPEED_MULTIPLIER, 1 + state.score * 0.02);

      // 11. Update render state (throttled)
      if (state.score !== lastRenderScore) {
        lastRenderScore = state.score;
        setRenderScore(state.score);
      }
      setRenderHeroY(state.heroY);
      setRenderTrail([...trailRef.current]);
      setRenderObstacles([...state.obstacles]);
      setRenderCoins([...state.coins]);
      setRenderSpeed(state.speed);
    });

    gameLoopRef.current = loop;
    loop.start();

    return () => {
      loop.stop();
      if (invertTimerRef.current) clearTimeout(invertTimerRef.current);
    };
  }, [onGameOver]);

  // Touch/click handler
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouch = (e: TouchEvent) => {
      e.preventDefault();
      handleFlip();
    };
    const handleMouse = (e: MouseEvent) => {
      e.preventDefault();
      handleFlip();
    };

    container.addEventListener('touchstart', handleTouch, { passive: false });
    container.addEventListener('mousedown', handleMouse);

    return () => {
      container.removeEventListener('touchstart', handleTouch);
      container.removeEventListener('mousedown', handleMouse);
    };
  }, [handleFlip]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden select-none"
      style={{
        filter: inverted ? 'invert(1)' : 'none',
        transition: 'filter 0.05s',
      }}
    >
      <Background speed={renderSpeed} />

      {renderObstacles.map((obs) => (
        <ObstacleComponent
          key={obs.id}
          x={obs.x}
          fromTop={obs.fromTop}
          height={obs.height}
          color={obs.fromTop ? '#EC4899' : '#06B6D4'}
        />
      ))}

      {renderCoins.map((coin) => (
        <CoinComponent
          key={coin.id}
          x={coin.x}
          y={coin.y}
          collected={coin.collected}
        />
      ))}

      <Hero y={renderHeroY} trail={renderTrail} />

      <ScoreDisplay score={renderScore} />
    </div>
  );
}
