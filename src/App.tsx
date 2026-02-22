import { useState, useEffect } from 'react';
import type { GameConfig } from './types';
import GameEditor from './components/GameEditor';
import GamePlayer from './components/GamePlayer';
import { decodeGame } from './utils';
import { PRESET_GAMES } from './presets';
import './App.css';

type AppMode = 'menu' | 'editor' | 'play';

const DEFAULT_GAME: GameConfig = {
  title: '',
  description: '',
  theme: 'mystery',
  puzzles: [],
  clearMessage: 'おめでとう！全ての謎を解いてクリアした！'
};

export default function App() {
  const [mode, setMode] = useState<AppMode>('menu');
  const [game, setGame] = useState<GameConfig>(DEFAULT_GAME);
  const [prevMode, setPrevMode] = useState<AppMode>('menu');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const playParam = params.get('play');
    if (playParam) {
      const decoded = decodeGame(playParam);
      if (decoded) {
        setGame(decoded);
        setPrevMode('menu');
        setMode('play');
      }
    }
  }, []);

  const startNew = () => {
    setGame(DEFAULT_GAME);
    setMode('editor');
  };

  const loadPreset = (index: number) => {
    setGame(PRESET_GAMES[index]);
    setPrevMode('menu');
    setMode('play');
  };

  const loadPresetEditor = (index: number) => {
    setGame(PRESET_GAMES[index]);
    setPrevMode('editor');
    setMode('editor');
  };

  if (mode === 'editor') {
    return (
      <div className="app">
        <header className="app-header">
          <button onClick={() => setMode('menu')} className="back-btn">← メニュー</button>
          <h1>🔐 脱出ゲームメーカー</h1>
        </header>
        <GameEditor
          game={game}
          onChange={setGame}
          onPlay={() => { setPrevMode('editor'); setMode('play'); }}
        />
      </div>
    );
  }

  if (mode === 'play') {
    return (
      <GamePlayer
        game={game}
        onExit={() => setMode(prevMode)}
      />
    );
  }

  // Menu
  return (
    <div className="app menu-screen">
      <div className="menu-hero">
        <div className="menu-icon">🔐</div>
        <h1>脱出ゲームメーカー</h1>
        <p className="menu-subtitle">謎を作って、解いて、シェアしよう</p>
      </div>

      <div className="menu-cards">
        <div className="menu-card create-card" onClick={startNew}>
          <div className="menu-card-icon">✏️</div>
          <h3>新しいゲームを作る</h3>
          <p>謎・答え・ヒントを設定してオリジナル脱出ゲームを作成。URLで誰とでも共有できます。</p>
          <button className="btn-primary">作成スタート</button>
        </div>

        <div className="menu-card">
          <div className="menu-card-icon">🎮</div>
          <h3>サンプルゲームで遊ぶ</h3>
          <p>用意されたサンプルゲームをそのままプレイ。謎解きの雰囲気を体験してみよう。</p>
          <div className="preset-play-list">
            {PRESET_GAMES.map((p, i) => (
              <button key={i} onClick={() => loadPreset(i)} className="btn-preset-play">
                <span className="preset-theme-icon">
                  {p.theme === 'horror' && '👻'}
                  {p.theme === 'sci-fi' && '🚀'}
                  {p.theme === 'mystery' && '🔍'}
                  {p.theme === 'fantasy' && '🧙'}
                </span>
                {p.title}
              </button>
            ))}
          </div>
        </div>

        <div className="menu-card">
          <div className="menu-card-icon">🛠️</div>
          <h3>サンプルを編集する</h3>
          <p>サンプルゲームをベースに改造して自分だけの謎を作ろう。</p>
          <div className="preset-play-list">
            {PRESET_GAMES.map((p, i) => (
              <button key={i} onClick={() => loadPresetEditor(i)} className="btn-preset-play secondary">
                <span className="preset-theme-icon">
                  {p.theme === 'horror' && '👻'}
                  {p.theme === 'sci-fi' && '🚀'}
                  {p.theme === 'mystery' && '🔍'}
                  {p.theme === 'fantasy' && '🧙'}
                </span>
                {p.title} を編集
              </button>
            ))}
          </div>
        </div>
      </div>

      <footer className="menu-footer">
        <p>作ったゲームはURLで共有できます。サーバー不要、ログイン不要。</p>
      </footer>
    </div>
  );
}
