import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

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
      await api.post("/marketplace", {
        ...form,
        price: Number(form.price),
      });
      setForm({
        title: "",
        description: "",
        price: "",
        category: "Books",
        condition: "Used",
        location: "",
      });
      setShowForm(false); // hide form after successful submit
      fetchItems();
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to create listing");
    }
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

  // Sort so available items come before sold ones
  const sortedItems = [...items].sort((a, b) => {
    const aSold = a.status === "sold";
    const bSold = b.status === "sold";
    return Number(aSold) - Number(bSold);
  });

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
          <h2 style={{ marginBottom: "0.3rem" }}>Marketplace</h2>
          <p style={{ color: "#9ca3af", fontSize: "0.9rem", margin: 0 }}>
            Buy &amp; sell books, electronics and hostel essentials within
            campus.
          </p>
        </div>

        <button
          className="btn-primary"
          onClick={() => setShowForm(true)}
          style={{ whiteSpace: "nowrap" }}
        >
          + Add your listing
        </button>
      </div>

      {/* Form (shown only when user clicks button) */}
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
            <h3 style={{ margin: 0 }}>Create Listing</h3>
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
              <label>Title</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                className="input"
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

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.75rem",
                marginBottom: "0.75rem",
              }}
            >
              <div>
                <label>Price (₹)</label>
                <input
                  name="price"
                  type="number"
                  value={form.price}
                  onChange={handleChange}
                  className="input"
                />
              </div>
              <div>
                <label>Location</label>
                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  className="input"
                  placeholder="CS Block, Hostel, etc."
                />
              </div>
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
                <label>Category</label>
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
                <label>Condition</label>
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
              <div style={{ color: "#fca5a5", fontSize: "0.85rem" }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn-primary">
              Add Listing
            </button>
          </form>
        </div>
      )}

      {/* Listings (always visible) */}
      <h3 style={{ marginBottom: "0.75rem" }}>All Listings</h3>
      {sortedItems.length === 0 && (
        <p style={{ color: "#9ca3af", fontSize: "0.9rem" }}>
          No items yet. Be the first to list something!
        </p>
      )}

      <div>
        {sortedItems.map((item) => {
          const isSold = item.status === "sold";
          const isOwner = item.seller?._id === user?.id;

          return (
            <div key={item._id} className="listing-card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "0.35rem",
                  gap: "0.5rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <strong>{item.title}</strong>
                  {isSold && (
                    <span
                      className="badge"
                      style={{ backgroundColor: "#dc2626", textTransform: "uppercase" }}
                    >
                      Sold
                    </span>
                  )}
                </div>
                <span>₹{item.price}</span>
              </div>

              <div style={{ marginBottom: "0.35rem", fontSize: "0.9rem" }}>
                {item.description}
              </div>

              <div style={{ marginBottom: "0.35rem", fontSize: "0.85rem" }}>
                <span className="badge">{item.category}</span>{" "}
                <span className="badge" style={{ marginLeft: "0.4rem" }}>
                  {item.condition}
                </span>{" "}
                {item.location && (
                  <span
                    style={{
                      marginLeft: "0.4rem",
                      fontSize: "0.8rem",
                      color: "#9ca3af",
                    }}
                  >
                    {item.location}
                  </span>
                )}
              </div>

              <div className="muted">
                Seller: {item.seller?.name} ({item.seller?.enrollment})
              </div>

              {/* Mark as sold button only for owner & only if available */}
              {isOwner && !isSold && (
                <button
                  onClick={() => handleMarkSold(item._id)}
                  className="btn-primary"
                  style={{
                    marginTop: "0.5rem",
                    background: "#dc2626",
                  }}
                >
                  Mark as Sold
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
