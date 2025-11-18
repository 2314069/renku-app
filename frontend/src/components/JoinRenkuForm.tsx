import { useState, useEffect } from 'react';
import { api } from '../api';
import { Renku } from '../types';
import './JoinRenkuForm.css';

interface JoinRenkuFormProps {
  onJoin: (renkuId: string, participantName: string, role: string) => void;
}

export default function JoinRenkuForm({ onJoin }: JoinRenkuFormProps) {
  const [renkuId, setRenkuId] = useState('');
  const [participantName, setParticipantName] = useState('');
  const [role, setRole] = useState<'admin' | 'participant'>('participant');
  const [renkuList, setRenkuList] = useState<Renku[]>([]);
  const [loading, setLoading] = useState(false);
  const [showList, setShowList] = useState(false);

  useEffect(() => {
    loadRenkuList();
  }, []);

  const loadRenkuList = async () => {
    try {
      setLoading(true);
      const renkus = await api.getAllRenku();
      setRenkuList(renkus);
    } catch (error) {
      console.error('連句一覧取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRenku = (selectedRenkuId: string) => {
    setRenkuId(selectedRenkuId);
    setShowList(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!renkuId.trim()) {
      alert('連句IDを入力してください');
      return;
    }
    // 名前が空の場合はデフォルト名を使用
    const name = participantName.trim() || '参加者';
    onJoin(renkuId, name, role);
  };

  return (
    <form className="join-renku-form" onSubmit={handleSubmit}>
      <h2>既存の連句に参加</h2>
      
      <div className="form-group">
        <label htmlFor="renkuId">連句ID</label>
        <div className="renku-select-wrapper">
          <input
            id="renkuId"
            type="text"
            value={renkuId}
            onChange={(e) => setRenkuId(e.target.value)}
            onFocus={() => setShowList(true)}
            placeholder="連句のIDを入力、または下から選択"
          />
          <button
            type="button"
            className="toggle-list-btn"
            onClick={() => setShowList(!showList)}
          >
            {showList ? '▲' : '▼'}
          </button>
        </div>
        {showList && (
          <div className="renku-list">
            {loading ? (
              <div className="loading">読み込み中...</div>
            ) : renkuList.length === 0 ? (
              <div className="empty-list">連句がありません</div>
            ) : (
              <div className="renku-list-items">
                {renkuList.map((renku) => (
                  <div
                    key={renku._id}
                    className={`renku-list-item ${renkuId === renku._id ? 'selected' : ''}`}
                    onClick={() => handleSelectRenku(renku._id)}
                  >
                    <div className="renku-item-title">{renku.title}</div>
                    <div className="renku-item-meta">
                      <span>ID: {renku._id}</span>
                      <span>句数: {renku.verses.length}</span>
                      <span>参加者: {renku.participants.length}人</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="participantName">あなたの名前（任意）</label>
        <input
          id="participantName"
          type="text"
          value={participantName}
          onChange={(e) => setParticipantName(e.target.value)}
          placeholder="例：花子（未入力の場合は「参加者」になります）"
          maxLength={20}
        />
      </div>

      <div className="form-group">
        <label htmlFor="role">権限</label>
        <select
          id="role"
          value={role}
          onChange={(e) => setRole(e.target.value as 'admin' | 'participant')}
          className="role-select"
        >
          <option value="admin">運営者（編集や投稿が可能）</option>
          <option value="participant">参加者（閲覧のみ）</option>
        </select>
      </div>

      <button type="submit" className="submit-btn">
        参加する
      </button>
    </form>
  );
}


