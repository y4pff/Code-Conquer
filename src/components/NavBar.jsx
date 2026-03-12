import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function NavBar() {

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <nav className="navbar">

      <div className="navLeft">
        <Link className="logo" to="/">
          RecipeHub
        </Link>

        <div className="navLinks">
          <Link to="/">Home</Link>
          <Link to="/create">Add Recipe</Link>
          <Link to="/favourites">Favourites</Link>
          <Link to="/profile">Profile</Link>
        </div>
      </div>

      <div className="navRight">
        <button className="btnSmall" onClick={handleLogout}>
          Logout
        </button>
      </div>

    </nav>
  );
}