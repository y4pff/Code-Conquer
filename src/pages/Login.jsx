import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    navigate("/");
  }

  return (
    <div className="container" style={{ maxWidth: 500 }}>
      <div className="card">
        <h1 style={{ marginTop: 0, marginBottom: 8 }}>Login</h1>
        <p style={{ marginTop: 0, color: "#666" }}>
          Sign in to create recipes, leave reviews, and save favourites.
        </p>

        {errorMessage && (
          <div
            style={{
              marginBottom: 16,
              padding: "12px 14px",
              borderRadius: 12,
              background: "#fff1f0",
              border: "1px solid #f5c2c0",
              color: "#b42318",
              fontSize: "0.95rem",
            }}
          >
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <label className="label">Email</label>
          <input
            className="input"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label className="label">Password</label>
          <input
            className="input"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div style={{ marginTop: 16 }}>
            <button className="btn" type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>
        </form>

        <p style={{ marginTop: 18, marginBottom: 0 }}>
          Don’t have an account?{" "}
          <Link className="link" to="/register">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}