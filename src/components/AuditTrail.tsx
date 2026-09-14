"use client";

import React, { useEffect, useState } from "react";
import { getAuditLogs } from "@/lib/db";

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

export default function AuditTrail() {
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

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

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="audit-section">
      <div className="audit-header">
        <h2 className="audit-title">Live Audit Trail</h2>
        <span className="audit-api-badge">zomato-api-v2</span>
      </div>

      {loading ? (
        <div className="audit-empty-state">Loading audit trail...</div>
      ) : auditEntries.length === 0 ? (
        <div className="audit-empty-state">No audit events are available yet.</div>
      ) : (
        <div className="audit-entries">
          {auditEntries.map((entry) => (
            <div key={entry.id} className="audit-entry">
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
