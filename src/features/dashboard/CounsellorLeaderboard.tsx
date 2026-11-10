import React, { useState, useEffect } from 'react';
import { Trophy, UserCheck, TrendingUp, RefreshCw, Star } from 'lucide-react';
import { leadService } from '../../services/leadService';
import { Profile, Lead } from '../../types/database';
import { UserAvatar } from '../../components/common/UserAvatar';

interface CounsellorStats {
  profile: Profile;
  totalLeads: number;
  convertedLeads: number;
  activeLeads: number;
  conversionRate: number;
  revenueCollected: number;
}

const COURSE_FEES: Record<string, number> = {
  'Full Stack Web Dev': 45000,
  'Cloud & DevOps': 55000,
  'Data Science & AI': 65000,
  'Cybersecurity': 48000,
  'UI/UX Design': 38000,
};

export const CounsellorLeaderboard: React.FC = () => {
  const [stats, setStats] = useState<CounsellorStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cohortFilter, setCohortFilter] = useState<'all' | 'session' | 'month'>('all');

  const loadLeaderboardData = async () => {
    setIsLoading(true);
    try {
      const [{ profiles }, { leads }] = await Promise.all([
        leadService.getStaffProfiles(),
        leadService.getLeads(),
      ]);

      if (profiles && profiles.length > 0) {
        const now = new Date();
        const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

        const computed: CounsellorStats[] = profiles.map((p) => {
          const pName = (p.full_name || '').toLowerCase().trim();
          const pEmailPrefix = (p as any).email ? (p as any).email.split('@')[0].toLowerCase() : '';

          let staffLeads = leads.filter((l: Lead) => {
            if (l.assigned_to === p.id) return true;
            if (l.assigned_profile?.id === p.id) return true;
            if (l.assigned_profile?.full_name && pName && l.assigned_profile.full_name.toLowerCase().trim() === pName) return true;
            if (l.assigned_to && pEmailPrefix && l.assigned_to.toLowerCase().includes(pEmailPrefix)) return true;
            return false;
          });

          // Apply Cohort Timeframe Filter
          if (cohortFilter === 'month') {
            staffLeads = staffLeads.filter((l: Lead) => {
              try {
                return l.created_at.startsWith(currentYearMonth) || new Date(l.created_at).getTime() > Date.now() - 86400000 * 30;
              } catch {
                return true;
              }
            });
          } else if (cohortFilter === 'session') {
            staffLeads = staffLeads.filter((l: Lead) => {
              try {
                return l.created_at.startsWith('2026') || l.created_at.startsWith('2027');
              } catch {
                return true;
              }
            });
          }

          const totalLeads = staffLeads.length;
          const convertedLeads = staffLeads.filter((l: Lead) => l.status === 'Converted').length;
          const activeLeads = staffLeads.filter((l: Lead) => l.status !== 'Converted' && l.status !== 'Lost').length;
          const conversionRate = totalLeads > 0 ? Number(((convertedLeads / totalLeads) * 100).toFixed(1)) : 0;
          const revenueCollected = staffLeads
            .filter((l: Lead) => l.status === 'Converted')
            .reduce((sum, l) => sum + (COURSE_FEES[l.course_interest] || 50000), 0);

          return {
            profile: p,
            totalLeads,
            convertedLeads,
            activeLeads,
            conversionRate,
            revenueCollected,
          };
        });

        // Rank by converted leads descending, then revenue, then conversion rate
        computed.sort((a, b) => b.convertedLeads - a.convertedLeads || b.revenueCollected - a.revenueCollected || b.conversionRate - a.conversionRate);
        setStats(computed);
      }
    } catch (err) {
      console.warn('Failed to compute counsellor leaderboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLeaderboardData();
  }, [cohortFilter]);

  const getRankBadge = (index: number) => {
    if (index === 0) return { icon: '🥇', label: '1st Rank', color: '#f59e0b', bg: 'linear-gradient(135deg, #fffbeb, #fef3c7)', border: '#fcd34d' };
    if (index === 1) return { icon: '🥈', label: '2nd Rank', color: '#64748b', bg: 'linear-gradient(135deg, #f8fafc, #f1f5f9)', border: '#cbd5e1' };
    if (index === 2) return { icon: '🥉', label: '3rd Rank', color: '#b45309', bg: 'linear-gradient(135deg, #fef3c7, #fed7aa)', border: '#fbd38d' };
    return { icon: `#${index + 1}`, label: `Rank ${index + 1}`, color: '#94a3b8', bg: '#ffffff', border: '#e2e8f0' };
  };

  const formatRevenue = (amt: number) => {
    if (amt >= 100000) {
      return `₹${(amt / 100000).toFixed(2)} Lakh`;
    }
    return `₹${amt.toLocaleString('en-IN')}`;
  };

  return (
    <div className="bento-card-surface bento-glow-top-amber fade-in-slide" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-display)' }}>
          <div style={{ width: 30, height: 30, borderRadius: 'var(--radius-sm)', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #fef3c7' }}>
            <Trophy size={17} color="#f59e0b" />
          </div>
          <span>Counsellor Conversion Leaderboard</span>
        </h3>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Cohort Filter Tabs */}
          <div style={{ display: 'inline-flex', background: '#f1f5f9', padding: '3px', borderRadius: 'var(--radius-sm)' }}>
            <button
              onClick={() => setCohortFilter('all')}
              style={{
                padding: '0.25rem 0.6rem',
                fontSize: '0.725rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: cohortFilter === 'all' ? '#ffffff' : 'transparent',
                color: cohortFilter === 'all' ? 'var(--text-main)' : 'var(--text-muted)',
                boxShadow: cohortFilter === 'all' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                cursor: 'pointer',
              }}
            >
              All Cohorts
            </button>
            <button
              onClick={() => setCohortFilter('session')}
              style={{
                padding: '0.25rem 0.6rem',
                fontSize: '0.725rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: cohortFilter === 'session' ? '#ffffff' : 'transparent',
                color: cohortFilter === 'session' ? 'var(--text-main)' : 'var(--text-muted)',
                boxShadow: cohortFilter === 'session' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                cursor: 'pointer',
              }}
            >
              2026–27
            </button>
            <button
              onClick={() => setCohortFilter('month')}
              style={{
                padding: '0.25rem 0.6rem',
                fontSize: '0.725rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: cohortFilter === 'month' ? '#ffffff' : 'transparent',
                color: cohortFilter === 'month' ? 'var(--text-main)' : 'var(--text-muted)',
                boxShadow: cohortFilter === 'month' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                cursor: 'pointer',
              }}
            >
              This Month
            </button>
          </div>

          <button
            onClick={loadLeaderboardData}
            className="btn-icon btn-micro-spring"
            style={{ width: 32, height: 32 }}
            title="Refresh Leaderboard Rankings"
          >
            <RefreshCw size={14} className={isLoading ? 'spin' : ''} />
          </button>
        </div>
      </div>

      <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
        Admissions performance ranked by successfully enrolled students (Converted stage) and tuition revenue generated across cohort intakes
      </p>

      {isLoading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Calculating counsellor conversions...
        </div>
      ) : stats.length === 0 ? (
        <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          No staff accounts registered yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {stats.map((item, index) => {
            const rank = getRankBadge(index);
            const isTop = index === 0 && item.convertedLeads > 0;

            return (
              <div
                key={item.profile.id}
                className="fade-in-slide btn-micro-spring"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '1rem 1.15rem',
                  borderRadius: 'var(--radius-md)',
                  background: isTop ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.07), rgba(217, 119, 6, 0.02))' : '#ffffff',
                  border: isTop ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid var(--border-subtle)',
                  boxShadow: isTop ? '0 4px 14px -2px rgba(245, 158, 11, 0.15)' : '0 1px 3px rgba(0,0,0,0.03)',
                  gap: '0.75rem',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                  {/* Left: Rank, Avatar & Staff Name */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ position: 'relative' }}>
                      <UserAvatar name={item.profile.full_name || 'Staff Member'} size={42} showStatus={true} status="online" />
                      <div
                        style={{
                          position: 'absolute',
                          bottom: -4,
                          right: -4,
                          width: 22,
                          height: 22,
                          borderRadius: '50%',
                          background: rank.bg,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          border: `1px solid ${rank.border}`,
                          boxShadow: '0 2px 4px rgba(0,0,0,0.12)',
                        }}
                        title={rank.label}
                      >
                        {rank.icon}
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.925rem', fontWeight: 800, color: 'var(--text-main)' }}>
                          {item.profile.full_name || 'Staff Member'}
                        </span>
                        {isTop && (
                          <span
                            style={{
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              color: '#b45309',
                              background: '#fef3c7',
                              padding: '0.1rem 0.45rem',
                              borderRadius: 'var(--radius-full)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              border: '1px solid #fde68a',
                            }}
                          >
                            <Star size={10} fill="#b45309" /> Top Performer
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Role: {item.profile.role.charAt(0).toUpperCase() + item.profile.role.slice(1)} &bull; {item.totalLeads} enquiries ({item.activeLeads} active)
                      </span>
                    </div>
                  </div>

                  {/* Right: Key Performance Badges */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.02em' }}>
                        Enrolled
                      </div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#047857', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                        <UserCheck size={15} />
                        <span>{item.convertedLeads}</span>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.02em' }}>
                        Tuition Revenue
                      </div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#2563eb', display: 'flex', alignItems: 'center', gap: '2px', justifyContent: 'flex-end' }}>
                        <span>{formatRevenue(item.revenueCollected)}</span>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.02em' }}>
                        Conversion Rate
                      </div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#7c3aed', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                        <TrendingUp size={15} />
                        <span>{item.conversionRate}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 21st.dev Conversion Velocity Progress Bar */}
                <div style={{ width: '100%', paddingTop: '0.35rem', borderTop: '1px solid rgba(0,0,0,0.04)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.685rem', color: 'var(--text-muted)', marginBottom: '3px' }}>
                    <span>Conversion Target Progress</span>
                    <span style={{ fontWeight: 700, color: item.conversionRate >= 60 ? '#059669' : '#4f46e5' }}>
                      {item.conversionRate}% cohort conversion
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '5px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${Math.min(100, item.conversionRate)}%`,
                        height: '100%',
                        background: item.conversionRate >= 60
                          ? 'linear-gradient(90deg, #10b981, #059669)'
                          : 'linear-gradient(90deg, #3b82f6, #6366f1)',
                        borderRadius: '3px',
                        transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
