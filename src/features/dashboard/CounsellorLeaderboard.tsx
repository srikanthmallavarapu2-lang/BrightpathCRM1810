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

  const loadLeaderboardData = async () => {
    setIsLoading(true);
    try {
      const [{ profiles }, { leads }] = await Promise.all([
        leadService.getStaffProfiles(),
        leadService.getLeads(),
      ]);

      if (profiles && profiles.length > 0) {
        const computed: CounsellorStats[] = profiles.map((p) => {
          const pName = (p.full_name || '').toLowerCase().trim();
          const pEmailPrefix = (p as any).email ? (p as any).email.split('@')[0].toLowerCase() : '';

          const staffLeads = leads.filter((l: Lead) => {
            if (l.assigned_to === p.id) return true;
            if (l.assigned_profile?.id === p.id) return true;
            if (l.assigned_profile?.full_name && pName && l.assigned_profile.full_name.toLowerCase().trim() === pName) return true;
            if (l.assigned_to && pEmailPrefix && l.assigned_to.toLowerCase().includes(pEmailPrefix)) return true;
            return false;
          });

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
  }, []);

  const getRankBadge = (index: number) => {
    if (index === 0) return { icon: '🥇', label: '1st Rank', color: '#f59e0b', bg: '#fffbeb' };
    if (index === 1) return { icon: '🥈', label: '2nd Rank', color: '#64748b', bg: '#f1f5f9' };
    if (index === 2) return { icon: '🥉', label: '3rd Rank', color: '#b45309', bg: '#fef3c7' };
    return { icon: `#${index + 1}`, label: `Rank ${index + 1}`, color: '#94a3b8', bg: '#ffffff' };
  };

  const formatRevenue = (amt: number) => {
    if (amt >= 100000) {
      return `₹${(amt / 100000).toFixed(2)} Lakh`;
    }
    return `₹${amt.toLocaleString('en-IN')}`;
  };

  return (
    <div className="bento-card-surface bento-glow-top-amber fade-in-slide" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-display)' }}>
          <div style={{ width: 28, height: 28, borderRadius: 'var(--radius-sm)', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Trophy size={16} color="#f59e0b" />
          </div>
          <span>Counsellor Conversion Leaderboard</span>
        </h3>
        <button
          onClick={loadLeaderboardData}
          className="btn-icon btn-micro-spring"
          style={{ width: 32, height: 32 }}
          title="Refresh Leaderboard Rankings"
        >
          <RefreshCw size={14} className={isLoading ? 'spin' : ''} />
        </button>
      </div>

      <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
        Admissions performance ranked by successfully enrolled students (Converted stage) and tuition revenue generated across cohorts
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
                className="fade-in-slide"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: isTop ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(217, 119, 6, 0.02))' : '#ffffff',
                  border: isTop ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid var(--border-subtle)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}
              >
                {/* Left: Rank, Avatar & Staff Name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ position: 'relative' }}>
                    <UserAvatar name={item.profile.full_name || 'Staff Member'} size={40} />
                    <div
                      style={{
                        position: 'absolute',
                        bottom: -4,
                        right: -4,
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        background: rank.bg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        border: '1px solid #cbd5e1',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      }}
                      title={rank.label}
                    >
                      {rank.icon}
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        {item.profile.full_name || 'Staff Member'}
                      </span>
                      {isTop && (
                        <span
                          style={{
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            color: '#b45309',
                            background: '#fef3c7',
                            padding: '0.1rem 0.4rem',
                            borderRadius: 'var(--radius-full)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '2px',
                          }}
                        >
                          <Star size={10} fill="#b45309" /> Top Performer
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Role: {item.profile.role.charAt(0).toUpperCase() + item.profile.role.slice(1)} &bull; {item.totalLeads} total ({item.activeLeads} active)
                    </span>
                  </div>
                </div>

                {/* Right: Key Performance Badges */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                      Enrolled Students
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#047857', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                      <UserCheck size={16} />
                      <span>{item.convertedLeads}</span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                      Tuition Revenue
                    </div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#2563eb', display: 'flex', alignItems: 'center', gap: '2px', justifyContent: 'flex-end' }}>
                      <span>{formatRevenue(item.revenueCollected)}</span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                      Conversion Rate
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#7c3aed', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                      <TrendingUp size={16} />
                      <span>{item.conversionRate}%</span>
                    </div>
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
