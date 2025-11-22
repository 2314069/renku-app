import { MongoClient, Db, ObjectId } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'renku-app';

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectDatabase(): Promise<void> {
  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(DB_NAME);
    console.log('MongoDBに接続しました');
  } catch (error) {
    console.error('MongoDB接続エラー:', error);
    throw error;
  }
}

export function getDatabase(): Db {
  if (!db) {
    throw new Error('データベースが接続されていません');
  }
  return db;
}

export interface Renku {
  _id?: ObjectId | string;
  title: string;
  participants: Participant[];
  verses: Verse[];
  currentTurn: number;
  createdAt: Date;
  updatedAt: Date;
  completed: boolean;
}

export interface Participant {
  id: string;
  name: string;
  joinedAt: Date;
  role?: 'admin' | 'participant';
}

export interface Verse {
  id: string;
  participantId: string;
  participantName: string;
  text: string;
  type: '575' | '77';
  order: number;
  createdAt: Date;
  seasonWord?: string;
}

