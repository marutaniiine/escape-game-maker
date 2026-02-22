import { useState } from 'react';
import type { GameConfig } from '../types';
import PuzzleEditor, { createDefaultPuzzle } from './PuzzleEditor';
import { getShareUrl } from '../utils';
import { PRESET_GAMES } from '../presets';

interface Props {
  game: GameConfig;
  onChange: (game: GameConfig) => void;
  onPlay: () => void;
}

const THEMES = [
  { value: 'mystery', label: '🔍 ミステリー' },
  { value: 'sci-fi', label: '🚀 SF' },
  { value: 'horror', label: '👻 ホラー' },
  { value: 'fantasy', label: '🧙 ファンタジー' },
] as const;

export default function GameEditor({ game, onChange, onPlay }: Props) {
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const update = (partial: Partial<GameConfig>) => onChange({ ...game, ...partial });

  const addPuzzle = () => {
    onChange({ ...game, puzzles: [...game.puzzles, createDefaultPuzzle()] });
  };

  const updatePuzzle = (i: number, puzzle: typeof game.puzzles[0]) => {
    const puzzles = [...game.puzzles];
    puzzles[i] = puzzle;
    onChange({ ...game, puzzles });
  };

  const deletePuzzle = (i: number) => {
    onChange({ ...game, puzzles: game.puzzles.filter((_, idx) => idx !== i) });
  };

  const movePuzzle = (i: number, dir: -1 | 1) => {
    const puzzles = [...game.puzzles];
    const j = i + dir;
    if (j < 0 || j >= puzzles.length) return;
    [puzzles[i], puzzles[j]] = [puzzles[j], puzzles[i]];
    onChange({ ...game, puzzles });
  };

  const handleShare = () => {
    const url = getShareUrl(game);
    setShareUrl(url);
    alert('共有URLを生成しました。下にスクロールしてURLを確認してください。');
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadPreset = (index: number) => {
    if (confirm('現在の編集内容が失われます。プリセットを読み込みますか？')) {
      onChange(PRESET_GAMES[index]);
    }
  };

  const isValid = game.title.trim() && game.puzzles.length > 0 &&
    game.puzzles.every(p => p.title && p.description && p.answer);

  return (
    <div className="editor-container">
      <div className="editor-header">
        <h2>ゲームエディター</h2>
        <div className="editor-header-actions">
          <div className="preset-group">
            <span>プリセット：</span>
            {PRESET_GAMES.map((p, i) => (
              <button key={i} onClick={() => loadPreset(i)} className="btn-preset">
                {p.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      <section className="editor-section">
        <h3>ゲーム設定</h3>
        <div className="form-group">
          <label>タイトル</label>
          <input
            type="text"
            value={game.title}
            onChange={e => update({ title: e.target.value })}
            placeholder="脱出ゲームのタイトル"
          />
        </div>
        <div className="form-group">
          <label>説明文</label>
          <textarea
            value={game.description}
            onChange={e => update({ description: e.target.value })}
            placeholder="ゲームの設定・背景（オープニングに表示されます）"
            rows={3}
          />
        </div>
        <div className="form-group">
          <label>テーマ</label>
          <div className="theme-selector">
            {THEMES.map(t => (
              <button
                key={t.value}
                className={`theme-btn theme-${t.value} ${game.theme === t.value ? 'active' : ''}`}
                onClick={() => update({ theme: t.value })}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label>クリアメッセージ</label>
          <textarea
            value={game.clearMessage}
            onChange={e => update({ clearMessage: e.target.value })}
            placeholder="全謎解き後に表示されるエンディングメッセージ"
            rows={3}
          />
        </div>
      </section>

      <section className="editor-section">
        <div className="section-header">
          <h3>謎リスト <span className="count-badge">{game.puzzles.length}</span></h3>
        </div>

        {game.puzzles.map((puzzle, i) => (
          <PuzzleEditor
            key={puzzle.id}
            puzzle={puzzle}
            index={i}
            onChange={p => updatePuzzle(i, p)}
            onDelete={() => deletePuzzle(i)}
            onMoveUp={() => movePuzzle(i, -1)}
            onMoveDown={() => movePuzzle(i, 1)}
            isFirst={i === 0}
            isLast={i === game.puzzles.length - 1}
          />
        ))}

        <button onClick={addPuzzle} className="btn-add-puzzle">
          <span>+</span> 謎を追加
        </button>
      </section>

      <div className="editor-footer">
        <div className="footer-left">
          {!isValid && (
            <span className="validation-msg">タイトルと最低1つの謎（タイトル・問題・正解が必要）を設定してください</span>
          )}
        </div>
        <div className="footer-right">
          <button
            onClick={handleShare}
            className="btn-secondary"
            disabled={!isValid}
            title={!isValid ? 'ゲーム設定を完成させてください' : '共有URLを生成'}
          >
            🔗 共有URLを生成
          </button>
          <button onClick={onPlay} className="btn-primary" disabled={!isValid}>
            ▶ プレイ開始
          </button>
        </div>
      </div>

      {shareUrl && (
        <div className="share-panel">
          <h4>共有URL</h4>
          <p className="share-note">このURLを共有するだけで、誰でもあなたのゲームをプレイできます。</p>
          <div className="share-url-box">
            <input type="text" value={shareUrl} readOnly className="share-url-input" />
            <button onClick={handleCopy} className={`btn-copy ${copied ? 'copied' : ''}`}>
              {copied ? '✓ コピー済み' : 'コピー'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
