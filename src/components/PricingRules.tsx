"use client";

import React, { useState } from "react";

interface PricingRule {
  id: string;
  dishName: string;
  dishImage: string;
  basePrice: number;
  timedRule: string | null;
  timedRuleType: "discount" | "surge" | null;
  hasRule: boolean;
}

const rules: PricingRule[] = [
  {
    id: "1",
    dishName: "Dal Makhani Premium",
    dishImage: "🍛",
    basePrice: 280.0,
    timedRule: "Lunch: -15%",
    timedRuleType: "discount",
    hasRule: true,
  },
  {
    id: "2",
    dishName: "Tandoori Paneer Tikka",
    dishImage: "🍢",
    basePrice: 310.0,
    timedRule: null,
    timedRuleType: "surge",
    hasRule: true,
  },
  {
    id: "3",
    dishName: "Sweet Kesar Lassi",
    dishImage: "🥛",
    basePrice: 120.0,
    timedRule: null,
    timedRuleType: null,
    hasRule: false,
  },
];

export default function PricingRules() {
  const [expandedId, setExpandedId] = useState<string>("2");

  return (
    <div className="pricing-section">
      {/* Header */}
      <div className="pricing-header">
        <h2 className="pricing-title">Active Pricing Rules</h2>
        <button className="pricing-create-btn" id="create-pricing-rule">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
          Create Pricing Rule
        </button>
      </div>

      {/* Table */}
      <table className="pricing-table">
        <thead>
          <tr>
            <th>Dish</th>
            <th>Base Price</th>
            <th>Timed Rule</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rules.map((rule) => (
            <React.Fragment key={rule.id}>
              <tr
                className={expandedId === rule.id ? "expanded-row" : ""}
              >
                <td>
                  <div className="pricing-dish">
                    <div className="pricing-dish-img">{rule.dishImage}</div>
                    <span className="pricing-dish-name">{rule.dishName}</span>
                  </div>
                </td>
                <td>
                  <span className="pricing-base-price">
                    ₹{rule.basePrice.toFixed(2)}
                  </span>
                </td>
                <td>
                  {rule.timedRule ? (
                    <span className="pricing-timed-rule">
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      {rule.timedRule}
                    </span>
                  ) : rule.hasRule ? null : (
                    <span className="pricing-no-rule">No active rules</span>
                  )}
                </td>
                <td>
                  {rule.hasRule ? (
                    <button
                      className="pricing-action-link edit"
                      onClick={() =>
                        setExpandedId(expandedId === rule.id ? "" : rule.id)
                      }
                    >
                      Edit Rule
                    </button>
                  ) : (
                    <button
                      className="pricing-action-link create"
                      onClick={() =>
                        setExpandedId(expandedId === rule.id ? "" : rule.id)
                      }
                    >
                      Create Rule
                    </button>
                  )}
                </td>
              </tr>

              {/* Expanded Editing Panel */}
              {expandedId === rule.id && rule.id === "2" && (
                <tr>
                  <td colSpan={4} style={{ padding: 0 }}>
                    <div className="pricing-expanded-card">
                      <div className="pricing-expanded-header">
                        <div>
                          <div className="pricing-expanded-name">
                            Tandoori Paneer Tikka
                          </div>
                          <div className="pricing-expanded-base">
                            Base: ₹310.00
                          </div>
                        </div>
                        <span className="pricing-surge-badge">
                          Surge Triggered
                        </span>
                      </div>

                      <div className="pricing-expanded-fields">
                        <div className="pricing-field">
                          <label className="pricing-field-label">
                            Time Schedule Range
                          </label>
                          <div className="pricing-field-input">
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <circle cx="12" cy="12" r="10" />
                              <polyline points="12 6 12 12 16 14" />
                            </svg>
                            06:00 PM – 09:00 PM
                          </div>
                        </div>
                        <div className="pricing-field">
                          <label className="pricing-field-label">
                            Percentage Adjustment
                          </label>
                          <div className="pricing-field-input">
                            +10% (Surge markup)
                          </div>
                        </div>
                        <div className="pricing-field">
                          <label className="pricing-field-label">Status</label>
                          <div>
                            <span className="pricing-active-badge">Active</span>
                          </div>
                        </div>
                      </div>

                      <div className="pricing-expanded-actions">
                        <button className="pricing-cancel-btn">Cancel</button>
                        <button className="pricing-save-btn">
                          Save &amp; Push Live
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
