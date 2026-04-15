import { useEffect, useState } from 'react';
import WorkoutCreator from './components/WorkoutCreator';
import EntryForm from './components/EntryForm';
import HistoryList from './components/HistoryList';
import { api } from './services/api';

export default function App() {
  const [user, setUser] = useState(null);
  const [workouts, setWorkouts] = useState([]);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState('');
  const [entries, setEntries] = useState([]);
  const [loadingCreateWorkout, setLoadingCreateWorkout] = useState(false);
  const [loadingEntry, setLoadingEntry] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const selectedWorkout = workouts.find((item) => item._id === selectedWorkoutId) || null;

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

  return (
    <main className="container">
      <header className="hero">
        <h1>Perfomance A.S.P</h1>
        <p>Registro e evolucao de treino com comparação automática por exercicio.</p>
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

      {selectedWorkout && <EntryForm workout={selectedWorkout} onSubmit={handleCreateEntry} loading={loadingEntry} />}

      {selectedWorkout && <HistoryList entries={entries} />}
    </main>
  );
}