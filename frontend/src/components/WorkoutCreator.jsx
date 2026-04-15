import { useState } from 'react';

const EMPTY_EXERCISE = '';

export default function WorkoutCreator({ onCreate, loading }) {
  const [name, setName] = useState('');
  const [exercises, setExercises] = useState([EMPTY_EXERCISE, EMPTY_EXERCISE]);

  function updateExercise(index, value) {
    setExercises((prev) => prev.map((item, idx) => (idx === index ? value : item)));
  }

  function addExerciseField() {
    setExercises((prev) => [...prev, EMPTY_EXERCISE]);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const parsedExercises = exercises.map((item) => item.trim()).filter(Boolean);

    if (!name.trim() || parsedExercises.length === 0) {
      return;
    }

    await onCreate({
      name: name.trim(),
      exercises: parsedExercises
    });

    setName('');
    setExercises([EMPTY_EXERCISE, EMPTY_EXERCISE]);
  }

  return (
    <section className="card">
      <h2>Novo treino</h2>
      <form onSubmit={handleSubmit} className="stack-sm">
        <input
          className="input"
          placeholder="Nome (ex: Treino A)"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />

        {exercises.map((exercise, index) => (
          <input
            key={`exercise-${index}`}
            className="input"
            placeholder={`Exercicio ${index + 1}`}
            value={exercise}
            onChange={(event) => updateExercise(index, event.target.value)}
          />
        ))}

        <button type="button" className="btn btn-secondary" onClick={addExerciseField}>
          + Adicionar exercicio
        </button>

        <button className="btn" disabled={loading}>
          {loading ? 'Salvando...' : 'Criar treino'}
        </button>
      </form>
    </section>
  );
}