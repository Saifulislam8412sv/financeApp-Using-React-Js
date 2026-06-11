import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

export default function Login({ onSwitch }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const result = login(form.email, form.password);
      if (!result.success) setError(result.message);
      setLoading(false);
    }, 400);
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-logo">💰</div>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-sub">Sign in to your finance account</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@email.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
            />
          </div>
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account?{" "}
          <button className="link-btn" onClick={onSwitch}>
            Create one →
          </button>
        </p>
      </div>
    </div>
  );
}
