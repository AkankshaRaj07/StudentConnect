import { Link } from "react-router-dom";
import { ArrowRight, ShoppingBag, Search, Users, ShieldCheck, Zap } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="landing-page" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "radial-gradient(ellipse at top, rgba(249, 115, 22, 0.15) 0%, #0f172a 70%)" }}>
      {/* Navigation */}
      <nav style={{ padding: "1.5rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1.25rem", fontWeight: 800, color: "white" }}>
          <div style={{ width: "32px", height: "32px", background: "linear-gradient(135deg, #f97316, #ec4899)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Zap size={20} color="white" />
          </div>
          Student Connect
        </div>
        <div>
          {isAuthenticated ? (
            <Link to="/marketplace" className="btn-primary" style={{ textDecoration: "none", display: "inline-block" }}>
              Go to Dashboard
            </Link>
          ) : (
            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              <Link to="/login" style={{ color: "white", textDecoration: "none", fontWeight: 600 }}>Login</Link>
              <Link to="/signup" className="btn-primary" style={{ textDecoration: "none", display: "inline-block" }}>Get Started</Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "4rem 2rem", textAlign: "center" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div style={{ display: "inline-block", padding: "0.4rem 1rem", background: "rgba(249, 115, 22, 0.1)", color: "#f97316", borderRadius: "999px", fontSize: "0.9rem", fontWeight: 600, marginBottom: "1.5rem", border: "1px solid rgba(249, 115, 22, 0.2)" }}>
            🚀 The Ultimate Campus Network
          </div>
          <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)", lineHeight: 1.1, marginBottom: "1.5rem", fontWeight: 800, background: "linear-gradient(to right, #fff, #94a3b8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Everything you need, right on <span style={{ color: "#f97316", WebkitTextFillColor: "#f97316" }}>Campus.</span>
          </h1>
          <p style={{ fontSize: "1.2rem", color: "#94a3b8", marginBottom: "2.5rem", lineHeight: 1.6, maxWidth: "600px", margin: "0 auto 2.5rem auto" }}>
            Buy and sell items, report lost belongings, and find the perfect team for your next hackathon. Exclusively for college students.
          </p>

          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link to={isAuthenticated ? "/marketplace" : "/signup"} className="btn-primary" style={{ padding: "0.8rem 1.8rem", fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none" }}>
              Join the Network <ArrowRight size={18} />
            </Link>
            {!isAuthenticated && (
              <Link to="/login" style={{ padding: "0.8rem 1.8rem", fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none", color: "white", background: "rgba(255,255,255,0.05)", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.1)", fontWeight: 600 }}>
                Sign In
              </Link>
            )}
          </div>
        </div>

        {/* Features Preview */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2rem", width: "100%", maxWidth: "1100px", marginTop: "5rem" }}>
          <div className="card" style={{ background: "rgba(255,255,255,0.02)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.05)", textAlign: "left", padding: "2rem" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(59, 130, 246, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.5rem" }}>
              <ShoppingBag size={24} color="#3b82f6" />
            </div>
            <h3 style={{ fontSize: "1.3rem", marginBottom: "0.8rem" }}>Campus Marketplace</h3>
            <p style={{ color: "#94a3b8", lineHeight: 1.5 }}>Buy and sell textbooks, electronics, and hostel essentials safely within your college premises.</p>
          </div>

          <div className="card" style={{ background: "rgba(255,255,255,0.02)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.05)", textAlign: "left", padding: "2rem" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(239, 68, 68, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.5rem" }}>
              <Search size={24} color="#ef4444" />
            </div>
            <h3 style={{ fontSize: "1.3rem", marginBottom: "0.8rem" }}>Lost & Found</h3>
            <p style={{ color: "#94a3b8", lineHeight: 1.5 }}>Easily report lost items or notify others when you've found something on campus.</p>
          </div>

          <div className="card" style={{ background: "rgba(255,255,255,0.02)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.05)", textAlign: "left", padding: "2rem" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(168, 85, 247, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.5rem" }}>
              <Users size={24} color="#a855f7" />
            </div>
            <h3 style={{ fontSize: "1.3rem", marginBottom: "0.8rem" }}>Hackathon Teams</h3>
            <p style={{ color: "#94a3b8", lineHeight: 1.5 }}>Connect with like-minded peers to form the perfect team for your next big hackathon.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ padding: "2rem", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.05)", color: "#64748b" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
          <ShieldCheck size={18} /> Verified College Network
        </div>
        <p style={{ margin: 0, fontSize: "0.9rem" }}>&copy; {new Date().getFullYear()} Student Connect. All rights reserved.</p>
      </footer>
    </div>
  );
}
