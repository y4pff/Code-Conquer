import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CreateRecipe from "./pages/CreateRecipe";
import RecipeDetail from "./pages/RecipeDetail";
import EditRecipe from "./pages/EditRecipe";
import NavBar from "./components/NavBar";
import Favourites from "./pages/Favourites";
import Profile from "./pages/Profile";

export default function App() {
  return (
    <BrowserRouter>
      <NavBar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/create" element={<CreateRecipe />} />

        <Route path="/recipes/:id" element={<RecipeDetail />} />
        <Route path="/recipe/:id" element={<RecipeDetail />} />

        <Route path="/recipes/:id/edit" element={<EditRecipe />} />

        <Route path="/favourites" element={<Favourites />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>

    </BrowserRouter>
  );
}