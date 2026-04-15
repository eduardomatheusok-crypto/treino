import express from 'express';
import cors from 'cors';
import userRoutes from './routes/userRoutes.js';
import workoutRoutes from './routes/workoutRoutes.js';
import workoutEntryRoutes from './routes/workoutEntryRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/users', userRoutes);
app.use('/api/users/:userId/workouts', workoutRoutes);
app.use('/api/users/:userId/workouts/:workoutId/entries', workoutEntryRoutes);

export default app;