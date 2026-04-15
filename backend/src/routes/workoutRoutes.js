import { Router } from 'express';
import { createWorkout, listWorkouts } from '../controllers/workoutController.js';

const router = Router({ mergeParams: true });

router.get('/', listWorkouts);
router.post('/', createWorkout);

export default router;