import { useState, useEffect } from 'react';
import type { GameConfig, PlayState } from '../types';
import { normalizeAnswer, formatTime } from '../utils';

interface Props {
  game: GameConfig;
  onExit: () => void;
}

export default function GamePlayer({ game, onExit }: Props) {
  const [state, setState] = useState<PlayState>({
    currentPuzzleIndex: 0,
    solvedPuzzles: new Set(),
    hintsUsed: {},
    attempts: {},
    startTime: Date.now()
  });
  const [phase, setPhase] = useState<'opening' | 'playing' | 'success' | 'cleared'>('opening');
  const [inputValue, setInputValue] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'fail'; message: string } | null>(null);
  const [shownHints, setShownHints] = useState<number>(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (phase === 'playing') {
      const interval = setInterval(() => {
        setElapsed(Date.now() - state.startTime);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [phase, state.startTime]);

  const puzzle = game.puzzles[state.currentPuzzleIndex];

  const handleSubmit = () => {
    if (!puzzle) return;
    const userAnswer = normalizeAnswer(inputValue);
    const correct = normalizeAnswer(puzzle.answer);
    const isCorrect = userAnswer === correct;

    const newAttempts = {
      ...state.attempts,
      [puzzle.id]: (state.attempts[puzzle.id] ?? 0) + 1
    };
    setState(s => ({ ...s, attempts: newAttempts }));

    if (isCorrect) {
      const newSolved = new Set(state.solvedPuzzles);
      newSolved.add(puzzle.id);
      setState(s => ({ ...s, solvedPuzzles: newSolved }));
      setFeedback({ type: 'success', message: puzzle.successMessage });
      setPhase('success');
    } else {
      setFeedback({ type: 'fail', message: puzzle.failMessage });
      setTimeout(() => setFeedback(null), 2000);
    }
  };

  const handleNext = () => {
    const nextIndex = state.currentPuzzleIndex + 1;
    if (nextIndex >= game.puzzles.length) {
      setPhase('cleared');
    } else {
      setState(s => ({ ...s, currentPuzzleIndex: nextIndex }));
      setPhase('playing');
      setInputValue('');
      setFeedback(null);
      setShownHints(0);
    }
  };

  const showNextHint = () => {
    if (shownHints < puzzle.hints.length) {
      setShownHints(n => n + 1);
      setState(s => ({
        ...s,
        hintsUsed: {
          ...s.hintsUsed,
          [puzzle.id]: (s.hintsUsed[puzzle.id] ?? 0) + 1
        }
      }));
    }
  };

  const totalHints = Object.values(state.hintsUsed).reduce((a, b) => a + b, 0);
  const totalAttempts = Object.values(state.attempts).reduce((a, b) => a + b, 0);

  const themeClass = `theme-${game.theme}`;

  if (phase === 'opening') {
    return (
      <div className={`player-screen opening-screen ${themeClass}`}>
        <div className="opening-content">
          <div className="opening-theme-icon">
            {game.theme === 'horror' && '👻'}
            {game.theme === 'sci-fi' && '🚀'}
            {game.theme === 'mystery' && '🔍'}
            {game.theme === 'fantasy' && '🧙'}
          </div>
          <h1 className="game-title">{game.title}</h1>
          <p className="game-description">{game.description}</p>
          <div className="opening-info">
            <span>謎の数：{game.puzzles.length}</span>
          </div>
          <button className="btn-start" onClick={() => setPhase('playing')}>
            ゲームスタート
          </button>
          <button className="btn-exit-small" onClick={onExit}>← エディターに戻る</button>
        </div>
      </div>
    );
  }

  if (phase === 'cleared') {
    return (
      <div className={`player-screen cleared-screen ${themeClass}`}>
        <div className="cleared-content">
          <div className="cleared-icon">🎉</div>
          <h2>脱出成功！</h2>
          <p className="clear-message">{game.clearMessage}</p>
          <div className="stats-grid">
            <div className="stat">
              <div className="stat-value">{formatTime(elapsed)}</div>
              <div className="stat-label">クリアタイム</div>
            </div>
            <div className="stat">
              <div className="stat-value">{totalAttempts}</div>
              <div className="stat-label">試行回数</div>
            </div>
            <div className="stat">
              <div className="stat-value">{totalHints}</div>
              <div className="stat-label">ヒント使用数</div>
            </div>
          </div>
          <button className="btn-primary" onClick={onExit}>エディターに戻る</button>
        </div>
      </div>
    );
  }

  if (phase === 'success' && feedback) {
    return (
      <div className={`player-screen success-screen ${themeClass}`}>
        <div className="success-content">
          <div className="success-icon">✓</div>
          <h3>正解！</h3>
          <p className="success-message">{feedback.message}</p>
          <div className="puzzle-progress">
            {game.puzzles.map((p, i) => (
              <div
                key={p.id}
                className={`progress-dot ${state.solvedPuzzles.has(p.id) ? 'solved' : i === state.currentPuzzleIndex ? 'current' : ''}`}
              />
            ))}
          </div>
          {state.currentPuzzleIndex < game.puzzles.length - 1 ? (
            <button className="btn-next" onClick={handleNext}>次の謎へ →</button>
          ) : (
            <button className="btn-next" onClick={handleNext}>エンディングへ →</button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`player-screen playing-screen ${themeClass}`}>
      <div className="playing-header">
        <button onClick={onExit} className="btn-exit-small">← 戻る</button>
        <div className="playing-status">
          <span className="timer">⏱ {formatTime(elapsed)}</span>
          <span className="progress-text">
            {state.currentPuzzleIndex + 1} / {game.puzzles.length}
          </span>
        </div>
      </div>

      <div className="puzzle-progress-bar">
        {game.puzzles.map((p, i) => (
          <div
            key={p.id}
            className={`progress-segment ${
              state.solvedPuzzles.has(p.id) ? 'solved' :
              i === state.currentPuzzleIndex ? 'current' : ''
            }`}
          />
        ))}
      </div>

      <div className="puzzle-area">
        {puzzle.flavorText && (
          <p className="flavor-text">{puzzle.flavorText}</p>
        )}
        <h2 className="puzzle-title">{puzzle.title}</h2>
        <div className="puzzle-description">
          {puzzle.description.split('\n').map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>

        <div className="answer-area">
          {puzzle.type === 'select' ? (
            <div className="select-options">
              {(puzzle.options ?? []).map((opt, i) => (
                <button
                  key={i}
                  className={`select-option ${inputValue === opt ? 'selected' : ''}`}
                  onClick={() => setInputValue(opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          ) : (
            <div className="input-row">
              <input
                type={puzzle.type === 'number' ? 'number' : 'text'}
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="答えを入力..."
                className="answer-input"
                autoFocus
              />
            </div>
          )}

          {feedback?.type === 'fail' && (
            <div className="feedback fail-feedback">{feedback.message}</div>
          )}

          <button
            onClick={handleSubmit}
            className="btn-submit"
            disabled={!inputValue.trim()}
          >
            答える
          </button>
        </div>

        {puzzle.hints.length > 0 && (
          <div className="hints-area">
            {shownHints > 0 && (
              <div className="hints-shown">
                {puzzle.hints.slice(0, shownHints).map((hint, i) => (
                  <div key={i} className="hint-item">
                    <span className="hint-label">ヒント {i + 1}</span>
                    <span>{hint}</span>
                  </div>
                ))}
              </div>
            )}
            {shownHints < puzzle.hints.length && (
              <button onClick={showNextHint} className="btn-hint">
                💡 ヒントを見る（残り {puzzle.hints.length - shownHints}個）
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
