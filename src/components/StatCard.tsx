"use client";

// ==========================================
// 1. IMPORTS & DEPENDENCIES
// ==========================================
import React from "react";

// ==========================================
// 2. TYPES & INTERFACES
// ==========================================
// Props interface for StatCard component
interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  linkText: string;
  linkColor: "green" | "red";
  iconColor: "red" | "amber" | "green" | "orange";
  icon: React.ReactNode;
}

// ==========================================
// 3. MAIN COMPONENT: STAT CARD
// ==========================================
// Reusable KPI metric card rendering title, primary value, subtitle, icon, and status badge
export default function StatCard({
  title,
  value,
  subtitle,
  linkText,
  linkColor,
  iconColor,
  icon,
}: StatCardProps) {
  return (
    <div className="stat-card">
      {/* Card header with metric title and colored icon */}
      <div className="stat-card-header">
        <span className="stat-card-title">{title}</span>
        <div className={`stat-card-icon ${iconColor}`}>{icon}</div>
      </div>

      {/* Prominent metric value */}
      <div className="stat-card-value">{value}</div>

      {/* Descriptive subtitle */}
      <div className="stat-card-subtitle">{subtitle}</div>

      {/* Contextual status note or link */}
      <a className={`stat-card-link ${linkColor}`}>{linkText}</a>
    </div>
  );
}
