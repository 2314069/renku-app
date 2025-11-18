import axios from 'axios';
import type { Renku, Verse, Participant } from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = {
  // 新しい連句を作成
  createRenku: async (title: string, participantName: string, role: string): Promise<Renku> => {
    const response = await axios.post(`${API_BASE_URL}/api/renku`, {
      title,
      participantName,
      role
    });
    return response.data;
  },

  // 連句を取得
  getRenku: async (id: string): Promise<Renku> => {
    const response = await axios.get(`${API_BASE_URL}/api/renku/${id}`);
    return response.data;
  },

  // 句を追加
  addVerse: async (renkuId: string, participantId: string, text: string, seasonWord?: string): Promise<Verse> => {
    const response = await axios.post(`${API_BASE_URL}/api/renku/${renkuId}/verse`, {
      participantId,
      text,
      seasonWord
    });
    return response.data;
  },

  // 参加者を追加
  addParticipant: async (renkuId: string, name: string, role: string): Promise<Participant> => {
    const response = await axios.post(`${API_BASE_URL}/api/renku/${renkuId}/participant`, {
      name,
      role
    });
    return response.data;
  },

  // 参加者の名前を更新
  updateParticipantName: async (renkuId: string, participantId: string, name: string): Promise<Participant> => {
    const response = await axios.put(`${API_BASE_URL}/api/renku/${renkuId}/participant/${participantId}`, {
      name
    });
    return response.data;
  },

  // 全連句一覧を取得
  getAllRenku: async (): Promise<Renku[]> => {
    const response = await axios.get(`${API_BASE_URL}/api/renku`);
    return response.data;
  },

  // 連句を更新
  updateRenku: async (renkuId: string, title: string): Promise<Renku> => {
    const response = await axios.put(`${API_BASE_URL}/api/renku/${renkuId}`, {
      title
    });
    return response.data;
  },

  // 連句を削除
  deleteRenku: async (renkuId: string): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/api/renku/${renkuId}`);
  },

  // 句を更新
  updateVerse: async (renkuId: string, verseId: string, text: string, seasonWord?: string, participantName?: string): Promise<Verse> => {
    const response = await axios.put(`${API_BASE_URL}/api/renku/${renkuId}/verse/${verseId}`, {
      text,
      seasonWord,
      participantName
    });
    return response.data;
  }
};




