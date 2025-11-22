import { useState } from 'react';
import { Verse } from '../types';
import { detectSeasonWord } from '../utils/verseValidator';
import './VerseInput.css';

interface VerseInputProps {
  verseType: '575' | '77';
  verses: Verse[];
  onAddVerse: (text: string, seasonWord?: string) => void;
}

// 月の定座と花の定座を判定する関数
function getSeatInfo(order: number): { isMoon: boolean; isFlower: boolean } {
  const moonSeats = [7, 18, 35, 46, 63, 74, 91];
  const flowerSeats = [21, 49, 77, 99];
  return {
    isMoon: moonSeats.includes(order),
    isFlower: flowerSeats.includes(order)
  };
}

export default function VerseInput({
  verseType,
  verses: _verses,
  onAddVerse
}: VerseInputProps) {
  const [text, setText] = useState('');
  const [selectedSeasonWord, setSelectedSeasonWord] = useState<string>('');
  const [charCount, setCharCount] = useState(0);
  
  // 次の句の順番を計算
  const nextOrder = _verses.length + 1;
  const seatInfo = getSeatInfo(nextOrder);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    setCharCount(newText.length);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedText = text.trim();
    
    // 空文字チェックのみ
    if (trimmedText.length === 0) {
      return;
    }

    // 季語の選択（選択されていない場合は自動検出）
    const seasonWord = selectedSeasonWord || detectSeasonWord(trimmedText);

    onAddVerse(trimmedText, seasonWord);
    setText('');
    setSelectedSeasonWord('');
    setCharCount(0);
  };


  const requirementText = verseType === '575' 
    ? `要件: 5-7-5 付け`
    : `要件: 7-7 付け`;

  return (
    <div className="verse-input-container">
      <div className="verse-input-header">
        <div className="verse-input-title-row">
          <h2>句の投稿</h2>
          <div className="verse-requirement">
            <div>{requirementText}</div>
            {seatInfo.isMoon && (
              <div className="seat-info moon-seat">月の定座（第{nextOrder}句）</div>
            )}
            {seatInfo.isFlower && (
              <div className="seat-info flower-seat">花の定座（第{nextOrder}句）</div>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="verse-input-form">
        <textarea
          value={text}
          onChange={handleTextChange}
          placeholder={verseType === '575' 
            ? 'ここに句を入力（例：灯ともして　縁側ひやり　虫の声）'
            : 'ここに句を入力（例：天にも昇る　心の如くも）'}
          className="verse-textarea"
          rows={3}
        />
        
        <div className="season-word-selector">
          <label htmlFor="season-word-select" className="season-word-label">
            季語を選択（任意）
          </label>
          <select
            id="season-word-select"
            value={selectedSeasonWord}
            onChange={(e) => setSelectedSeasonWord(e.target.value)}
            className="season-word-select"
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
        
        <div className="input-footer">
          <div className="char-count-wrapper">
            <div className="char-count">
              文字数: {charCount}
            </div>
          </div>
          
          <div className="input-actions">
            <button 
              type="button"
              className="draft-btn"
              onClick={() => {
                // 下書き保存機能（将来実装）
                console.log('下書き保存:', text);
              }}
            >
              下書き保存
            </button>
            <button 
              type="submit" 
              className="submit-verse-btn"
              disabled={text.trim().length === 0}
            >
              投稿
            </button>
          </div>
          
        </div>
      </form>
    </div>
  );
}

