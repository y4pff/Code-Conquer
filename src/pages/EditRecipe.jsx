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
  const [imageFile, setImageFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [existingImageUrl, setExistingImageUrl] = useState("");
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
      setVideoUrl(recipe.video_url || "");
      setExistingImageUrl(recipe.image_url || "");
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

    // upload new image if one was selected
    let imageUrl = existingImageUrl;
    if (imageFile) {
      const fileName = Date.now() + "_" + imageFile.name;
      const { error: uploadError } = await supabase.storage
        .from("recipe-images")
        .upload(fileName, imageFile);

      if (uploadError) {
        setErrorMessage("Image upload failed: " + uploadError.message);
        setSaving(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("recipe-images")
        .getPublicUrl(fileName);

      imageUrl = urlData.publicUrl;
    }

    const { error } = await supabase
      .from("recipes")
      .update({
        title,
        ingredients,
        steps,
        dietary_tag: dietaryTag || null,
        estimated_cost: estimatedCost === "" ? null : Number(estimatedCost),
        image_url: imageUrl || null,
        video_url: videoUrl || null,
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
          <div style={{
            marginBottom: 16,
            padding: "12px 14px",
            borderRadius: 12,
            background: "#fff1f0",
            border: "1px solid #f5c2c0",
            color: "#b42318",
            fontSize: "0.95rem",
          }}>
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div style={{
            marginBottom: 16,
            padding: "12px 14px",
            borderRadius: 12,
            background: "#ecfdf3",
            border: "1px solid #abefc6",
            color: "#067647",
            fontSize: "0.95rem",
          }}>
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
            <option value="keto">Keto</option>
            <option value="dairy-free">Dairy-free</option>
            <option value="pescatarian">Pescatarian</option>
          </select>

          <label className="label">Estimated Cost (£)</label>
          <input
            className="input"
            type="number"
            step="0.01"
            min="0"
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

          <label className="label">Recipe Image (optional)</label>
          {existingImageUrl && (
            <div style={{ marginBottom: 8 }}>
              <img
                src={existingImageUrl}
                alt="Current recipe"
                style={{ width: 120, height: 80, objectFit: "cover", borderRadius: 8 }}
              />
              <p style={{ margin: "4px 0 0 0", fontSize: "0.85rem", color: "#666" }}>Current image</p>
            </div>
          )}
          <input
            className="input"
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
          />
          {imageFile && (
            <p style={{ margin: "6px 0 0 0", fontSize: "0.9rem", color: "#666" }}>
              New image selected: {imageFile.name}
            </p>
          )}

          <label className="label">Video URL (optional)</label>
          <input
            className="input"
            type="text"
            placeholder="Paste a YouTube link e.g. https://youtube.com/watch?v=..."
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
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