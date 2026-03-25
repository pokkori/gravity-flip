# 重力反転（Gravity Flip） 詳細設計書

## 概要
タップで重力を反転させて障害物を避ける、ワンボタンアクションゲーム。
サイバーパンク世界観。CSS transform + requestAnimationFrame による60FPS描画。

---

## 1. 技術スタック

- Next.js 15 (App Router) + TypeScript + Tailwind CSS v4
- CSS transform + position: absolute（Canvas不使用）
- requestAnimationFrame で60FPSゲームループ
- localStorage でハイスコア永続化
- Web Audio API で効果音
- @vercel/og でOGP動的生成

---

## 2. 画面遷移

```
タイトル画面 → [タップでスタート] → ゲームプレイ画面 → [衝突] → 結果画面 → [タップで再挑戦]
```

全画面を1つのpage.tsx内で `phase` 状態により切り替える（SPA的構成）。

---

## 3. ファイル構成

```
重力反転/
├── app/
│   ├── layout.tsx            # メタデータ+フォント+グローバルCSS
│   ├── page.tsx              # メイン画面（タイトル/プレイ/結果をphaseで切替）
│   ├── globals.css           # Tailwind v4 import + カスタムアニメーション定義
│   └── api/og/route.tsx      # OGP画像動的生成
├── components/
│   ├── GameCanvas.tsx        # ゲームループ管理+全体レイアウト
│   ├── Hero.tsx              # キャラクター+残像トレイル
│   ├── Obstacle.tsx          # 障害物バー（上or下からせり出し）
│   ├── Coin.tsx              # コイン表示
│   ├── Background.tsx        # スクロール背景+ネオンライン
│   ├── ScoreDisplay.tsx      # スコア表示（巨大半透明）
│   └── ResultOverlay.tsx     # ゲームオーバーオーバーレイ
├── lib/
│   ├── gameLoop.ts           # requestAnimationFrame管理クラス
│   ├── collision.ts          # 矩形衝突判定
│   ├── obstacleGenerator.ts  # 障害物生成ロジック
│   ├── sound.ts              # Web Audio API効果音
│   └── share.ts              # シェアテキスト+クリップボードコピー
├── package.json
├── next.config.ts
├── tsconfig.json
├── postcss.config.mjs
└── DESIGN.md
```

---

## 4. 型定義

```typescript
// lib/types.ts

/** ゲームフェーズ */
type Phase = 'title' | 'playing' | 'game-over';

/** 重力方向 */
type GravityDirection = 'down' | 'up';

/** 障害物 */
interface Obstacle {
  id: number;
  x: number;          // 画面左端からの距離（px）
  fromTop: boolean;   // trueなら上からせり出す
  height: number;     // せり出し高さ（画面高さの30-60%）
  gapSize: number;    // 隙間サイズ（画面高さの35-50%）
  passed: boolean;    // スコア加算済みフラグ
}

/** コイン */
interface Coin {
  id: number;
  x: number;
  y: number;          // 画面高さに対する%
  collected: boolean;
}

/** ゲーム全体の状態 */
interface GravityState {
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
```

---

## 5. コンポーネント詳細設計

### 5.1 app/page.tsx
- `useState<Phase>` でフェーズ管理
- phase === 'title': タイトルオーバーレイ表示
- phase === 'playing': GameCanvas表示
- phase === 'game-over': ResultOverlay表示
- タイトル画面でタップ → `setPhase('playing')`
- ハイスコアは `useEffect` で localStorage から読み込み

### 5.2 GameCanvas.tsx
**責務**: ゲームループの管理、全子コンポーネントの配置、入力処理

```typescript
// Props
interface GameCanvasProps {
  onGameOver: (score: number) => void;
  highScore: number;
}
```

**実装詳細:**
- `useRef` で gameState を管理（re-render回避のため state ではなく ref）
- 描画用の state は `useState` で別途管理（60FPSでsetStateすると重いので、requestAnimationFrame内で直接DOM操作 or 最低限のstate更新）
- **推奨方式**: gameStateはuseRefで保持し、requestAnimationFrame内でDOM要素のstyle.transformを直接操作する

**ゲームループ（1フレームの処理順序）:**
```
1. frameCount++
2. 障害物のx座標を speed に応じて左に移動
3. コインのx座標を同様に移動
4. heroYをheroTargetYに向かってlerp（0.15秒 = 約9フレームで到達）
5. 障害物通過判定（heroのx座標を超えた && !passed → score++, passed=true）
6. コイン取得判定（距離 < 閾値 && !collected → score+=3, collected=true）
7. 衝突判定（collision.ts使用）
8. 画面外に出た障害物・コインを配列から削除
9. 新規障害物生成判定（obstacleGenerator.ts使用）
10. speed更新: 1 + score * 0.02（最大3.0）
11. DOM更新（style.transform書き換え）
```

