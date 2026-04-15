import mongoose from 'mongoose';

const setSchema = new mongoose.Schema(
  {
    setNumber: { type: Number, required: true },
    weightKg: { type: Number, required: true, min: 0 },
    reps: { type: Number, required: true, min: 0 }
  },
  { _id: false }
);

const comparisonSchema = new mongoose.Schema(
  {
    previousWeightKg: { type: Number, default: 0 },
    previousReps: { type: Number, default: 0 },
    currentWeightKg: { type: Number, default: 0 },
    currentReps: { type: Number, default: 0 },
    diffWeightKg: { type: Number, default: 0 },
    diffReps: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['progresso', 'regressao', 'parcial_carga', 'parcial_repeticoes', 'regressao_total', 'estavel'],
      default: 'estavel'
    },
    highlight: { type: String, enum: ['carga', 'repeticoes', 'nenhum'], default: 'nenhum' }
  },
  { _id: false }
);

const entryExerciseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    sets: { type: [setSchema], default: [] },
    comparison: { type: comparisonSchema, default: () => ({}) }
  },
  { _id: false }
);

const workoutEntrySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    workoutId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workout', required: true, index: true },
    performedAt: { type: Date, required: true, index: true },
    exercises: { type: [entryExerciseSchema], default: [] }
  },
  { timestamps: true }
);

workoutEntrySchema.index({ userId: 1, workoutId: 1, performedAt: -1 });

export default mongoose.model('WorkoutEntry', workoutEntrySchema);