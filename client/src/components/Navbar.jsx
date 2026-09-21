// Top bar of the dashboard: who is logged in, and the way out.
export function Navbar({ user, onLogout }) {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="brand">
          <span className="brand-mark">{'</>'}</span>
          <span className="brand-name">DevBoard</span>
        </div>

        <div className="navbar-right">
          <span className="navbar-user">
            Signed in as <strong>{user.name}</strong>
          </span>
          <button type="button" className="btn btn-ghost" onClick={onLogout}>
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
