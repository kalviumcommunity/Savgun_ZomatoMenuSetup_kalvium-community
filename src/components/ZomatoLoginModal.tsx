"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

interface ZomatoLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ZomatoLoginModal({ isOpen, onClose }: ZomatoLoginModalProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setMounted(true), 50);
      return () => clearTimeout(timer);
    } else {
      setMounted(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message || "Login failed. Please try again.");
        return;
      }

      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong during login."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes login-gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes login-float-1 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.12; }
          33% { transform: translate(30px, -40px) scale(1.1); opacity: 0.18; }
          66% { transform: translate(-20px, 20px) scale(0.95); opacity: 0.1; }
        }
        @keyframes login-float-2 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.08; }
          33% { transform: translate(-40px, 30px) scale(1.15); opacity: 0.14; }
          66% { transform: translate(25px, -25px) scale(0.9); opacity: 0.06; }
        }
        @keyframes login-float-3 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.1; }
          50% { transform: translate(20px, 30px) scale(1.08); opacity: 0.16; }
        }
        @keyframes login-shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes login-pulse-ring {
          0% { transform: scale(0.95); opacity: 0.5; }
          50% { transform: scale(1); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.5; }
        }
        @keyframes login-slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes login-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .login-page-root * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .login-input-field {
          width: 100%;
          padding: 14px 16px;
          padding-left: 44px;
          border-radius: 12px;
          border: 1.5px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.04);
          color: #fff;
          font-size: 14px;
          font-family: 'Inter', sans-serif;
          outline: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          letter-spacing: 0.01em;
        }
        .login-input-field::placeholder {
          color: rgba(255,255,255,0.3);
          font-weight: 400;
        }
        .login-input-field:focus {
          border-color: rgba(226, 55, 68, 0.6);
          background: rgba(255,255,255,0.06);
          box-shadow: 0 0 0 3px rgba(226, 55, 68, 0.1), 0 0 20px rgba(226, 55, 68, 0.05);
        }

        .login-submit-btn {
          width: 100%;
          padding: 14px 24px;
          border: none;
          border-radius: 12px;
          background: linear-gradient(135deg, #E23744 0%, #c0293a 100%);
          color: #fff;
          font-size: 14px;
          font-weight: 600;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          letter-spacing: 0.02em;
        }
        .login-submit-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #d6313d 0%, #b52434 100%);
          transform: translateY(-1px);
          box-shadow: 0 8px 25px rgba(226, 55, 68, 0.35);
        }
        .login-submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        .login-submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .login-toggle-pw {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: rgba(255,255,255,0.35);
          cursor: pointer;
          padding: 4px;
          transition: color 0.2s;
          display: flex;
          align-items: center;
        }
        .login-toggle-pw:hover {
          color: rgba(255,255,255,0.6);
        }
      `}</style>

      <div
        className="login-page-root"
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f0f0f 0%, #1a1118 25%, #0f0f0f 50%, #111018 75%, #0f0f0f 100%)",
          backgroundSize: "400% 400%",
          animation: "login-gradient-shift 15s ease infinite",
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          position: "relative",
          overflow: "hidden",
          padding: "20px",
        }}
      >
        {/* Floating orbs */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
          <div style={{
            position: "absolute", top: "10%", left: "15%", width: "300px", height: "300px",
            borderRadius: "50%", background: "radial-gradient(circle, rgba(226,55,68,0.15) 0%, transparent 70%)",
            animation: "login-float-1 12s ease-in-out infinite", filter: "blur(40px)",
          }} />
          <div style={{
            position: "absolute", bottom: "15%", right: "10%", width: "250px", height: "250px",
            borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
            animation: "login-float-2 15s ease-in-out infinite", filter: "blur(50px)",
          }} />
          <div style={{
            position: "absolute", top: "50%", left: "60%", width: "200px", height: "200px",
            borderRadius: "50%", background: "radial-gradient(circle, rgba(245,166,35,0.1) 0%, transparent 70%)",
            animation: "login-float-3 10s ease-in-out infinite", filter: "blur(35px)",
          }} />
        </div>

        {/* Main container */}
        <div style={{
          display: "flex",
          width: "100%",
          maxWidth: "1100px",
          minHeight: "640px",
          borderRadius: "24px",
          overflow: "hidden",
          background: "rgba(255,255,255,0.03)",
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
          border: "1px solid rgba(255,255,255,0.06)",
          boxShadow: "0 32px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
          position: "relative",
          zIndex: 1,
          opacity: mounted ? 1 : 0,
          transform: mounted ? "scale(1)" : "scale(0.97)",
          transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
        }}>

          {/* Left Panel - Hero */}
          <div style={{
            flex: "0 0 45%",
            position: "relative",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}>
            {/* Background image */}
            <div style={{
              position: "absolute", inset: 0,
              backgroundImage: "url('/login-food.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }} />
            {/* Dark overlay */}
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.65) 50%, rgba(0,0,0,0.85) 100%)",
            }} />

            {/* Content */}
            <div style={{
              position: "relative", zIndex: 2, padding: "36px 32px",
              display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%",
            }}>
              {/* Logo */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{
                  width: "38px", height: "38px", borderRadius: "10px",
                  background: "linear-gradient(135deg, #E23744, #c0293a)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(226,55,68,0.4)",
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                </div>
                <span style={{ color: "#fff", fontSize: "20px", fontWeight: 700, letterSpacing: "-0.3px" }}>Fieasto</span>
                <span style={{
                  fontSize: "9px", background: "rgba(226,55,68,0.2)", color: "#f87171",
                  padding: "3px 7px", borderRadius: "4px", fontWeight: 600, letterSpacing: "0.8px", textTransform: "uppercase" as const,
                }}>PRO</span>
              </div>

              {/* Hero text */}
              <div style={{
                animation: mounted ? "login-slide-up 0.8s ease-out 0.3s both" : "none",
              }}>
                <h1 style={{
                  fontSize: "38px", fontWeight: 800, lineHeight: 1.1,
                  color: "#fff", letterSpacing: "-0.5px", marginBottom: "16px",
                }}>
                  Your restaurant,<br />
                  <span style={{
                    background: "linear-gradient(90deg, #E23744, #F5A623)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}>smarter.</span>
                </h1>
                <p style={{
                  fontSize: "15px", color: "rgba(255,255,255,0.6)",
                  lineHeight: 1.6, maxWidth: "340px",
                }}>
                  Manage menus, track inventory, and optimize pricing — all from one beautiful dashboard.
                </p>
              </div>

              {/* Trust indicators */}
              <div style={{
                display: "flex", flexDirection: "column", gap: "12px",
                animation: mounted ? "login-slide-up 0.8s ease-out 0.5s both" : "none",
              }}>
                {[
                  { icon: "🔒", text: "End-to-end encrypted" },
                  { icon: "⚡", text: "Real-time stock syncing" },
                  { icon: "📊", text: "Live audit trails" },
                ].map((item, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    fontSize: "13px", color: "rgba(255,255,255,0.55)",
                  }}>
                    <span style={{ fontSize: "14px" }}>{item.icon}</span>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel - Login Form */}
          <div style={{
            flex: "0 0 55%",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "48px 40px",
            background: "rgba(18,18,22,0.95)",
          }}>
            <div style={{
              width: "100%", maxWidth: "380px",
              animation: mounted ? "login-slide-up 0.6s ease-out 0.2s both" : "none",
            }}>
              {/* Welcome text */}
              <div style={{ marginBottom: "32px" }}>
                <h2 style={{
                  fontSize: "26px", fontWeight: 700, color: "#fff",
                  letterSpacing: "-0.3px", marginBottom: "8px",
                }}>
                  Welcome back
                </h2>
                <p style={{
                  fontSize: "14px", color: "rgba(255,255,255,0.4)",
                  lineHeight: 1.5,
                }}>
                  Sign in to your Fieasto dashboard
                </p>
              </div>

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {/* Email */}
                <div>
                  <label style={{
                    display: "block", fontSize: "11px", fontWeight: 600,
                    color: "rgba(255,255,255,0.45)", textTransform: "uppercase" as const,
                    letterSpacing: "0.1em", marginBottom: "8px",
                  }}>
                    Email address
                  </label>
                  <div style={{ position: "relative" }}>
                    <div style={{
                      position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)",
                      color: "rgba(255,255,255,0.3)", display: "flex",
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                    </div>
                    <input
                      type="email"
                      placeholder="name@restaurant.com"
                      className="login-input-field"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label style={{
                    display: "block", fontSize: "11px", fontWeight: 600,
                    color: "rgba(255,255,255,0.45)", textTransform: "uppercase" as const,
                    letterSpacing: "0.1em", marginBottom: "8px",
                  }}>
                    Password
                  </label>
                  <div style={{ position: "relative" }}>
                    <div style={{
                      position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)",
                      color: "rgba(255,255,255,0.3)", display: "flex",
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className="login-input-field"
                      style={{ paddingRight: "44px" }}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="login-toggle-pw"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div style={{
                    padding: "12px 14px", borderRadius: "10px",
                    background: "rgba(226,55,68,0.1)",
                    border: "1px solid rgba(226,55,68,0.2)",
                    fontSize: "13px", color: "#f87171",
                    display: "flex", alignItems: "center", gap: "8px",
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="15" y1="9" x2="9" y2="15" />
                      <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                    {error}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="login-submit-btn"
                >
                  {loading ? (
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: "spin 1s linear infinite" }}>
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                      Sign in to Dashboard
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </span>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div style={{
                display: "flex", alignItems: "center", gap: "12px",
                margin: "24px 0",
              }}>
                <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.06)" }} />
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)", textTransform: "uppercase" as const, letterSpacing: "0.1em" }}>
                  Demo access
                </span>
                <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.06)" }} />
              </div>

              {/* Demo hint */}
              <div style={{
                padding: "14px 16px", borderRadius: "12px",
                background: "rgba(245,166,35,0.06)",
                border: "1px solid rgba(245,166,35,0.12)",
                display: "flex", alignItems: "center", gap: "10px",
              }}>
                <div style={{
                  width: "32px", height: "32px", borderRadius: "8px",
                  background: "rgba(245,166,35,0.12)", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "14px",
                }}>💡</div>
                <p style={{
                  fontSize: "12px", color: "rgba(255,255,255,0.45)",
                  lineHeight: 1.5,
                }}>
                  Use the pre-filled demo credentials to explore the dashboard instantly.
                </p>
              </div>

              {/* Back link */}
              <div style={{
                marginTop: "24px", textAlign: "center" as const,
              }}>
                <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)" }}>
                  Need help?{" "}
                </span>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    fontSize: "13px", fontWeight: 600, color: "#E23744",
                    fontFamily: "'Inter', sans-serif",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#f87171")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#E23744")}
                >
                  Go back
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
