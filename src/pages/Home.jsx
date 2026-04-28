import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Link } from "react-router-dom";

export default function Home() {
  const [user, setUser] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTag, setFilterTag] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  async function fetchRecipes() {
    setLoading(true);

    let query = supabase.from("recipe_stats").select("*");

    if (sortBy === "top") {
      query = query.order("avg_rating", { ascending: false });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    if (filterTag !== "all") {
      query = query.eq("dietary_tag", filterTag);
    }

    const { data, error } = await query;

    if (error) {
      alert(error.message);
    } else {
      setRecipes(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    fetchRecipes();

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [filterTag, sortBy]);

  return (
    <div className="container">
      <div style={{ marginBottom: 24 }}>
        <h1 className="pageTitle">Discover Recipes</h1>
        <p className="pageSubtitle">
          Explore recipes, save favourites, and share your own meals.
        </p>
      </div>

      <div
        className="card"
        style={{
          marginBottom: 24,
          display: "flex",
          gap: 20,
          flexWrap: "wrap",
          alignItems: "flex-end",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          <div>
            <label className="label" style={{ marginTop: 0 }}>Filter</label>
            <select value={filterTag} onChange={(e) => setFilterTag(e.target.value)}>
              <option value="all">All</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="vegan">Vegan</option>
              <option value="halal">Halal</option>
              <option value="gluten-free">Gluten-free</option>
              <option value="keto">Keto</option>
              <option value="dairy-free">Dairy-free</option>
              <option value="pescatarian">Pescatarian</option>
            </select>
          </div>

          <div>
            <label className="label" style={{ marginTop: 0 }}>Sort</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="newest">Newest</option>
              <option value="top">Top Rated</option>
            </select>
          </div>
        </div>

        {user && (
          <Link className="btn" to="/create">
            + Add Recipe
          </Link>
        )}
      </div>

      <h2 style={{ marginBottom: 16 }}>Latest Recipes</h2>

      {loading ? (
        <p>Loading...</p>
      ) : recipes.length === 0 ? (
        <div className="card">
          <p style={{ margin: 0 }}>No recipes found.</p>
        </div>
      ) : (
        <div className="recipeGrid">
          {recipes.map((r) => (
            <div className="recipeCard" key={r.id}>
              <div style={{ marginBottom: 12 }}>
                <span className="badge">{r.dietary_tag || "No tag"}</span>
              </div>

              <h3 style={{ marginTop: 0, marginBottom: 10 }}>
                {r.title}
              </h3>

              <p className="recipeMeta">
                <strong>Cost:</strong>{" "}
                {r.estimated_cost !== null ? `£${r.estimated_cost}` : "N/A"}
              </p>

              <p className="recipeMeta">
                <strong>Rating:</strong> {Number(r.avg_rating).toFixed(1)} / 5 (
                {r.review_count} review{r.review_count === 1 ? "" : "s"})
              </p>

              <p className="recipeDesc">
                <strong>Ingredients:</strong>{" "}
                {r.ingredients?.slice(0, 90)}
                {r.ingredients?.length > 90 ? "..." : ""}
              </p>

              <Link className="btnSmall" to={`/recipes/${r.id}`}>
                View Recipe
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}