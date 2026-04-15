import WorkoutEntry from '../models/WorkoutEntry.js';

function getExerciseSummary(exercise) {
  const currentWeightKg = exercise.sets.reduce((acc, setItem) => Math.max(acc, setItem.weightKg), 0);
  const currentReps = exercise.sets.reduce((acc, setItem) => acc + setItem.reps, 0);

  return { currentWeightKg, currentReps };
}

function buildComparison(currentWeightKg, currentReps, previousWeightKg, previousReps) {
  const diffWeightKg = Number((currentWeightKg - previousWeightKg).toFixed(2));
  const diffReps = currentReps - previousReps;

  if (diffWeightKg > 0 && diffReps < 0) {
    return {
      previousWeightKg,
      previousReps,
      currentWeightKg,
      currentReps,
      diffWeightKg,
      diffReps,
      status: 'parcial_carga',
      highlight: 'carga'
    };
  }

  if (diffWeightKg < 0 && diffReps > 0) {
    return {
      previousWeightKg,
      previousReps,
      currentWeightKg,
      currentReps,
      diffWeightKg,
      diffReps,
      status: 'parcial_repeticoes',
      highlight: 'repeticoes'
    };
  }

  if (diffWeightKg < 0 && diffReps < 0) {
    return {
      previousWeightKg,
      previousReps,
      currentWeightKg,
      currentReps,
      diffWeightKg,
      diffReps,
      status: 'regressao_total',
      highlight: 'nenhum'
    };
  }

  if (diffWeightKg > 0 || diffReps > 0) {
    return {
      previousWeightKg,
      previousReps,
      currentWeightKg,
      currentReps,
      diffWeightKg,
      diffReps,
      status: 'progresso',
      highlight: 'nenhum'
    };
  }

  if (diffWeightKg < 0 || diffReps < 0) {
    return {
      previousWeightKg,
      previousReps,
      currentWeightKg,
      currentReps,
      diffWeightKg,
      diffReps,
      status: 'regressao',
      highlight: 'nenhum'
    };
  }

  return {
    previousWeightKg,
    previousReps,
    currentWeightKg,
    currentReps,
    diffWeightKg,
    diffReps,
    status: 'estavel',
    highlight: 'nenhum'
  };
}

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

async function findPreviousExercise(userId, workoutId, performedAt, exerciseName) {
  const previousEntry = await WorkoutEntry.findOne({
    userId,
    workoutId,
    performedAt: { $lt: performedAt },
    'exercises.name': exerciseName
  })
    .sort({ performedAt: -1 })
    .lean();

  if (!previousEntry) {
    return { previousWeightKg: 0, previousReps: 0 };
  }

  const previousExercise = previousEntry.exercises.find((exercise) => exercise.name === exerciseName);

  if (!previousExercise) {
    return { previousWeightKg: 0, previousReps: 0 };
  }

  const previousWeightKg = previousExercise.sets.reduce((acc, setItem) => Math.max(acc, setItem.weightKg), 0);
  const previousReps = previousExercise.sets.reduce((acc, setItem) => acc + setItem.reps, 0);

  return { previousWeightKg, previousReps };
}

export async function appendComparisons({ userId, workoutId, performedAt, exercises }) {
  const exercisesWithComparison = [];

  for (const exercise of exercises) {
    const { currentWeightKg, currentReps } = getExerciseSummary(exercise);
    const { previousWeightKg, previousReps } = await findPreviousExercise(
      userId,
      workoutId,
      performedAt,
      exercise.name
    );

    const comparison = buildComparison(currentWeightKg, currentReps, previousWeightKg, previousReps);

    exercisesWithComparison.push({
      ...exercise,
      comparison
    });
  }

  return exercisesWithComparison;
}

export async function recalculateWorkoutComparisons({ userId, workoutId }) {
  const entries = await WorkoutEntry.find({ userId, workoutId }).sort({ performedAt: 1, createdAt: 1, _id: 1 });
  const latestSummaryByExercise = new Map();

  for (const entry of entries) {
    entry.exercises = entry.exercises.map((exercise) => {
      const normalizedExercise = {
        name: String(exercise.name || '').trim(),
        sets: (exercise.sets || []).map((setItem, index) => ({
          setNumber: index + 1,
          weightKg: toNumber(setItem.weightKg),
          reps: toNumber(setItem.reps)
        }))
      };

      const previous = latestSummaryByExercise.get(normalizedExercise.name) || {
        currentWeightKg: 0,
        currentReps: 0
      };

      const current = getExerciseSummary(normalizedExercise);

      const comparison = buildComparison(
        current.currentWeightKg,
        current.currentReps,
        previous.currentWeightKg,
        previous.currentReps
      );

      latestSummaryByExercise.set(normalizedExercise.name, current);

      return {
        ...normalizedExercise,
        comparison
      };
    });

    await entry.save();
  }
}
