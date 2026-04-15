import mongoose from 'mongoose';
import Workout from '../models/Workout.js';
import WorkoutEntry from '../models/WorkoutEntry.js';

function parseWorkoutPayload(name, exercises) {
  const parsedName = String(name || '').trim();

  const parsedExercises = (Array.isArray(exercises) ? exercises : [])
    .map((exerciseName) => String(exerciseName || '').trim())
    .filter(Boolean)
    .map((exerciseName, index) => ({
      name: exerciseName,
      order: index + 1
    }));

  return { parsedName, parsedExercises };
}

export async function createWorkout(req, res) {
  try {
    const { userId } = req.params;
    const { name, exercises } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'userId invalido.' });
    }

    const { parsedName, parsedExercises } = parseWorkoutPayload(name, exercises);

    if (!parsedName || parsedExercises.length === 0) {
      return res.status(400).json({ message: 'Nome e lista de exercicios sao obrigatorios.' });
    }

    const workout = await Workout.create({
      userId,
      name: parsedName,
      exercises: parsedExercises
    });

    return res.status(201).json(workout);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Ja existe treino com esse nome para este usuario.' });
    }

    return res.status(500).json({ message: 'Erro ao criar treino.', error: error.message });
  }
}

export async function listWorkouts(req, res) {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'userId invalido.' });
    }

    const workouts = await Workout.find({ userId }).sort({ createdAt: 1 });
    return res.json(workouts);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao listar treinos.', error: error.message });
  }
}

export async function updateWorkout(req, res) {
  try {
    const { userId, workoutId } = req.params;
    const { name, exercises } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(workoutId)) {
      return res.status(400).json({ message: 'userId ou workoutId invalido.' });
    }

    const { parsedName, parsedExercises } = parseWorkoutPayload(name, exercises);

    if (!parsedName || parsedExercises.length === 0) {
      return res.status(400).json({ message: 'Nome e lista de exercicios sao obrigatorios.' });
    }

    const updated = await Workout.findOneAndUpdate(
      { _id: workoutId, userId },
      { name: parsedName, exercises: parsedExercises },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Treino nao encontrado para este usuario.' });
    }

    return res.json(updated);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Ja existe treino com esse nome para este usuario.' });
    }

    return res.status(500).json({ message: 'Erro ao atualizar treino.', error: error.message });
  }
}

export async function deleteWorkout(req, res) {
  try {
    const { userId, workoutId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(workoutId)) {
      return res.status(400).json({ message: 'userId ou workoutId invalido.' });
    }

    const deletedWorkout = await Workout.findOneAndDelete({ _id: workoutId, userId });

    if (!deletedWorkout) {
      return res.status(404).json({ message: 'Treino nao encontrado para este usuario.' });
    }

    await WorkoutEntry.deleteMany({ userId, workoutId });

    return res.json({ message: 'Treino excluido com sucesso.' });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao excluir treino.', error: error.message });
  }
}
