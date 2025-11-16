import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDatabase } from './database';
import { setupRoutes } from './routes';
import { setupSocketIO } from './socket';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }
});

const PORT = parseInt(process.env.PORT || '3000', 10);

// ミドルウェア
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
console.log('FRONTEND_URL:', frontendUrl);
const corsOptions = {
  origin: frontendUrl,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());

// データベース接続
connectDatabase();

// ルート設定
setupRoutes(app);

// Socket.io設定
setupSocketIO(io);

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`サーバーがポート ${PORT} で起動しました`);
});




