import mongoose from 'mongoose';

const workoutExerciseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    order: { type: Number, required: true }
  },
  { _id: false }
);

const workoutSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    exercises: { type: [workoutExerciseSchema], default: [] }
  },
  { timestamps: true }
);

workoutSchema.index({ userId: 1, name: 1 }, { unique: true });

export default mongoose.model('Workout', workoutSchema);