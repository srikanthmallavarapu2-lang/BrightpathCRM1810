import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Phone, 
  Mail, 
  GraduationCap, 
  Calendar,
  RotateCcw
} from 'lucide-react';

interface LeadItem {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  courseInterest: string;
  source: string;
  status: 'New' | 'Contacted' | 'Qualified' | 'Converted' | 'Lost';
  assignedTo: string;
  createdDate: string;
}

const SAMPLE_LEADS: LeadItem[] = [
  {
    id: '1',
    fullName: 'Aarav Sharma',
    phone: '+91 98765 43210',
    email: 'aarav.sharma@example.com',
    courseInterest: 'Full Stack Web Dev',
    source: 'Website Form',
    status: 'New',
    assignedTo: 'Demo Counsellor',
    createdDate: '2026-10-22',
  },
  {
    id: '2',
    fullName: 'Diya Patel',
    phone: '+91 98234 56789',
    email: 'diya.p@example.com',
    courseInterest: 'Data Science & AI',
    source: 'Walk-in Visit',
    status: 'Contacted',
    assignedTo: 'Demo Counsellor',
    createdDate: '2026-10-21',
  },
  {
    id: '3',
    fullName: 'Rohan Verma',
    phone: '+91 97123 45678',
    email: 'rohan.v@example.com',
    courseInterest: 'Cloud Computing & DevOps',
    source: 'Inbound Phone Call',
    status: 'Qualified',
    assignedTo: 'Demo Counsellor',
    createdDate: '2026-10-20',
  },
  {
    id: '4',
    fullName: 'Ananya Iyer',
    phone: '+91 98456 78901',
    email: 'ananya.iyer@example.com',
    courseInterest: 'Cybersecurity Fundamentals',
    source: 'Student Referral',
    status: 'Converted',
    assignedTo: 'Demo Counsellor',
    createdDate: '2026-10-19',
  },
];

interface LeadsViewProps {
  onOpenCreateModal: () => void;
}

export const LeadsView: React.FC<LeadsViewProps> = ({ onOpenCreateModal }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');

  const filteredLeads = SAMPLE_LEADS.filter((lead) => {
    const matchesSearch = 
      lead.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.includes(searchQuery) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || lead.status === selectedStatus;
    const matchesSource = selectedSource === 'all' || lead.source === selectedSource;

    return matchesSearch && matchesStatus && matchesSource;
  });

  const getStatusBadgeClass = (status: LeadItem['status']) => {
    switch (status) {
      case 'New': return 'status-badge new';
      case 'Contacted': return 'status-badge contacted';
      case 'Qualified': return 'status-badge qualified';
      case 'Converted': return 'status-badge converted';
      case 'Lost': return 'status-badge lost';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Action and Filter Toolbar */}
      <div 
        className="card" 
        style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
            <Search 
              size={18} 
              color="#94a3b8" 
              style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} 
            />
            <input
              type="text"
              placeholder="Search by student name, phone, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.55rem 1rem 0.55rem 2.5rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                background: '#f8fafc',
                fontSize: '0.875rem',
              }}
            />
          </div>

          {/* Quick Create Button */}
          <button onClick={onOpenCreateModal} className="btn btn-primary">
            <Plus size={16} />
            <span>Create Lead</span>
          </button>
        </div>

        {/* Filter Dropdowns */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', paddingTop: '0.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            <Filter size={14} />
            <span>Filters:</span>
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              background: 'white',
              fontSize: '0.8rem',
            }}
          >
            <option value="all">All Statuses</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Qualified">Qualified</option>
            <option value="Converted">Converted</option>
            <option value="Lost">Lost</option>
          </select>

          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              background: 'white',
              fontSize: '0.8rem',
            }}
          >
            <option value="all">All Sources</option>
            <option value="Website Form">Website Form</option>
            <option value="Walk-in Visit">Walk-in Visit</option>
            <option value="Inbound Phone Call">Inbound Phone Call</option>
            <option value="Student Referral">Student Referral</option>
          </select>

          {(selectedStatus !== 'all' || selectedSource !== 'all' || searchQuery !== '') && (
            <button
              onClick={() => {
                setSelectedStatus('all');
                setSelectedSource('all');
                setSearchQuery('');
              }}
              className="btn btn-secondary"
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </button>
          )}

          <div style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Showing <strong>{filteredLeads.length}</strong> enquiries
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '0.85rem 1.25rem', fontWeight: 600 }}>Student Name</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Contact Info</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Course Interest</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Source</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Assignee</th>
                <th style={{ padding: '0.85rem 1.25rem', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead) => (
                <tr 
                  key={lead.id}
                  style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.15s ease' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <td style={{ padding: '0.85rem 1.25rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{lead.fullName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <Calendar size={12} /> Added {lead.createdDate}
                    </div>
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.825rem' }}>
                      <Phone size={13} color="#2563eb" /> {lead.phone}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.785rem', marginTop: '2px' }}>
                      <Mail size={13} /> {lead.email}
                    </div>
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 500 }}>
                      <GraduationCap size={15} color="#4f46e5" />
                      {lead.courseInterest}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>
                    {lead.source}
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span className={getStatusBadgeClass(lead.status)}>
                      {lead.status}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>
                    {lead.assignedTo}
                  </td>
                  <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                    <button 
                      onClick={onOpenCreateModal}
                      className="btn btn-outline" 
                      style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
