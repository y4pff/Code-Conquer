import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function CreateRecipe() {
  const [title, setTitle] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [steps, setSteps] = useState("");
  const [dietaryTag, setDietaryTag] = useState("vegetarian");
  const [estimatedCost, setEstimatedCost] = useState("");

  const navigate = useNavigate();

  async function handleCreate(e) {
    e.preventDefault();

    // Get current user
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;

    if (!user) {
      alert("You must be logged in to create a recipe.");
      return;
    }

    const { error } = await supabase.from("recipes").insert([
      {
        user_id: user.id,
        title,
        ingredients,
        steps,
        dietary_tag: dietaryTag,
        estimated_cost: estimatedCost ? Number(estimatedCost) : null,
      },
    ]);

    if (error) {
      alert(error.message);
    } else {
      alert("Recipe created!");
      navigate("/");
    }
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Create Recipe</h1>

      <form onSubmit={handleCreate}>
        <div>
          <label>Title</label>
          <br />
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Chicken Pasta"
            required
          />
        </div>

        <br />

        <div>
          <label>Ingredients</label>
          <br />
          <textarea
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            placeholder="List ingredients..."
            rows={4}
            required
          />
        </div>

        <br />

        <div>
          <label>Steps</label>
          <br />
          <textarea
            value={steps}
            onChange={(e) => setSteps(e.target.value)}
            placeholder="Write the steps..."
            rows={5}
            required
          />
        </div>

        <br />

        <div>
          <label>Dietary Tag</label>
          <br />
          <select value={dietaryTag} onChange={(e) => setDietaryTag(e.target.value)}>
            <option value="vegetarian">Vegetarian</option>
            <option value="vegan">Vegan</option>
            <option value="halal">Halal</option>
            <option value="gluten-free">Gluten-free</option>
          </select>
        </div>

        <br />

        <div>
          <label>Estimated Cost (£)</label>
          <br />
          <input
            type="number"
            value={estimatedCost}
            onChange={(e) => setEstimatedCost(e.target.value)}
            placeholder="e.g. 6.50"
            step="0.01"
          />
        </div>

        <br />

        <button type="submit">Create</button>
      </form>
    </div>
  );
}