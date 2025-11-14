import { useState, useEffect } from 'react';
import { Renku } from '../types';
import VerseInput from './VerseInput';
import VerseList from './VerseList';
import ParticipantList from './ParticipantList';
import ExportButton from './ExportButton';
import './RenkuRoom.css';

interface RenkuRoomProps {
  renku: Renku;
  participantId: string;
  onAddVerse: (text: string, seasonWord?: string) => void;
}

export default function RenkuRoom({ renku, participantId, onAddVerse }: RenkuRoomProps) {
  const currentParticipant = renku.participants.find(p => p.id === participantId);
  const nextVerseType = renku.verses.length === 0 ? '575' : 
    renku.verses[renku.verses.length - 1].type === '575' ? '77' : '575';
  const isMyTurn = renku.participants[renku.currentTurn]?.id === participantId;

  return (
    <div className="renku-room">
      <header className="room-header">
        <div>
          <h1>{renku.title}</h1>
          <p className="renku-id">連句ID: {renku._id}</p>
        </div>
        <ExportButton renku={renku} />
      </header>

      <div className="room-content">
        <div className="main-section">
          <div className="kpi-indicators">
            <div className="kpi-card">
              <div className="kpi-label">季語</div>
              <div className="kpi-value">
                {renku.verses.length > 0 && renku.verses[renku.verses.length - 1].seasonWord 
                  ? renku.verses[renku.verses.length - 1].seasonWord 
                  : '未設定'}
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">進行</div>
              <div className="kpi-value">{renku.verses.length} / 100</div>
            </div>
          </div>

          <VerseList verses={renku.verses} participants={renku.participants} />

          <VerseInput
            verseType={nextVerseType as '575' | '77'}
            participants={renku.participants}
            currentParticipant={currentParticipant!}
            verses={renku.verses}
            isMyTurn={isMyTurn}
            onAddVerse={onAddVerse}
          />
        </div>

        <aside className="sidebar">
          <ParticipantList 
            participants={renku.participants}
            currentTurn={renku.currentTurn}
            currentParticipantId={participantId}
          />
        </aside>
      </div>
    </div>
  );
}

