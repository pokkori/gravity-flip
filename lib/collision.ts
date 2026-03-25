import type { Obstacle } from './types';

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * 2つの矩形の衝突判定
 * 全座標はpx単位
 */
export function checkCollision(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

/**
 * ヒーローと障害物の衝突判定
 * heroRect: ヒーローの矩形（16x16px）
 * obstacle: 障害物データ
 * screenWidth, screenHeight: 画面サイズ
 */
export function checkObstacleCollision(
  heroRect: Rect,
  obstacle: Obstacle,
  screenWidth: number,
  screenHeight: number
): boolean {
  const obstacleWidth = screenWidth * 0.15;
  const obstacleHeight = screenHeight * (obstacle.height / 100);

  const obstacleRect: Rect = {
    x: obstacle.x,
    y: obstacle.fromTop ? 0 : screenHeight - obstacleHeight,
    width: obstacleWidth,
    height: obstacleHeight,
  };

  return checkCollision(heroRect, obstacleRect);
}
