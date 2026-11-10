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
      className="card" 
      style={{ 
        padding: '1.25rem',
        background: 'linear-gradient(135deg, rgba(5, 150, 105, 0.05), rgba(16, 185, 129, 0.02))',
        border: '1px solid rgba(16, 185, 129, 0.25)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Coins size={18} color="#059669" />
          <span>Tuition Revenue &amp; Pipeline Financial Value</span>
        </h3>

        {/* Currency Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', background: '#ffffff', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', padding: '2px' }}>
          <button
            onClick={() => setCurrency('INR')}
            style={{
              padding: '0.2rem 0.5rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.75rem',
              fontWeight: 700,
              background: currency === 'INR' ? '#059669' : 'transparent',
              color: currency === 'INR' ? '#ffffff' : 'var(--text-muted)',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '2px',
            }}
          >
            <IndianRupee size={12} />
            <span>INR</span>
          </button>
          <button
            onClick={() => setCurrency('USD')}
            style={{
              padding: '0.2rem 0.5rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.75rem',
              fontWeight: 700,
              background: currency === 'USD' ? '#059669' : 'transparent',
              color: currency === 'USD' ? '#ffffff' : 'var(--text-muted)',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '2px',
            }}
          >
            <DollarSign size={12} />
            <span>USD</span>
          </button>
        </div>
      </div>

      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
        Live calculated admissions fees collected from enrolled students and weighted revenue forecasting
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {/* Metric 1: Realized Tuition Revenue */}
        <div style={{ background: '#ffffff', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.25)', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            <Wallet size={14} color="#059669" />
            <span>Enrolled Tuition Collected</span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#047857', marginTop: '0.35rem', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
            {formatAmount(totalConvertedINR)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            From <strong>{convertedCount}</strong> enrolled admissions
          </div>
        </div>

        {/* Metric 2: Weighted Pipeline Revenue */}
        <div style={{ background: '#ffffff', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(99, 102, 241, 0.25)', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            <TrendingUp size={14} color="#6366f1" />
            <span>Forecasted Pipeline Value</span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#4338ca', marginTop: '0.35rem', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
            {formatAmount(pipelinePotentialINR)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Probability weighted across active leads
          </div>
        </div>

        {/* Metric 3: Average Tuition Yield */}
        <div style={{ background: '#ffffff', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(245, 158, 11, 0.25)', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            <ShieldCheck size={14} color="#f59e0b" />
            <span>Avg Student Tuition</span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#b45309', marginTop: '0.35rem', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
            {formatAmount(avgFeePerStudent)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Per 12-week comprehensive program
          </div>
        </div>
      </div>
    </div>
  );
};