**入力処理:**
- `onTouchStart` / `onMouseDown` でタップ検知
- gravityDirection を反転
- heroTargetY を計算:
  - 'down' → 80（画面下部20%位置）
  - 'up' → 20（画面上部20%位置）
- 反転エフェクト: 画面全体に `filter: invert(1)` を0.1秒適用

**画面レイアウト（全てposition: absolute、親がrelative）:**
```
┌─────────────────────────┐
│ Background (z-0)        │
│ ┌───────────────────┐   │
│ │ Obstacles (z-10)  │   │
│ │ Coins (z-15)      │   │
│ │ Hero (z-20)       │   │
│ └───────────────────┘   │
│ ScoreDisplay (z-30)     │
└─────────────────────────┘
```

### 5.3 Hero.tsx
```typescript
interface HeroProps {
  y: number;        // 画面高さに対する%
  trail: number[];  // 過去5フレームのY位置
}
```

**描画:**
- 本体: 16x16px白い正方形、`box-shadow: 0 0 10px #fff, 0 0 20px #06B6D4`（ネオン効果）
- 残像: 過去5フレームのY位置に、opacity 0.6→0.1 で同じ正方形を配置
- X位置: 画面左から20%で固定（`left: 20%`）

### 5.4 Obstacle.tsx
```typescript
interface ObstacleProps {
  x: number;
  fromTop: boolean;
  height: number;    // %
  color: string;     // '#EC4899' or '#06B6D4'
}
```

**描画:**
- 幅: 画面幅の15%
- fromTop=true: `top: 0; height: {height}%`
- fromTop=false: `bottom: 0; height: {height}%`
- CSS: `background: linear-gradient(to right, {color}80, {color})` + `box-shadow: 0 0 15px {color}`

### 5.5 Coin.tsx
```typescript
interface CoinProps {
  x: number;
  y: number;
  collected: boolean;
}
```
- 収集済みなら非表示
- 黄色い円（12x12px）、回転アニメーション（`@keyframes spin`）
- 収集時: scale(1.5) → opacity(0) のアニメーション

### 5.6 Background.tsx
**CSS実装:**
```css
/* 背景グラデーション */
.bg-cyber {
  background: linear-gradient(135deg, #1a0033 0%, #0a0a0a 50%, #001a1a 100%);
}

/* ネオンライン（水平方向にスクロール） */
.neon-line {
  position: absolute;
  height: 1px;
  width: 200%;
  background: linear-gradient(90deg, transparent, #06B6D4, transparent);
  animation: scroll-left var(--speed) linear infinite;
}

@keyframes scroll-left {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
```
- ネオンラインを5本、異なるY位置と速度で配置
- `--speed` CSS変数をgameのspeedに応じて動的に更新

### 5.7 ScoreDisplay.tsx
- 画面中央に巨大フォント（`text-8xl font-bold`）
- `color: rgba(255, 255, 255, 0.15)`
- スコア変化時に `scale(1.1)` → `scale(1.0)` のパルスアニメーション

### 5.8 ResultOverlay.tsx
```typescript
interface ResultOverlayProps {
  score: number;
  highScore: number;
  isNewRecord: boolean;
  onRestart: () => void;
}
```
- 半透明黒背景オーバーレイ
- 「GAME OVER」テキスト（ネオンピンクで点滅）
- スコア、ハイスコア表示
- isNewRecord時: 「NEW RECORD!」+ 金色パーティクルアニメーション
- 「TAP TO RETRY」テキスト（点滅）
- シェアボタン

---

## 6. ロジック詳細設計

### 6.1 lib/gameLoop.ts
```typescript
type FrameCallback = (deltaTime: number) => void;

class GameLoop {
  private rafId: number | null = null;
  private lastTime: number = 0;
  private callback: FrameCallback;

  constructor(callback: FrameCallback) {
    this.callback = callback;
  }

  start(): void {
    this.lastTime = performance.now();
    const loop = (currentTime: number) => {
      const deltaTime = (currentTime - this.lastTime) / 1000; // 秒単位
      this.lastTime = currentTime;
      // deltaTimeが大きすぎる場合（タブ非表示後など）はスキップ
      if (deltaTime < 0.1) {
        this.callback(deltaTime);
      }
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }

  stop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }
}
```

### 6.2 lib/collision.ts
```typescript
interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * 2つの矩形の衝突判定
 * 全座標はpx単位
 */
function checkCollision(a: Rect, b: Rect): boolean {
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
function checkObstacleCollision(
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
```

