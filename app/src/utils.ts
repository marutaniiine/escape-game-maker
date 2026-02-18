import type { GameConfig } from './types';

export function encodeGame(game: GameConfig): string {
  const json = JSON.stringify(game);
  return btoa(encodeURIComponent(json));
}

export function decodeGame(encoded: string): GameConfig | null {
  try {
    const json = decodeURIComponent(atob(encoded));
    return JSON.parse(json) as GameConfig;
  } catch {
    return null;
  }
}

export function getShareUrl(game: GameConfig): string {
  const encoded = encodeGame(game);
  const base = window.location.origin + window.location.pathname;
  return `${base}?play=${encoded}`;
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (minutes === 0) return `${secs}秒`;
  return `${minutes}分${secs}秒`;
}

export function normalizeAnswer(answer: string): string {
  return answer.trim().toLowerCase()
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) =>
      String.fromCharCode(s.charCodeAt(0) - 0xFEE0)
    )
    .replace(/\s+/g, '');
}
