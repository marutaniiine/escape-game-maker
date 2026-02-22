import type { Puzzle, PuzzleType } from '../types';
import { generateId } from '../utils';

interface Props {
  puzzle: Puzzle;
  index: number;
  onChange: (puzzle: Puzzle) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}

const TYPE_LABELS: Record<PuzzleType, string> = {
  text: 'テキスト入力',
  number: '数字入力',
  select: '選択式'
};

export default function PuzzleEditor({ puzzle, index, onChange, onDelete, onMoveUp, onMoveDown, isFirst, isLast }: Props) {
  const update = (partial: Partial<Puzzle>) => onChange({ ...puzzle, ...partial });

  const addHint = () => update({ hints: [...puzzle.hints, ''] });
  const updateHint = (i: number, val: string) => {
    const hints = [...puzzle.hints];
    hints[i] = val;
    update({ hints });
  };
  const removeHint = (i: number) => {
    update({ hints: puzzle.hints.filter((_, idx) => idx !== i) });
  };

  const addOption = () => update({ options: [...(puzzle.options ?? []), ''] });
  const updateOption = (i: number, val: string) => {
    const options = [...(puzzle.options ?? [])];
    options[i] = val;
    update({ options });
  };
  const removeOption = (i: number) => {
    const options = (puzzle.options ?? []).filter((_, idx) => idx !== i);
    update({ options, answer: '' });
  };

  return (
    <div className="puzzle-card">
      <div className="puzzle-card-header">
        <span className="puzzle-number">謎 {index + 1}</span>
        <div className="puzzle-actions">
          <button onClick={onMoveUp} disabled={isFirst} className="btn-icon" title="上へ">↑</button>
          <button onClick={onMoveDown} disabled={isLast} className="btn-icon" title="下へ">↓</button>
          <button onClick={onDelete} className="btn-icon btn-danger" title="削除">×</button>
        </div>
      </div>

      <div className="form-group">
        <label>タイトル</label>
        <input
          type="text"
          value={puzzle.title}
          onChange={e => update({ title: e.target.value })}
          placeholder="謎のタイトル（例：受付の暗号）"
        />
      </div>

      <div className="form-group">
        <label>フレーバーテキスト <span className="label-sub">（雰囲気・情景描写）</span></label>
        <textarea
          value={puzzle.flavorText}
          onChange={e => update({ flavorText: e.target.value })}
          placeholder="場所の雰囲気や状況を描写するテキスト"
          rows={2}
        />
      </div>

      <div className="form-group">
        <label>問題文</label>
        <textarea
          value={puzzle.description}
          onChange={e => update({ description: e.target.value })}
          placeholder="謎の問題文を入力（改行可）"
          rows={3}
        />
      </div>

      <div className="form-group">
        <label>回答形式</label>
        <div className="type-selector">
          {(Object.keys(TYPE_LABELS) as PuzzleType[]).map(t => (
            <button
              key={t}
              className={`type-btn ${puzzle.type === t ? 'active' : ''}`}
              onClick={() => update({ type: t, options: t === 'select' ? ['', '', ''] : undefined, answer: '' })}
            >
              {TYPE_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      {puzzle.type === 'select' && (
        <div className="form-group">
          <label>選択肢</label>
          {(puzzle.options ?? []).map((opt, i) => (
            <div key={i} className="option-row">
              <input
                type="text"
                value={opt}
                onChange={e => updateOption(i, e.target.value)}
                placeholder={`選択肢 ${i + 1}`}
              />
              <button onClick={() => removeOption(i)} className="btn-icon btn-danger">×</button>
            </div>
          ))}
          <button onClick={addOption} className="btn-add-small">+ 選択肢を追加</button>
        </div>
      )}

      <div className="form-group">
        <label>正解</label>
        {puzzle.type === 'select' ? (
          <select
            value={puzzle.answer}
            onChange={e => update({ answer: e.target.value })}
          >
            <option value="">正解を選択...</option>
            {(puzzle.options ?? []).map((opt, i) => (
              <option key={i} value={opt}>{opt || `選択肢 ${i + 1}`}</option>
            ))}
          </select>
        ) : (
          <input
            type={puzzle.type === 'number' ? 'number' : 'text'}
            value={puzzle.answer}
            onChange={e => update({ answer: e.target.value })}
            placeholder={puzzle.type === 'number' ? '数字を入力' : '正解テキスト（ひらがな推奨）'}
          />
        )}
      </div>

      <div className="form-group">
        <label>ヒント <span className="label-sub">（最大3個まで推奨）</span></label>
        {puzzle.hints.map((hint, i) => (
          <div key={i} className="hint-row">
            <span className="hint-num">#{i + 1}</span>
            <input
              type="text"
              value={hint}
              onChange={e => updateHint(i, e.target.value)}
              placeholder={`ヒント ${i + 1}`}
            />
            <button onClick={() => removeHint(i)} className="btn-icon btn-danger">×</button>
          </div>
        ))}
        <button onClick={addHint} className="btn-add-small">+ ヒントを追加</button>
      </div>

      <div className="form-row">
        <div className="form-group half">
          <label>正解時メッセージ</label>
          <textarea
            value={puzzle.successMessage}
            onChange={e => update({ successMessage: e.target.value })}
            rows={2}
            placeholder="正解したときのメッセージ"
          />
        </div>
        <div className="form-group half">
          <label>不正解時メッセージ</label>
          <textarea
            value={puzzle.failMessage}
            onChange={e => update({ failMessage: e.target.value })}
            rows={2}
            placeholder="不正解だったときのメッセージ"
          />
        </div>
      </div>
    </div>
  );
}

export function createDefaultPuzzle(): Puzzle {
  return {
    id: generateId(),
    title: '',
    description: '',
    flavorText: '',
    type: 'text',
    answer: '',
    hints: [],
    successMessage: '正解！先に進める。',
    failMessage: '違う。もう一度考えろ。'
  };
}
