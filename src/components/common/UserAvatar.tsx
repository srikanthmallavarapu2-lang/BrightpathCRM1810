import React from 'react';

interface UserAvatarProps {
  name: string;
  size?: number;
  role?: string;
  className?: string;
}

const GRADIENT_PALETTES = [
  { bg: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', text: '#ffffff', border: '#93c5fd' },
  { bg: 'linear-gradient(135deg, #10b981, #047857)', text: '#ffffff', border: '#a7f3d0' },
  { bg: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', text: '#ffffff', border: '#c4b5fd' },
  { bg: 'linear-gradient(135deg, #f59e0b, #b45309)', text: '#ffffff', border: '#fde68a' },
  { bg: 'linear-gradient(135deg, #ec4899, #be185d)', text: '#ffffff', border: '#fbcfe8' },
  { bg: 'linear-gradient(135deg, #06b6d4, #0e7490)', text: '#ffffff', border: '#a5f3fc' },
  { bg: 'linear-gradient(135deg, #6366f1, #4338ca)', text: '#ffffff', border: '#c7d2fe' },
];

function getPalette(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % GRADIENT_PALETTES.length;
  return GRADIENT_PALETTES[index];
}

function getInitials(name: string): string {
  if (!name || !name.trim()) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  size = 36,
  role,
  className = '',
}) => {
  const palette = getPalette(name);
  const initials = getInitials(name);
  const fontSize = Math.max(10, Math.floor(size * 0.4));

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        borderRadius: '50%',
        background: palette.bg,
        color: palette.text,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: `${fontSize}px`,
        letterSpacing: '0.5px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.08)',
        border: `2px solid rgba(255, 255, 255, 0.85)`,
        position: 'relative',
        userSelect: 'none',
        flexShrink: 0,
      }}
      title={role ? `${name} (${role})` : name}
    >
      <span>{initials}</span>
    </div>
  );
};

