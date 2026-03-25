export type FrameCallback = (deltaTime: number) => void;

export class GameLoop {
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
