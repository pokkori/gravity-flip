import type { Obstacle, Coin } from './types';

interface ObstacleConfig {
  minInterval: number;  // フレーム数（初期: 120 = 2秒@60fps）
  maxInterval: number;  // フレーム数（初期: 120）
  minHeight: number;    // 30（%）
  maxHeight: number;    // 60（%）
  minGap: number;       // 35（%）
  maxGap: number;       // 50（%）
}

/**
 * スコアに応じた難易度パラメータを返す
 */
export function getDifficultyConfig(score: number): ObstacleConfig {
  return {
    minInterval: Math.max(48, 120 - score * 3),   // 最速0.8秒
    maxInterval: Math.max(60, 120 - score * 2),
    minHeight: 30,
    maxHeight: Math.min(60, 30 + score),
    minGap: Math.max(35, 50 - score * 0.5),
    maxGap: Math.max(40, 50 - score * 0.3),
  };
}

/**
 * 障害物を生成するか判定し、生成する場合はObstacleを返す
 */
export function maybeGenerateObstacle(
  frameCount: number,
  lastObstacleFrame: number,
  score: number,
  screenWidth: number,
  nextId: number
): Obstacle | null {
  const config = getDifficultyConfig(score);
  const interval = config.minInterval +
    Math.random() * (config.maxInterval - config.minInterval);

  if (frameCount - lastObstacleFrame < interval) return null;

  const height = config.minHeight +
    Math.random() * (config.maxHeight - config.minHeight);
  const fromTop = Math.random() > 0.5;

  return {
    id: nextId,
    x: screenWidth + 10,
    fromTop,
    height,
    gapSize: config.minGap + Math.random() * (config.maxGap - config.minGap),
    passed: false,
  };
}

/**
 * 障害物の隙間にコインを配置するか判定
 * 30%の確率で生成
 */
export function maybeGenerateCoin(
  obstacle: Obstacle,
  screenWidth: number,
  _screenHeight: number,
  nextId: number
): Coin | null {
  if (Math.random() > 0.3) return null;

  const obstacleTopEnd = obstacle.fromTop
    ? obstacle.height
    : 100 - obstacle.height;
  // 隙間の中央にコインを配置
  const coinY = obstacle.fromTop
    ? obstacleTopEnd + obstacle.gapSize / 2
    : (100 - obstacle.height - obstacle.gapSize) + obstacle.gapSize / 2;

  return {
    id: nextId,
    x: obstacle.x + screenWidth * 0.075, // 障害物の中央
    y: coinY,
    collected: false,
  };
}
