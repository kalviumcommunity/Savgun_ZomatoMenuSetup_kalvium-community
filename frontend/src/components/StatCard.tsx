"use client";

import React from "react";

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  linkText: string;
  linkColor: "green" | "red";
  iconColor: "red" | "amber" | "green" | "orange";
  icon: React.ReactNode;
}

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
      <div className="stat-card-header">
        <span className="stat-card-title">{title}</span>
        <div className={`stat-card-icon ${iconColor}`}>{icon}</div>
      </div>
      <div className="stat-card-value">{value}</div>
      <div className="stat-card-subtitle">{subtitle}</div>
      <a className={`stat-card-link ${linkColor}`}>{linkText}</a>
    </div>
  );
}
