import { useEffect, useMemo, useRef, useState } from 'react';

function createSet(index = 1, source = {}) {
  return {
    id: `${Date.now()}-${Math.random()}`,
    setNumber: index,
    weightKg: source.weightKg ?? '',
    reps: source.reps ?? ''
  };
}

function createExercise(index = 1, source = {}) {
  const sourceSets = Array.isArray(source.sets) && source.sets.length > 0 ? source.sets : [{}];
  return {
    id: `${Date.now()}-${Math.random()}`,
    name: source.name ?? `Exercicio ${index}`,
    sets: sourceSets.map((setItem, setIndex) => createSet(setIndex + 1, setItem))
  };
}

function normalizeSetOrder(exercises) {
  return exercises.map((exercise) => ({
    ...exercise,
    sets: exercise.sets.map((setItem, index) => ({
      ...setItem,
      setNumber: index + 1
    }))
  }));
}

export default function EntryForm({ workout, onSubmit, loading, initialEntry = null, onCancelEdit = null }) {
  const seededExercises = useMemo(() => {
    if (initialEntry?.exercises?.length) {
      return initialEntry.exercises.map((exercise, index) => createExercise(index + 1, exercise));
    }

    if (workout?.exercises?.length) {
      return workout.exercises.map((exercise, index) => createExercise(index + 1, { name: exercise.name }));
    }

    return [createExercise(1)];
  }, [initialEntry, workout]);

  const [performedAt, setPerformedAt] = useState(new Date().toISOString().slice(0, 10));
  const [exerciseItems, setExerciseItems] = useState(seededExercises);
  const isEditing = Boolean(initialEntry?._id);
  const mountedRef = useRef(false);

  useEffect(() => {
    setExerciseItems(seededExercises);
  }, [seededExercises]);

  useEffect(() => {
    if (isEditing && initialEntry?.performedAt) {
      setPerformedAt(new Date(initialEntry.performedAt).toISOString().slice(0, 10));
      return;
    }

    if (!mountedRef.current) {
      mountedRef.current = true;
    }

    setPerformedAt(new Date().toISOString().slice(0, 10));
  }, [isEditing, initialEntry]);

  function updateExerciseName(exerciseId, value) {
    setExerciseItems((prev) =>
      prev.map((exercise) => (exercise.id === exerciseId ? { ...exercise, name: value } : exercise))
    );
  }

  function addExercise() {
    setExerciseItems((prev) => [...prev, createExercise(prev.length + 1)]);
  }

  function removeExercise(exerciseId) {
    setExerciseItems((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((exercise) => exercise.id !== exerciseId);
    });
  }

  function addSet(exerciseId) {
    setExerciseItems((prev) =>
      normalizeSetOrder(
        prev.map((exercise) => {
          if (exercise.id !== exerciseId) return exercise;
          return { ...exercise, sets: [...exercise.sets, createSet(exercise.sets.length + 1)] };
        })
      )
    );
  }

  function removeSet(exerciseId, setId) {
    setExerciseItems((prev) =>
      normalizeSetOrder(
        prev.map((exercise) => {
          if (exercise.id !== exerciseId) return exercise;
          if (exercise.sets.length <= 1) return exercise;
          return { ...exercise, sets: exercise.sets.filter((setItem) => setItem.id !== setId) };
        })
      )
    );
  }

  function updateSet(exerciseId, setId, field, value) {
    setExerciseItems((prev) =>
      prev.map((exercise) => {
        if (exercise.id !== exerciseId) return exercise;
        return {
          ...exercise,
          sets: exercise.sets.map((setItem) =>
            setItem.id === setId ? { ...setItem, [field]: value } : setItem
          )
        };
      })
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const exercises = exerciseItems
      .map((exercise) => ({
        name: String(exercise.name || '').trim(),
        sets: exercise.sets
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
      }))
      .filter((exercise) => exercise.name && exercise.sets.length > 0);

    if (exercises.length === 0) {
      return;
    }

    await onSubmit({
      performedAt: `${performedAt}T12:00:00.000Z`,
      exercises
    });

    if (!isEditing) {
      setExerciseItems(seededExercises);
    }
  }

  return (
    <section className="card">
      <h2>{isEditing ? `Editar registro de ${workout.name}` : `Registrar ${workout.name}`}</h2>
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

        {exerciseItems.map((exercise, exerciseIndex) => (
          <article key={exercise.id} className="exercise-box">
            <header className="exercise-header">
              <input
                className="input"
                value={exercise.name}
                onChange={(event) => updateExerciseName(exercise.id, event.target.value)}
                placeholder={`Exercicio ${exerciseIndex + 1}`}
              />
              <div className="action-row-tight">
                <button type="button" className="btn btn-secondary btn-inline" onClick={() => addSet(exercise.id)}>
                  + Serie
                </button>
                <button
                  type="button"
                  className="btn btn-danger btn-inline"
                  onClick={() => removeExercise(exercise.id)}
                >
                  Excluir exercicio
                </button>
              </div>
            </header>

            <div className="stack-xs">
              {exercise.sets.map((setItem) => (
                <div className="set-row" key={setItem.id}>
                  <span className="set-number">S{setItem.setNumber}</span>
                  <input
                    className="input"
                    type="number"
                    step="0.5"
                    min="0"
                    placeholder="kg"
                    value={setItem.weightKg}
                    onChange={(event) => updateSet(exercise.id, setItem.id, 'weightKg', event.target.value)}
                  />
                  <input
                    className="input"
                    type="number"
                    min="0"
                    placeholder="reps"
                    value={setItem.reps}
                    onChange={(event) => updateSet(exercise.id, setItem.id, 'reps', event.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn-danger btn-inline"
                    onClick={() => removeSet(exercise.id, setItem.id)}
                  >
                    Excluir serie
                  </button>
                </div>
              ))}
            </div>
          </article>
        ))}

        <button type="button" className="btn btn-secondary" onClick={addExercise}>
          + Adicionar exercicio
        </button>

        <div className="action-row">
          <button className="btn" disabled={loading}>
            {loading ? 'Salvando...' : isEditing ? 'Salvar alteracoes' : 'Salvar treino'}
          </button>
          {isEditing && onCancelEdit && (
            <button type="button" className="btn btn-secondary" onClick={onCancelEdit}>
              Cancelar edicao
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
