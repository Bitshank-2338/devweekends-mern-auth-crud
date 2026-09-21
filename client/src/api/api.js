// Every call to the Express backend goes through this file.
// Keeping fetch in one place means each request automatically gets the JSON
// header, the JWT from localStorage, and the same error handling.

const API_URL = import.meta.env.VITE_API_URL;

async function apiRequest(path, options = {}) {
  const token = localStorage.getItem('token');

  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        // This header is how the backend knows who is calling.
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });
  } catch {
    // fetch only rejects when the request never reached the server at all,
    // for example the backend is stopped or the network is down.
    throw new Error('Cannot reach the server. Is the backend running?');
  }

  // A failed response may have an empty body, so fall back to an empty object.
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    // 401 means the token is missing, invalid or expired. Drop it here so the
    // app can never keep making requests with a token the server refuses.
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }

    const error = new Error(data.message || 'Request failed');
    // The pages read this to tell "session expired" apart from a normal error.
    error.status = response.status;
    throw error;
  }

  return data;
}

// Small wrappers so components read nicely: api.get('/api/projects')
export const api = {
  get: (path) => apiRequest(path),
  post: (path, body) => apiRequest(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => apiRequest(path, { method: 'PUT', body: JSON.stringify(body) }),
  del: (path) => apiRequest(path, { method: 'DELETE' }),
};
