import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <Link to="/" className="brand">
        ⌨ typerush
      </Link>

      <div className="nav-links">
        <Link to="/">Play</Link>

        <Link to="/leaderboard">
          Leaderboard
        </Link>

        {user && (
          <Link to="/history">
            History
          </Link>
        )}
      </div>

      <div className="nav-auth">
        {user ? (
          <>
            <span className="nav-username">
              {user.username}
            </span>

            <button
              className="btn-ghost"
              onClick={logout}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="btn-ghost"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="btn-primary-sm"
            >
              Sign up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}