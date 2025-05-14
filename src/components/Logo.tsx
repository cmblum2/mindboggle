
import React from 'react';
import { Link } from 'react-router-dom';

const Logo = () => {
  return (
    <Link to="/" className="flex items-center gap-1">
      <svg 
        width="36" 
        height="36" 
        viewBox="0 0 36 36" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="h-8 w-8"
      >
        <defs>
          <linearGradient id="brainControllerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7B61FF" /> {/* Brain Purple */}
            <stop offset="100%" stopColor="#41BFB3" /> {/* Brain Teal */}
          </linearGradient>
        </defs>
        {/* Brain Top */}
        <path 
          d="M18 3C13.5 3 12 6 12 8.5C12 11 13.5 13 15.5 13.5C15.5 11.5 17 10 18.5 10C20 10 21 11 21 12.5C21 14 20 15 18.5 15.5C17 16 15 17 15 19.5C15 22 17 23.5 19.5 23.5C22 23.5 24 21.5 24 19.5C24 17.5 23 16 21.5 15.5C24 15 24.5 12.5 24 10.5C23.5 8.5 22 3 18 3Z"
          fill="url(#brainControllerGradient)"
          stroke="none"
        />
        {/* Controller Base */}
        <path 
          d="M10 23C7 23 4 25 4 28C4 31 6 33 8 33C10 33 11 31.5 11 29.5C11 27.5 12 26 14 26H22C24 26 25 27.5 25 29.5C25 31.5 26 33 28 33C30 33 32 31 32 28C32 25 29 23 26 23H10Z"
          fill="url(#brainControllerGradient)"
          stroke="none"
        />
        {/* Controller Buttons */}
        <circle cx="22" cy="29" r="1" fill="white" opacity="0.8" />
        <circle cx="26" cy="29" r="1" fill="white" opacity="0.8" />
        <circle cx="24" cy="27" r="1" fill="white" opacity="0.8" />
        <circle cx="24" cy="31" r="1" fill="white" opacity="0.8" />
        {/* D-Pad */}
        <rect x="10" y="28" width="2" height="4" rx="0.5" fill="white" opacity="0.8" />
        <rect x="9" y="29" width="4" height="2" rx="0.5" fill="white" opacity="0.8" />
      </svg>
      <span className="font-bold text-xl tracking-tight">MindBoggle</span>
    </Link>
  );
};

export default Logo;
