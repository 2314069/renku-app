import { useState } from 'react';
import { Verse } from '../types';
import { api } from '../api';
import './VerseList.css';

interface VerseListProps {
  verses: Verse[];
  renkuId: string;
  isAdmin?: boolean;
  onVerseUpdate?: () => void;
}

// 句の順番に応じて折と表裏の情報を取得する関数
function getSectionInfo(order: number): { section: string; side: string } {
  if (order >= 1 && order <= 8) {
    return { section: '初折', side: '表八句' };
  } else if (order >= 9 && order <= 22) {
    return { section: '初折', side: '裏十四句' };
  } else if (order >= 23 && order <= 36) {
    return { section: '二の折', side: '表十四句' };
  } else if (order >= 37 && order <= 50) {
    return { section: '二の折', side: '裏十四句' };
  } else if (order >= 51 && order <= 64) {
    return { section: '三の折', side: '表十四句' };
  } else if (order >= 65 && order <= 78) {
    return { section: '三の折', side: '裏十四句' };
  } else if (order >= 79 && order <= 92) {
    return { section: '名残の折', side: '表十四句' };
  } else if (order >= 93 && order <= 100) {
    return { section: '名残の折', side: '裏八句' };
  }
  return { section: '', side: '' };
}

function VerseItem({ verse, renkuId, isAdmin, onUpdate }: { verse: Verse; renkuId: string; isAdmin?: boolean; onUpdate?: () => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(verse.text);
  const [seasonWord, setSeasonWord] = useState(verse.seasonWord || '');
  const [participantName, setParticipantName] = useState(verse.participantName || '');
  const [isSaving, setIsSaving] = useState(false);
  
  const sectionInfo = getSectionInfo(verse.order);

  const handleEdit = () => {
    setIsEditing(true);
    setText(verse.text);
    setSeasonWord(verse.seasonWord || '');
    setParticipantName(verse.participantName || '');
  };

  const handleSave = async () => {
    if (!text.trim()) {
      alert('句を入力してください');
      return;
    }

    if (!participantName.trim()) {
      alert('名前を入力してください');
      return;
    }

    setIsSaving(true);
    try {
      await api.updateVerse(renkuId, verse.id, text.trim(), seasonWord || undefined, participantName.trim());
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
    setParticipantName(verse.participantName || '');
    setIsEditing(false);
  };

  return (
    <div className={`verse-item verse-${verse.type}`}>
      <div className="verse-header">
        <span className="verse-order">第{verse.order}句</span>
        {sectionInfo.section && (
          <span className="verse-section">{sectionInfo.section} {sectionInfo.side}</span>
        )}
        <span className="verse-type">{verse.type === '575' ? '5-7-5' : '7-7'}</span>
        <span className="verse-author">{verse.participantName}</span>
        {!isEditing && isAdmin && (
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
          <div className="verse-edit-name">
            <label htmlFor={`name-${verse.id}`} className="verse-edit-name-label">
              詠者:
            </label>
            <input
              id={`name-${verse.id}`}
              type="text"
              value={participantName}
              onChange={(e) => setParticipantName(e.target.value)}
              className="verse-edit-name-input"
              disabled={isSaving}
              placeholder="名前を入力"
            />
          </div>
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
              <option value="三春">三春</option>
              <option value="初春">初春</option>
              <option value="仲春">仲春</option>
              <option value="晩春">晩春</option>
              <option value="三夏">三夏</option>
              <option value="初夏">初夏</option>
              <option value="仲夏">仲夏</option>
              <option value="晩夏">晩夏</option>
              <option value="三秋">三秋</option>
              <option value="初秋">初秋</option>
              <option value="仲秋">仲秋</option>
              <option value="晩秋">晩秋</option>
              <option value="三冬">三冬</option>
              <option value="初冬">初冬</option>
              <option value="仲冬">仲冬</option>
              <option value="晩冬">晩冬</option>
            </select>
          </div>
          <div className="verse-edit-actions">
            <button
              className="verse-save-btn"
              onClick={handleSave}
              disabled={isSaving || !text.trim() || !participantName.trim()}
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

export default function VerseList({ verses, renkuId, isAdmin, onVerseUpdate }: VerseListProps) {
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
            isAdmin={isAdmin}
            onUpdate={onVerseUpdate}
          />
        ))}
      </div>
    </div>
  );
}

