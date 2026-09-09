import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="navbar" id="navbar">
      <div className="container navbar__inner">
        <Link href="/" className="navbar__logo" id="navbar-logo">
          <span className="navbar__logo-icon" aria-hidden="true"></span>
          Fieasto
        </Link>

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

        <Link href="#cta" className="navbar__cta" id="navbar-cta">
          Sync your Zomato
        </Link>
      </div>
    </nav>
  );
}
