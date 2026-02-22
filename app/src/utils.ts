import type { GameConfig } from './types';

export function encodeGame(game: GameConfig): string {
  const json = JSON.stringify(game);
  const bytes = new TextEncoder().encode(json);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  // URL-safe Base64（+→- /→_ =除去）
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export function decodeGame(encoded: string): GameConfig | null {
  try {
    // URL-safe Base64を通常のBase64に戻す
    const base64 = encoded
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .padEnd(encoded.length + (4 - encoded.length % 4) % 4, '=');
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const json = new TextDecoder().decode(bytes);
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
