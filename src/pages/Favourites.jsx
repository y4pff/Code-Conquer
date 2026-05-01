import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Link } from "react-router-dom";

export default function Favourites() {
  const [favourites, setFavourites] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRecipes, setSelectedRecipes] = useState([]);
  const [checkedItems, setCheckedItems] = useState({});

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
        .select("recipe_id, recipes(id, title, dietary_tag, estimated_cost, ingredients)")
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

  function toggleSelectRecipe(recipeId) {
    setSelectedRecipes((prev) =>
      prev.includes(recipeId)
        ? prev.filter((id) => id !== recipeId)
        : [...prev, recipeId]
    );
    setCheckedItems({});
  }

  function getShoppingList() {
    const selected = selectedRecipes.length > 0
      ? favourites.filter((f) => selectedRecipes.includes(f.recipe_id))
      : [];

    const allIngredients = [];
    selected.forEach((f) => {
      if (f.recipes?.ingredients) {
        const lines = f.recipes.ingredients
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line.length > 0);
        allIngredients.push(...lines);
      }
    });

    return [...new Set(allIngredients)];
  }

  function handleCheck(item) {
    setCheckedItems((prev) => ({
      ...prev,
      [item]: !prev[item],
    }));
  }

  function handleExport() {
    const list = getShoppingList();
    const text = list
      .map((item) => (checkedItems[item] ? `[x] ${item}` : `[ ] ${item}`))
      .join("\n");

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "shopping-list.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleRemove(recipeId) {
    const { error } = await supabase
      .from("favourites")
      .delete()
      .eq("recipe_id", recipeId)
      .eq("user_id", user.id);

    if (!error) {
      const updated = favourites.filter((f) => f.recipe_id !== recipeId);
      setFavourites(updated);
      setSelectedRecipes((prev) => prev.filter((id) => id !== recipeId));
    }
  }

  const shoppingList = getShoppingList();

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
        <>
          <p style={{ color: "#666", marginBottom: 12 }}>
            Select recipes below to generate a shopping list.
          </p>

          <div className="recipeGrid">
            {favourites.map((f) => {
              const isSelected = selectedRecipes.includes(f.recipe_id);
              return (
                <div
                  className="recipeCard"
                  key={f.recipe_id}
                  style={{
                    border: isSelected ? "2px solid #e07b2a" : "2px solid transparent",
                    cursor: "pointer",
                  }}
                >
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
                    <button
                      className="btnSmall"
                      onClick={() => toggleSelectRecipe(f.recipe_id)}
                      style={{
                        background: isSelected ? "#e07b2a" : "",
                        color: isSelected ? "white" : "",
                      }}
                    >
                      {isSelected ? "✓ Selected" : "Add to List"}
                    </button>
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
              );
            })}
          </div>

          {shoppingList.length > 0 && (
            <div className="card" style={{ marginTop: 32 }}>
              <h2 style={{ marginTop: 0 }}>Shopping List</h2>
              <p style={{ color: "#666", marginTop: 0 }}>
                Generated from {selectedRecipes.length} selected recipe{selectedRecipes.length === 1 ? "" : "s"}.
              </p>

              <div style={{ marginBottom: 16 }}>
                {shoppingList.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "8px 0",
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={!!checkedItems[item]}
                      onChange={() => handleCheck(item)}
                    />
                    <span style={{
                      textDecoration: checkedItems[item] ? "line-through" : "none",
                      color: checkedItems[item] ? "#999" : "#333",
                    }}>
                      {item}
                    </span>
                  </div>
                ))}
              </div>

              <button className="btn" onClick={handleExport}>
                Export as Text
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}