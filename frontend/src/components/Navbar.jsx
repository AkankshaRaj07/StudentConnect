import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogOut, Menu, X, ShoppingBag, Search, Users, GraduationCap, Bell, User } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setMenuOpen(false);
  };

  const handleNavClick = () => {
    // close menu when user clicks a link on mobile
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Left: Logo */}
        <Link to="/" className="nav-logo" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{ width: "32px", height: "32px", background: "linear-gradient(135deg, #f97316, #ec4899)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <GraduationCap size={20} color="white" />
          </div>
          <span style={{ fontSize: "1.2rem" }}>Student Connect</span>
        </Link>

        {/* Center: Links (Desktop) */}
        <div className={`nav-links ${menuOpen ? "open" : ""}`}>
          <Link to="/marketplace" className={`nav-link ${location.pathname === '/marketplace' ? 'active' : ''}`} onClick={handleNavClick} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <ShoppingBag size={18} />
            Marketplace
          </Link>
          <Link to="/lost-found" className={`nav-link ${location.pathname === '/lost-found' ? 'active' : ''}`} onClick={handleNavClick} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <Search size={18} />
            Lost & Found
          </Link>
          <Link to="/hackathon" className={`nav-link ${location.pathname === '/hackathon' ? 'active' : ''}`} onClick={handleNavClick} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <Users size={18} />
            Hackathons
          </Link>
        </div>

        {/* Right: User + Icons + Hamburger */}
        <div className="nav-right">
          <button className="icon-btn" aria-label="Notifications">
            <Bell size={20} />
            <span className="notification-dot"></span>
          </button>

          <div className="user-profile-btn" style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "rgba(255,255,255,0.1)", padding: "0.3rem 0.8rem", borderRadius: "999px" }}>
            <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: "50%", padding: "0.2rem" }}>
              <User size={16} />
            </div>
            <span className="nav-user" style={{ fontSize: "0.9rem", fontWeight: "600" }}>
              {user?.name ? user.name.split(' ')[0] : "Student"}
            </span>
          </div>

          <button className="nav-logout" onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <LogOut size={16} />
            <span className="logout-text">Logout</span>
          </button>

          <button
            className="nav-toggle"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle navigation menu"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
