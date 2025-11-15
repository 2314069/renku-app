import { Participant } from '../types';
import './ParticipantList.css';

interface ParticipantListProps {
  participants: Participant[];
  currentTurn: number;
}

export default function ParticipantList({ 
  participants, 
  currentTurn
}: ParticipantListProps) {
  const nextParticipant = participants[currentTurn];
  
  return (
    <div className="participant-list-container">
      <h3>名前 / ルール</h3>
      <div className="participant-list">
        <div className="name-section">
          <div className="name-label">名前</div>
          <div className="name-item">
            {nextParticipant ? nextParticipant.name : '未設定'}
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

