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
    <div style={{
      minHeight: "80vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
    }}>
      <div className="card" style={{ width: "100%", maxWidth: 420 }}>

        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <h1 style={{ marginTop: 0, marginBottom: 8, fontSize: "1.8rem" }}>
            Welcome Back
          </h1>
          <p style={{ margin: 0, color: "#666" }}>
            Sign in to discover and share recipes.
          </p>
        </div>

        {errorMessage && (
          <div style={{
            marginBottom: 16,
            padding: "12px 14px",
            borderRadius: 12,
            background: "#fff1f0",
            border: "1px solid #f5c2c0",
            color: "#b42318",
            fontSize: "0.95rem",
          }}>
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <label className="label">Email Address</label>
          <input
            className="input"
            type="email"
            placeholder="you@example.com"
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

          <div style={{ marginTop: 20 }}>
            <button
              className="btn"
              type="submit"
              disabled={loading}
              style={{ width: "100%" }}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>
        </form>

        <p style={{ marginTop: 18, marginBottom: 0, textAlign: "center" }}>
          Don't have an account?{" "}
          <Link className="link" to="/register">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}