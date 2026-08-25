import { useState } from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export function Register() {
  const { register } = useAuth();

  const navigate = useNavigate();

  const [email, setEmail] =
    useState("");

  const [username, setUsername] =
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
      await register(
        email,
        username,
        password
      );

      navigate("/");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Registration failed"
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
      <h1>Create account</h1>

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
        Username

        <input
          value={username}
          onChange={(event) =>
            setUsername(event.target.value)
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
          minLength={8}
        />
      </label>

      <button
        className="btn-primary"
        type="submit"
        disabled={loading}
      >
        {loading
          ? "Creating account..."
          : "Sign up"}
      </button>

      <p>
        Already have an account?{" "}
        <Link to="/login">
          Log in
        </Link>
      </p>
    </form>
  );
}