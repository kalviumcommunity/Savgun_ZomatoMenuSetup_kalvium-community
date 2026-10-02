// ==========================================
// 1. IMPORTS & DEPENDENCIES
// ==========================================
import Link from "next/link";

// ==========================================
// 2. MAIN COMPONENT: FOOTER
// ==========================================
// Renders page footer with copyright notice and navigation links
export default function Footer() {
  return (
    <footer className="footer" id="footer">
      <div className="container footer__inner">
        {/* Copyright notice */}
        <p className="footer__copy">
          © 2026 Fieasto Technologies. All rights reserved.
        </p>

        {/* Footer navigation links */}
        <div className="footer__links" id="footer-links">
          <Link href="#terms" className="footer__link" id="footer-terms">
            Terms
          </Link>
          <Link href="#privacy" className="footer__link" id="footer-privacy">
            Privacy
          </Link>
          <Link
            href="#partner-guidelines"
            className="footer__link"
            id="footer-guidelines"
          >
            Zomato Partner Guidelines
          </Link>
        </div>
      </div>
    </footer>
  );
}
