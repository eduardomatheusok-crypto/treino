import { Router } from 'express';
import { createWorkout, deleteWorkout, listWorkouts, updateWorkout } from '../controllers/workoutController.js';

const router = Router({ mergeParams: true });

router.get('/', listWorkouts);
router.post('/', createWorkout);
router.put('/:workoutId', updateWorkout);
router.delete('/:workoutId', deleteWorkout);

export default router;
