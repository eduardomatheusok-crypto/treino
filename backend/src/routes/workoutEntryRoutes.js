import { Router } from 'express';
import {
  createWorkoutEntry,
  deleteWorkoutEntry,
  listWorkoutEntries,
  updateWorkoutEntry
} from '../controllers/workoutEntryController.js';

const router = Router({ mergeParams: true });

router.get('/', listWorkoutEntries);
router.post('/', createWorkoutEntry);
router.put('/:entryId', updateWorkoutEntry);
router.delete('/:entryId', deleteWorkoutEntry);

export default router;
