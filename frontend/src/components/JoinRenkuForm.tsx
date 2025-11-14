import { useState } from 'react';
import './JoinRenkuForm.css';

interface JoinRenkuFormProps {
  onJoin: (renkuId: string, participantName: string) => void;
}

export default function JoinRenkuForm({ onJoin }: JoinRenkuFormProps) {
  const [renkuId, setRenkuId] = useState('');
  const [participantName, setParticipantName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!renkuId.trim() || !participantName.trim()) {
      alert('連句IDと参加者名を入力してください');
      return;
    }
    onJoin(renkuId, participantName);
  };

  return (
    <form className="join-renku-form" onSubmit={handleSubmit}>
      <h2>既存の連句に参加</h2>
      
      <div className="form-group">
        <label htmlFor="renkuId">連句ID</label>
        <input
          id="renkuId"
          type="text"
          value={renkuId}
          onChange={(e) => setRenkuId(e.target.value)}
          placeholder="連句のIDを入力"
        />
      </div>

      <div className="form-group">
        <label htmlFor="participantName">あなたの名前</label>
        <input
          id="participantName"
          type="text"
          value={participantName}
          onChange={(e) => setParticipantName(e.target.value)}
          placeholder="例：花子"
          maxLength={20}
        />
      </div>

      <button type="submit" className="submit-btn">
        参加する
      </button>
    </form>
  );
}


