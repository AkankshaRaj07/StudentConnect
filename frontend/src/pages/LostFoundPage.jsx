import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Plus, X, MapPin, Calendar, CheckCircle, Edit2, Trash2, Tag, Search } from "lucide-react";

export default function LostFoundPage() {
  const [items, setItems] = useState([]);
  const [activeTab, setActiveTab] = useState("lost"); // "lost" | "found"
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "lost",
    category: "ID Card",
    location: "",
    date: "",
    contactInfo: "",
  });

  const { user } = useAuth();

  const fetchItems = async () => {
    try {
      setError("");
      const res = await api.get("/lostfound", {
        params: { type: activeTab },
      });
      setItems(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load lost/found posts");
    }
  };

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

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
        ...form,
        // If date is filled, send Date object; else let backend handle default
        date: form.date ? new Date(form.date) : undefined,
      };

      if (editingId) {
        await api.put(`/lostfound/${editingId}`, payload);
      } else {
        await api.post("/lostfound", payload);
      }

      setForm({
        title: "",
        description: "",
        type: activeTab,
        category: "ID Card",
        location: "",
        date: "",
        contactInfo: "",
      });

      setShowForm(false);
      setEditingId(null);
      fetchItems();
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || `Failed to ${editingId ? "update" : "create"} post`);
    }
  };

  const handleEdit = (item) => {
    // format date for input[type="date"]
    let formattedDate = "";
    if (item.date) {
      const d = new Date(item.date);
      formattedDate = d.toISOString().split("T")[0];
    }

    setForm({
      title: item.title,
      description: item.description,
      type: item.type,
      category: item.category || "ID Card",
      location: item.location || "",
      date: formattedDate,
      contactInfo: item.contactInfo || "",
    });
    setActiveTab(item.type);
    setEditingId(item._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMarkResolved = async (id) => {
    try {
      await api.patch(`/lostfound/${id}/resolve`);
      fetchItems();
    } catch (err) {
      console.error(err);
      alert(
        err?.response?.data?.message ||
          `Failed to mark as resolved (status ${err?.response?.status || "?"})`
      );
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await api.delete(`/lostfound/${id}`);
      fetchItems();
    } catch (err) {
      console.error(err);
      alert("Failed to delete post");
    }
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    setForm((prev) => ({ ...prev, type: tab }));
    setShowForm(false);
    setEditingId(null);
  };

  // unresolved first, then resolved
  const sortedItems = [...items].sort(
    (a, b) => Number(a.isResolved) - Number(b.isResolved)
  );

  return (
    <div className="page-shell">
      {/* Header */}
      <div
        style={{
          marginBottom: "2.5rem",
          padding: "2rem",
          background: "linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0) 100%)",
          borderRadius: "16px",
          border: "1px solid rgba(239, 68, 68, 0.1)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h2 style={{ marginBottom: "0.5rem", fontSize: "2rem", fontWeight: "800", color: "#fff" }}>Lost & Found</h2>
          <p style={{ margin: 0, color: "#cbd5e1", fontSize: "1.05rem" }}>
            Help your batchmates by reporting lost or found items on campus.
          </p>
        </div>
      </div>

      {/* Floating Action Button */}
      <button
        className="fab"
        onClick={() => setShowForm(true)}
        title="Report Item"
      >
        <Plus size={28} />
      </button>

      {/* Tabs */}
      <div style={{ marginBottom: "1rem" }}>
        <button
          onClick={() => switchTab("lost")}
          style={{
            padding: "0.4rem 0.9rem",
            borderRadius: "999px",
            border: "none",
            marginRight: "0.4rem",
            cursor: "pointer",
            background:
              activeTab === "lost" ? "#f97316" : "rgba(148,163,184,0.2)",
            color: "white",
            fontWeight: 600,
          }}
        >
          Lost Items
        </button>
        <button
          onClick={() => switchTab("found")}
          style={{
            padding: "0.4rem 0.9rem",
            borderRadius: "999px",
            border: "none",
            cursor: "pointer",
            background:
              activeTab === "found" ? "#f97316" : "rgba(148,163,184,0.2)",
            color: "white",
            fontWeight: 600,
          }}
        >
          Found Items
        </button>
      </div>

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
              <h3 style={{ margin: 0 }}>
                {editingId ? "Edit" : "Report"} {activeTab === "lost" ? "Lost" : "Found"} Item
              </h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setForm({
                    title: "",
                    description: "",
                    type: activeTab,
                    category: "ID Card",
                    location: "",
                    date: "",
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
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.9rem" }}>Title</label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  className="input"
                  placeholder={
                    activeTab === "lost"
                      ? "Lost wallet near cafeteria"
                      : "Found headphones in library"
                  }
                  required
                />
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
                  <label style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.9rem" }}>Category</label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="select"
                  >
                    <option>ID Card</option>
                    <option>Book</option>
                    <option>Electronics</option>
                    <option>Keys</option>
                    <option>Wallet</option>
                    <option>Other</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.9rem" }}>Date</label>
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    className="input"
                    required
                  />
                </div>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.9rem" }}>Location</label>
                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  className="input"
                  placeholder="CSE Block, Canteen, Parking..."
                  required
                />
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.9rem" }}>Contact Info (optional)</label>
                <input
                  name="contactInfo"
                  value={form.contactInfo}
                  onChange={handleChange}
                  className="input"
                  placeholder="Phone / Insta / Room no."
                />
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

      {/* List posts */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h3 style={{ margin: 0, fontSize: "1.5rem", fontWeight: "700" }}>
          {activeTab === "lost" ? "Recently Lost Items" : "Recently Found Items"}
        </h3>
      </div>

      {sortedItems.length === 0 && (
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
          <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: activeTab === "lost" ? "rgba(239, 68, 68, 0.1)" : "rgba(34, 197, 94, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Search size={40} color={activeTab === "lost" ? "#ef4444" : "#22c55e"} />
          </div>
          <div>
            <h3 style={{ fontSize: "1.3rem", margin: "0 0 0.5rem 0" }}>No {activeTab} items reported</h3>
            <p style={{ color: "#9ca3af", margin: 0, maxWidth: "400px" }}>
              Looks like there are no {activeTab} items reported right now. If you {activeTab === "lost" ? "lost something" : "found an item"}, you can report it to help others.
            </p>
          </div>
          <button className="btn-primary" onClick={() => setShowForm(true)} style={{ marginTop: "1rem", background: activeTab === "lost" ? "#ef4444" : "#22c55e" }}>
            Report {activeTab === "lost" ? "Lost" : "Found"} Item
          </button>
        </div>
      )}

      <div className="responsive-grid">
        {sortedItems.map((item) => {
          const isResolved = item.isResolved;
          const isOwner = item.reportedBy?._id === user?.id;

          return (
            <div key={item._id} className="listing-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.8rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: activeTab === 'lost' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)', display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Search size={20} color={activeTab === 'lost' ? '#ef4444' : '#22c55e'} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: "1.1rem", lineHeight: 1.2 }}>{item.title}</h3>
                      <span className="muted" style={{ fontSize: "0.8rem" }}>{new Date(item.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {isResolved && (
                    <span className="badge" style={{ backgroundColor: "rgba(22, 163, 74, 0.2)", color: "#22c55e", textTransform: "uppercase" }}>
                      Resolved
                    </span>
                  )}
                </div>

                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.8rem", flexWrap: "wrap" }}>
                  <span className="badge" style={{ display: "flex", gap: "0.2rem", background: "rgba(255,255,255,0.1)", color: "#cbd5e1" }}><Tag size={12} /> {item.category}</span>
                </div>

                <div style={{ fontSize: "0.95rem", color: "#cbd5e1", marginBottom: "1rem", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {item.description}
                </div>

                {item.location && (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem", color: "#94a3b8", marginBottom: "0.5rem" }}>
                    <MapPin size={14} /> {item.location}
                  </div>
                )}
              </div>

              <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div className="muted" style={{ fontSize: "0.8rem" }}>
                  By: {item.reportedBy?.name}
                </div>

                {isOwner && (
                  <div style={{ display: "flex", gap: "0.4rem" }}>
                    {!isResolved && (
                      <button onClick={() => handleMarkResolved(item._id)} style={{ background: "rgba(22, 163, 74, 0.2)", color: "#22c55e", border: "none", padding: "0.4rem", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center" }} title="Mark as Resolved">
                        <CheckCircle size={18} />
                      </button>
                    )}
                    <button onClick={() => handleEdit(item)} style={{ background: "rgba(59, 130, 246, 0.2)", color: "#3b82f6", border: "none", padding: "0.4rem", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center" }} title="Edit">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(item._id)} style={{ background: "rgba(239, 68, 68, 0.2)", color: "#ef4444", border: "none", padding: "0.4rem", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center" }} title="Delete">
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
