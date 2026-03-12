import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleRegister(e) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
    } else {
      alert("Account created successfully. You can now log in.");
      navigate("/login");
    }
  }

  return (
    <div className="container" style={{ maxWidth: 500 }}>
      <div className="card">
        <h1 style={{ marginTop: 0, marginBottom: 8 }}>Register</h1>
        <p style={{ marginTop: 0, color: "#666" }}>
          Create an account to share recipes and save your favourites.
        </p>

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