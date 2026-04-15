import mongoose from 'mongoose';
import Workout from '../models/Workout.js';
import WorkoutEntry from '../models/WorkoutEntry.js';
import { recalculateWorkoutComparisons } from '../services/comparisonService.js';

function sanitizeExercisePayload(exercises) {
  return exercises
    .map((exercise) => ({
      name: String(exercise?.name || '').trim(),
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

function parsePerformedAt(performedAt) {
  const parsed = new Date(performedAt);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed;
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
    const entryDate = parsePerformedAt(performedAt);
    if (!entryDate) {
      return res.status(400).json({ message: 'performedAt invalido.' });
    }

    const entry = await WorkoutEntry.create({
      userId,
      workoutId,
      performedAt: entryDate,
      exercises: sanitizedExercises
    });

    await recalculateWorkoutComparisons({ userId, workoutId });
    const refreshedEntry = await WorkoutEntry.findById(entry._id);

    return res.status(201).json(refreshedEntry || entry);
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

export async function updateWorkoutEntry(req, res) {
  try {
    const { userId, workoutId, entryId } = req.params;
    const { performedAt, exercises } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(workoutId) ||
      !mongoose.Types.ObjectId.isValid(entryId)
    ) {
      return res.status(400).json({ message: 'userId, workoutId ou entryId invalido.' });
    }

    const entry = await WorkoutEntry.findOne({ _id: entryId, userId, workoutId });
    if (!entry) {
      return res.status(404).json({ message: 'Registro nao encontrado para este treino.' });
    }

    const sanitizedExercises = sanitizeExercisePayload(exercises || []);
    if (sanitizedExercises.length === 0) {
      return res.status(400).json({ message: 'Nenhum exercicio valido foi enviado.' });
    }

    const nextPerformedAt = parsePerformedAt(performedAt || entry.performedAt);
    if (!nextPerformedAt) {
      return res.status(400).json({ message: 'performedAt invalido.' });
    }

    entry.performedAt = nextPerformedAt;
    entry.exercises = sanitizedExercises;
    await entry.save();

    await recalculateWorkoutComparisons({ userId, workoutId });
    const refreshedEntry = await WorkoutEntry.findById(entryId);

    return res.json(refreshedEntry || entry);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao atualizar registro.', error: error.message });
  }
}

export async function deleteWorkoutEntry(req, res) {
  try {
    const { userId, workoutId, entryId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(workoutId) ||
      !mongoose.Types.ObjectId.isValid(entryId)
    ) {
      return res.status(400).json({ message: 'userId, workoutId ou entryId invalido.' });
    }

    const deletedEntry = await WorkoutEntry.findOneAndDelete({ _id: entryId, userId, workoutId });

    if (!deletedEntry) {
      return res.status(404).json({ message: 'Registro nao encontrado para este treino.' });
    }

    await recalculateWorkoutComparisons({ userId, workoutId });

    return res.json({ message: 'Registro excluido com sucesso.' });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao excluir registro.', error: error.message });
  }
}
