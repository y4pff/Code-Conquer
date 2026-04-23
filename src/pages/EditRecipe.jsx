import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function EditRecipe() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [steps, setSteps] = useState("");
  const [dietaryTag, setDietaryTag] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    async function loadRecipe() {
      setErrorMessage("");
      setSuccessMessage("");

      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;

      if (!user) {
        navigate("/login");
        return;
      }

      const { data: recipe, error } = await supabase
        .from("recipes")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        setErrorMessage(error.message);
        setLoading(false);
        return;
      }

      if (recipe.user_id !== user.id) {
        setErrorMessage("You are not allowed to edit this recipe.");
        setLoading(false);
        return;
      }

      setTitle(recipe.title || "");
      setIngredients(recipe.ingredients || "");
      setSteps(recipe.steps || "");
      setDietaryTag(recipe.dietary_tag || "");
      setEstimatedCost(recipe.estimated_cost ?? "");
      setLoading(false);
    }

    loadRecipe();
  }, [id, navigate]);

  async function handleUpdate(e) {
    e.preventDefault();
    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) {
      setErrorMessage("You must be logged in.");
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("recipes")
      .update({
        title,
        ingredients,
        steps,
        dietary_tag: dietaryTag || null,
        estimated_cost: estimatedCost === "" ? null : Number(estimatedCost),
      })
      .eq("id", id)
      .eq("user_id", user.id);

    setSaving(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setSuccessMessage("Recipe updated successfully. Redirecting...");

    setTimeout(() => {
      navigate(`/recipes/${id}`);
    }, 1200);
  }

  if (loading) {
    return (
      <div className="container">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: 700 }}>
      <div className="card">
        <h1 style={{ marginTop: 0, marginBottom: 8 }}>Edit Recipe</h1>
        <p style={{ marginTop: 0, color: "#666" }}>
          Update your recipe details below.
        </p>

        {errorMessage && (
          <div
            style={{
              marginBottom: 16,
              padding: "12px 14px",
              borderRadius: 12,
              background: "#fff1f0",
              border: "1px solid #f5c2c0",
              color: "#b42318",
              fontSize: "0.95rem",
            }}
          >
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div
            style={{
              marginBottom: 16,
              padding: "12px 14px",
              borderRadius: 12,
              background: "#ecfdf3",
              border: "1px solid #abefc6",
              color: "#067647",
              fontSize: "0.95rem",
            }}
          >
            {successMessage}
          </div>
        )}

        <form onSubmit={handleUpdate}>
          <label className="label">Recipe Title</label>
          <input
            className="input"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <label className="label">Dietary Tag</label>
          <select
            value={dietaryTag}
            onChange={(e) => setDietaryTag(e.target.value)}
          >
            <option value="">Select a dietary tag</option>
            <option value="vegetarian">Vegetarian</option>
            <option value="vegan">Vegan</option>
            <option value="halal">Halal</option>
            <option value="gluten-free">Gluten-free</option>
          </select>

          <label className="label">Estimated Cost (£)</label>
          <input
            className="input"
            type="number"
            step="0.01"
            value={estimatedCost}
            onChange={(e) => setEstimatedCost(e.target.value)}
          />

          <label className="label">Ingredients</label>
          <textarea
            className="textarea"
            rows={5}
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            required
          />

          <label className="label">Instructions</label>
          <textarea
            className="textarea"
            rows={7}
            value={steps}
            onChange={(e) => setSteps(e.target.value)}
            required
          />

          <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
            <button className="btn" type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>

            <button
              className="btnSecondary"
              type="button"
              onClick={() => navigate(`/recipes/${id}`)}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}