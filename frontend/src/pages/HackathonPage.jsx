import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Plus, X, Users, Code, Mail, Edit2, Trash2, XCircle } from "lucide-react";

export default function HackathonPage() {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

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
      const payload = {
        hackathonName: form.hackathonName,
        title: form.title,
        description: form.description,
        techStack: form.techStack, // backend will split into array
        skillsNeeded: form.skillsNeeded,
        maxMembers: form.maxTeamSize
          ? Number(form.maxTeamSize)
          : undefined,
        contactInfo: form.contactInfo,
      };

      if (editingId) {
        await api.put(`/hackathon/post/${editingId}`, payload);
      } else {
        await api.post("/hackathon", payload);
      }

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
      setEditingId(null);
      fetchPosts();
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || `Failed to ${editingId ? "update" : "create"} post`);
    }
  };

  const handleEdit = (post) => {
    setForm({
      title: post.title,
      description: post.description,
      hackathonName: post.hackathonName || "",
      techStack: Array.isArray(post.techStack) ? post.techStack.join(", ") : post.techStack || "",
      skillsNeeded: post.skillsNeeded || "",
      maxTeamSize: post.maxMembers || "",
      contactInfo: post.contactInfo || "",
    });
    setEditingId(post._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await api.delete(`/hackathon/post/${id}`);
      fetchPosts();
    } catch (err) {
      console.error(err);
      alert("Failed to delete post");
    }
  };

  const handleApply = async (id) => {
    const message = window.prompt("Introduce yourself (skills, experience, why you want to join):");
    if (message === null) return; // user cancelled
    try {
      await api.post(`/hackathon/post/${id}/apply`, { message });
      alert("Applied successfully!");
      fetchPosts();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to apply");
    }
  };

  const handleApplicantStatus = async (postId, applicantId, status) => {
    try {
      await api.post(`/hackathon/post/${postId}/applicants/${applicantId}/status`, { status });
      fetchPosts();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to update status");
    }
  };

  return (
    <div className="page-shell">
      {/* Header */}
      <div
        style={{
          marginBottom: "2.5rem",
          padding: "2rem",
          background: "linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(168, 85, 247, 0) 100%)",
          borderRadius: "16px",
          border: "1px solid rgba(168, 85, 247, 0.1)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h2 style={{ marginBottom: "0.5rem", fontSize: "2rem", fontWeight: "800", color: "#fff" }}>Hackathon Team Finder</h2>
          <p style={{ margin: 0, color: "#cbd5e1", fontSize: "1.05rem" }}>
            Create or join teams for upcoming hackathons.
          </p>
        </div>
      </div>

      {/* Floating Action Button */}
      <button
        className="fab"
        onClick={() => setShowForm(true)}
        title="Create Team"
      >
        <Plus size={28} />
      </button>

      {/* Modal Form */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "1.5rem",
                alignItems: "center",
              }}
            >
              <h3 style={{ margin: 0 }}>{editingId ? "Edit Team Post" : "Create Team / Looking for Team"}</h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setForm({
                    title: "",
                    description: "",
                    hackathonName: "",
                    techStack: "",
                    skillsNeeded: "",
                    maxTeamSize: "",
                    contactInfo: "",
                  });
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "#9ca3af",
                  cursor: "pointer",
                  display: "flex",
                }}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                  marginBottom: "1rem",
                }}
              >
                <div>
                  <label style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.9rem" }}>Hackathon Name</label>
                  <input
                    name="hackathonName"
                    value={form.hackathonName}
                    onChange={handleChange}
                    className="input"
                    placeholder="e.g. SIH 2025"
                    required
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.9rem" }}>Post Title</label>
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    className="input"
                    placeholder="Looking for 2 frontend devs"
                    required
                  />
                </div>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.9rem" }}>Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  className="input"
                  rows={4}
                  required
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                  marginBottom: "1rem",
                }}
              >
                <div>
                  <label style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.9rem" }}>Tech Stack (comma separated)</label>
                  <input
                    name="techStack"
                    value={form.techStack}
                    onChange={handleChange}
                    className="input"
                    placeholder="React, Node, ML, Figma"
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.9rem" }}>Skills Needed</label>
                  <input
                    name="skillsNeeded"
                    value={form.skillsNeeded}
                    onChange={handleChange}
                    className="input"
                    placeholder="Frontend, backend, design"
                  />
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                  marginBottom: "1.5rem",
                }}
              >
                <div>
                  <label style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.9rem" }}>Team Size (max)</label>
                  <input
                    name="maxTeamSize"
                    type="number"
                    value={form.maxTeamSize}
                    onChange={handleChange}
                    className="input"
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.9rem" }}>Contact Info</label>
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
                <div style={{ color: "#fca5a5", fontSize: "0.85rem", marginBottom: "1rem" }}>
                  {error}
                </div>
              )}

              <button type="submit" className="btn-primary" style={{ width: "100%", padding: "0.8rem" }}>
                {editingId ? "Update Post" : "Post"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Posts list */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h3 style={{ margin: 0, fontSize: "1.5rem", fontWeight: "700" }}>All Posts</h3>
      </div>
      
      {posts.length === 0 && (
        <div style={{ 
          textAlign: "center", 
          padding: "4rem 2rem", 
          background: "rgba(255,255,255,0.02)", 
          borderRadius: "16px", 
          border: "1px dashed rgba(255,255,255,0.1)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1rem"
        }}>
          <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "rgba(168, 85, 247, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Users size={40} color="#a855f7" />
          </div>
          <div>
            <h3 style={{ fontSize: "1.3rem", margin: "0 0 0.5rem 0" }}>No Teams Found</h3>
            <p style={{ color: "#9ca3af", margin: 0, maxWidth: "400px" }}>
              There are no hackathon team posts at the moment. Be the first to create one and start building!
            </p>
          </div>
          <button className="btn-primary" onClick={() => setShowForm(true)} style={{ marginTop: "1rem" }}>
            Create First Post
          </button>
        </div>
      )}

      <div className="responsive-grid">
        {posts.map((p) => {
          const isClosed = p.isClosed;
          const isOwner = p.createdBy?._id === user?.id;

          return (
            <div key={p._id} className="listing-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.8rem" }}>
                  <div>
                    {p.hackathonName && (
                      <div className="badge" style={{ marginBottom: "0.5rem" }}>{p.hackathonName}</div>
                    )}
                    <h3 style={{ margin: 0, fontSize: "1.15rem", lineHeight: 1.3 }}>{p.title}</h3>
                  </div>
                  {isClosed && (
                    <span className="badge" style={{ backgroundColor: "rgba(220, 38, 38, 0.2)", color: "#ef4444", textTransform: "uppercase" }}>
                      Closed
                    </span>
                  )}
                </div>

                <div style={{ fontSize: "0.95rem", color: "#cbd5e1", marginBottom: "1rem", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {p.description}
                </div>

                {p.techStack && p.techStack.length > 0 && (
                  <div style={{ marginBottom: "0.8rem" }}>
                    <div style={{ fontSize: "0.8rem", color: "#9ca3af", marginBottom: "0.3rem", display: "flex", alignItems: "center", gap: "0.3rem" }}><Code size={12}/> Tech Stack:</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                      {p.techStack.map((tech, i) => (
                        <span key={i} className="badge" style={{ background: "rgba(139, 92, 246, 0.15)", color: "#c084fc" }}>
                          {tech.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {p.skillsNeeded && (
                  <div style={{ marginBottom: "0.8rem", fontSize: "0.85rem", color: "#cbd5e1" }}>
                    <strong>Looking for:</strong> {p.skillsNeeded}
                  </div>
                )}

                <div style={{ display: "flex", gap: "1rem", fontSize: "0.85rem", color: "#94a3b8", marginBottom: "0.5rem" }}>
                  {p.maxMembers && (
                    <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                      <Users size={14} /> Max {p.maxMembers}
                    </span>
                  )}
                  {p.contactInfo && (
                    <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                      <Mail size={14} /> Contact provided
                    </span>
                  )}
                </div>
              </div>

              <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                <div className="muted" style={{ fontSize: "0.8rem" }}>
                  By: {p.createdBy?.name}
                </div>

                <div style={{ display: "flex", gap: "0.4rem" }}>
                  {isOwner ? (
                    <>
                      {!isClosed && (
                        <button onClick={() => handleCloseTeam(p._id)} style={{ background: "rgba(220, 38, 38, 0.2)", color: "#ef4444", border: "none", padding: "0.4rem", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center" }} title="Close Team">
                          <XCircle size={18} />
                        </button>
                      )}
                      <button onClick={() => handleEdit(p)} style={{ background: "rgba(59, 130, 246, 0.2)", color: "#3b82f6", border: "none", padding: "0.4rem", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center" }} title="Edit">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(p._id)} style={{ background: "rgba(239, 68, 68, 0.2)", color: "#ef4444", border: "none", padding: "0.4rem", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center" }} title="Delete">
                        <Trash2 size={18} />
                      </button>
                    </>
                  ) : (
                    !isClosed && (
                      <button onClick={() => handleApply(p._id)} className="btn-primary" style={{ padding: "0.4rem 1rem", fontSize: "0.85rem" }}>
                        Apply
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Applicants section (Only visible to owner) */}
              {isOwner && p.applicants && p.applicants.length > 0 && (
                <div style={{ marginTop: "1rem", padding: "0.75rem", background: "rgba(0,0,0,0.03)", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
                  <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "0.95rem" }}>Applicants</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {p.applicants.map((app) => (
                      <div key={app._id || app.user._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem", padding: "0.4rem 0", borderBottom: "1px solid #e5e7eb" }}>
                        <div>
                          <strong>{app.user.name}</strong> ({app.user.enrollment})<br/>
                          <span style={{ color: "#6b7280" }}>{app.message || "No message provided."}</span>
                        </div>
                        <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                          {app.status === "pending" ? (
                            <>
                              <button onClick={() => handleApplicantStatus(p._id, app.user._id, "accepted")} style={{ background: "#16a34a", color: "white", border: "none", borderRadius: "4px", padding: "0.2rem 0.5rem", cursor: "pointer", fontSize: "0.8rem" }}>Accept</button>
                              <button onClick={() => handleApplicantStatus(p._id, app.user._id, "rejected")} style={{ background: "#dc2626", color: "white", border: "none", borderRadius: "4px", padding: "0.2rem 0.5rem", cursor: "pointer", fontSize: "0.8rem" }}>Reject</button>
                            </>
                          ) : (
                            <span style={{ fontWeight: 600, color: app.status === "accepted" ? "#16a34a" : "#dc2626", textTransform: "capitalize" }}>{app.status}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
