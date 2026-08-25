import { useState } from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../utils/errors";

export function Login() {
  const { login } = useAuth();

  const navigate = useNavigate();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(false);

  async function onSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate("/");
    } catch (error) {
      setError(
        getErrorMessage(error, "Login failed")
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      className="auth-form"
      onSubmit={onSubmit}
    >
      <h1>Log in</h1>

      {error && (
        <p className="form-error">
          {error}
        </p>
      )}

      <label>
        Email

        <input
          type="email"
          value={email}
          onChange={(event) =>
            setEmail(event.target.value)
          }
          required
        />
      </label>

      <label>
        Password

        <input
          type="password"
          value={password}
          onChange={(event) =>
            setPassword(event.target.value)
          }
          required
        />
      </label>

      <button
        className="btn-primary"
        type="submit"
        disabled={loading}
      >
        {loading
          ? "Logging in..."
          : "Log in"}
      </button>

      <p>
        No account?{" "}
        <Link to="/register">
          Sign up
        </Link>
      </p>
    </form>
  );
}