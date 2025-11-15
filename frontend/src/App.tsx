import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { api } from './api';
import { Renku } from './types';
import RenkuRoom from './components/RenkuRoom';
import CreateRenkuForm from './components/CreateRenkuForm';
import JoinRenkuForm from './components/JoinRenkuForm';
import './App.css';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function App() {
  const [renku, setRenku] = useState<Renku | null>(null);
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [mode, setMode] = useState<'create' | 'join' | 'room'>('create');

  // Socket.io接続
  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on('renku-updated', (updatedRenku: Renku) => {
      setRenku(updatedRenku);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  // 連句ルームに参加
  useEffect(() => {
    if (socket && renku) {
      socket.emit('join-renku', renku._id);
      return () => {
        socket.emit('leave-renku', renku._id);
      };
    }
  }, [socket, renku]);

  const handleCreateRenku = async (title: string, participantName: string) => {
    try {
      const newRenku = await api.createRenku(title, participantName);
      setRenku(newRenku);
      setParticipantId(newRenku.participants[0].id);
      setMode('room');
    } catch (error) {
      console.error('連句作成エラー:', error);
      alert('連句の作成に失敗しました');
    }
  };

  const handleJoinRenku = async (renkuId: string, participantName: string) => {
    try {
      const renkuData = await api.getRenku(renkuId);
      const newParticipant = await api.addParticipant(renkuId, participantName);
      setRenku({ ...renkuData, participants: [...renkuData.participants, newParticipant] });
      setParticipantId(newParticipant.id);
      setMode('room');
    } catch (error) {
      console.error('連句参加エラー:', error);
      alert('連句への参加に失敗しました');
    }
  };

  const handleAddVerse = async (text: string, seasonWord?: string) => {
    if (!renku || !participantId) return;

    try {
      await api.addVerse(renku._id, participantId, text, seasonWord);
      if (socket) {
        socket.emit('verse-added', { renkuId: renku._id });
      }
    } catch (error) {
      console.error('句追加エラー:', error);
      alert('句の追加に失敗しました');
    }
  };

  if (mode === 'room' && renku) {
    return (
      <RenkuRoom
        renku={renku}
        participantId={participantId!}
        onAddVerse={handleAddVerse}
      />
    );
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>連句アプリ</h1>
        <p className="subtitle">オンラインで複数人で連句を詠もう</p>
      </header>

      <main className="app-main">
        {mode === 'create' && (
          <div className="mode-selector">
            <CreateRenkuForm onCreate={handleCreateRenku} />
            <div className="divider">または</div>
            <button
              className="switch-mode-btn"
              onClick={() => setMode('join')}
            >
              既存の連句に参加する
            </button>
          </div>
        )}

        {mode === 'join' && (
          <div className="mode-selector">
            <JoinRenkuForm onJoin={handleJoinRenku} />
            <div className="divider">または</div>
            <button
              className="switch-mode-btn"
              onClick={() => setMode('create')}
            >
              新しい連句を作成する
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;




