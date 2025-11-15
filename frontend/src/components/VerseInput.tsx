import { useState } from 'react';
import { Verse } from '../types';
import { validate575, validate77, detectSeasonWord, checkTabooWords } from '../utils/verseValidator';
import './VerseInput.css';

interface VerseInputProps {
  verseType: '575' | '77';
  verses: Verse[];
  isMyTurn: boolean;
  onAddVerse: (text: string, seasonWord?: string) => void;
}

export default function VerseInput({
  verseType,
  verses,
  isMyTurn,
  onAddVerse
}: VerseInputProps) {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [charCount, setCharCount] = useState(0);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    setCharCount(newText.length);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isMyTurn) {
      setError('まだあなたの順番ではありません');
      return;
    }

    const trimmedText = text.trim();
    
    // バリデーション
    const validation = verseType === '575' 
      ? validate575(trimmedText)
      : validate77(trimmedText);
    
    if (!validation.valid) {
      setError(validation.error || '無効な句です');
      return;
    }

    // 禁忌語チェック
    const tabooCheck = checkTabooWords(verses, trimmedText, verses.length === 0);
    if (!tabooCheck.valid) {
      setError(tabooCheck.error || '禁忌語が使われています');
      return;
    }

    // 季語の検出
    const seasonWord = detectSeasonWord(trimmedText);

    onAddVerse(trimmedText, seasonWord);
    setText('');
    setCharCount(0);
    setError(null);
  };

  const maxChars = verseType === '575' ? 17 : 14;

  const lastVerse = verses.length > 0 ? verses[verses.length - 1] : null;
  const lastSeasonWord = lastVerse?.seasonWord || '未設定';
  const requirementText = verseType === '575' 
    ? `要件: 5-7-5 付け、季語: ${lastSeasonWord}`
    : `要件: 7-7 付け、季語: ${lastSeasonWord}`;

  return (
    <div className="verse-input-container">
      <div className="verse-input-header">
        <div className="verse-input-title-row">
          <h2>句の投稿</h2>
          <div className="verse-requirement">{requirementText}</div>
        </div>
      </div>

      {!isMyTurn && (
        <div className="waiting-message">
          <p>他の参加者の順番です。お待ちください...</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="verse-input-form">
        <textarea
          value={text}
          onChange={handleTextChange}
          placeholder={verseType === '575' 
            ? 'ここに句を入力（例：灯ともして　縁側ひやり　虫の声）'
            : 'ここに句を入力（例：天にも昇る　心の如くも）'}
          className="verse-textarea"
          rows={3}
          disabled={!isMyTurn}
          maxLength={maxChars + 10}
        />
        
        <div className="input-footer">
          <div className="char-count-wrapper">
            <div className="char-count">
              <span className={charCount > maxChars ? 'over-limit' : ''}>
                文字数: {charCount}
              </span>
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
              disabled={!isMyTurn || text.trim().length === 0}
            >
              投稿
            </button>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          {!error && text.trim() && (
            <div className="validation-hint">
              形式チェック: {verseType === '575' ? '5-7-5形式' : '7-7形式'}
            </div>
          )}
        </div>
      </form>
    </div>
  );
}

