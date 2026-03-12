import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function RecipeDetail() {
  const { id } = useParams();

  const [recipe, setRecipe] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [user, setUser] = useState(null);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const [loading, setLoading] = useState(true);
  const [isFavourited, setIsFavourited] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  async function fetchRecipe() {
    const { data, error } = await supabase
      .from("recipes")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      alert(error.message);
      return;
    }

    setRecipe(data);
  }

  async function fetchReviews() {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("recipe_id", id)
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
      return;
    }

    setReviews(data || []);
  }

  async function checkFavourite(currentUser) {
    if (!currentUser) {
      setIsFavourited(false);
      return;
    }

    const { data, error } = await supabase
      .from("favourites")
      .select("id")
      .eq("recipe_id", id)
      .eq("user_id", currentUser.id)
      .maybeSingle();

    if (error) {
      alert(error.message);
      return;
    }

    setIsFavourited(!!data);
  }

  async function fetchUser() {
    const { data } = await supabase.auth.getUser();
    setUser(data.user);
    await checkFavourite(data.user);
  }

  useEffect(() => {
    async function load() {
      setLoading(true);
      await Promise.all([fetchRecipe(), fetchReviews(), fetchUser()]);
      setLoading(false);
    }
    load();
  }, [id]);

  async function handleToggleFavourite() {
    if (!user) {
      alert("You must be logged in to favourite a recipe.");
      return;
    }

    setFavLoading(true);

    if (isFavourited) {
      const { error } = await supabase
        .from("favourites")
        .delete()
        .eq("recipe_id", id)
        .eq("user_id", user.id);

      if (error) {
        alert(error.message);
      } else {
        setIsFavourited(false);
      }
    } else {
      const { error } = await supabase.from("favourites").insert([
        { recipe_id: id, user_id: user.id },
      ]);

      if (error) {
        alert(error.message);
      } else {
        setIsFavourited(true);
      }
    }

    setFavLoading(false);
  }

  async function handleDeleteRecipe() {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this recipe?"
    );
    if (!confirmDelete) return;

    const { error } = await supabase.from("recipes").delete().eq("id", id);

    if (error) {
      alert(error.message);
    } else {
      alert("Recipe deleted!");
      window.location.href = "/";
    }
  }

  async function handleAddReview(e) {
    e.preventDefault();

    const { data: sessionData } = await supabase.auth.getSession();
    const currentUser = sessionData.session?.user;

    if (!currentUser) {
      alert("You must be logged in to leave a review.");
      return;
    }

    const { data: existing, error: findError } = await supabase
      .from("reviews")
      .select("id")
      .eq("recipe_id", id)
      .eq("user_id", currentUser.id)
      .maybeSingle();

    if (findError) {
      alert(findError.message);
      return;
    }

    let error;

    if (existing) {
      const res = await supabase
        .from("reviews")
        .update({ rating: Number(rating), comment })
        .eq("id", existing.id);
      error = res.error;
    } else {
      const res = await supabase.from("reviews").insert([
        {
          recipe_id: id,
          user_id: currentUser.id,
          rating: Number(rating),
          comment,
        },
      ]);
      error = res.error;
    }

    if (error) {
      alert(error.message);
      return;
    }

    setComment("");
    setRating(5);
    await fetchReviews();
    alert(existing ? "Review updated!" : "Review added!");
  }

  if (loading) return <div className="container"><p>Loading...</p></div>;
  if (!recipe) return <div className="container"><p>Recipe not found.</p></div>;

  const avg =
    reviews.length === 0
      ? null
      : (
          reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
        ).toFixed(1);

  return (
    <div className="container">
      <div className="card" style={{ marginBottom: 20 }}>
        <h1 style={{ marginTop: 0 }}>{recipe.title}</h1>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
          <button className="btnSmall" onClick={handleToggleFavourite} disabled={favLoading}>
            {favLoading ? "..." : isFavourited ? "★ Saved" : "☆ Save"}
          </button>

          {user && recipe.user_id === user.id && (
            <>
              <Link className="btnSmall" to={`/recipes/${id}/edit`}>
                Edit Recipe
              </Link>
              <button className="btnDanger" type="button" onClick={handleDeleteRecipe}>
                Delete Recipe
              </button>
            </>
          )}
        </div>

        <p style={{ margin: "0 0 8px 0" }}>
          <strong>Dietary Tag:</strong> {recipe.dietary_tag || "N/A"}
        </p>

        <p style={{ margin: "0 0 8px 0" }}>
          <strong>Estimated Cost:</strong>{" "}
          {recipe.estimated_cost !== null ? `£${recipe.estimated_cost}` : "N/A"}
        </p>

        <p style={{ margin: 0 }}>
          <strong>Average Rating:</strong>{" "}
          {avg ? `${avg} / 5 (${reviews.length} review${reviews.length === 1 ? "" : "s"})` : "No ratings yet"}
        </p>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ marginTop: 0 }}>Ingredients</h2>
        <p style={{ whiteSpace: "pre-line" }}>{recipe.ingredients}</p>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ marginTop: 0 }}>Instructions</h2>
        <p style={{ whiteSpace: "pre-line" }}>{recipe.steps}</p>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>Reviews</h2>

        {user ? (
          <form onSubmit={handleAddReview} style={{ marginBottom: 24 }}>
            <label className="label">Rating</label>
            <select value={rating} onChange={(e) => setRating(e.target.value)}>
              <option value={5}>5</option>
              <option value={4}>4</option>
              <option value={3}>3</option>
              <option value={2}>2</option>
              <option value={1}>1</option>
            </select>

            <label className="label">Comment (optional)</label>
            <textarea
              className="textarea"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write a short review..."
            />

            <div style={{ marginTop: 12 }}>
              <button className="btn" type="submit">
                Submit Review
              </button>
            </div>
          </form>
        ) : (
          <p>You must be logged in to leave a review.</p>
        )}

        {reviews.length === 0 ? (
          <p>No reviews yet.</p>
        ) : (
          <div className="list">
            {reviews.map((r) => (
              <div className="listItem" key={r.id} style={{ display: "block" }}>
                <p style={{ margin: "0 0 8px 0" }}>
                  <strong>Rating:</strong> {r.rating} / 5
                </p>
                <p style={{ margin: 0, color: "#555" }}>
                  {r.comment ? r.comment : "(No comment)"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}