"use client";

import React, { useState } from "react";
import Image from "next/image";
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
    <div className="min-h-screen bg-[#1d1b1a] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-[1300px] overflow-hidden rounded-[28px] border border-white/10 bg-[#1d1b1a] shadow-2xl">
        <div className="flex w-full flex-col justify-between bg-[#1d1b1a] p-5 text-white sm:p-8 lg:w-[45%] lg:p-10">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E23744] text-lg font-bold shadow-md">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <line x1="10" y1="9" x2="8" y2="9" />
              </svg>
            </div>
            <span className="text-[22px] font-bold tracking-tight">Fieasto</span>
          </div>

          <div className="mt-8 flex flex-col items-center lg:mt-0">
            <div className="relative w-full max-w-[420px] overflow-hidden rounded-[32px] border-4 border-white/10 bg-white/5 shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
              <div className="relative aspect-[1.08]">
                <Image
                  src="/chef_plating.jpg"
                  alt="Chef plating food"
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 420px"
                />
              </div>
            </div>

            <div className="mt-8 text-center lg:mt-10">
              <h1 className="text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-[52px] lg:leading-[1.05]">
                Connect your restaurant dashboard in seconds
              </h1>
              <p className="mt-4 text-base text-gray-300 sm:text-lg">
                Securely manage menus, inventory, pricing, and live audit trails.
              </p>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-3 text-sm text-gray-400 lg:mt-0">
            <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[#1BA672] bg-[#1BA672]/10 text-[10px] text-[#1BA672]">
              ✓
            </span>
            <span>Supabase-powered access with live inventory syncing</span>
          </div>
        </div>

        <div className="flex w-full items-center justify-center bg-[#f5f5f5] p-4 sm:p-8 lg:w-[55%] lg:p-10">
          <div className="w-full max-w-[520px] rounded-[24px] border border-[#4db4ff] bg-[#f8f8f8] p-4 shadow-[inset_0_0_0_1px_rgba(96,165,250,0.1)] sm:p-6 lg:p-8">
            <div className="rounded-[20px] border border-dashed border-[#5aa7ff] bg-[#f9f9f9] p-5 sm:p-7">
              <h2 className="text-2xl font-bold text-gray-900 sm:text-[32px]">
                Log in to Fieasto
              </h2>
              <p className="mt-2 text-sm text-gray-500 sm:text-base">
                Enter your email and password to access your dashboard
              </p>

              <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-700">
                      Email
                    </label>
                  </div>

                  <input
                    type="email"
                    placeholder="name@example.com"
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm text-gray-900 outline-none transition-all focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-700">
                      Password
                    </label>
                  </div>

                  <input
                    type="password"
                    placeholder="Enter your password"
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm text-gray-900 outline-none transition-all focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                {error ? (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 w-full rounded-lg bg-[#E23744] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#d6313d] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? "Signing in..." : "Login to Dashboard"}
                </button>
              </form>

              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500">
                <span className="text-base text-[#F5A623]">◔</span>
                <span>Use the generated demo account email and password below.</span>
              </div>
            </div>

            <div className="mt-6 text-center text-sm text-gray-500">
              Need help logging in? <button type="button" onClick={onClose} className="font-semibold text-[#E23744] hover:underline">Go back</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
