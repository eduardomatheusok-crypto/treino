import mongoose from 'mongoose';
import Workout from '../models/Workout.js';

export async function createWorkout(req, res) {
  try {
    const { userId } = req.params;
    const { name, exercises } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'userId invalido.' });
    }

    if (!name || !Array.isArray(exercises) || exercises.length === 0) {
      return res.status(400).json({ message: 'Nome e lista de exercicios sao obrigatorios.' });
    }

    const parsedExercises = exercises.map((exerciseName, index) => ({
      name: String(exerciseName).trim(),
      order: index + 1
    }));

    const workout = await Workout.create({
      userId,
      name: String(name).trim(),
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