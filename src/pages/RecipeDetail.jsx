import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [user, setUser] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [favLoading, setFavLoading] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isFavourited, setIsFavourited] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function fetchRecipe() {
    const { data, error } = await supabase.from("recipes").select("*").eq("id", id).single();
    if (error) { setErrorMessage(error.message); return; }
    setRecipe(data);
  }

  async function fetchReviews() {
    const { data, error } = await supabase.from("reviews").select("*").eq("recipe_id", id).order("created_at", { ascending: false });
    if (error) { setErrorMessage(error.message); return; }
    setReviews(data || []);
  }

  async function checkFavourite(currentUser) {
    if (!currentUser) { setIsFavourited(false); return; }
    const { data, error } = await supabase.from("favourites").select("id").eq("recipe_id", id).eq("user_id", currentUser.id).maybeSingle();
    if (error) { setErrorMessage(error.message); return; }
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
      setErrorMessage("");
      setSuccessMessage("");
      await Promise.all([fetchRecipe(), fetchReviews(), fetchUser()]);
      setLoading(false);
    }
    load();
  }, [id]);

  async function handleToggleFavourite() {
    if (!user) { setErrorMessage("You must be logged in to save a recipe."); return; }
    setFavLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    if (isFavourited) {
      const { error } = await supabase.from("favourites").delete().eq("recipe_id", id).eq("user_id", user.id);
      if (error) { setErrorMessage(error.message); }
      else { setIsFavourited(false); setErrorMessage("Recipe removed from favourites."); }
    } else {
      const { error } = await supabase.from("favourites").insert([{ recipe_id: id, user_id: user.id }]);
      if (error) { setErrorMessage(error.message); }
      else { setIsFavourited(true); setSuccessMessage("Recipe added to favourites."); }
    }
    setFavLoading(false);
  }

  async function handleDeleteRecipe() {
    const confirmDelete = window.confirm("Are you sure you want to delete this recipe?");
    if (!confirmDelete) return;
    setDeleteLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    const { error } = await supabase.from("recipes").delete().eq("id", id);
    setDeleteLoading(false);
    if (error) { setErrorMessage(error.message); return; }
    navigate("/");
  }

  async function handleAddReview(e) {
    e.preventDefault();
    setReviewLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    const { data: sessionData } = await supabase.auth.getSession();
    const currentUser = sessionData.session?.user;
    if (!currentUser) { setErrorMessage("You must be logged in to leave a review."); setReviewLoading(false); return; }
    const { data: existing, error: findError } = await supabase.from("reviews").select("id").eq("recipe_id", id).eq("user_id", currentUser.id).maybeSingle();
    if (findError) { setErrorMessage(findError.message); setReviewLoading(false); return; }
    let error;
    if (existing) {
      const res = await supabase.from("reviews").update({ rating: Number(rating), comment }).eq("id", existing.id);
      error = res.error;
    } else {
      const res = await supabase.from("reviews").insert([{ recipe_id: id, user_id: currentUser.id, rating: Number(rating), comment }]);
      error = res.error;
    }
    if (error) { setErrorMessage(error.message); setReviewLoading(false); return; }
    setComment("");
    setRating(5);
    await fetchReviews();
    setSuccessMessage(existing ? "Review updated successfully." : "Review added successfully.");
    setReviewLoading(false);
  }

  if (loading) return <div className="container"><p>Loading...</p></div>;
  if (!recipe) return <div className="container"><p>Recipe not found.</p></div>;

  const avg = reviews.length === 0 ? null : (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1);
  const twitterUrl = "https://twitter.com/intent/tweet?text=Check out: " + recipe.title + "&url=" + window.location.href;
  const facebookUrl = "https://www.facebook.com/sharer/sharer.php?u=" + window.location.href;
  const whatsappUrl = "https://wa.me/?text=Check out this recipe: " + recipe.title + " " + window.location.href;

  return (
    <div className="container" style={{ maxWidth: 1000 }}>

      <div style={{ marginBottom: 16 }}>
        <button className="btnSmall" onClick={() => navigate("/")}>Back to Recipes</button>
      </div>

      {(errorMessage || successMessage) && (
        <div style={{ marginBottom: 20 }}>
          {errorMessage && (
            <div style={{ marginBottom: 12, padding: "12px 14px", borderRadius: 12, background: "#fff1f0", border: "1px solid #f5c2c0", color: "#b42318", fontSize: "0.95rem" }}>
              {errorMessage}
            </div>
          )}
          {successMessage && (
            <div style={{ padding: "12px 14px", borderRadius: 12, background: "#ecfdf3", border: "1px solid #abefc6", color: "#067647", fontSize: "0.95rem" }}>
              {successMessage}
            </div>
          )}
        </div>
      )}

      {/* top section - image left, info right */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        <div>
          {recipe.image_url ? (
            <img src={recipe.image_url} alt={recipe.title} style={{ width: "100%", height: 320, objectFit: "cover", borderRadius: 16 }} />
          ) : (
            <div style={{ width: "100%", height: 320, borderRadius: 16, background: "#fff1e6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "4rem" }}>
              🍽️
            </div>
          )}
        </div>

        <div className="card">
          <div style={{ marginBottom: 12 }}>
            <span className="badge">{recipe.dietary_tag || "No tag"}</span>
          </div>

          <h1 style={{ marginTop: 0, marginBottom: 16 }}>{recipe.title}</h1>

          <div style={{ marginBottom: 20 }}>
            <div style={{ background: "#fff8f2", borderRadius: 10, padding: "10px 14px", marginBottom: 12 }}>
              <p style={{ margin: "0 0 4px 0", fontSize: "0.85rem", color: "#888" }}>Estimated Cost</p>
              <p style={{ margin: 0, fontWeight: 700, fontSize: "1.1rem" }}>{recipe.estimated_cost !== null ? `£${recipe.estimated_cost}` : "N/A"}</p>
            </div>
            <div style={{ background: "#fff8f2", borderRadius: 10, padding: "10px 14px" }}>
              <p style={{ margin: "0 0 4px 0", fontSize: "0.85rem", color: "#888" }}>Average Rating</p>
              <p style={{ margin: 0, fontWeight: 700, fontSize: "1.1rem" }}>{avg ? `${avg} / 5 (${reviews.length} review${reviews.length === 1 ? "" : "s"})` : "No ratings yet"}</p>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button className="btnSmall" onClick={handleToggleFavourite} disabled={favLoading} style={{ background: isFavourited ? "#fff3e8" : "", borderColor: isFavourited ? "#e07b2a" : "", color: isFavourited ? "#e07b2a" : "" }}>
              {favLoading ? "Updating..." : isFavourited ? "★ Saved" : "☆ Save"}
            </button>
            {user && recipe.user_id === user.id && (
              <>
                <Link className="btnSmall" to={`/recipes/${id}/edit`}>Edit Recipe</Link>
                <button className="btnDanger" type="button" onClick={handleDeleteRecipe} disabled={deleteLoading}>
                  {deleteLoading ? "Deleting..." : "Delete Recipe"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ingredients and instructions side by side */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Ingredients</h2>
          <p style={{ whiteSpace: "pre-line", lineHeight: 1.8 }}>{recipe.ingredients}</p>
        </div>

        <div className="card">
          <h2 style={{ marginTop: 0 }}>Instructions</h2>
          <p style={{ whiteSpace: "pre-line", lineHeight: 1.8 }}>{recipe.steps}</p>
        </div>
      </div>

      {recipe.video_url && (
        <div className="card" style={{ marginBottom: 20 }}>
          <h2 style={{ marginTop: 0 }}>Video</h2>
          <p style={{ marginTop: 0, color: "#666" }}>Watch how this recipe is made:</p>
          <a href={recipe.video_url} target="_blank" rel="noreferrer" className="btn">Watch on YouTube</a>
        </div>
      )}

      <div className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ marginTop: 0 }}>Share this Recipe</h2>
        <p style={{ marginTop: 0, color: "#666" }}>Share this recipe with your friends and family.</p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <a href={twitterUrl} target="_blank" rel="noreferrer" className="btnSmall" style={{ background: "#1DA1F2", color: "white", border: "none" }}>Share on X</a>
          <a href={facebookUrl} target="_blank" rel="noreferrer" className="btnSmall" style={{ background: "#1877F2", color: "white", border: "none" }}>Share on Facebook</a>
          <a href={whatsappUrl} target="_blank" rel="noreferrer" className="btnSmall" style={{ background: "#25D366", color: "white", border: "none" }}>Share on WhatsApp</a>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>Reviews</h2>
        {user ? (
          <form onSubmit={handleAddReview} style={{ marginBottom: 24 }}>
            <label className="label">Rating</label>
            <select value={rating} onChange={(e) => setRating(e.target.value)}>
              <option value={5}>5 - Excellent</option>
              <option value={4}>4 - Good</option>
              <option value={3}>3 - Average</option>
              <option value={2}>2 - Poor</option>
              <option value={1}>1 - Terrible</option>
            </select>
            <label className="label">Comment (optional)</label>
            <textarea className="textarea" rows={3} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Write a short review..." />
            <div style={{ marginTop: 12 }}>
              <button className="btn" type="submit" disabled={reviewLoading}>{reviewLoading ? "Saving Review..." : "Submit Review"}</button>
            </div>
          </form>
        ) : (
          <p style={{ color: "#666" }}><Link to="/login" className="link">Login</Link> to leave a review.</p>
        )}
        {reviews.length === 0 ? (
          <p style={{ color: "#888" }}>No reviews yet. Be the first to review this recipe.</p>
        ) : (
          <div className="list">
            {reviews.map((r) => (
              <div className="listItem" key={r.id} style={{ display: "block" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ background: "#fff1e6", color: "#e07b2a", padding: "2px 10px", borderRadius: 999, fontWeight: 700, fontSize: "0.9rem" }}>
                    {r.rating} / 5
                  </span>
                </div>
                <p style={{ margin: 0, color: "#555" }}>{r.comment ? r.comment : "(No comment)"}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}