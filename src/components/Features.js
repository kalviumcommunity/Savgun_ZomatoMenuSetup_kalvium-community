const FEATURES_DATA = [
  {
    id: "feature-inventory",
    icon: "📊",
    title: "Real-Time Inventory",
    description:
      "Auto-decreases dish counts across Zomato on every order placed inside your kitchen hub.",
  },
  {
    id: "feature-pricing",
    icon: "⏱️",
    title: "Time-Based Pricing",
    description:
      "Set automatic surge rules or happy hour discounts that sync dynamically by time slot.",
  },
  {
    id: "feature-orders",
    icon: "🚫",
    title: "No Double Orders",
    description:
      "Instantly locks inventory when items hit zero, ensuring two customers never buy the last unit.",
  },
  {
    id: "feature-audit",
    icon: "📋",
    title: "Full Audit Log",
    description:
      "Every menu adjustment or pricing swing is saved with a detailed editor name and timestamp.",
  },
];

export default function Features() {
  return (
    <section className="features" id="features">
      <div className="container">
        <div className="features__header">
          <p className="features__label" id="features-label">
            ENTERPRISE GRADE FEATURES
          </p>
          <h2 className="features__title" id="features-title">
            Designed for Fast-Paced Kitchen Operations
          </h2>
        </div>

        <div className="features__grid" id="features-grid">
          {FEATURES_DATA.map((feature) => (
            <div className="feature-card" key={feature.id} id={feature.id}>
              <div className="feature-card__icon" aria-hidden="true">
                {feature.icon}
              </div>
              <h3 className="feature-card__title">{feature.title}</h3>
              <p className="feature-card__desc">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
