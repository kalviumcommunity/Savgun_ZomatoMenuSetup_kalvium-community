// ==========================================
// 1. IMPORTS & DEPENDENCIES
// ==========================================
import Link from "next/link";

// ==========================================
// 2. MAIN COMPONENT: NAVBAR
// ==========================================
// Top navigation header featuring logo, jump links, and partner sync button
export default function Navbar() {
  return (
    <nav className="navbar" id="navbar">
      <div className="container navbar__inner">
        {/* Brand logo & icon */}
        <Link href="/" className="navbar__logo" id="navbar-logo">
          <span className="navbar__logo-icon" aria-hidden="true"></span>
          Fieasto
        </Link>

        {/* In-page navigation anchors */}
        <div className="navbar__links" id="navbar-links">
          <Link href="#features" className="navbar__link" id="nav-features">
            Features
          </Link>
          <Link href="#pricing" className="navbar__link" id="nav-pricing">
            Pricing
          </Link>
          <Link href="#about" className="navbar__link" id="nav-about">
            About Us
          </Link>
        </div>

        {/* Partner portal login CTA */}
        <Link href="/login" className="navbar__cta" id="navbar-cta">
          Sync your Zomato
        </Link>
      </div>
    </nav>
  );
}
