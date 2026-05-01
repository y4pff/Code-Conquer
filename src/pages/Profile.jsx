import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Link } from "react-router-dom";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [myRecipes, setMyRecipes] = useState([]);
  const [favCount, setFavCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [socialLink, setSocialLink] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);

      const { data: userData } = await supabase.auth.getUser();
      const u = userData.user;
      setUser(u);

      if (!u) {
        setLoading(false);
        return;
      }

      const { data: recipes } = await supabase
        .from("recipes")
        .select("id, title, created_at")
        .eq("user_id", u.id)
        .order("created_at", { ascending: false });

      setMyRecipes(recipes || []);

      const { count } = await supabase
        .from("favourites")
        .select("*", { count: "exact", head: true })
        .eq("user_id", u.id);

      setFavCount(count || 0);

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", u.id)
        .single();

      if (profile) {
        setUsername(profile.username || "");
        setBio(profile.bio || "");
        setSocialLink(profile.social_link || "");
        setContactNumber(profile.contact_number || "");
      }

      setLoading(false);
    }

    load();
  }, []);

  async function handleSaveProfile(e) {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMessage("");

    const { data: userData } = await supabase.auth.getUser();
    const u = userData.user;

    if (!u) {
      setProfileMessage("You must be logged in.");
      setProfileSaving(false);
      return;
    }

    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", u.id)
      .single();

    let error;

    if (existing) {
      const res = await supabase
        .from("profiles")
        .update({
          username,
          bio,
          social_link: socialLink,
          contact_number: contactNumber,
        })
        .eq("id", u.id);
      error = res.error;
    } else {
      const res = await supabase
        .from("profiles")
        .insert([{
          id: u.id,
          username,
          bio,
          social_link: socialLink,
          contact_number: contactNumber,
        }]);
      error = res.error;
    }

    setProfileSaving(false);

    if (error) {
      setProfileMessage("Error saving profile: " + error.message);
    } else {
      setProfileMessage("Profile saved successfully.");
    }
  }

  if (loading) {
    return (
      <div className="container">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container" style={{ maxWidth: 600 }}>
        <div className="card">
          <h1 style={{ marginTop: 0 }}>Profile</h1>
          <p style={{ color: "#666" }}>You are not logged in.</p>
          <Link className="btn" to="/login">Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">

      <div className="card" style={{ marginBottom: 24 }}>
        <h1 style={{ marginTop: 0, marginBottom: 8 }}>My Profile</h1>
        <p style={{ marginTop: 0, color: "#666" }}>
          Manage your account and view your recipe activity.
        </p>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          marginTop: 20,
        }}>
          <div className="card">
            <p style={{ margin: "0 0 8px 0", color: "#666" }}>Email</p>
            <p style={{ margin: 0, fontWeight: 600 }}>{user.email}</p>
          </div>

          <div className="card">
            <p style={{ margin: "0 0 8px 0", color: "#666" }}>Saved Recipes</p>
            <p style={{ margin: 0, fontWeight: 600 }}>{favCount}</p>
          </div>

          <div className="card">
            <p style={{ margin: "0 0 8px 0", color: "#666" }}>Recipes Created</p>
            <p style={{ margin: 0, fontWeight: 600 }}>{myRecipes.length}</p>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h2 style={{ marginTop: 0, marginBottom: 8 }}>Edit Profile</h2>
        <p style={{ marginTop: 0, color: "#666" }}>
          Update your profile information.
        </p>

        {profileMessage && (
          <div style={{
            marginBottom: 16,
            padding: "12px 14px",
            borderRadius: 12,
            background: profileMessage.includes("Error") ? "#fff1f0" : "#ecfdf3",
            border: profileMessage.includes("Error") ? "1px solid #f5c2c0" : "1px solid #abefc6",
            color: profileMessage.includes("Error") ? "#b42318" : "#067647",
            fontSize: "0.95rem",
          }}>
            {profileMessage}
          </div>
        )}

        <form onSubmit={handleSaveProfile}>
          <label className="label">Username</label>
          <input
            className="input"
            type="text"
            placeholder="Enter a username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <label className="label">Bio</label>
          <textarea
            className="textarea"
            rows={3}
            placeholder="Tell us about yourself..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />

          <label className="label">Social Media Link</label>
          <input
            className="input"
            type="text"
            placeholder="e.g. https://instagram.com/yourprofile"
            value={socialLink}
            onChange={(e) => setSocialLink(e.target.value)}
          />

          <label className="label">Contact Number</label>
          <input
            className="input"
            type="text"
            placeholder="e.g. 07700 900000"
            value={contactNumber}
            onChange={(e) => setContactNumber(e.target.value)}
          />

          <div style={{ marginTop: 16 }}>
            <button className="btn" type="submit" disabled={profileSaving}>
              {profileSaving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0, marginBottom: 8 }}>Your Recipes</h2>
        <p style={{ marginTop: 0, color: "#666" }}>
          View and manage the recipes you have created.
        </p>

        {myRecipes.length === 0 ? (
          <div className="card" style={{ marginTop: 16 }}>
            <p style={{ margin: 0 }}>You have not created any recipes yet.</p>
          </div>
        ) : (
          <div className="list" style={{ marginTop: 16 }}>
            {myRecipes.map((r) => (
              <div className="listItem" key={r.id}>
                <div>
                  <Link to={`/recipes/${r.id}`} className="link">
                    {r.title}
                  </Link>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <Link to={`/recipes/${r.id}`} className="btnSmall">View</Link>
                  <Link to={`/recipes/${r.id}/edit`} className="btnSmall">Edit</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}