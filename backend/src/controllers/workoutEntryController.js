import mongoose from 'mongoose';
import Workout from '../models/Workout.js';
import WorkoutEntry from '../models/WorkoutEntry.js';
import { appendComparisons } from '../services/comparisonService.js';

function sanitizeExercisePayload(exercises) {
  return exercises
    .map((exercise) => ({
      name: String(exercise.name).trim(),
      sets: (exercise.sets || [])
        .map((setItem, index) => ({
          setNumber: index + 1,
          weightKg: Number(setItem.weightKg),
          reps: Number(setItem.reps)
        }))
        .filter(
          (setItem) =>
            Number.isFinite(setItem.weightKg) &&
            Number.isFinite(setItem.reps) &&
            setItem.weightKg >= 0 &&
            setItem.reps >= 0
        )
    }))
    .filter((exercise) => exercise.name && exercise.sets.length > 0);
}

export async function createWorkoutEntry(req, res) {
  try {
    const { userId, workoutId } = req.params;
    const { performedAt, exercises } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(workoutId)) {
      return res.status(400).json({ message: 'userId ou workoutId invalido.' });
    }

    if (!performedAt || !Array.isArray(exercises) || exercises.length === 0) {
      return res.status(400).json({ message: 'performedAt e exercicios sao obrigatorios.' });
    }

    const workout = await Workout.findOne({ _id: workoutId, userId });

    if (!workout) {
      return res.status(404).json({ message: 'Treino nao encontrado para este usuario.' });
    }

    const sanitizedExercises = sanitizeExercisePayload(exercises);
    if (sanitizedExercises.length === 0) {
      return res.status(400).json({ message: 'Nenhum exercicio valido foi enviado.' });
    }
    const entryDate = new Date(performedAt);

    const exercisesWithComparison = await appendComparisons({
      userId,
      workoutId,
      performedAt: entryDate,
      exercises: sanitizedExercises
    });

    const entry = await WorkoutEntry.create({
      userId,
      workoutId,
      performedAt: entryDate,
      exercises: exercisesWithComparison
    });

    return res.status(201).json(entry);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao registrar treino.', error: error.message });
  }
}

export async function listWorkoutEntries(req, res) {
  try {
    const { userId, workoutId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(workoutId)) {
      return res.status(400).json({ message: 'userId ou workoutId invalido.' });
    }

    const entries = await WorkoutEntry.find({ userId, workoutId })
      .sort({ performedAt: -1 })
      .limit(60);

    return res.json(entries);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao listar historico.', error: error.message });
  }
}
