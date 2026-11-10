import React, { useState } from 'react';
import { 
  IndianRupee, 
  DollarSign, 
  TrendingUp, 
  ShieldCheck, 
  Wallet, 
  Coins 
} from 'lucide-react';
import { Lead } from '../../types/database';

interface RevenueMetricsCardProps {
  leads: Lead[];
}

// Estimated tuition fees per course in INR
const COURSE_FEES_INR: Record<string, number> = {
  'Full Stack Web Dev': 45000,
  'Data Science & AI': 55000,
  'Cloud & DevOps': 50000,
  'Cybersecurity': 48000,
  'UI/UX Design': 38000,
  'Digital Marketing': 32000,
};

const DEFAULT_COURSE_FEE_INR = 45000;
const USD_CONVERSION_RATE = 86; // 1 USD ~ 86 INR

export const RevenueMetricsCard: React.FC<RevenueMetricsCardProps> = ({ leads }) => {
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');

  // Compute revenue metrics
  let totalConvertedINR = 0;
  let pipelinePotentialINR = 0;
  let convertedCount = 0;

  leads.forEach((l) => {
    const fee = COURSE_FEES_INR[l.course_interest] || DEFAULT_COURSE_FEE_INR;
    if (l.status === 'Converted') {
      totalConvertedINR += fee;
      convertedCount += 1;
    } else if (l.status === 'Qualified') {
      // 70% weighted probability
      pipelinePotentialINR += fee * 0.7;
    } else if (l.status === 'Contacted') {
      // 30% weighted probability
      pipelinePotentialINR += fee * 0.3;
    } else if (l.status === 'New') {
      // 15% weighted probability
      pipelinePotentialINR += fee * 0.15;
    }
  });

  const formatAmount = (inr: number) => {
    if (currency === 'INR') {
      if (inr >= 10000000) {
        return `₹${(inr / 10000000).toFixed(2)} Cr`;
      }
      if (inr >= 100000) {
        return `₹${(inr / 100000).toFixed(2)} Lakh`;
      }
      return `₹${inr.toLocaleString('en-IN')}`;
    } else {
      const usd = Math.round(inr / USD_CONVERSION_RATE);
      if (usd >= 1000000) {
        return `$${(usd / 1000000).toFixed(2)}M`;
      }
      if (usd >= 1000) {
        return `$${(usd / 1000).toFixed(1)}k`;
      }
      return `$${usd.toLocaleString('en-US')}`;
    }
  };

  const avgFeePerStudent = convertedCount > 0 
    ? Math.round(totalConvertedINR / convertedCount) 
    : DEFAULT_COURSE_FEE_INR;

  return (
    <div 
      className="bento-card-surface bento-glow-top-emerald fade-in-slide" 
      style={{ 
        padding: '1.5rem',
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(240, 253, 244, 0.45))',
        border: '1px solid rgba(16, 185, 129, 0.25)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-display)' }}>
          <div style={{ width: 28, height: 28, borderRadius: 'var(--radius-sm)', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Coins size={16} color="#059669" />
          </div>
          <span>Tuition Revenue &amp; Pipeline Financial Value</span>
        </h3>

        {/* Currency Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', background: '#ffffff', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-subtle)', padding: '3px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <button
            onClick={() => setCurrency('INR')}
            className="btn-micro-spring"
            style={{
              padding: '0.25rem 0.65rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.785rem',
              fontWeight: 700,
              background: currency === 'INR' ? '#059669' : 'transparent',
              color: currency === 'INR' ? '#ffffff' : 'var(--text-muted)',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              transition: 'all 0.15s ease',
            }}
          >
            <IndianRupee size={12} />
            <span>INR (₹)</span>
          </button>
          <button
            onClick={() => setCurrency('USD')}
            className="btn-micro-spring"
            style={{
              padding: '0.25rem 0.65rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.785rem',
              fontWeight: 700,
              background: currency === 'USD' ? '#059669' : 'transparent',
              color: currency === 'USD' ? '#ffffff' : 'var(--text-muted)',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              transition: 'all 0.15s ease',
            }}
          >
            <DollarSign size={12} />
            <span>USD ($)</span>
          </button>
        </div>
      </div>

      <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
        Live calculated admissions fees collected from enrolled students and weighted revenue forecasting across current cohorts
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        {/* Metric 1: Realized Tuition Revenue */}
        <div className="btn-micro-spring" style={{ background: '#ffffff', padding: '1.15rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.3)', boxShadow: '0 2px 8px rgba(16, 185, 129, 0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: '#047857', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <Wallet size={14} color="#059669" />
              <span>Enrolled Tuition Collected</span>
            </div>
            <span style={{ fontSize: '0.7rem', padding: '1px 6px', borderRadius: 'var(--radius-full)', background: '#ecfdf5', color: '#047857', fontWeight: 700, border: '1px solid #a7f3d0' }}>
              Realized
            </span>
          </div>
          <div style={{ fontSize: '1.95rem', fontWeight: 900, color: '#047857', marginTop: '0.4rem', fontFamily: 'var(--font-display)', letterSpacing: '-0.03em' }}>
            {formatAmount(totalConvertedINR)}
          </div>
          <div style={{ fontSize: '0.785rem', color: 'var(--text-secondary)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>From</span> <strong>{convertedCount}</strong> <span>enrolled student admissions</span>
          </div>
        </div>

        {/* Metric 2: Weighted Pipeline Revenue */}
        <div className="btn-micro-spring" style={{ background: '#ffffff', padding: '1.15rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(99, 102, 241, 0.3)', boxShadow: '0 2px 8px rgba(99, 102, 241, 0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: '#4338ca', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <TrendingUp size={14} color="#6366f1" />
              <span>Forecasted Pipeline Value</span>
            </div>
            <span style={{ fontSize: '0.7rem', padding: '1px 6px', borderRadius: 'var(--radius-full)', background: '#eff6ff', color: '#1d4ed8', fontWeight: 700, border: '1px solid #bfdbfe' }}>
              Weighted
            </span>
          </div>
          <div style={{ fontSize: '1.95rem', fontWeight: 900, color: '#4338ca', marginTop: '0.4rem', fontFamily: 'var(--font-display)', letterSpacing: '-0.03em' }}>
            {formatAmount(pipelinePotentialINR)}
          </div>
          <div style={{ fontSize: '0.785rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Probability weighted across active student leads
          </div>
        </div>

        {/* Metric 3: Average Tuition Yield */}
        <div className="btn-micro-spring" style={{ background: '#ffffff', padding: '1.15rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(245, 158, 11, 0.3)', boxShadow: '0 2px 8px rgba(245, 158, 11, 0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <ShieldCheck size={14} color="#f59e0b" />
              <span>Avg Student Tuition</span>
            </div>
            <span style={{ fontSize: '0.7rem', padding: '1px 6px', borderRadius: 'var(--radius-full)', background: '#fffbeb', color: '#b45309', fontWeight: 700, border: '1px solid #fde68a' }}>
              Per Seat
            </span>
          </div>
          <div style={{ fontSize: '1.95rem', fontWeight: 900, color: '#b45309', marginTop: '0.4rem', fontFamily: 'var(--font-display)', letterSpacing: '-0.03em' }}>
            {formatAmount(avgFeePerStudent)}
          </div>
          <div style={{ fontSize: '0.785rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Standard 12-week comprehensive track
          </div>
        </div>
      </div>
    </div>
  );
};

