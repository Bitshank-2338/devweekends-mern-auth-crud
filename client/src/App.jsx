import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';

// Reads the login saved by a previous visit. This is what makes a page
// refresh keep you logged in: the token and user sit in localStorage, which
// survives a reload, unlike React state.
function loadSavedUser() {
  const token = localStorage.getItem('token');
  const savedUser = localStorage.getItem('user');

  if (!token || !savedUser) return null;

  try {
    return JSON.parse(savedUser);
  } catch {
    // Corrupted entry: treat it as logged out rather than crashing on start.
    return null;
  }
}

export function App() {
  const [user, setUser] = useState(loadSavedUser);
  // Message shown on the login screen, e.g. after an expired session.
  const [notice, setNotice] = useState('');

  // Called by Login and Register once the API has handed back a token.
  function handleAuthSuccess({ user: loggedInUser, token }) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    setNotice('');
  }

  // Logout is entirely client-side: a JWT is stateless, so throwing the token
  // away is what ends the session as far as this app is concerned.
  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setNotice('');
  }

  // The dashboard calls this when the API answered 401, which means the token
  // expired or is invalid. api.js has already cleared storage by then.
  function handleSessionExpired() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setNotice('Your session has expired. Please log in again.');
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Login notice={notice} onAuthSuccess={handleAuthSuccess} />
            )
          }
        />
        <Route
          path="/register"
          element={
            user ? <Navigate to="/dashboard" replace /> : <Register onAuthSuccess={handleAuthSuccess} />
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute user={user}>
              <Dashboard user={user} onLogout={handleLogout} onSessionExpired={handleSessionExpired} />
            </ProtectedRoute>
          }
        />
        {/* Anything else lands on the dashboard, which bounces guests to login. */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
