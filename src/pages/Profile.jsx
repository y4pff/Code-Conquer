import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Link } from "react-router-dom";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [myRecipes, setMyRecipes] = useState([]);
  const [favCount, setFavCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);

      const { data: userData } = await supabase.auth.getUser();
      const u = userData.user;
      setUser(u);

      if (!u) {
        setLoading(false);
        return;
      }

      const { data: recipes } = await supabase
        .from("recipes")
        .select("id, title, created_at")
        .eq("user_id", u.id)
        .order("created_at", { ascending: false });

      setMyRecipes(recipes || []);

      const { count } = await supabase
        .from("favourites")
        .select("*", { count: "exact", head: true })
        .eq("user_id", u.id);

      setFavCount(count || 0);

      setLoading(false);
    }

    load();
  }, []);

  if (loading) {
    return (
      <div className="container">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container" style={{ maxWidth: 600 }}>
        <div className="card">
          <h1 style={{ marginTop: 0 }}>Profile</h1>
          <p style={{ color: "#666" }}>You are not logged in.</p>
          <Link className="btn" to="/login">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card" style={{ marginBottom: 24 }}>
        <h1 style={{ marginTop: 0, marginBottom: 8 }}>My Profile</h1>
        <p style={{ marginTop: 0, color: "#666" }}>
          Manage your account and view your recipe activity.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
            marginTop: 20,
          }}
        >
          <div className="card">
            <p style={{ margin: "0 0 8px 0", color: "#666" }}>Email</p>
            <p style={{ margin: 0, fontWeight: 600 }}>{user.email}</p>
          </div>

          <div className="card">
            <p style={{ margin: "0 0 8px 0", color: "#666" }}>Saved Recipes</p>
            <p style={{ margin: 0, fontWeight: 600 }}>{favCount}</p>
          </div>

          <div className="card">
            <p style={{ margin: "0 0 8px 0", color: "#666" }}>Recipes Created</p>
            <p style={{ margin: 0, fontWeight: 600 }}>{myRecipes.length}</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0, marginBottom: 8 }}>Your Recipes</h2>
        <p style={{ marginTop: 0, color: "#666" }}>
          View and manage the recipes you have created.
        </p>

        {myRecipes.length === 0 ? (
          <div className="card" style={{ marginTop: 16 }}>
            <p style={{ margin: 0 }}>You have not created any recipes yet.</p>
          </div>
        ) : (
          <div className="list" style={{ marginTop: 16 }}>
            {myRecipes.map((r) => (
              <div className="listItem" key={r.id}>
                <div>
                  <Link to={`/recipes/${r.id}`} className="link">
                    {r.title}
                  </Link>
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <Link to={`/recipes/${r.id}`} className="btnSmall">
                    View
                  </Link>
                  <Link to={`/recipes/${r.id}/edit`} className="btnSmall">
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}