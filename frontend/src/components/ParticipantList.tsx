import { useState, useEffect } from 'react';
import { Participant } from '../types';
import { api } from '../api';
import './ParticipantList.css';

interface ParticipantListProps {
  participants: Participant[];
  currentParticipantId: string;
  renkuId: string;
  onNameUpdate?: () => void;
}

export default function ParticipantList({ 
  participants, 
  currentParticipantId,
  renkuId,
  onNameUpdate
}: ParticipantListProps) {
  const currentParticipant = participants.find(p => p.id === currentParticipantId);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentParticipant?.name || '');
  const [isSaving, setIsSaving] = useState(false);

  // 入力フィールドにフォーカスが当たったら編集モードにする
  const handleFocus = () => {
    setIsEditing(true);
  };

  // デバッグ用ログ
  useEffect(() => {
    console.log('ParticipantList Debug:', {
      currentParticipantId,
      currentParticipant,
      participants,
      isEditing,
      name
    });
  }, [currentParticipantId, currentParticipant, participants, isEditing, name]);

  // 参加者が更新されたら名前を同期
  useEffect(() => {
    if (currentParticipant && !isEditing) {
      setName(currentParticipant.name);
    }
  }, [currentParticipant, isEditing]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleSave = async () => {
    if (!name.trim() || !currentParticipant) return;
    
    setIsSaving(true);
    try {
      await api.updateParticipantName(renkuId, currentParticipantId, name.trim());
      setIsEditing(false);
      if (onNameUpdate) {
        onNameUpdate();
      }
    } catch (error) {
      console.error('名前更新エラー:', error);
      alert('名前の更新に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setName(currentParticipant?.name || '');
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };
  
  return (
    <div className="participant-list-container">
      <h3>名前 / ルール</h3>
      <div className="participant-list">
        <div className="name-section">
          <div className="name-label">名前</div>
          <div className="name-edit">
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              onKeyDown={handleKeyDown}
              onFocus={handleFocus}
              onBlur={() => {
                // フォーカスが外れたら自動保存（変更がある場合のみ）
                if (name.trim() && currentParticipant && name.trim() !== currentParticipant.name) {
                  handleSave();
                } else if (!name.trim() || !currentParticipant) {
                  // 空欄の場合は元の値に戻す
                  setName(currentParticipant?.name || '');
                }
                // 少し遅延させてから編集モードを解除（ボタンクリックを確実に処理するため）
                setTimeout(() => setIsEditing(false), 200);
              }}
              className="name-input"
              disabled={isSaving}
              placeholder="名前を入力"
            />
            {isEditing && (
              <div className="name-edit-actions">
                <button 
                  className="name-save-btn" 
                  onClick={handleSave}
                  disabled={isSaving || !name.trim()}
                >
                  保存
                </button>
                <button 
                  className="name-cancel-btn" 
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  キャンセル
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="rules-section">
          <div className="rules-label">ルール</div>
          <ul className="rules-list">
            <li>5-7-5 / 7-7 の付けを交互に進行</li>
            <li>季語は適切に配置する</li>
            <li>直前句と意味の飛躍を適度に保つ</li>
          </ul>
          <div className="rules-actions">
            <button className="rule-btn small">詳細</button>
            <button className="rule-btn small">履歴</button>
          </div>
        </div>
      </div>
    </div>
  );
}

