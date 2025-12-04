import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function HackathonPage() {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    hackathonName: "",
    techStack: "",
    skillsNeeded: "",
    maxTeamSize: "",
    contactInfo: "",
  });

  const { user } = useAuth();

  const fetchPosts = async () => {
    try {
      setError("");
      const res = await api.get("/hackathon");
      setPosts(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load hackathon posts");
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await api.post("/hackathon", {
        hackathonName: form.hackathonName,
        title: form.title,
        description: form.description,
        techStack: form.techStack, // backend will split into array
        skillsNeeded: form.skillsNeeded,
        maxMembers: form.maxTeamSize
          ? Number(form.maxTeamSize)
          : undefined,
        contactInfo: form.contactInfo,
      });

      setForm({
        title: "",
        description: "",
        hackathonName: "",
        techStack: "",
        skillsNeeded: "",
        maxTeamSize: "",
        contactInfo: "",
      });

      setShowForm(false); // hide form after submit
      fetchPosts();
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to create post");
    }
  };

  const handleCloseTeam = async (id) => {
    try {
      await api.patch(`/hackathon/post/${id}/close`);
      fetchPosts();
    } catch (err) {
      console.error(err);
      alert(
        err?.response?.data?.message ||
          `Failed to close team (status ${err?.response?.status || "?"})`
      );
    }
  };

  return (
    <div className="page-shell">
      {/* Header + button */}
      <div
        style={{
          marginBottom: "1.2rem",
          display: "flex",
          justifyContent: "space-between",
          gap: "1rem",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h2 style={{ marginBottom: "0.3rem" }}>Hackathon Team Finder</h2>
          <p
            style={{
              margin: 0,
              color: "#9ca3af",
              fontSize: "0.9rem",
            }}
          >
            Create or join teams for upcoming hackathons.
          </p>
        </div>

        <button
          className="btn-primary"
          onClick={() => setShowForm(true)}
          style={{ whiteSpace: "nowrap" }}
        >
          + Create post
        </button>
      </div>

      {/* Form (only visible when showForm is true) */}
      {showForm && (
        <div className="card" style={{ marginBottom: "1.2rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "0.8rem",
              alignItems: "center",
            }}
          >
            <h3 style={{ margin: 0 }}>Create Team / Looking for Team</h3>
            <button
              onClick={() => setShowForm(false)}
              style={{
                background: "none",
                border: "none",
                color: "#9ca3af",
                cursor: "pointer",
                fontSize: "1.1rem",
              }}
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "0.75rem" }}>
              <label>Hackathon Name</label>
              <input
                name="hackathonName"
                value={form.hackathonName}
                onChange={handleChange}
                className="input"
                placeholder="Smart India Hackathon, SIH 2025..."
              />
            </div>

            <div style={{ marginBottom: "0.75rem" }}>
              <label>Post Title</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                className="input"
                placeholder="Looking for 2 frontend devs"
              />
            </div>

            <div style={{ marginBottom: "0.75rem" }}>
              <label>Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="input"
                rows={3}
              />
            </div>

            <div style={{ marginBottom: "0.75rem" }}>
              <label>Tech Stack / Tools</label>
              <input
                name="techStack"
                value={form.techStack}
                onChange={handleChange}
                className="input"
                placeholder="React, Node, ML, Figma..."
              />
            </div>

            <div style={{ marginBottom: "0.75rem" }}>
              <label>Skills Needed</label>
              <input
                name="skillsNeeded"
                value={form.skillsNeeded}
                onChange={handleChange}
                className="input"
                placeholder="Frontend, backend, design, ML..."
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.75rem",
                marginBottom: "0.75rem",
              }}
            >
              <div>
                <label>Team Size (max)</label>
                <input
                  name="maxTeamSize"
                  type="number"
                  value={form.maxTeamSize}
                  onChange={handleChange}
                  className="input"
                />
              </div>
              <div>
                <label>Contact Info</label>
                <input
                  name="contactInfo"
                  value={form.contactInfo}
                  onChange={handleChange}
                  className="input"
                  placeholder="WhatsApp / Insta / Email"
                />
              </div>
            </div>

            {error && (
              <div style={{ color: "#fca5a5", fontSize: "0.85rem" }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn-primary">
              Post
            </button>
          </form>
        </div>
      )}

      {/* Posts list */}
      <h3 style={{ marginBottom: "0.75rem" }}>All Posts</h3>
      {posts.length === 0 && (
        <p style={{ color: "#9ca3af", fontSize: "0.9rem" }}>
          No hackathon posts yet.
        </p>
      )}

      <div>
        {posts.map((p) => {
          const isClosed = p.isClosed;
          const isOwner = p.createdBy?._id === user?.id;

          return (
            <div key={p._id} className="listing-card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "0.35rem",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      marginBottom: "0.2rem",
                    }}
                  >
                    {p.hackathonName && (
                      <div className="badge">{p.hackathonName}</div>
                    )}
                    {isClosed && (
                      <span
                        className="badge"
                        style={{
                          backgroundColor: "#dc2626",
                          textTransform: "uppercase",
                        }}
                      >
                        Closed
                      </span>
                    )}
                  </div>
                  <div style={{ fontWeight: 600 }}>{p.title}</div>
                </div>
                {p.maxMembers && (
                  <span className="muted">
                    Max team size: {p.maxMembers}
                  </span>
                )}
              </div>

              <div style={{ marginBottom: "0.35rem", fontSize: "0.9rem" }}>
                {p.description}
              </div>

              {p.techStack && p.techStack.length > 0 && (
                <div className="muted" style={{ marginBottom: "0.25rem" }}>
                  Tech: {p.techStack.join(", ")}
                </div>
              )}

              {p.skillsNeeded && (
                <div className="muted" style={{ marginBottom: "0.25rem" }}>
                  Looking for: {p.skillsNeeded}
                </div>
              )}

              <div className="muted">
                Posted by: {p.createdBy?.name} ({p.createdBy?.enrollment})
              </div>

              {p.contactInfo && (
                <div
                  style={{
                    marginTop: "0.25rem",
                    fontSize: "0.8rem",
                    color: "#e5e7eb",
                  }}
                >
                  Contact: {p.contactInfo}
                </div>
              )}

              {isOwner && !isClosed && (
                <button
                  onClick={() => handleCloseTeam(p._id)}
                  className="btn-primary"
                  style={{ marginTop: "0.5rem", background: "#dc2626" }}
                >
                  Close team
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
