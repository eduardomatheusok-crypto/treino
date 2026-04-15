import { useEffect, useMemo, useState } from 'react';

function createSet(setNumber) {
  return { setNumber, weightKg: '', reps: '' };
}

export default function EntryForm({ workout, onSubmit, loading }) {
  const initialState = useMemo(() => {
    const result = {};

    workout.exercises.forEach((exercise) => {
      result[exercise.name] = [createSet(1)];
    });

    return result;
  }, [workout]);

  const [performedAt, setPerformedAt] = useState(new Date().toISOString().slice(0, 10));
  const [exerciseSets, setExerciseSets] = useState(initialState);

  useEffect(() => {
    setExerciseSets(initialState);
  }, [initialState]);

  function addSet(exerciseName) {
    setExerciseSets((prev) => {
      const nextSets = [...prev[exerciseName], createSet(prev[exerciseName].length + 1)];
      return { ...prev, [exerciseName]: nextSets };
    });
  }

  function updateSet(exerciseName, index, field, value) {
    setExerciseSets((prev) => {
      const nextSets = prev[exerciseName].map((setItem, setIndex) =>
        setIndex === index ? { ...setItem, [field]: value } : setItem
      );

      return { ...prev, [exerciseName]: nextSets };
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const exercises = workout.exercises.map((exercise) => ({
      name: exercise.name,
      sets: (exerciseSets[exercise.name] || [])
        .map((setItem) => ({
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
    }));

    await onSubmit({
      performedAt: `${performedAt}T12:00:00.000Z`,
      exercises
    });

    setExerciseSets(initialState);
  }

  return (
    <section className="card">
      <h2>Registrar {workout.name}</h2>
      <form onSubmit={handleSubmit} className="stack-md">
        <label className="label">
          Data
          <input
            className="input"
            type="date"
            value={performedAt}
            onChange={(event) => setPerformedAt(event.target.value)}
          />
        </label>

        {workout.exercises.map((exercise) => (
          <article key={exercise.name} className="exercise-box">
            <header className="exercise-header">
              <h3>{exercise.name}</h3>
              <button type="button" className="btn btn-secondary" onClick={() => addSet(exercise.name)}>
                + Serie
              </button>
            </header>

            <div className="stack-xs">
              {(exerciseSets[exercise.name] || []).map((setItem, index) => (
                <div className="set-row" key={`${exercise.name}-${index}`}>
                  <span className="set-number">S{setItem.setNumber}</span>
                  <input
                    className="input"
                    type="number"
                    step="0.5"
                    min="0"
                    placeholder="kg"
                    value={setItem.weightKg}
                    onChange={(event) => updateSet(exercise.name, index, 'weightKg', event.target.value)}
                  />
                  <input
                    className="input"
                    type="number"
                    min="0"
                    placeholder="reps"
                    value={setItem.reps}
                    onChange={(event) => updateSet(exercise.name, index, 'reps', event.target.value)}
                  />
                </div>
              ))}
            </div>
          </article>
        ))}

        <button className="btn" disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar treino'}
        </button>
      </form>
    </section>
  );
}
