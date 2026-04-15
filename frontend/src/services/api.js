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
  getEntries(userId, workoutId) {
    return request(`/users/${userId}/workouts/${workoutId}/entries`);
  },
  createEntry(userId, workoutId, payload) {
    return request(`/users/${userId}/workouts/${workoutId}/entries`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }
};