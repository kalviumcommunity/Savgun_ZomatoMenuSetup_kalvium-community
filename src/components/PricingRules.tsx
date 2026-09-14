"use client";

import React, { useEffect, useState } from "react";
import { getDishes } from "@/lib/db";

interface PricingRule {
  id: string;
  dishName: string;
  dishImage: string;
  basePrice: number;
  timedRule: string | null;
  timedRuleType: "discount" | "surge" | null;
  hasRule: boolean;
  ruleName?: string;
  adjustmentPercentage?: number;
  timeRange?: string;
  statusLabel?: string;
}

function formatClockTime(value: string | null) {
  if (!value) {
    return "";
  }

  return value.slice(0, 5);
}

export default function PricingRules() {
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [expandedId, setExpandedId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadPricingRules() {
      setLoading(true);

      try {
        const { data } = await getDishes();

        if (!isMounted) {
          return;
        }

        const mappedRules = (data || []).map((dish: any) => {
          const activeRule = Array.isArray(dish.pricing_rules)
            ? dish.pricing_rules.find((rule: any) => rule.is_active) || null
            : null;

          const adjustmentPercentage = activeRule
            ? Number(Math.abs(activeRule.adjustment_percentage || 0))
            : 0;

          const timedRule = activeRule
            ? `${activeRule.rule_name}: ${activeRule.rule_type === "discount" ? "-" : "+"}${adjustmentPercentage}%`
            : null;

          const timeRange = activeRule
            ? [formatClockTime(activeRule.time_start), formatClockTime(activeRule.time_end)]
                .filter(Boolean)
                .join(" – ")
            : "";

          return {
            id: dish.id,
            dishName: dish.name,
            dishImage: dish.dish_emoji || "🍽️",
            basePrice: Number(dish.base_price || 0),
            timedRule,
            timedRuleType: activeRule?.rule_type || null,
            hasRule: Boolean(activeRule),
            ruleName: activeRule?.rule_name,
            adjustmentPercentage: activeRule ? adjustmentPercentage : undefined,
            timeRange,
            statusLabel: activeRule?.is_active ? "Active" : "Inactive",
          };
        });

        setRules(mappedRules);
        const firstWithRule = mappedRules.find((rule) => rule.hasRule);
        setExpandedId(firstWithRule ? firstWithRule.id : "");
      } catch (error) {
        console.error("[PricingRules] Failed to load pricing rules:", error);
        setRules([]);
        setExpandedId("");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadPricingRules();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="pricing-section">
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

      {loading ? (
        <div className="pricing-empty-state">Loading pricing rules...</div>
      ) : rules.length === 0 ? (
        <div className="pricing-empty-state">
          No pricing data is available yet.
        </div>
      ) : (
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
            {rules.map((rule) => {
              const isExpanded = expandedId === rule.id;
              const formattedAdjustment =
                rule.timedRuleType === "surge"
                  ? `+${rule.adjustmentPercentage ?? 0}% (Surge markup)`
                  : rule.adjustmentPercentage
                    ? `-${rule.adjustmentPercentage}% (Discount)`
                    : "No active adjustment";

              return (
                <React.Fragment key={rule.id}>
                  <tr className={isExpanded ? "expanded-row" : ""}>
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
                            setExpandedId(isExpanded ? "" : rule.id)
                          }
                        >
                          Edit Rule
                        </button>
                      ) : (
                        <button
                          className="pricing-action-link create"
                          onClick={() =>
                            setExpandedId(isExpanded ? "" : rule.id)
                          }
                        >
                          Create Rule
                        </button>
                      )}
                    </td>
                  </tr>

                  {isExpanded && rule.hasRule && (
                    <tr>
                      <td colSpan={4} style={{ padding: 0 }}>
                        <div className="pricing-expanded-card">
                          <div className="pricing-expanded-header">
                            <div>
                              <div className="pricing-expanded-name">
                                {rule.dishName}
                              </div>
                              <div className="pricing-expanded-base">
                                Base: ₹{rule.basePrice.toFixed(2)}
                              </div>
                            </div>
                            <span className="pricing-surge-badge">
                              {rule.timedRuleType === "surge"
                                ? "Surge Triggered"
                                : "Discount Active"}
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
                                {rule.timeRange || "All day"}
                              </div>
                            </div>
                            <div className="pricing-field">
                              <label className="pricing-field-label">
                                Percentage Adjustment
                              </label>
                              <div className="pricing-field-input">
                                {formattedAdjustment}
                              </div>
                            </div>
                            <div className="pricing-field">
                              <label className="pricing-field-label">Status</label>
                              <div>
                                <span className="pricing-active-badge">
                                  {rule.statusLabel}
                                </span>
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
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
