import React, { useState } from 'react';
import Image from 'next/image';

interface ZomatoLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}
// Zomato Login Modal
export default function ZomatoLoginModal({ isOpen, onClose }: ZomatoLoginModalProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex bg-black/50 backdrop-blur-sm">
      <div className="m-auto flex w-[1000px] max-w-[95vw] h-[600px] max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
        
        {/* Left Side - Dark */}
        <div className="w-1/2 bg-[#1d1b1a] p-10 flex flex-col justify-between relative text-white">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#E23744] rounded-lg flex items-center justify-center text-sm font-bold shadow-md">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <line x1="10" y1="9" x2="8" y2="9"></line>
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight">Fieasto</span>
          </div>

          {/* Center Image & Text */}
          <div className="flex flex-col items-center mt-6">
            <div className="w-64 h-64 rounded-3xl overflow-hidden border-4 border-white/10 shadow-2xl relative">
              <Image 
                src="/chef_plating.jpg" 
                alt="Chef plating food" 
                fill 
                className="object-cover"
                unoptimized
              />
            </div>
            
            <div className="mt-8 text-center px-4">
              <h2 className="text-[28px] leading-tight font-extrabold mb-3">
                Connect your Zomato account in seconds
              </h2>
              <p className="text-gray-400 text-sm">
                Securely sync dynamic pricing and inventory counts.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-center items-center gap-2 text-xs text-gray-500 pb-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1BA672" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              <path d="m9 12 2 2 4-4"></path>
            </svg>
            <span>AES-256 Encrypted Zomato Merchant API Pipeline</span>
          </div>
        </div>

        {/* Right Side - Light */}
        <div className="w-1/2 bg-[#fafafa] p-10 flex flex-col items-center justify-center relative">
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 w-full max-w-[400px]">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Log in to Fieasto</h2>
            <p className="text-sm text-gray-500 mb-8">
              Enter your credentials to manage your live menus
            </p>

            <div className="space-y-5">
              {/* Phone Number */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Phone Number
                </label>
                <div className="flex rounded-lg border border-gray-200 overflow-hidden focus-within:border-gray-400 focus-within:ring-1 focus-within:ring-gray-400 transition-all">
                  <div className="bg-white border-r border-gray-200 px-3 py-2.5 flex items-center gap-1 text-sm font-medium text-gray-700">
                    +91
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>
                  <input 
                    type="text" 
                    placeholder="98765 43210" 
                    className="flex-1 px-3 py-2.5 text-sm outline-none w-full"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
              </div>

              {/* OTP */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-semibold text-gray-700">
                    One-Time Password
                  </label>
                  <span className="text-[11px] text-[#F5A623] font-medium cursor-pointer">
                    Resend in 0:28
                  </span>
                </div>
                <input 
                  type="text" 
                  placeholder="4 1 8 0 |" 
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all font-medium tracking-[0.2em]"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>

              {/* Login Button */}
              <button 
                className="w-full bg-[#E23744] hover:bg-[#d6313d] text-white font-semibold py-3 rounded-lg text-sm transition-colors mt-2"
              >
                Login to Merchant Suite
              </button>
            </div>

            {/* OTP Status */}
            <div className="flex items-center justify-center gap-1.5 mt-6 text-xs text-gray-500">
              <span className="text-yellow-500 text-sm">🔒</span>
              OTP sent to your Zomato-registered merchant number.
            </div>
          </div>

          {/* Footer Contact Support */}
          <div className="absolute bottom-8 text-xs text-gray-500">
            Need help logging in? <a href="#" className="text-[#E23744] font-medium hover:underline">Contact Support</a>
          </div>
        </div>

      </div>
    </div>
  );
}