### 6.3 lib/obstacleGenerator.ts
```typescript
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
function getDifficultyConfig(score: number): ObstacleConfig {
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
function maybeGenerateObstacle(
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
function maybeGenerateCoin(
  obstacle: Obstacle,
  screenWidth: number,
  screenHeight: number,
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
```

### 6.4 lib/sound.ts
```typescript
/**
 * Web Audio APIを使った効果音再生
 * AudioContextは1つだけ作成してキャッシュする
 */
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

/** 重力反転時の効果音（短い電子音） */
function playFlipSound(): void {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.setValueAtTime(800, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(1200, ctx.currentTime + 0.05);
  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.1);
}

/** コイン取得音（チャリン） */
function playCoinSound(): void {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.setValueAtTime(1200, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(1800, ctx.currentTime + 0.1);
  gain.gain.setValueAtTime(0.2, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.15);
}

/** ゲームオーバー音（低い衝突音） */
function playGameOverSound(): void {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.setValueAtTime(200, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(50, ctx.currentTime + 0.3);
  gain.gain.setValueAtTime(0.4, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.3);
}
```

### 6.5 lib/share.ts
```typescript
function generateShareText(score: number): string {
  const bars = '|'.repeat(Math.min(score, 30));
  return `重力反転 Gravity Flip\nScore: ${score} ${bars}\n#重力反転 #GravityFlip`;
}

async function shareResult(score: number, url: string): Promise<void> {
  const text = generateShareText(score);

  if (navigator.share) {
    await navigator.share({ text, url });
  } else {
    await navigator.clipboard.writeText(`${text}\n${url}`);
    // コピー完了トーストを表示（呼び出し元で処理）
  }
}
```

---

## 7. 定数定義

```typescript
// lib/constants.ts

export const HERO_SIZE = 16;             // px
export const HERO_X_PERCENT = 20;        // 画面左から20%
export const HERO_GROUND_Y = 80;         // 重力down時のY%
export const HERO_CEILING_Y = 20;        // 重力up時のY%
export const FLIP_DURATION = 0.15;       // 秒
export const TRAIL_LENGTH = 5;           // 残像フレーム数
export const OBSTACLE_WIDTH_PERCENT = 15;// 画面幅の15%
export const INITIAL_OBSTACLE_INTERVAL = 120; // フレーム（2秒@60fps）
export const MIN_OBSTACLE_INTERVAL = 48;      // フレーム（0.8秒@60fps）
export const INITIAL_SPEED = 3;          // px/frame
export const MAX_SPEED_MULTIPLIER = 3.0;
export const COIN_SIZE = 12;             // px
export const COIN_SCORE = 3;
export const COIN_SPAWN_CHANCE = 0.3;
export const INVERT_FLASH_DURATION = 100;// ms
```

---

## 8. CSS アニメーション定義

```css
/* globals.css に追加 */

@keyframes neon-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes scroll-bg {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

@keyframes coin-spin {
  from { transform: rotateY(0deg); }
  to { transform: rotateY(360deg); }
}

@keyframes coin-collect {
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(1.5); opacity: 0; }
}

@keyframes score-pulse {
  0% { transform: scale(1.1); }
  100% { transform: scale(1.0); }
}

@keyframes game-over-flash {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

@keyframes tap-hint {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 0.3; }
}
```

---

## 9. パフォーマンス注意事項

1. **DOM要素数の制限**: 画面外に出た障害物・コインは即座にstateから削除する（x < -100px）
2. **re-render最小化**: ゲームループ内では `useRef` で状態管理し、DOM操作は `ref.current.style.transform` で直接行う。Reactのstateは「スコア表示」「フェーズ切替」など低頻度の更新のみに使用する
3. **タッチイベント**: `{ passive: false }` で登録し、`preventDefault()` でスクロール防止
4. **メモリリーク防止**: `useEffect` のクリーンアップで `GameLoop.stop()` と イベントリスナー解除を必ず行う

---

## 10. OGP動的生成

```typescript
// app/api/og/route.tsx
// @vercel/og の ImageResponse を使用
// パラメータ: ?score=15
// 出力: 1200x630のサイバーパンク風OGP画像
// - 黒背景にネオンピンク/シアンのライン
// - 「GRAVITY FLIP」タイトル
// - 「Score: 15」を大きく表示
```

---

## 11. localStorage設計

```typescript
// キー
const STORAGE_KEY = 'gravity-flip-highscore';

// 読み込み
function loadHighScore(): number {
  if (typeof window === 'undefined') return 0;
  const val = localStorage.getItem(STORAGE_KEY);
  return val ? parseInt(val, 10) : 0;
}

// 保存（ハイスコア更新時のみ）
function saveHighScore(score: number): void {
  const current = loadHighScore();
  if (score > current) {
    localStorage.setItem(STORAGE_KEY, score.toString());
  }
}
```
