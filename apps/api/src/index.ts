import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables FIRST before any other imports
const envPath = path.resolve(__dirname, '../.env');
const result = dotenv.config({ path: envPath });
console.log('📝 Loading .env from:', envPath);
console.log('📝 .env loaded:', !result.error);
if (result.error) console.error('.env error:', result.error);

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import passport, { initializePassport } from './config/passport.js';
import { startEventReminderScheduler } from './services/eventReminderService.js';

// Initialize Passport strategies after env vars are loaded
initializePassport();

// Start event reminder scheduler
startEventReminderScheduler();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Initialize Passport
app.use(passport.initialize());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.get('/', (req, res) => {
  res.json({ message: 'The Ember Society API' });
});

// Auth routes (OAuth) - imported after passport initialization
const authRoutes = (await import('./routes/auth.js')).default;
app.use('/api/auth', authRoutes);

// User routes
const userRoutes = (await import('./routes/users.js')).default;
app.use('/api/users', userRoutes);

// Post routes
const postRoutes = (await import('./routes/posts.js')).default;
app.use('/api/posts', postRoutes);

// Club routes
const clubRoutes = (await import('./routes/clubs.js')).default;
app.use('/api/clubs', clubRoutes);

// Upload routes
const uploadRoutes = (await import('./routes/upload.js')).default;
app.use('/api/upload', uploadRoutes);

// Message routes
const messageRoutes = (await import('./routes/messages.js')).default;
app.use('/api/messages', messageRoutes);

// Event routes
const eventRoutes = (await import('./routes/events.js')).default;
app.use('/api', eventRoutes);

// Notification routes
const notificationRoutes = (await import('./routes/notifications.js')).default;
app.use('/api/notifications', notificationRoutes);

// Review routes
const reviewRoutes = (await import('./routes/reviews.js')).default;
app.use('/api/reviews', reviewRoutes);

// Report routes
const reportRoutes = (await import('./routes/reports.js')).default;
app.use('/api/reports', reportRoutes);

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
