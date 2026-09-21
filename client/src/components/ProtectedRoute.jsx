import { Navigate } from 'react-router-dom';

// Guards a route in the browser: no logged-in user, no dashboard.
//
// This is a convenience, not the security boundary. Anyone can edit the
// JavaScript running in their own browser, so the real protection is the auth
// middleware on the server, which refuses any request without a valid JWT.
export function ProtectedRoute({ user, children }) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
