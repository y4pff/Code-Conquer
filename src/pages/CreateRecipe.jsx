import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function CreateRecipe() {
  const [title, setTitle] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [steps, setSteps] = useState("");
  const [dietaryTag, setDietaryTag] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();

  async function handleCreate(e) {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) {
      setErrorMessage("You must be logged in to create a recipe.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("recipes").insert([
      {
        title,
        ingredients,
        steps,
        dietary_tag: dietaryTag || null,
        estimated_cost: estimatedCost === "" ? null : Number(estimatedCost),
        user_id: user.id,
      },
    ]);

    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setSuccessMessage("Recipe created successfully. Redirecting...");

    setTimeout(() => {
      navigate("/");
    }, 1200);
  }

  return (
    <div className="container" style={{ maxWidth: 700 }}>
      <div className="card">
        <h1 style={{ marginTop: 0, marginBottom: 8 }}>Create Recipe</h1>
        <p style={{ marginTop: 0, color: "#666" }}>
          Share your recipe with other users on the platform.
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

        <form onSubmit={handleCreate}>
          <label className="label">Recipe Title</label>
          <input
            className="input"
            type="text"
            placeholder="e.g. Chicken Pasta"
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
            placeholder="e.g. 4.50"
            value={estimatedCost}
            onChange={(e) => setEstimatedCost(e.target.value)}
          />

          <label className="label">Ingredients</label>
          <textarea
            className="textarea"
            rows={5}
            placeholder="List all ingredients..."
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            required
          />

          <label className="label">Instructions</label>
          <textarea
            className="textarea"
            rows={7}
            placeholder="Write the cooking steps..."
            value={steps}
            onChange={(e) => setSteps(e.target.value)}
            required
          />

          <div style={{ marginTop: 16 }}>
            <button className="btn" type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Recipe"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}