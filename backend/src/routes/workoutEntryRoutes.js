import { Router } from 'express';
import { createWorkoutEntry, listWorkoutEntries } from '../controllers/workoutEntryController.js';

const router = Router({ mergeParams: true });

router.get('/', listWorkoutEntries);
router.post('/', createWorkoutEntry);

export default router;