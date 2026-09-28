import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  variant?: 'full' | 'mark' | 'monochrome';
}

export const VegapunkLogo: React.FC<LogoProps> = ({
  className = '',
  size = 28,
  variant = 'mark',
}) => {
  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Precision Geometric Vegapunk Emblem */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-300 hover:rotate-12"
      >
        <defs>
          <linearGradient id="vpGrad" x1="2" y1="2" x2="38" y2="38" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="50%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
          <filter id="vpGlow" x1="-10%" y1="-10%" width="120%" height="120%" filterUnits="userSpaceOnUse">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#2563EB" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* Outer Orbit Rings */}
        <circle cx="20" cy="20" r="17" stroke="url(#vpGrad)" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.4" />
        
        {/* Iconic Starburst / Neural Rays (Vegapunk Signature) */}
        <path
          d="M20 3V11M20 29V37M3 20H11M29 20H37M8 8L13.6 13.6M26.4 26.4L32 32M8 32L13.6 26.4M26.4 13.6L32 8"
          stroke="url(#vpGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Central Core Atom & Diamond Matrix */}
        <rect
          x="15"
          y="15"
          width="10"
          height="10"
          rx="2.5"
          transform="rotate(45 20 20)"
          fill="url(#vpGrad)"
          filter="url(#vpGlow)"
        />
        <circle cx="20" cy="20" r="2.5" fill="#FFFFFF" />
      </svg>

      {variant === 'full' && (
        <span className="font-serif text-2xl font-semibold tracking-tight text-slate-900 flex items-baseline">
          Vegapunk
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 ml-1 inline-block"></span>
        </span>
      )}
    </div>
  );
};

export default VegapunkLogo;
