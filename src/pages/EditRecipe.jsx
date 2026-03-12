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

  useEffect(() => {
    async function loadRecipe() {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;

      if (!user) {
        alert("You must be logged in.");
        navigate("/login");
        return;
      }

      const { data: recipe, error } = await supabase
        .from("recipes")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        alert(error.message);
        setLoading(false);
        return;
      }

      if (recipe.user_id !== user.id) {
        alert("You are not allowed to edit this recipe.");
        navigate(`/recipes/${id}`);
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

    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) {
      alert("You must be logged in.");
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
      alert(error.message);
    } else {
      navigate(`/recipes/${id}`);
    }
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