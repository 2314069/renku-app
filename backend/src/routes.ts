import { Express } from 'express';
import { Server } from 'socket.io';
import { ObjectId } from 'mongodb';
import { getDatabase } from './database';
import type { Renku, Verse, Participant } from './database';

// RenkuオブジェクトをJSONレスポンス用に変換するヘルパー関数
function serializeRenku(renku: Renku): any {
  return {
    ...renku,
    _id: renku._id?.toString(),
    createdAt: renku.createdAt instanceof Date ? renku.createdAt.toISOString() : renku.createdAt,
    updatedAt: renku.updatedAt instanceof Date ? renku.updatedAt.toISOString() : renku.updatedAt,
    participants: renku.participants.map(p => ({
      ...p,
      joinedAt: p.joinedAt instanceof Date ? p.joinedAt.toISOString() : p.joinedAt
    })),
    verses: renku.verses.map(v => ({
      ...v,
      createdAt: v.createdAt instanceof Date ? v.createdAt.toISOString() : v.createdAt
    }))
  };
}

export function setupRoutes(app: Express, io: Server): void {
  // ヘルスチェック
  app.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'Renku API is running' });
  });

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Renku API is healthy' });
  });

  // 全連句一覧を取得
  app.get('/api/renku', async (req, res) => {
    try {
      const db = getDatabase();
      const renkuCollection = db.collection<Renku>('renku');
      
      const renkus = await renkuCollection
        .find({})
        .sort({ updatedAt: -1 })
        .limit(100)
        .toArray();

      // ObjectIdとDateを文字列に変換
      const response = renkus.map(renku => serializeRenku(renku));

      res.json(response);
    } catch (error) {
      console.error('連句一覧取得エラー:', error);
      res.status(500).json({ error: '連句一覧の取得に失敗しました' });
    }
  });

  // 新しい連句を作成
  app.post('/api/renku', async (req, res) => {
    try {
      const { title, participantName, role } = req.body;
      const db = getDatabase();
      const renkuCollection = db.collection<Renku>('renku');
      
      const participant: Participant = {
        id: `p_${Date.now()}`,
        name: participantName,
        joinedAt: new Date(),
        role: role || 'admin'
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

      // ObjectIdとDateを文字列に変換
      const response = serializeRenku(createdRenku);
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

      // ObjectIdとDateを文字列に変換
      const response = serializeRenku(renku);
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

      // Socket.ioで更新を通知
      const response = serializeRenku(renku);
      io.to(`renku-${id}`).emit('renku-updated', response);

      res.json(newVerse);
    } catch (error) {
      console.error('句追加エラー:', error);
      res.status(500).json({ error: '句の追加に失敗しました' });
    }
  });

  // 句を更新
  app.put('/api/renku/:id/verse/:verseId', async (req, res) => {
    try {
      const { id, verseId } = req.params;
      const { text, seasonWord, participantName } = req.body;
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

      const verse = renku.verses.find(v => v.id === verseId);
      if (!verse) {
        return res.status(404).json({ error: '句が見つかりません' });
      }

      // 句の内容を更新
      if (text !== undefined) {
        verse.text = text;
      }
      if (seasonWord !== undefined) {
        verse.seasonWord = seasonWord;
      }
      if (participantName !== undefined) {
        verse.participantName = participantName;
      }

      renku.updatedAt = new Date();

      const updateFilter = ObjectId.isValid(id)
        ? { _id: new ObjectId(id) }
        : { _id: id };

      await renkuCollection.updateOne(
        updateFilter,
        { $set: renku }
      );

      // Socket.ioで更新を通知
      const response = serializeRenku(renku);
      io.to(`renku-${id}`).emit('renku-updated', response);

      res.json(verse);
    } catch (error) {
      console.error('句更新エラー:', error);
      res.status(500).json({ error: '句の更新に失敗しました' });
    }
  });

  // 参加者を追加
  app.post('/api/renku/:id/participant', async (req, res) => {
    try {
      const { id } = req.params;
      const { name, role } = req.body;
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
        joinedAt: new Date(),
        role: role || 'participant'
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
      const response = serializeRenku(renku);
      io.to(`renku-${id}`).emit('renku-updated', response);

      res.json(participant);
    } catch (error) {
      console.error('参加者名更新エラー:', error);
      res.status(500).json({ error: '参加者名の更新に失敗しました' });
    }
  });

  // 連句を更新
  app.put('/api/renku/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { title } = req.body;
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

      // タイトルを更新
      if (title) {
        renku.title = title;
      }

      renku.updatedAt = new Date();

      const updateFilter = ObjectId.isValid(id)
        ? { _id: new ObjectId(id) }
        : { _id: id };

      await renkuCollection.updateOne(
        updateFilter,
        { $set: renku }
      );

      // Socket.ioで更新を通知
      const response = serializeRenku(renku);
      io.to(`renku-${id}`).emit('renku-updated', response);

      res.json(response);
    } catch (error) {
      console.error('連句更新エラー:', error);
      res.status(500).json({ error: '連句の更新に失敗しました' });
    }
  });

  // 連句を削除
  app.delete('/api/renku/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const db = getDatabase();
      const renkuCollection = db.collection<Renku>('renku');
      
      const deleteFilter = ObjectId.isValid(id)
        ? { _id: new ObjectId(id) }
        : { _id: id };

      const result = await renkuCollection.deleteOne(deleteFilter);

      if (result.deletedCount === 0) {
        return res.status(404).json({ error: '連句が見つかりません' });
      }

      // Socket.ioで削除を通知
      io.to(`renku-${id}`).emit('renku-deleted', { id });

      res.json({ message: '連句が削除されました', id });
    } catch (error) {
      console.error('連句削除エラー:', error);
      res.status(500).json({ error: '連句の削除に失敗しました' });
    }
  });
}

