import { Verse } from '../types';
import './VerseList.css';

interface VerseListProps {
  verses: Verse[];
}

export default function VerseList({ verses }: VerseListProps) {
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
          <div key={verse.id} className={`verse-item verse-${verse.type}`}>
            <div className="verse-header">
              <span className="verse-order">第{verse.order}句</span>
              <span className="verse-type">{verse.type === '575' ? '5-7-5' : '7-7'}</span>
              <span className="verse-author">{verse.participantName}</span>
            </div>
            <div className="verse-text">
              {verse.text.split('').map((char, i) => (
                <span key={i}>{char}</span>
              ))}
            </div>
            {verse.seasonWord && (
              <div className="verse-season-word">
                季語: {verse.seasonWord}
              </div>
            )}
            <div className="verse-time">
              {new Date(verse.createdAt).toLocaleString('ja-JP')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

