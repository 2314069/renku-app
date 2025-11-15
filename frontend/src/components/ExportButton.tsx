import { Renku } from '../types';
import './ExportButton.css';

interface ExportButtonProps {
  renku: Renku;
}

export default function ExportButton({ renku }: ExportButtonProps) {
  const handleExport = () => {
    // テキスト形式でエクスポート
    let text = `連句: ${renku.title}\n`;
    text += `作成日: ${new Date(renku.createdAt).toLocaleString('ja-JP')}\n`;
    text += `参加者: ${renku.participants.map(p => p.name).join(', ')}\n\n`;
    text += '────────────────\n\n';

    renku.verses.forEach((verse) => {
      text += `第${verse.order}句 (${verse.type === '575' ? '5-7-5' : '7-7'})\n`;
      text += `${verse.text}\n`;
      text += `詠者: ${verse.participantName}`;
      if (verse.seasonWord) {
        text += ` | 季語: ${verse.seasonWord}`;
      }
      text += `\n${new Date(verse.createdAt).toLocaleString('ja-JP')}\n\n`;
    });

    // ファイルとしてダウンロード
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${renku.title}_連句_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="export-buttons">
      <button onClick={handleExport} className="export-btn">
        エクスポート
      </button>
      <button onClick={handlePrint} className="print-btn">
        印刷
      </button>
    </div>
  );
}

