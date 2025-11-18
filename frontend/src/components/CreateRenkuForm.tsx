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
    if (!title.trim()) {
      alert('タイトルを入力してください');
      return;
    }
    // 名前が空の場合はデフォルト名を使用
    const name = participantName.trim() || '参加者';
    onCreate(title, name);
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
        <label htmlFor="participantName">あなたの名前（任意）</label>
        <input
          id="participantName"
          type="text"
          value={participantName}
          onChange={(e) => setParticipantName(e.target.value)}
          placeholder="例：太郎（未入力の場合は「参加者」になります）"
          maxLength={20}
        />
      </div>

      <button type="submit" className="submit-btn">
        連句を作成
      </button>
    </form>
  );
}




