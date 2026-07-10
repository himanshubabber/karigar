import dotenv from "dotenv";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

import mongoose from 'mongoose';
import { AdminMessage } from '../src/models/adminMessage.model.js';
import { DB_NAME } from '../src/constants.js';

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: DB_NAME });
    console.log('Connected to MongoDB for seeding messages');

    const now = new Date();
    const seed = [
      { toEmail: 'test.user1@example.com', subject: 'Welcome', body: 'Welcome to Karigar test DB', sentBy: 'system', createdAt: now },
      { toEmail: 'customer1@example.com', subject: 'Policy Update', body: 'This is a test message for database view', sentBy: 'admin@example.com', createdAt: now },
    ];

    await AdminMessage.insertMany(seed);
    console.log('Seeded messages');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed', err);
    process.exit(1);
  }
};

run();
