import './ProgressIndicator.css';

interface ProgressIndicatorProps {
  currentCount: number;
  targetCount: number;
}

export default function ProgressIndicator({ currentCount, targetCount }: ProgressIndicatorProps) {
  const percentage = Math.min((currentCount / targetCount) * 100, 100);

  return (
    <div className="progress-indicator-container">
      <div className="progress-header">
        <h2>進行状況</h2>
        <span className="progress-count">
          {currentCount} / {targetCount} 句
        </span>
      </div>
      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="progress-percentage">
        {percentage.toFixed(1)}% 完成
      </div>
    </div>
  );
}

