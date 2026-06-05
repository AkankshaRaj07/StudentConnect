import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Plus, X, Tag, MapPin, IndianRupee, Image as ImageIcon, Trash2, Edit2, CheckCircle, ShoppingBag } from "lucide-react";

export default function MarketplacePage() {
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "Books",
    condition: "Used",
    location: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const { user } = useAuth(); // 👈 current logged-in user

  const fetchItems = async () => {
    try {
      setError("");
      const res = await api.get("/marketplace");
      setItems(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load listings");
    }
  };

  useEffect(() => {
    fetchItems();
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
      if (editingId) {
        await api.put(`/marketplace/${editingId}`, {
          ...form,
          price: Number(form.price),
        });
      } else {
        await api.post("/marketplace", {
          ...form,
          price: Number(form.price),
        });
      }
      setForm({
        title: "",
        description: "",
        price: "",
        category: "Books",
        condition: "Used",
        location: "",
      });
      setShowForm(false); // hide form after successful submit
      setEditingId(null);
      fetchItems();
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || `Failed to ${editingId ? "update" : "create"} listing`);
    }
  };

  const handleEdit = (item) => {
    setForm({
      title: item.title,
      description: item.description,
      price: item.price,
      category: item.category || "Books",
      condition: item.condition || "Used",
      location: item.location || "",
    });
    setEditingId(item._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMarkSold = async (id) => {
    try {
      await api.patch(`/marketplace/${id}/mark-sold`);
      fetchItems();
    } catch (err) {
      console.error(err);
      alert("Failed to mark as sold");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) return;
    try {
      await api.delete(`/marketplace/${id}`);
      fetchItems();
    } catch (err) {
      console.error(err);
      alert("Failed to delete listing");
    }
  };

  // Sort so available items come before sold ones
  const sortedItems = [...items].sort((a, b) => {
    const aSold = a.status === "sold";
    const bSold = b.status === "sold";
    return Number(aSold) - Number(bSold);
  });

  return (
    <div className="page-shell">
      {/* Header */}
      <div
        style={{
          marginBottom: "2.5rem",
          padding: "2rem",
          background: "linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0) 100%)",
          borderRadius: "16px",
          border: "1px solid rgba(59, 130, 246, 0.1)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h2 style={{ marginBottom: "0.5rem", fontSize: "2rem", fontWeight: "800", color: "#fff" }}>Campus Marketplace</h2>
          <p style={{ margin: 0, color: "#cbd5e1", fontSize: "1.05rem" }}>
            Buy & sell books, electronics, and hostel essentials securely.
          </p>
        </div>
      </div>

      {/* Floating Action Button */}
      <button
        className="fab"
        onClick={() => setShowForm(true)}
        title="Add Listing"
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
              <h3 style={{ margin: 0 }}>{editingId ? "Edit Listing" : "Create Listing"}</h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setForm({
                    title: "",
                    description: "",
                    price: "",
                    category: "Books",
                    condition: "Used",
                    location: "",
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
                  placeholder="e.g., Mac Graw Hill Physics"
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
                  placeholder="Condition details, why you are selling..."
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
                  <label style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.9rem" }}>Price (₹)</label>
                  <div style={{ position: "relative" }}>
                    <IndianRupee size={16} style={{ position: "absolute", left: "12px", top: "14px", color: "#94a3b8" }} />
                    <input
                      name="price"
                      type="number"
                      min="0"
                      value={form.price}
                      onChange={handleChange}
                      className="input"
                      style={{ paddingLeft: "2.2rem" }}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.9rem" }}>Location</label>
                  <input
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    className="input"
                    placeholder="CS Block, Hostel, etc."
                    required
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
                  <label style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.9rem" }}>Category</label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="select"
                  >
                    <option>Books</option>
                    <option>Electronics</option>
                    <option>Hostel Essentials</option>
                    <option>Stationery</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.9rem" }}>Condition</label>
                  <select
                    name="condition"
                    value={form.condition}
                    onChange={handleChange}
                    className="select"
                  >
                    <option>New</option>
                    <option>Like New</option>
                    <option>Good</option>
                    <option>Used</option>
                  </select>
                </div>
              </div>

              {error && (
                <div style={{ color: "#fca5a5", fontSize: "0.85rem", marginBottom: "1rem" }}>
                  {error}
                </div>
              )}

              <button type="submit" className="btn-primary" style={{ width: "100%", padding: "0.8rem" }}>
                {editingId ? "Update Listing" : "Post Listing"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Listings (always visible) */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h3 style={{ margin: 0, fontSize: "1.5rem", fontWeight: "700" }}>All Listings</h3>
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
          <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "rgba(59, 130, 246, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ShoppingBag size={40} color="#3b82f6" />
          </div>
          <div>
            <h3 style={{ fontSize: "1.3rem", margin: "0 0 0.5rem 0" }}>No Items Listed</h3>
            <p style={{ color: "#9ca3af", margin: 0, maxWidth: "400px" }}>
              The marketplace is currently empty. Be the first to list your old books, electronics, or hostel essentials!
            </p>
          </div>
          <button className="btn-primary" onClick={() => setShowForm(true)} style={{ marginTop: "1rem" }}>
            Create First Listing
          </button>
        </div>
      )}

      <div className="responsive-grid">
        {sortedItems.map((item) => {
          const isSold = item.status === "sold";
          const isOwner = item.seller?._id === user?.id;

          return (
            <div key={item._id} className="listing-card" style={{ display: 'flex', flexDirection: 'column' }}>
              
              {/* Image Placeholder */}
              <div style={{
                height: "160px",
                background: "rgba(255,255,255,0.02)",
                borderRadius: "10px",
                marginBottom: "1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px dashed rgba(255,255,255,0.1)"
              }}>
                <ImageIcon size={48} color="rgba(255,255,255,0.1)" />
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                  <h3 style={{ margin: 0, fontSize: "1.15rem", lineHeight: 1.3 }}>{item.title}</h3>
                  <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#f97316", display: "flex", alignItems: "center" }}>
                    <IndianRupee size={16} strokeWidth={3} /> {item.price}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.8rem", flexWrap: "wrap" }}>
                  <span className="badge" style={{ display: "flex", gap: "0.2rem" }}><Tag size={12} /> {item.category}</span>
                  <span className="badge" style={{ background: "rgba(255,255,255,0.1)", color: "#cbd5e1" }}>{item.condition}</span>
                  {isSold && (
                    <span className="badge" style={{ backgroundColor: "rgba(220, 38, 38, 0.2)", color: "#ef4444" }}>SOLD</span>
                  )}
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
                  By: {item.seller?.name}
                </div>

                {isOwner && (
                  <div style={{ display: "flex", gap: "0.4rem" }}>
                    {!isSold && (
                      <button onClick={() => handleMarkSold(item._id)} style={{ background: "rgba(22, 163, 74, 0.2)", color: "#22c55e", border: "none", padding: "0.4rem", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center" }} title="Mark as Sold">
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
