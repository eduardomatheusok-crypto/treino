import { useEffect, useMemo, useState } from 'react';
import WorkoutCreator from './components/WorkoutCreator';
import EntryForm from './components/EntryForm';
import HistoryList from './components/HistoryList';
import { api } from './services/api';

const EMPTY_EXERCISE = '';

export default function App() {
  const [user, setUser] = useState(null);
  const [workouts, setWorkouts] = useState([]);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState('');
  const [entries, setEntries] = useState([]);
  const [editingEntry, setEditingEntry] = useState(null);
  const [loadingCreateWorkout, setLoadingCreateWorkout] = useState(false);
  const [loadingUpdateWorkout, setLoadingUpdateWorkout] = useState(false);
  const [loadingDeleteWorkout, setLoadingDeleteWorkout] = useState(false);
  const [loadingEntry, setLoadingEntry] = useState(false);
  const [deletingEntryId, setDeletingEntryId] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [workoutDraftName, setWorkoutDraftName] = useState('');
  const [workoutDraftExercises, setWorkoutDraftExercises] = useState([EMPTY_EXERCISE]);

  const selectedWorkout = useMemo(
    () => workouts.find((item) => item._id === selectedWorkoutId) || null,
    [workouts, selectedWorkoutId]
  );

  useEffect(() => {
    async function initialize() {
      try {
        const demoUser = await api.getDemoUser();
        setUser(demoUser);

        const workoutList = await api.getWorkouts(demoUser._id);
        setWorkouts(workoutList);

        if (workoutList[0]) {
          setSelectedWorkoutId(workoutList[0]._id);
        }
      } catch (err) {
        setError(err.message);
      }
    }

    initialize();
  }, []);

  useEffect(() => {
    async function loadEntries() {
      if (!user || !selectedWorkoutId) {
        setEntries([]);
        return;
      }

      try {
        const history = await api.getEntries(user._id, selectedWorkoutId);
        setEntries(history);
      } catch (err) {
        setError(err.message);
      }
    }

    loadEntries();
  }, [user, selectedWorkoutId]);

  useEffect(() => {
    if (!selectedWorkout) {
      setWorkoutDraftName('');
      setWorkoutDraftExercises([EMPTY_EXERCISE]);
      setEditingEntry(null);
      return;
    }

    setWorkoutDraftName(selectedWorkout.name);
    setWorkoutDraftExercises(selectedWorkout.exercises.map((item) => item.name));
    setEditingEntry(null);
  }, [selectedWorkout]);

  function cleanDraftExercises() {
    return workoutDraftExercises.map((item) => item.trim()).filter(Boolean);
  }

  function updateDraftExercise(index, value) {
    setWorkoutDraftExercises((prev) => prev.map((item, idx) => (idx === index ? value : item)));
  }

  function addDraftExercise() {
    setWorkoutDraftExercises((prev) => [...prev, EMPTY_EXERCISE]);
  }

  function removeDraftExercise(index) {
    setWorkoutDraftExercises((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, idx) => idx !== index);
    });
  }

  async function handleCreateWorkout(payload) {
    if (!user) return;

    setLoadingCreateWorkout(true);
    setMessage('');
    setError('');

    try {
      const created = await api.createWorkout(user._id, payload);
      const nextWorkouts = [...workouts, created];
      setWorkouts(nextWorkouts);
      setSelectedWorkoutId(created._id);
      setMessage('Treino criado com sucesso.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingCreateWorkout(false);
    }
  }

  async function handleUpdateWorkout(event) {
    event.preventDefault();
    if (!user || !selectedWorkout) return;

    const parsedExercises = cleanDraftExercises();
    if (!workoutDraftName.trim() || parsedExercises.length === 0) {
      return;
    }

    setLoadingUpdateWorkout(true);
    setMessage('');
    setError('');

    try {
      const updated = await api.updateWorkout(user._id, selectedWorkout._id, {
        name: workoutDraftName.trim(),
        exercises: parsedExercises
      });

      setWorkouts((prev) => prev.map((workout) => (workout._id === updated._id ? updated : workout)));
      setMessage('Treino atualizado com sucesso.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingUpdateWorkout(false);
    }
  }

  async function handleDeleteWorkout() {
    if (!user || !selectedWorkout) return;

    const confirmed = window.confirm(`Deseja excluir o treino "${selectedWorkout.name}"?`);
    if (!confirmed) return;

    setLoadingDeleteWorkout(true);
    setMessage('');
    setError('');

    try {
      await api.deleteWorkout(user._id, selectedWorkout._id);

      const remaining = workouts.filter((workout) => workout._id !== selectedWorkout._id);
      setWorkouts(remaining);
      setSelectedWorkoutId(remaining[0]?._id || '');
      setEntries([]);
      setEditingEntry(null);
      setMessage('Treino excluido com sucesso.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingDeleteWorkout(false);
    }
  }

  async function handleCreateEntry(payload) {
    if (!user || !selectedWorkoutId) return;

    setLoadingEntry(true);
    setMessage('');
    setError('');

    try {
      await api.createEntry(user._id, selectedWorkoutId, payload);
      const history = await api.getEntries(user._id, selectedWorkoutId);
      setEntries(history);
      setMessage('Treino registrado. Comparacoes atualizadas.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingEntry(false);
    }
  }

  async function handleUpdateEntry(payload) {
    if (!user || !selectedWorkoutId || !editingEntry) return;

    setLoadingEntry(true);
    setMessage('');
    setError('');

    try {
      await api.updateEntry(user._id, selectedWorkoutId, editingEntry._id, payload);
      const history = await api.getEntries(user._id, selectedWorkoutId);
      setEntries(history);
      setEditingEntry(null);
      setMessage('Registro atualizado com sucesso.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingEntry(false);
    }
  }

  async function handleDeleteEntry(entry) {
    if (!user || !selectedWorkoutId) return;

    const confirmed = window.confirm('Deseja excluir este registro do historico?');
    if (!confirmed) return;

    setDeletingEntryId(entry._id);
    setMessage('');
    setError('');

    try {
      await api.deleteEntry(user._id, selectedWorkoutId, entry._id);
      const history = await api.getEntries(user._id, selectedWorkoutId);
      setEntries(history);
      if (editingEntry?._id === entry._id) {
        setEditingEntry(null);
      }
      setMessage('Registro excluido com sucesso.');
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingEntryId('');
    }
  }

  return (
    <main className="container">
      <header className="hero">
        <h1>Perfomance A.S.P</h1>
        <p>Registro e evolucao de treino com comparacao automatica por exercicio.</p>
        {user && <span className="user-tag">Usuario: {user.name}</span>}
      </header>

      {message && <p className="feedback success">{message}</p>}
      {error && <p className="feedback danger">{error}</p>}

      <WorkoutCreator onCreate={handleCreateWorkout} loading={loadingCreateWorkout} />

      <section className="card">
        <h2>Selecionar treino</h2>
        <select
          className="input"
          value={selectedWorkoutId}
          onChange={(event) => setSelectedWorkoutId(event.target.value)}
        >
          <option value="">Escolha um treino</option>
          {workouts.map((workout) => (
            <option key={workout._id} value={workout._id}>
              {workout.name}
            </option>
          ))}
        </select>
      </section>

      {selectedWorkout && (
        <section className="card">
          <h2>Editar treino</h2>
          <form onSubmit={handleUpdateWorkout} className="stack-sm">
            <input
              className="input"
              value={workoutDraftName}
              onChange={(event) => setWorkoutDraftName(event.target.value)}
              placeholder="Nome do treino"
            />

            {workoutDraftExercises.map((exercise, index) => (
              <div className="inline-input-group" key={`workout-exercise-${index}`}>
                <input
                  className="input"
                  value={exercise}
                  onChange={(event) => updateDraftExercise(index, event.target.value)}
                  placeholder={`Exercicio ${index + 1}`}
                />
                <button
                  type="button"
                  className="btn btn-danger btn-inline"
                  onClick={() => removeDraftExercise(index)}
                >
                  Excluir
                </button>
              </div>
            ))}

            <button type="button" className="btn btn-secondary" onClick={addDraftExercise}>
              + Adicionar exercicio
            </button>

            <div className="action-row">
              <button className="btn" disabled={loadingUpdateWorkout}>
                {loadingUpdateWorkout ? 'Salvando...' : 'Salvar treino'}
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDeleteWorkout}
                disabled={loadingDeleteWorkout}
              >
                {loadingDeleteWorkout ? 'Excluindo...' : 'Excluir treino'}
              </button>
            </div>
          </form>
        </section>
      )}

      {selectedWorkout && (
        <EntryForm
          workout={selectedWorkout}
          onSubmit={editingEntry ? handleUpdateEntry : handleCreateEntry}
          loading={loadingEntry}
          initialEntry={editingEntry}
          onCancelEdit={() => setEditingEntry(null)}
        />
      )}

      {selectedWorkout && (
        <HistoryList
          entries={entries}
          onEdit={(entry) => setEditingEntry(entry)}
          onDelete={handleDeleteEntry}
          deletingEntryId={deletingEntryId}
        />
      )}
    </main>
  );
}
