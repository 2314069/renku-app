import { useState } from 'react';
import './CreateRenkuForm.css';

interface CreateRenkuFormProps {
  onCreate: (title: string, participantName: string) => void;
}

export default function CreateRenkuForm({ onCreate }: CreateRenkuFormProps) {
  const [title, setTitle] = useState('');
  const [participantName, setParticipantName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !participantName.trim()) {
      alert('タイトルと参加者名を入力してください');
      return;
    }
    onCreate(title, participantName);
  };

  return (
    <form className="create-renku-form" onSubmit={handleSubmit}>
      <h2>新しい連句を作成</h2>
      
      <div className="form-group">
        <label htmlFor="title">連句のタイトル</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例：春の連句"
          maxLength={50}
        />
      </div>

      <div className="form-group">
        <label htmlFor="participantName">あなたの名前</label>
        <input
          id="participantName"
          type="text"
          value={participantName}
          onChange={(e) => setParticipantName(e.target.value)}
          placeholder="例：太郎"
          maxLength={20}
        />
      </div>

      <button type="submit" className="submit-btn">
        連句を作成
      </button>
    </form>
  );
}




