import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
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
      {/* Top row: logo + user + hamburger */}
      <div className="nav-top">
        <span className="nav-logo">Student Connect</span>

        <div className="nav-right">
          <span className="nav-user">
            {user?.name ? user.name : "Student"}
          </span>

          <button className="nav-logout" onClick={handleLogout}>
            Logout
          </button>

          <button
            className="nav-toggle"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle navigation menu"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Links row – horizontal on desktop, collapsible on mobile */}
      <div className={`nav-links ${menuOpen ? "open" : ""}`}>
        <Link to="/marketplace" className="nav-link" onClick={handleNavClick}>
          Marketplace
        </Link>
        <Link to="/lost-found" className="nav-link" onClick={handleNavClick}>
          Lost &amp; Found
        </Link>
        <Link to="/hackathon" className="nav-link" onClick={handleNavClick}>
          Hackathon Teams
        </Link>
      </div>
    </nav>
  );
}
