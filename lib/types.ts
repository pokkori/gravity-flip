/** ゲームフェーズ */
export type Phase = 'title' | 'playing' | 'game-over';

/** 重力方向 */
export type GravityDirection = 'down' | 'up';

/** 障害物 */
export interface Obstacle {
  id: number;
  x: number;          // 画面左端からの距離（px）
  fromTop: boolean;   // trueなら上からせり出す
  height: number;     // せり出し高さ（画面高さの30-60%）
  gapSize: number;    // 隙間サイズ（画面高さの35-50%）
  passed: boolean;    // スコア加算済みフラグ
}

/** コイン */
export interface Coin {
  id: number;
  x: number;
  y: number;          // 画面高さに対する%
  collected: boolean;
}

/** ゲーム全体の状態 */
export interface GravityState {
  phase: Phase;
  gravityDirection: GravityDirection;
  heroY: number;              // キャラY位置（画面高さに対する%、0=上端、100=下端）
  heroTargetY: number;        // 重力反転時のターゲットY
  speed: number;              // 現在のスクロール速度倍率
  score: number;
  highScore: number;
  obstacles: Obstacle[];
  coins: Coin[];
  frameCount: number;         // 障害物生成間隔管理用
  lastObstacleFrame: number;  // 最後に障害物を生成したフレーム
}
