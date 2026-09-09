"use client";

import React from "react";

interface AuditEntry {
  id: string;
  dishName: string;
  description: string;
  actor: string;
  actorRole: string;
  actorColor: string;
  timeAgo: string;
  avatarBg: string;
}

const auditEntries: AuditEntry[] = [
  {
    id: "1",
    dishName: "Paneer Butter Masala",
    description: "Price updated ₹320 → ₹310",
    actor: "Aman S.",
    actorRole: "Chef",
    actorColor: "#E23744",
    timeAgo: "3 min ago",
    avatarBg: "#FEE2E2",
  },
  {
    id: "2",
    dishName: "Butter Naan",
    description: "Stock depleted to 0 (Auto Locked)",
    actor: "System Sync",
    actorRole: "",
    actorColor: "#1BA672",
    timeAgo: "14 min ago",
    avatarBg: "#D1FAE5",
  },
  {
    id: "3",
    dishName: "Gulab Jamun",
    description: "Surge rule 'Dinner Rush' activated",
    actor: "Rahul K.",
    actorRole: "Manager",
    actorColor: "#F59E0B",
    timeAgo: "42 min ago",
    avatarBg: "#FEF3C7",
  },
  {
    id: "4",
    dishName: "Tandoori Chicken (Full)",
    description: "Price updated ₹540 → ₹580",
    actor: "Rahul K.",
    actorRole: "Manager",
    actorColor: "#F59E0B",
    timeAgo: "1 hour ago",
    avatarBg: "#FEF3C7",
  },
  {
    id: "5",
    dishName: "Mutton Rogan Josh",
    description: "Marked Out of Stock",
    actor: "System Sync",
    actorRole: "",
    actorColor: "#1BA672",
    timeAgo: "2 hours ago",
    avatarBg: "#D1FAE5",
  },
];

export default function AuditTrail() {
  return (
    <div className="audit-section">
      {/* Header */}
      <div className="audit-header">
        <h2 className="audit-title">Live Audit Trail</h2>
        <span className="audit-api-badge">zomato-api-v2</span>
      </div>

      {/* Entries */}
      <div className="audit-entries">
        {auditEntries.map((entry) => (
          <div key={entry.id} className="audit-entry">
            <div className="audit-entry-avatar" style={{ background: entry.avatarBg }}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke={entry.actorColor}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div className="audit-entry-content">
              <div className="audit-entry-top">
                <span className="audit-entry-dish">{entry.dishName}</span>
                <span className="audit-entry-time">{entry.timeAgo}</span>
              </div>
              <div className="audit-entry-desc">{entry.description}</div>
              <div className="audit-entry-actor">
                By{" "}
                <span style={{ color: entry.actorColor, fontWeight: 600 }}>
                  {entry.actor}
                  {entry.actorRole && ` (${entry.actorRole})`}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
