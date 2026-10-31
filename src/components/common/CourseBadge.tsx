import React from 'react';
import { 
  Code, 
  Brain, 
  Cloud, 
  ShieldCheck, 
  Palette, 
  BookOpen, 
  GraduationCap 
} from 'lucide-react';

interface CourseBadgeProps {
  courseName: string;
  size?: 'sm' | 'md';
  className?: string;
}

interface CourseConfig {
  icon: React.ElementType;
  bg: string;
  color: string;
  border: string;
  shortLabel: string;
}

const COURSE_CONFIGS: Record<string, CourseConfig> = {
  'Full Stack Web Dev': {
    icon: Code,
    bg: '#eff6ff',
    color: '#1d4ed8',
    border: '#bfdbfe',
    shortLabel: 'Full Stack',
  },
  'Data Science & AI': {
    icon: Brain,
    bg: '#f5f3ff',
    color: '#6d28d9',
    border: '#ddd6fe',
    shortLabel: 'Data Science',
  },
  'Cloud & DevOps': {
    icon: Cloud,
    bg: '#ecfeff',
    color: '#0e7490',
    border: '#a5f3fc',
    shortLabel: 'DevOps',
  },
  'Cybersecurity': {
    icon: ShieldCheck,
    bg: '#fef2f2',
    color: '#b91c1c',
    border: '#fecaca',
    shortLabel: 'Cybersecurity',
  },
  'UI/UX Design': {
    icon: Palette,
    bg: '#fdf2f8',
    color: '#be185d',
    border: '#fbcfe8',
    shortLabel: 'UI/UX',
  },
  'Digital Marketing': {
    icon: BookOpen,
    bg: '#fffbeb',
    color: '#b45309',
    border: '#fde68a',
    shortLabel: 'Marketing',
  },
};

const DEFAULT_CONFIG: CourseConfig = {
  icon: GraduationCap,
  bg: '#f8fafc',
  color: '#334155',
  border: '#e2e8f0',
  shortLabel: 'Academy Course',
};

export const CourseBadge: React.FC<CourseBadgeProps> = ({
  courseName,
  size = 'md',
  className = '',
}) => {
  // Fuzzy match or default
  const matchedKey = Object.keys(COURSE_CONFIGS).find((key) => 
    courseName.toLowerCase().includes(key.toLowerCase()) ||
    key.toLowerCase().includes(courseName.toLowerCase())
  );

  const config = matchedKey ? COURSE_CONFIGS[matchedKey] : DEFAULT_CONFIG;
  const Icon = config.icon;

  const isSmall = size === 'sm';

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: isSmall ? '4px' : '5px',
        padding: isSmall ? '0.15rem 0.45rem' : '0.2rem 0.6rem',
        borderRadius: 'var(--radius-sm)',
        background: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
        fontSize: isSmall ? '0.72rem' : '0.785rem',
        fontWeight: 600,
        lineHeight: 1.2,
      }}
      title={`Course: ${courseName}`}
    >
      <Icon size={isSmall ? 11 : 13} />
      <span>{courseName}</span>
    </span>
  );
};

