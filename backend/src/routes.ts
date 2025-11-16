import { Express } from 'express';
import { Server } from 'socket.io';
import { ObjectId } from 'mongodb';
import { getDatabase } from './database';
import type { Renku, Verse, Participant } from './database';

export function setupRoutes(app: Express, io: Server): void {
  // ヘルスチェック
  app.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'Renku API is running' });
  });

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Renku API is healthy' });
  });

  // 新しい連句を作成
  app.post('/api/renku', async (req, res) => {
    try {
      const { title, participantName } = req.body;
      const db = getDatabase();
      const renkuCollection = db.collection<Renku>('renku');
      
      const participant: Participant = {
        id: `p_${Date.now()}`,
        name: participantName,
        joinedAt: new Date()
      };

      const renku: Omit<Renku, '_id'> = {
        title: title || '無題',
        participants: [participant],
        verses: [],
        currentTurn: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        completed: false
      };

      const result = await renkuCollection.insertOne(renku as Renku);
      const createdRenku = await renkuCollection.findOne({ _id: result.insertedId });

      if (!createdRenku) {
        return res.status(500).json({ error: '連句の作成に失敗しました' });
      }

      // ObjectIdを文字列に変換
      const response = {
        ...createdRenku,
        _id: createdRenku._id?.toString()
      };

      res.json(response);
    } catch (error) {
      console.error('連句作成エラー:', error);
      res.status(500).json({ error: '連句の作成に失敗しました' });
    }
  });

  // 連句を取得
  app.get('/api/renku/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const db = getDatabase();
      const renkuCollection = db.collection<Renku>('renku');
      
      let renku;
      if (ObjectId.isValid(id)) {
        renku = await renkuCollection.findOne({ _id: new ObjectId(id) });
      } else {
        renku = await renkuCollection.findOne({ _id: id });
      }

      if (!renku) {
        return res.status(404).json({ error: '連句が見つかりません' });
      }

      // ObjectIdを文字列に変換
      const response = {
        ...renku,
        _id: renku._id?.toString()
      };

      res.json(response);
    } catch (error) {
      console.error('連句取得エラー:', error);
      res.status(500).json({ error: '連句の取得に失敗しました' });
    }
  });

  // 句を追加
  app.post('/api/renku/:id/verse', async (req, res) => {
    try {
      const { id } = req.params;
      const { participantId, text, seasonWord } = req.body;
      const db = getDatabase();
      const renkuCollection = db.collection<Renku>('renku');
      
      let renku;
      if (ObjectId.isValid(id)) {
        renku = await renkuCollection.findOne({ _id: new ObjectId(id) });
      } else {
        renku = await renkuCollection.findOne({ _id: id });
      }

      if (!renku) {
        return res.status(404).json({ error: '連句が見つかりません' });
      }

      const participant = renku.participants.find(p => p.id === participantId);
      if (!participant) {
        return res.status(404).json({ error: '参加者が見つかりません' });
      }

      const verseType: '575' | '77' = renku.verses.length === 0 ? '575' : 
        renku.verses[renku.verses.length - 1].type === '575' ? '77' : '575';

      const newVerse: Verse = {
        id: `v_${Date.now()}`,
        participantId,
        participantName: participant.name,
        text,
        type: verseType,
        order: renku.verses.length + 1,
        createdAt: new Date(),
        seasonWord
      };

      renku.verses.push(newVerse);
      renku.currentTurn = (renku.currentTurn + 1) % renku.participants.length;
      renku.updatedAt = new Date();

      const updateFilter = ObjectId.isValid(id) 
        ? { _id: new ObjectId(id) }
        : { _id: id };

      await renkuCollection.updateOne(
        updateFilter,
        { $set: renku }
      );

      res.json(newVerse);
    } catch (error) {
      console.error('句追加エラー:', error);
      res.status(500).json({ error: '句の追加に失敗しました' });
    }
  });

  // 参加者を追加
  app.post('/api/renku/:id/participant', async (req, res) => {
    try {
      const { id } = req.params;
      const { name } = req.body;
      const db = getDatabase();
      const renkuCollection = db.collection<Renku>('renku');
      
      let renku;
      if (ObjectId.isValid(id)) {
        renku = await renkuCollection.findOne({ _id: new ObjectId(id) });
      } else {
        renku = await renkuCollection.findOne({ _id: id });
      }

      if (!renku) {
        return res.status(404).json({ error: '連句が見つかりません' });
      }

      const newParticipant: Participant = {
        id: `p_${Date.now()}`,
        name,
        joinedAt: new Date()
      };

      renku.participants.push(newParticipant);
      renku.updatedAt = new Date();

      const updateFilter = ObjectId.isValid(id) 
        ? { _id: new ObjectId(id) }
        : { _id: id };

      await renkuCollection.updateOne(
        updateFilter,
        { $set: renku }
      );

      res.json(newParticipant);
    } catch (error) {
      console.error('参加者追加エラー:', error);
      res.status(500).json({ error: '参加者の追加に失敗しました' });
    }
  });

  // 参加者の名前を更新
  app.put('/api/renku/:id/participant/:participantId', async (req, res) => {
    try {
      const { id, participantId } = req.params;
      const { name } = req.body;
      const db = getDatabase();
      const renkuCollection = db.collection<Renku>('renku');
      
      let renku;
      if (ObjectId.isValid(id)) {
        renku = await renkuCollection.findOne({ _id: new ObjectId(id) });
      } else {
        renku = await renkuCollection.findOne({ _id: id });
      }

      if (!renku) {
        return res.status(404).json({ error: '連句が見つかりません' });
      }

      const participant = renku.participants.find(p => p.id === participantId);
      if (!participant) {
        return res.status(404).json({ error: '参加者が見つかりません' });
      }

      // 参加者の名前を更新
      participant.name = name;
      
      // 既存の句のparticipantNameも更新
      renku.verses.forEach(verse => {
        if (verse.participantId === participantId) {
          verse.participantName = name;
        }
      });

      renku.updatedAt = new Date();

      const updateFilter = ObjectId.isValid(id) 
        ? { _id: new ObjectId(id) }
        : { _id: id };

      await renkuCollection.updateOne(
        updateFilter,
        { $set: renku }
      );

      // Socket.ioで更新を通知
      const response = {
        ...renku,
        _id: renku._id?.toString()
      };
      io.to(`renku-${id}`).emit('renku-updated', response);

      res.json(participant);
    } catch (error) {
      console.error('参加者名更新エラー:', error);
      res.status(500).json({ error: '参加者名の更新に失敗しました' });
    }
  });
}

