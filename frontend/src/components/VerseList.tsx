import { useState } from 'react';
import { Verse } from '../types';
import { api } from '../api';
import './VerseList.css';

interface VerseListProps {
  verses: Verse[];
  renkuId: string;
  onVerseUpdate?: () => void;
}

function VerseItem({ verse, renkuId, onUpdate }: { verse: Verse; renkuId: string; onUpdate?: () => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(verse.text);
  const [seasonWord, setSeasonWord] = useState(verse.seasonWord || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
    setText(verse.text);
    setSeasonWord(verse.seasonWord || '');
  };

  const handleSave = async () => {
    if (!text.trim()) {
      alert('句を入力してください');
      return;
    }

    setIsSaving(true);
    try {
      await api.updateVerse(renkuId, verse.id, text.trim(), seasonWord || undefined);
      setIsEditing(false);
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('句更新エラー:', error);
      alert('句の更新に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setText(verse.text);
    setSeasonWord(verse.seasonWord || '');
    setIsEditing(false);
  };

  return (
    <div className={`verse-item verse-${verse.type}`}>
      <div className="verse-header">
        <span className="verse-order">第{verse.order}句</span>
        <span className="verse-type">{verse.type === '575' ? '5-7-5' : '7-7'}</span>
        <span className="verse-author">{verse.participantName}</span>
        {!isEditing && (
          <button
            className="verse-edit-btn"
            onClick={handleEdit}
            title="句を編集"
          >
            編集
          </button>
        )}
      </div>
      {isEditing ? (
        <div className="verse-edit-form">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="verse-edit-textarea"
            rows={2}
            disabled={isSaving}
            autoFocus
          />
          <div className="verse-edit-season">
            <label htmlFor={`season-${verse.id}`} className="verse-edit-season-label">
              季語:
            </label>
            <select
              id={`season-${verse.id}`}
              value={seasonWord}
              onChange={(e) => setSeasonWord(e.target.value)}
              className="verse-edit-season-select"
              disabled={isSaving}
            >
              <option value="">季語なし</option>
              <option value="春">春</option>
              <option value="夏">夏</option>
              <option value="秋">秋</option>
              <option value="冬">冬</option>
            </select>
          </div>
          <div className="verse-edit-actions">
            <button
              className="verse-save-btn"
              onClick={handleSave}
              disabled={isSaving || !text.trim()}
            >
              保存
            </button>
            <button
              className="verse-cancel-btn"
              onClick={handleCancel}
              disabled={isSaving}
            >
              キャンセル
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="verse-text">
            {verse.text.split('').map((char, i) => (
              <span key={i}>{char}</span>
            ))}
          </div>
          <div className="verse-meta">
            {verse.seasonWord && (
              <div className="verse-season-word">
                <span className="season-word-text">{verse.seasonWord}</span>
              </div>
            )}
            <div className="verse-time">
              {new Date(verse.createdAt).toLocaleString('ja-JP')}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function VerseList({ verses, renkuId, onVerseUpdate }: VerseListProps) {
  if (verses.length === 0) {
    return (
      <div className="verse-list-empty">
        <p>まだ句がありません。最初の句（発句）を詠んでください。</p>
      </div>
    );
  }

  return (
    <div className="verse-list-container">
      <h2>詠まれた句</h2>
      <div className="verse-list">
        {verses.map((verse) => (
          <VerseItem
            key={verse.id}
            verse={verse}
            renkuId={renkuId}
            onUpdate={onVerseUpdate}
          />
        ))}
      </div>
    </div>
  );
}

