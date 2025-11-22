import { Server } from 'socket.io';
import { ObjectId } from 'mongodb';
import { getDatabase } from './database';
import type { Renku } from './database';

export function setupSocketIO(io: Server): void {
  io.on('connection', (socket) => {
    console.log('クライアントが接続しました:', socket.id);

    // 連句ルームに参加
    socket.on('join-renku', async (renkuId: string) => {
      socket.join(`renku-${renkuId}`);
      console.log(`クライアント ${socket.id} が連句 ${renkuId} に参加しました`);

      // 最新の連句データを送信
      try {
        const db = getDatabase();
        const renkuCollection = db.collection<Renku>('renku');
        
        let renku;
        if (ObjectId.isValid(renkuId)) {
          renku = await renkuCollection.findOne({ _id: new ObjectId(renkuId) });
        } else {
          renku = await renkuCollection.findOne({ _id: renkuId });
        }

        if (renku) {
          const response = {
            ...renku,
            _id: renku._id?.toString()
          };
          socket.emit('renku-updated', response);
        }
      } catch (error) {
        console.error('連句取得エラー:', error);
      }
    });

    // 連句ルームから退出
    socket.on('leave-renku', (renkuId: string) => {
      socket.leave(`renku-${renkuId}`);
      console.log(`クライアント ${socket.id} が連句 ${renkuId} から退出しました`);
    });

    // 句が追加されたとき
    socket.on('verse-added', async (data: { renkuId: string }) => {
      try {
        const db = getDatabase();
        const renkuCollection = db.collection<Renku>('renku');
        
        let renku;
        if (ObjectId.isValid(data.renkuId)) {
          renku = await renkuCollection.findOne({ _id: new ObjectId(data.renkuId) });
        } else {
          renku = await renkuCollection.findOne({ _id: data.renkuId });
        }

        if (renku) {
          const response = {
            ...renku,
            _id: renku._id?.toString()
          };
          // 同じルーム内の全員に通知
          io.to(`renku-${data.renkuId}`).emit('renku-updated', response);
        }
      } catch (error) {
        console.error('句追加通知エラー:', error);
      }
    });

    // 切断時
    socket.on('disconnect', () => {
      console.log('クライアントが切断しました:', socket.id);
    });
  });
}

