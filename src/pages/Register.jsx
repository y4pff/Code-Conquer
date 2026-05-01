import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();

  async function handleRegister(e) {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please try again.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setSuccessMessage("Account created successfully. Redirecting to login...");

    setTimeout(() => {
      navigate("/login");
    }, 1500);
  }

  return (
    <div className="container" style={{ maxWidth: 500 }}>
      <div className="card">
        <h1 style={{ marginTop: 0, marginBottom: 8 }}>Register</h1>
        <p style={{ marginTop: 0, color: "#666" }}>
          Create an account to share recipes and save your favourites.
        </p>

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

        {successMessage && (
          <div style={{
            marginBottom: 16,
            padding: "12px 14px",
            borderRadius: 12,
            background: "#ecfdf3",
            border: "1px solid #abefc6",
            color: "#067647",
            fontSize: "0.95rem",
          }}>
            {successMessage}
          </div>
        )}

        <form onSubmit={handleRegister}>
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
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <label className="label">Confirm Password</label>
          <input
            className="input"
            type="password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <div style={{ marginTop: 16 }}>
            <button className="btn" type="submit" disabled={loading}>
              {loading ? "Creating account..." : "Register"}
            </button>
          </div>
        </form>

        <p style={{ marginTop: 18, marginBottom: 0 }}>
          Already have an account?{" "}
          <Link className="link" to="/login">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}