"use client";

// ==========================================
// 1. IMPORTS & DEPENDENCIES
// ==========================================
import React, { useEffect, useState } from "react";
import { getAuditLogs } from "@/lib/db";

// ==========================================
// 2. TYPES & INTERFACES
// ==========================================
// Represents a single formatted audit log item for UI display
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

// ==========================================
// 3. HELPER FUNCTIONS
// ==========================================
// Converts timestamp string into human-readable relative time (e.g., "5 min ago")
function formatTimeAgo(createdAt: string) {
  const diffInMinutes = Math.max(
    0,
    Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000)
  );

  if (diffInMinutes < 1) {
    return "just now";
  }

  if (diffInMinutes < 60) {
    return `${diffInMinutes} min ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);

  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} day${diffInDays === 1 ? "" : "s"} ago`;
}

// ==========================================
// 4. MAIN COMPONENT: AUDIT TRAIL
// ==========================================
export default function AuditTrail() {
  // --- Component State ---
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Data Fetching Lifecycle ---
  useEffect(() => {
    let isMounted = true;

    // Fetch recent audit logs from database and map into display format
    async function loadAuditTrail() {
      setLoading(true);

      try {
        const { data } = await getAuditLogs(20);

        if (!isMounted) {
          return;
        }

        const mappedEntries = (data || []).map((entry) => ({
          id: entry.id,
          dishName: entry.dish_name,
          description: entry.description,
          actor: entry.actor,
          actorRole: entry.actor_role || "",
          actorColor: entry.actor_color || "#E23744",
          timeAgo: formatTimeAgo(entry.created_at),
          avatarBg: entry.avatar_bg || "#FEE2E2",
        }));

        setAuditEntries(mappedEntries);
      } catch (error) {
        console.error("[AuditTrail] Failed to load audit log:", error);
        setAuditEntries([]);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadAuditTrail();

    // Clean up mount guard
    return () => {
      isMounted = false;
    };
  }, []);

  // --- Render ---
  return (
    <div className="audit-section">
      {/* Section header & sync badge */}
      <div className="audit-header">
        <h2 className="audit-title">Live Audit Trail</h2>
        <span className="audit-api-badge">zomato-api-v2</span>
      </div>

      {/* Loading, empty, or populated list */}
      {loading ? (
        <div className="audit-empty-state">Loading audit trail...</div>
      ) : auditEntries.length === 0 ? (
        <div className="audit-empty-state">No audit events are available yet.</div>
      ) : (
        <div className="audit-entries">
          {auditEntries.map((entry) => (
            <div key={entry.id} className="audit-entry">
              {/* Actor avatar icon */}
              <div
                className="audit-entry-avatar"
                style={{ background: entry.avatarBg }}
              >
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

              {/* Event details */}
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
      )}
    </div>
  );
}
