import express from 'express';
import cors from 'cors';
import userRoutes from './routes/userRoutes.js';
import workoutRoutes from './routes/workoutRoutes.js';
import workoutEntryRoutes from './routes/workoutEntryRoutes.js';

const app = express();

const allowedOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Permite chamadas server-to-server e ferramentas sem header Origin.
      if (!origin) {
        return callback(null, true);
      }

      const isLocalhost =
        origin.startsWith('http://localhost:') ||
        origin.startsWith('http://127.0.0.1:');

      if (isLocalhost || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Origem nao permitida pelo CORS'));
    }
  })
);
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/users', userRoutes);
app.use('/api/users/:userId/workouts', workoutRoutes);
app.use('/api/users/:userId/workouts/:workoutId/entries', workoutEntryRoutes);

export default app;
