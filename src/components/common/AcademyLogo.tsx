import React from 'react';

interface AcademyLogoProps {
  size?: number;
  variant?: 'shield' | 'full';
  className?: string;
}

export const AcademyLogo: React.FC<AcademyLogoProps> = ({
  size = 32,
  variant = 'shield',
  className = '',
}) => {
  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        userSelect: 'none',
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <defs>
          <linearGradient id="shieldGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop stopColor="#2563eb" />
            <stop offset="0.5" stopColor="#1d4ed8" />
            <stop offset="1" stopColor="#1e3a8a" />
          </linearGradient>
          <linearGradient id="goldGrad" x1="12" y1="8" x2="36" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#fde047" />
            <stop offset="1" stopColor="#f59e0b" />
          </linearGradient>
        </defs>

        {/* Shield Crest */}
        <path
          d="M24 4L8 10V22C8 32.5 14.8 42.2 24 45C33.2 42.2 40 32.5 40 22V10L24 4Z"
          fill="url(#shieldGrad)"
          stroke="#3b82f6"
          strokeWidth="1.5"
          filter="drop-shadow(0 2px 4px rgba(37,99,235,0.25))"
        />

        {/* Inner Shield Accent */}
        <path
          d="M24 7L11 12V22C11 30.5 16.5 38.6 24 41.5C31.5 38.6 37 30.5 37 22V12L24 7Z"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="1"
          fill="none"
        />

        {/* Graduation Cap */}
        <path
          d="M24 14L34 19L24 24L14 19L24 14Z"
          fill="url(#goldGrad)"
        />
        <path
          d="M18 21.5V26.5C18 29.5 20.7 31 24 31C27.3 31 30 29.5 30 26.5V21.5L24 24.5L18 21.5Z"
          fill="#fef08a"
        />
        {/* Tassel */}
        <path
          d="M31.5 20.5V28L30 29.5"
          stroke="#fef08a"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Star of Excellence */}
        <circle cx="24" cy="36" r="2" fill="#ffffff" />
      </svg>

      {variant === 'full' && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.15, letterSpacing: '-0.3px' }}>
            BrightPath
          </span>
          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Academy CRM
          </span>
        </div>
      )}
    </div>
  );
};

