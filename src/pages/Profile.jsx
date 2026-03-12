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

  if (loading) return <div className="container"><p>Loading...</p></div>;

  if (!user) {
    return (
      <div className="container">
        <h1>Profile</h1>
        <p>You’re not logged in.</p>
        <Link className="btn" to="/login">Go to Login</Link>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Profile</h1>

      <div className="card">
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>User ID:</strong> {user.id}</p>
        <p><strong>Favourites:</strong> {favCount}</p>
        <p><strong>Your recipes:</strong> {myRecipes.length}</p>
      </div>

      <h2 style={{ marginTop: 20 }}>Your recipes</h2>

      {myRecipes.length === 0 ? (
        <p>You haven’t created any recipes yet.</p>
      ) : (
        <div className="list">
          {myRecipes.map((r) => (
            <div className="listItem" key={r.id}>
              <Link to={`/recipes/${r.id}`} className="link">{r.title}</Link>
              <Link to={`/recipes/${r.id}/edit`} className="btnSmall">Edit</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}