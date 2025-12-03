import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const [enrollmentNo, setEnrollmentNo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/marketplace", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(enrollmentNo, password);
      navigate("/marketplace");
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Welcome Back</h2>
        <p style={styles.subtitle}>
          Login with your LNCT enrollment number to access Student Connect.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Enrollment Number</label>
            <input
              type="text"
              value={enrollmentNo}
              onChange={(e) => setEnrollmentNo(e.target.value)}
              placeholder="0157CS25XXXX"
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
            />
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Logging in…" : "Login"}
          </button>
        </form>

        <p style={styles.footerText}>
          Don&apos;t have an account?{" "}
          <Link to="/signup" style={styles.link}>
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    width: "100vw",
    display: "grid",
    placeItems: "center",
    padding: "1.5rem",
    background:
      "linear-gradient(135deg, #1b1033 0%, #5b2c6f 40%, #f97316 100%)",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    background: "#ffffff",
    padding: "2rem 2.4rem",
    borderRadius: "16px",
    boxShadow: "0 18px 45px rgba(15,23,42,0.45)",
    color: "#111827",
  },
  title: {
    marginBottom: "0.25rem",
    fontSize: "1.6rem",
    fontWeight: "700",
  },
  subtitle: {
    marginBottom: "1.5rem",
    fontSize: "0.9rem",
    color: "#6b7280",
  },
  inputGroup: {
    marginBottom: "1rem",
  },
  label: {
    display: "block",
    marginBottom: "0.25rem",
    fontSize: "0.9rem",
    fontWeight: 500,
    color: "#4b5563",
  },
  input: {
    width: "100%",
    padding: "0.65rem 0.7rem",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
    background: "#f9fafb",
    color: "#111827",
    outline: "none",
  },
  button: {
    width: "100%",
    padding: "0.8rem",
    marginTop: "0.5rem",
    background: "linear-gradient(135deg, #f97316, #ea580c)",
    border: "none",
    borderRadius: "999px",
    color: "#ffffff",
    fontWeight: "600",
    fontSize: "0.95rem",
    cursor: "pointer",
  },
  error: {
    color: "#b91c1c",
    fontSize: "0.85rem",
    marginBottom: "0.4rem",
  },
  footerText: {
    marginTop: "1rem",
    textAlign: "center",
    fontSize: "0.9rem",
    color: "#6b7280",
  },
  link: {
    color: "#c026d3",
    fontWeight: 500,
  },
};
