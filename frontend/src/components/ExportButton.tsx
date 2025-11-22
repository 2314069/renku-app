import { Renku } from '../types';
import html2pdf from 'html2pdf.js';
import './ExportButton.css';

interface ExportButtonProps {
  renku: Renku;
}

export default function ExportButton({ renku }: ExportButtonProps) {
  const handleExport = async () => {
    // PDF用のHTMLコンテンツを生成
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="ja">
        <head>
          <meta charset="UTF-8">
          <style>
            @page {
              margin: 20mm;
              size: A4;
            }
            body {
              font-family: 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', 'Meiryo', sans-serif;
              line-height: 1.8;
              color: #333;
              padding: 20px;
            }
            h1 {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 10px;
              text-align: center;
              border-bottom: 2px solid #333;
              padding-bottom: 10px;
            }
            .metadata {
              font-size: 12px;
              color: #666;
              margin-bottom: 20px;
              text-align: center;
            }
            .verse-item {
              margin-bottom: 25px;
              padding: 15px;
              border-left: 4px solid #3498db;
              background: #f8f9fa;
            }
            .verse-item.verse-77 {
              border-left-color: #e74c3c;
            }
            .verse-header {
              font-size: 12px;
              color: #666;
              margin-bottom: 8px;
            }
            .verse-text {
              font-size: 18px;
              font-weight: 500;
              margin: 10px 0;
              line-height: 2;
            }
            .verse-meta {
              font-size: 12px;
              color: #666;
              margin-top: 8px;
            }
            .season-word {
              display: inline-block;
              padding: 4px 10px;
              background: #fff9e6;
              border: 1px solid #f39c12;
              border-radius: 12px;
              font-size: 11px;
              color: #d68910;
              margin-right: 10px;
            }
          </style>
        </head>
        <body>
          <h1>${renku.title}</h1>
          <div class="metadata">
            <div>作成日: ${new Date(renku.createdAt).toLocaleString('ja-JP')}</div>
            <div>参加者: ${renku.participants.map(p => p.name).join(', ')}</div>
          </div>
          ${renku.verses.map((verse) => `
            <div class="verse-item verse-${verse.type}">
              <div class="verse-header">
                第${verse.order}句 (${verse.type === '575' ? '5-7-5' : '7-7'}) | 詠者: ${verse.participantName}
              </div>
              <div class="verse-text">${verse.text}</div>
              <div class="verse-meta">
                ${verse.seasonWord ? `<span class="season-word">${verse.seasonWord}</span>` : ''}
                <span>${new Date(verse.createdAt).toLocaleString('ja-JP')}</span>
              </div>
            </div>
          `).join('')}
        </body>
      </html>
    `;

    // 一時的な要素を作成してPDFを生成
    const element = document.createElement('div');
    element.innerHTML = htmlContent;
    element.style.position = 'absolute';
    element.style.left = '-9999px';
    document.body.appendChild(element);

    try {
      const opt = {
        margin: [20, 20, 20, 20] as [number, number, number, number],
        filename: `${renku.title}_連句_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      // PDFを生成してBlobとして取得
      const pdfBlob = await html2pdf().set(opt).from(element).output('blob');
      
      // 新しいタブでPDFを表示
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const newWindow = window.open(pdfUrl, '_blank');
      
      if (!newWindow) {
        alert('ポップアップがブロックされました。ブラウザの設定でポップアップを許可してください。');
      }
      
      // クリーンアップ
      document.body.removeChild(element);
      
      // メモリリークを防ぐため、少し遅延してからURLを解放
      setTimeout(() => {
        URL.revokeObjectURL(pdfUrl);
      }, 1000);
    } catch (error) {
      console.error('PDF生成エラー:', error);
      alert('PDFの生成に失敗しました');
      if (document.body.contains(element)) {
        document.body.removeChild(element);
      }
    }
  };

  return (
    <div className="export-buttons">
      <button onClick={handleExport} className="export-btn">
        エクスポート
      </button>
    </div>
  );
}

