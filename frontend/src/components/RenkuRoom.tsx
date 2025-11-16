import { useState, useEffect } from 'react';
import { Renku } from '../types';
import { api } from '../api';
import VerseInput from './VerseInput';
import VerseList from './VerseList';
import ParticipantList from './ParticipantList';
import ExportButton from './ExportButton';
import './RenkuRoom.css';

interface RenkuRoomProps {
  renku: Renku;
  participantId: string;
  onAddVerse: (text: string, seasonWord?: string) => void;
  onRenkuUpdate?: (renku: Renku) => void;
  onRenkuDelete?: () => void;
}

export default function RenkuRoom({ renku, participantId, onAddVerse, onRenkuUpdate, onRenkuDelete }: RenkuRoomProps) {
  const nextVerseType = renku.verses.length === 0 ? '575' : 
    renku.verses[renku.verses.length - 1].type === '575' ? '77' : '575';
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(renku.title);
  const [isSaving, setIsSaving] = useState(false);

  // renku.titleが変更されたらtitleステートを更新
  useEffect(() => {
    if (!isEditingTitle) {
      setTitle(renku.title);
    }
  }, [renku.title, isEditingTitle]);

  const handleEditTitle = () => {
    setIsEditingTitle(true);
    setTitle(renku.title);
  };

  const handleSaveTitle = async () => {
    if (!title.trim()) {
      alert('タイトルを入力してください');
      return;
    }

    setIsSaving(true);
    try {
      const updatedRenku = await api.updateRenku(renku._id, title.trim());
      if (onRenkuUpdate) {
        onRenkuUpdate(updatedRenku);
      }
      setIsEditingTitle(false);
    } catch (error) {
      console.error('タイトル更新エラー:', error);
      alert('タイトルの更新に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setTitle(renku.title);
    setIsEditingTitle(false);
  };

  const handleDelete = async () => {
    if (!confirm('本当にこの連句を削除しますか？この操作は取り消せません。')) {
      return;
    }

    try {
      await api.deleteRenku(renku._id);
      if (onRenkuDelete) {
        onRenkuDelete();
      }
    } catch (error) {
      console.error('連句削除エラー:', error);
      alert('連句の削除に失敗しました');
    }
  };

  return (
    <div className="renku-room">
      <header className="room-header">
        <div>
          {isEditingTitle ? (
            <div className="title-edit">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="title-input"
                disabled={isSaving}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveTitle();
                  } else if (e.key === 'Escape') {
                    handleCancelEdit();
                  }
                }}
              />
              <div className="title-edit-actions">
                <button
                  className="title-save-btn"
                  onClick={handleSaveTitle}
                  disabled={isSaving || !title.trim()}
                >
                  保存
                </button>
                <button
                  className="title-cancel-btn"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                >
                  キャンセル
                </button>
              </div>
            </div>
          ) : (
            <h1 onClick={handleEditTitle} className="title-editable" title="クリックして編集">
              {renku.title}
            </h1>
          )}
          <p className="renku-id">連句ID: {renku._id}</p>
        </div>
        <div className="header-actions">
          <button
            className="edit-renku-btn"
            onClick={handleEditTitle}
            title="タイトルを編集"
          >
            編集
          </button>
          <button
            className="delete-renku-btn"
            onClick={handleDelete}
            title="連句を削除"
          >
            削除
          </button>
          <ExportButton renku={renku} />
        </div>
      </header>

      <div className="room-content">
        <div className="main-section">
          <div className="kpi-indicators">
            <div className="kpi-card">
              <div className="kpi-label">進行</div>
              <div className="kpi-value">{renku.verses.length} / 100</div>
            </div>
          </div>

          <VerseList 
            verses={renku.verses}
            renkuId={renku._id}
            onVerseUpdate={() => {
              // 句が更新されたら連句を再取得
              if (onRenkuUpdate) {
                api.getRenku(renku._id).then(updatedRenku => {
                  onRenkuUpdate(updatedRenku);
                });
              }
            }}
          />

          <VerseInput
            verseType={nextVerseType as '575' | '77'}
            verses={renku.verses}
            onAddVerse={onAddVerse}
          />
        </div>

        <aside className="sidebar">
          <ParticipantList 
            participants={renku.participants}
            currentParticipantId={participantId}
            renkuId={renku._id}
          />
        </aside>
      </div>
    </div>
  );
}

