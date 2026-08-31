import Link from "next/link";

export default function Hero() {
  return (
    <section className="hero" id="hero">
      <div className="container hero__inner">
        {/* Left: Content */}
        <div className="hero__content">
          <div className="hero__badge" id="hero-badge">
            <span className="hero__badge-check">✓</span>
            Direct API Integration with Zomato Merchant Suite
          </div>

          <h1 className="hero__title" id="hero-title">
            Your Menu, Always in Sync
          </h1>

          <p className="hero__description" id="hero-description">
            No more double orders or outdated pricing. Fieasto automatically
            bridges your restaurant kitchen&apos;s live inventory and pricing
            rules directly into Zomato. Take control of your food-tech workflow
            in real-time.
          </p>

          <div className="hero__actions" id="hero-actions">
            <Link href="#get-started" className="btn-primary" id="btn-get-started">
              Get Started for Free
            </Link>
            <Link href="#demo" className="btn-secondary" id="btn-demo">
              Schedule a Demo
            </Link>
          </div>
        </div>

        {/* Right: Mock Browser */}
        <div className="hero__visual" id="hero-visual">
          <div className="mock-browser">
            <div className="mock-browser__header">
              <div className="mock-browser__dots">
                <span className="mock-browser__dot mock-browser__dot--red"></span>
                <span className="mock-browser__dot mock-browser__dot--yellow"></span>
                <span className="mock-browser__dot mock-browser__dot--green"></span>
              </div>
              <span className="mock-browser__url">merchant.fieasto.com</span>
            </div>

            <div className="mock-browser__body">
              {/* Item Card */}
              <div className="mock-item">
                <div className="mock-item__icon" aria-hidden="true">🍛</div>
                <div className="mock-item__info">
                  <div className="mock-item__name">Special Hyderabadi Biryani</div>
                  <div className="mock-item__category">Category: Main Course</div>
                </div>
                <div className="mock-item__price-wrap">
                  <div className="mock-item__price">₹349.00</div>
                  <div className="mock-item__synced">Synced</div>
                </div>
              </div>

              {/* Inventory Counter */}
              <div className="mock-inventory">
                <span className="mock-inventory__label">
                  ZOMATO INVENTORY COUNTER
                </span>
                <div className="mock-inventory__controls">
                  <button
                    className="mock-inventory__btn"
                    aria-label="Decrease inventory"
                  >
                    −
                  </button>
                  <span className="mock-inventory__count">14 Left</span>
                  <button
                    className="mock-inventory__btn"
                    aria-label="Increase inventory"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Connection Status */}
              <div className="mock-connection">
                <span className="mock-connection__label">
                  Live connection tunnel
                </span>
                <span className="mock-connection__status">
                  CONNECTED
                  <span className="mock-connection__dot"></span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
