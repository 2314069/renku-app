import { Renku } from '../types';
import './ExportButton.css';

interface ExportButtonProps {
  renku: Renku;
}

export default function ExportButton({ renku }: ExportButtonProps) {
  const handleExport = () => {
    // テキストコンテンツを生成
    const textContent = [
      renku.title,
      '',
      `作成日: ${new Date(renku.createdAt).toLocaleString('ja-JP')}`,
      `参加者: ${renku.participants.map(p => p.name).join(', ')}`,
      '',
      ...renku.verses.map((verse) => {
        const lines = [
          `第${verse.order}句 (${verse.type === '575' ? '5-7-5' : '7-7'}) | 詠者: ${verse.participantName}`,
          verse.text,
        ];
        if (verse.seasonWord) {
          lines.push(`季語: ${verse.seasonWord}`);
        }
        lines.push(`作成日時: ${new Date(verse.createdAt).toLocaleString('ja-JP')}`);
        lines.push('');
        return lines.join('\n');
      })
    ].join('\n');

    // テキストファイルとしてダウンロード
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${renku.title}_連句_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // メモリリークを防ぐため、少し遅延してからURLを解放
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 100);
  };

  return (
    <div className="export-buttons">
      <button onClick={handleExport} className="export-btn">
        エクスポート
      </button>
    </div>
  );
}

