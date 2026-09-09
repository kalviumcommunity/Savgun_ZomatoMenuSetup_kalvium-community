"use client";

import React from "react";

export default function Header() {
  return (
    <header className="header">
      <div className="header-left">
        <h1 className="header-title">Inventory Hub</h1>
        <div className="header-sync">
          <span className="header-sync-dot" />
          <span>Synced with Zomato, just now</span>
        </div>
      </div>

      <div className="header-right">
        {/* Search */}
        <div className="header-search">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input type="text" placeholder="Search everything..." />
        </div>

        {/* Notification Bell */}
        <button className="header-icon-btn" id="notifications-btn" aria-label="Notifications">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span className="notification-dot" />
        </button>

        {/* Avatar */}
        <div className="header-avatar" id="user-avatar">
          S
        </div>
      </div>
    </header>
  );
}
