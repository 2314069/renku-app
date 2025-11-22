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
      <h3>名前 / 式目</h3>
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
          <div className="rules-label">式目</div>
          <div className="rules-content">
            <div className="rules-structure">
              <div className="rules-structure-title">※百韻の構成と簡単式目</div>
              <div className="rule-group">
                <div className="rule-group-title">●初折</div>
                <div className="rule-group-content">
                  <div>表八句（１～８）　（七句め・７／月）</div>
                  <div>裏十四句（９～22）（十句め・18／月、十三句め・21／花）</div>
                  <div style={{ marginTop: '8px' }}></div>
                </div>
              </div>
              <div className="rule-group">
                <div className="rule-group-title">●二の折</div>
                <div className="rule-group-content">
                  <div>表十四句（23～36）（十三句め・35／月）</div>
                  <div>裏十四句（37～50）（十句め・46／月、十三句め・49／花）</div>
                  <div style={{ marginTop: '8px' }}></div>
                </div>
              </div>
              <div className="rule-group">
                <div className="rule-group-title">●三の折</div>
                <div className="rule-group-content">
                  <div>表十四句（51～64）（十三句め・63／月）</div>
                  <div>裏十四句（65～78）（十句め・74／月、十三句め・77／花）</div>
                  <div style={{ marginTop: '8px' }}></div>
                </div>
              </div>
              <div className="rule-group">
                <div className="rule-group-title">●名残の折</div>
                <div className="rule-group-content">
                  <div>表十四句（79～92）（十三句め・91／月）</div>
                  <div>裏八句　（93～100）（七句め・99／花）</div>
                </div>
              </div>
            </div>
            <ul className="rules-list">
              <li>発句と同字は（できるだけ）避ける。同じ内容は避ける。</li>
              <li>打越と同字、似たような内容は避ける。</li>
              <li>発句以外で「や、かな、けり」などの切れ字は使わない。</li>
              <li>春、秋の句は３～５句続ける。夏、冬の句は１～３句まで。</li>
              <li>短句の下句はヨミニゴーを（できるだけ）避ける。<br />→連句初めて、という人にはここまで求めなくて良い。</li>
              <li>恋句も適宜入れる。恋句は１句では終わらせず最大５句まで。<br />恋句は何度入れてもよいが、前の恋の句から最低５句は間を開ける。</li>
              <li>去嫌い、自他場は気にしなくて良い。</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

