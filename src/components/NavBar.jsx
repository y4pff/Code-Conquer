import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useEffect, useState } from "react";

export default function NavBar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user || null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <nav className="navbar">
      <div className="navLeft">
        <Link className="logo" to="/">RecipeHub</Link>
        <div className="navLinks">
          <Link to="/">Home</Link>
          {user && <Link to="/create">Add Recipe</Link>}
          {user && <Link to="/favourites">Favourites</Link>}
          {user && <Link to="/profile">Profile</Link>}
        </div>
      </div>

      <div className="navRight">
        {user ? (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: "0.85rem", color: "#555" }}>
              {user.email}
            </span>
            <button className="btnSmall" onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 8 }}>
            <Link className="btnSmall" to="/login">Login</Link>
            <Link className="btnSmall" to="/register">Register</Link>
          </div>
        )}
      </div>
    </nav>
  );
}