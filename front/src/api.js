const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:3002/api';

async function request(path, options = {}) {
  const token = localStorage.getItem('ramais_token');
  const hasBody = options.body !== undefined && options.body !== null;
  const headers = {
    ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers || {}),
  };

  const body =
    hasBody && typeof options.body !== 'string' ? JSON.stringify(options.body) : options.body;

  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    body,
    headers,
  });

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message = typeof data === 'string' ? data : data?.message || 'Erro inesperado';
    throw new Error(message);
  }

  return data;
}

export const api = {
  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  me: () => request('/auth/me'),
  changePassword: (payload) =>
    request('/users/me/password', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  listUsers: () => request('/users'),
  createUser: (payload) =>
    request('/users', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateUser: (id, payload) =>
    request(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  deleteUser: (id) => request(`/users/${id}`, { method: 'DELETE' }),
  listRamais: () => request('/ramais'),
  createRamal: (payload) =>
    request('/ramais', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateRamal: (id, payload) =>
    request(`/ramais/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  deleteRamal: (id) => request(`/ramais/${id}`, { method: 'DELETE' }),
  publicRamais: () => request('/public/ramais', { headers: {} }),
  publicRamalById: (id) => request(`/public/ramais/${id}`, { headers: {} }),
};

export function setToken(token) {
  localStorage.setItem('ramais_token', token);
}

export function clearToken() {
  localStorage.removeItem('ramais_token');
}

export function getToken() {
  return localStorage.getItem('ramais_token');
}
