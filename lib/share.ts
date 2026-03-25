export function generateShareText(score: number): string {
  const bars = '|'.repeat(Math.min(score, 30));
  return `重力反転 Gravity Flip\nScore: ${score} ${bars}\n#重力反転 #GravityFlip`;
}

export async function shareResult(score: number, url: string): Promise<void> {
  const text = generateShareText(score);

  if (navigator.share) {
    await navigator.share({ text, url });
  } else {
    await navigator.clipboard.writeText(`${text}\n${url}`);
    // コピー完了トーストを表示（呼び出し元で処理）
  }
}
