const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || 'Erro na requisicao');
  }

  return response.json();
}

export const api = {
  getDemoUser() {
    return request('/users/demo');
  },
  getWorkouts(userId) {
    return request(`/users/${userId}/workouts`);
  },
  createWorkout(userId, payload) {
    return request(`/users/${userId}/workouts`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },
  updateWorkout(userId, workoutId, payload) {
    return request(`/users/${userId}/workouts/${workoutId}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },
  deleteWorkout(userId, workoutId) {
    return request(`/users/${userId}/workouts/${workoutId}`, {
      method: 'DELETE'
    });
  },
  getEntries(userId, workoutId) {
    return request(`/users/${userId}/workouts/${workoutId}/entries`);
  },
  createEntry(userId, workoutId, payload) {
    return request(`/users/${userId}/workouts/${workoutId}/entries`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },
  updateEntry(userId, workoutId, entryId, payload) {
    return request(`/users/${userId}/workouts/${workoutId}/entries/${entryId}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },
  deleteEntry(userId, workoutId, entryId) {
    return request(`/users/${userId}/workouts/${workoutId}/entries/${entryId}`, {
      method: 'DELETE'
    });
  }
};
