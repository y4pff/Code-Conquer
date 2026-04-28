import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Link } from "react-router-dom";

export default function Favourites() {
  const [favourites, setFavourites] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFavourites() {
      const { data: userData } = await supabase.auth.getUser();
      const currentUser = userData.user;
      setUser(currentUser);

      if (!currentUser) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("favourites")
        .select("recipe_id, recipes(id, title, dietary_tag, estimated_cost)")
        .eq("user_id", currentUser.id);

      if (error) {
        console.log(error.message);
      } else {
        setFavourites(data || []);
      }

      setLoading(false);
    }

    loadFavourites();
  }, []);

  async function handleRemove(recipeId) {
    const { error } = await supabase
      .from("favourites")
      .delete()
      .eq("recipe_id", recipeId)
      .eq("user_id", user.id);

    if (!error) {
      setFavourites(favourites.filter((f) => f.recipe_id !== recipeId));
    }
  }

  if (loading) {
    return <div className="container"><p>Loading...</p></div>;
  }

  if (!user) {
    return (
      <div className="container">
        <div className="card">
          <h1 style={{ marginTop: 0 }}>Favourites</h1>
          <p>You need to be logged in to view your favourites.</p>
          <Link className="btn" to="/login">Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>My Favourites</h1>

      {favourites.length === 0 ? (
        <div className="card">
          <p>You have not saved any recipes yet.</p>
        </div>
      ) : (
        <div className="recipeGrid">
          {favourites.map((f) => (
            <div className="recipeCard" key={f.recipe_id}>
              <span className="badge">{f.recipes?.dietary_tag || "No tag"}</span>

              <h3>
                <Link className="link" to={`/recipes/${f.recipe_id}`}>
                  {f.recipes?.title}
                </Link>
              </h3>

              <p className="recipeMeta">
                <strong>Cost:</strong> £{f.recipes?.estimated_cost || "N/A"}
              </p>

              <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                <Link className="btnSmall" to={`/recipes/${f.recipe_id}`}>
                  View Recipe
                </Link>
                <button
                  className="btnDanger"
                  onClick={() => handleRemove(f.recipe_id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}