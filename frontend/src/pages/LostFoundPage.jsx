import { useEffect, useState } from "react";
import api from "../api/axios";

export default function LostFoundPage() {
  const [items, setItems] = useState([]);
  const [activeTab, setActiveTab] = useState("lost"); // "lost" | "found"
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "lost",
    category: "ID Card",
    location: "",
    date: "",
    contactInfo: "",
  });

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
      await api.post("/lostfound", {
        ...form,
        // If date is filled, send Date object; else let backend handle default
        date: form.date ? new Date(form.date) : undefined,
      });

      // reset form (keep type same as tab)
      setForm({
        title: "",
        description: "",
        type: activeTab,
        category: "ID Card",
        location: "",
        date: "",
        contactInfo: "",
      });

      setShowForm(false); // hide form after submit
      fetchItems();
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to create post");
    }
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    setForm((prev) => ({ ...prev, type: tab }));
    // optional: close form when switching tab
    setShowForm(false);
  };

  return (
    <div className="page-shell">
      {/* Header row: title + button */}
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
          <h2 style={{ marginBottom: "0.3rem" }}>Lost &amp; Found</h2>
          <p
            style={{
              margin: 0,
              color: "#9ca3af",
              fontSize: "0.9rem",
            }}
          >
            Help your batchmates by reporting lost or found items on campus.
          </p>
        </div>

        <button
          className="btn-primary"
          onClick={() => setShowForm(true)}
          style={{ whiteSpace: "nowrap" }}
        >
          + Report item
        </button>
      </div>

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

      {/* Form card (only when showForm true) */}
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
            <h3 style={{ margin: 0 }}>
              Report {activeTab === "lost" ? "Lost" : "Found"} Item
            </h3>
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
                placeholder={
                  activeTab === "lost"
                    ? "Lost wallet near cafeteria"
                    : "Found headphones in library"
                }
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
                <label>Category</label>
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
                <label>Date</label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  className="input"
                />
              </div>
            </div>

            <div style={{ marginBottom: "0.75rem" }}>
              <label>Location</label>
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                className="input"
                placeholder="CSE Block, Canteen, Parking..."
              />
            </div>

            <div style={{ marginBottom: "0.75rem" }}>
              <label>Contact Info (optional)</label>
              <input
                name="contactInfo"
                value={form.contactInfo}
                onChange={handleChange}
                className="input"
                placeholder="Phone / Insta / Room no."
              />
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

      {/* List posts */}
      <h3 style={{ marginBottom: "0.75rem" }}>
        {activeTab === "lost" ? "Recently Lost" : "Recently Found"}
      </h3>

      {items.length === 0 && (
        <p style={{ color: "#9ca3af", fontSize: "0.9rem" }}>
          No {activeTab} items yet.
        </p>
      )}

      <div>
        {items.map((item) => (
          <div key={item._id} className="listing-card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "0.35rem",
              }}
            >
              <strong>{item.title}</strong>
              <span className="badge">{item.category}</span>
            </div>

            <div style={{ marginBottom: "0.35rem", fontSize: "0.9rem" }}>
              {item.description}
            </div>

            <div style={{ fontSize: "0.85rem", marginBottom: "0.3rem" }}>
              {item.location && (
                <span style={{ marginRight: "0.5rem" }}>
                  📍 {item.location}
                </span>
              )}
              {item.date && (
                <span className="muted">
                  {new Date(item.date).toLocaleDateString()}
                </span>
              )}
            </div>

            <div className="muted">
              Reported by: {item.reportedBy?.name} (
              {item.reportedBy?.enrollment})
            </div>

            {item.contactInfo && (
              <div
                style={{
                  marginTop: "0.25rem",
                  fontSize: "0.8rem",
                  color: "#e5e7eb",
                }}
              >
                Contact: {item.contactInfo}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
