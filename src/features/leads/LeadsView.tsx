import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Phone, 
  Mail, 
  Calendar, 
  RotateCcw,
  Edit2,
  Trash2,
  AlertCircle,
  RefreshCw,
  FolderOpen,
  CalendarPlus,
  ExternalLink,
  MessageCircle,
  Download,
  LayoutGrid,
  List,
  Copy,
  Check,
  X
} from 'lucide-react';
import { Lead, LeadStatus, Profile } from '../../types/database';
import { leadService } from '../../services/leadService';
import { LostReasonModal } from './LostReasonModal';
import { LeadDetailModal } from './LeadDetailModal';
import { LeadKanbanBoard } from './LeadKanbanBoard';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { exportLeadsToCSV } from '../../utils/csvExport';
import { extractPriority } from '../../utils/priority';
import { launchWhatsAppOutreach } from '../../utils/outreach';
import { UserAvatar } from '../../components/common/UserAvatar';
import { CourseBadge } from '../../components/common/CourseBadge';

interface LeadsViewProps {
  onOpenCreateModal: () => void;
  onEditLead?: (lead: Lead) => void;
  onScheduleFollowUpForLead?: (lead: Lead) => void;
  initialSearchQuery?: string;
  initialStatusFilter?: string;
  initialSourceFilter?: string;
  refreshTrigger?: number;
}

export const LeadsView: React.FC<LeadsViewProps> = ({ 
  onOpenCreateModal,
  onEditLead,
  onScheduleFollowUpForLead,
  initialSearchQuery,
  initialStatusFilter,
  initialSourceFilter,
  refreshTrigger = 0,
}) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [staffProfiles, setStaffProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedLeadForDetail, setSelectedLeadForDetail] = useState<Lead | null>(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery || '');
  const [selectedStatus, setSelectedStatus] = useState<string>(initialStatusFilter || 'all');
  const [selectedSource, setSelectedSource] = useState<string>(initialSourceFilter || 'all');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [copiedPhoneId, setCopiedPhoneId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<'name' | 'priority' | 'date' | 'status'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleSort = (field: 'name' | 'priority' | 'date' | 'status') => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Global '/' keyboard shortcut to focus search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleCopyPhone = (leadId: string, phone: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(phone);
    setCopiedPhoneId(leadId);
    toast.success(`Copied phone number (${phone}) to clipboard`);
    setTimeout(() => setCopiedPhoneId(null), 2000);
  };

  useEffect(() => {
    if (initialSearchQuery !== undefined) {
      setSearchQuery(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  useEffect(() => {
    if (initialStatusFilter !== undefined) {
      setSelectedStatus(initialStatusFilter);
    }
  }, [initialStatusFilter]);

  useEffect(() => {
    if (initialSourceFilter !== undefined) {
      setSelectedSource(initialSourceFilter);
    }
  }, [initialSourceFilter]);

  // Status transition state for LostReasonModal
  const [lostModalState, setLostModalState] = useState<{ isOpen: boolean; lead: Lead | null }>({
    isOpen: false,
    lead: null,
  });

  const { isAdmin, isManager } = useAuth();
  const toast = useToast();

  // Load staff profiles once on mount for filter dropdown
  useEffect(() => {
    leadService.getStaffProfiles().then(({ profiles }) => {
      if (profiles && profiles.length > 0) {
        setStaffProfiles(profiles);
      }
    });
  }, []);

  const fetchLeads = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const { leads: data, error } = await leadService.getLeads({
      status: selectedStatus,
      source: selectedSource,
      assignee: selectedAssignee,
      search: searchQuery,
    });

    if (error) {
      setErrorMessage(error);
    } else {
      setLeads(data);
    }
    setIsLoading(false);
  }, [selectedStatus, selectedSource, selectedAssignee, searchQuery]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads, refreshTrigger]);

  const handleStatusChange = async (lead: Lead, newStatus: LeadStatus) => {
    if (newStatus === 'Lost') {
      // Prompt for mandatory lost reason
      setLostModalState({ isOpen: true, lead });
      return;
    }

    const { success, error } = await leadService.updateLeadStatus(lead.id, newStatus);
    if (success) {
      toast.success(`Updated status to ${newStatus} for ${lead.full_name}.`);
      fetchLeads();
    } else {
      toast.error(error || 'Failed to update status.');
    }
  };

  const handleAssigneeChange = async (lead: Lead, newAssigneeId: string) => {
    const targetProfile = staffProfiles.find((p) => p.id === newAssigneeId);
    const { success, error } = await leadService.updateLead(lead.id, {
      assigned_to: newAssigneeId || null,
      assigned_profile: targetProfile || null,
    });

    if (success) {
      toast.success(
        newAssigneeId 
          ? `Assigned ${lead.full_name} to ${targetProfile?.full_name || 'counsellor'}.` 
          : `Moved ${lead.full_name} to Unassigned Pool.`
      );
      fetchLeads();
    } else {
      toast.error(error || 'Failed to update assignee.');
    }
  };

  const handleConfirmLostReason = async (reason: string) => {
    if (!lostModalState.lead) return;
    const { success, error } = await leadService.updateLeadStatus(lostModalState.lead.id, 'Lost', reason);
    if (success) {
      toast.info(`Marked enquiry for ${lostModalState.lead.full_name} as Lost.`);
      fetchLeads();
    } else {
      toast.error(error || 'Failed to update status.');
      throw new Error(error || 'Failed to update status.');
    }
  };

  const handleDeleteLead = async (lead: Lead) => {
    if (!window.confirm(`Are you sure you want to delete the enquiry for "${lead.full_name}"?`)) {
      return;
    }

    const { success, error } = await leadService.deleteLead(lead.id);
    if (success) {
      toast.info(`Deleted enquiry for ${lead.full_name}.`);
      fetchLeads();
    } else {
      toast.error(error || 'Could not delete lead.');
    }
  };

  const getStatusBadgeClass = (status: LeadStatus) => {
    switch (status) {
      case 'New': return 'status-badge new';
      case 'Contacted': return 'status-badge contacted';
      case 'Qualified': return 'status-badge qualified';
      case 'Converted': return 'status-badge converted';
      case 'Lost': return 'status-badge lost';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateString;
    }
  };

  const displayedLeads = leads
    .filter((lead) => {
      if (selectedPriority !== 'all') {
        return extractPriority(lead.notes, lead.status) === selectedPriority;
      }
      return true;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortField === 'name') {
        comparison = a.full_name.localeCompare(b.full_name);
      } else if (sortField === 'date') {
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else if (sortField === 'status') {
        comparison = a.status.localeCompare(b.status);
      } else if (sortField === 'priority') {
        const priorityOrder: Record<string, number> = { Hot: 3, Warm: 2, Cold: 1 };
        const pA = priorityOrder[extractPriority(a.notes, a.status)] || 0;
        const pB = priorityOrder[extractPriority(b.notes, b.status)] || 0;
        comparison = pA - pB;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Action and Filter Toolbar */}
      <div 
        className="bento-card-surface fade-in-slide" 
        style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          {/* Live Search Box */}
          <div style={{ position: 'relative', flex: '1', minWidth: '260px' }}>
            <Search 
              size={17} 
              color="#94a3b8" 
              style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} 
            />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search by student name, phone, email, course... (press / to focus)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.55rem 3.5rem 0.55rem 2.4rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                background: '#f8fafc',
                fontSize: '0.85rem',
                transition: 'border-color 0.2s, background 0.2s',
              }}
              onFocus={(e) => (e.target.style.background = '#ffffff')}
              onBlur={(e) => (e.target.style.background = '#f8fafc')}
            />
            <div style={{ position: 'absolute', right: '0.65rem', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    padding: '2px',
                    borderRadius: '50%',
                    background: '#e2e8f0',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                  title="Clear search"
                >
                  <X size={12} />
                </button>
              )}
              <kbd
                style={{
                  fontSize: '0.7rem',
                  fontFamily: 'var(--font-mono, monospace)',
                  background: '#e2e8f0',
                  color: '#64748b',
                  padding: '1px 5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1',
                  userSelect: 'none',
                }}
                title="Press / to focus search"
              >
                /
              </kbd>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            {/* View Mode Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', background: '#f1f5f9', padding: '3px', borderRadius: 'var(--radius-sm)' }}>
              <button
                onClick={() => setViewMode('table')}
                style={{
                  padding: '0.3rem 0.65rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.785rem',
                  fontWeight: 600,
                  background: viewMode === 'table' ? '#ffffff' : 'transparent',
                  color: viewMode === 'table' ? 'var(--text-main)' : 'var(--text-muted)',
                  boxShadow: viewMode === 'table' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
                title="Table List View"
              >
                <List size={13} />
                <span>Table</span>
              </button>

              <button
                onClick={() => setViewMode('kanban')}
                style={{
                  padding: '0.3rem 0.65rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.785rem',
                  fontWeight: 600,
                  background: viewMode === 'kanban' ? '#ffffff' : 'transparent',
                  color: viewMode === 'kanban' ? 'var(--text-main)' : 'var(--text-muted)',
                  boxShadow: viewMode === 'kanban' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
                title="Visual Kanban Pipeline Board"
              >
                <LayoutGrid size={13} />
                <span>Kanban</span>
              </button>
            </div>

            {/* Export CSV Button */}
            <button
              onClick={() => {
                const filtered = leads.filter((lead) => {
                  if (selectedPriority !== 'all') {
                    return extractPriority(lead.notes, lead.status) === selectedPriority;
                  }
                  return true;
                });
                exportLeadsToCSV(filtered);
                toast.success(`Exported ${filtered.length} enquiries to CSV.`);
              }}
              className="btn btn-outline"
              style={{ fontSize: '0.8rem', padding: '0.45rem 0.75rem', gap: '5px' }}
              title="Download enquiries spreadsheet"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>

            {/* Refresh Button */}
            <button 
              onClick={fetchLeads} 
              className="btn btn-outline" 
              title="Refresh database records"
              style={{ padding: '0.45rem 0.75rem' }}
            >
              <RefreshCw size={14} className={isLoading ? 'spin' : ''} />
              <span>Sync</span>
            </button>

            {/* Quick Create Button with 21st.dev Shimmer effect */}
            <button 
              onClick={onOpenCreateModal} 
              className="btn-shimmer" 
              style={{ fontSize: '0.8rem', padding: '0.45rem 0.95rem', gap: '6px', display: 'inline-flex', alignItems: 'center' }}
            >
              <Plus size={15} />
              <span>Record Enquiry</span>
            </button>
          </div>
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

          <select
            value={selectedAssignee}
            onChange={(e) => setSelectedAssignee(e.target.value)}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              background: 'white',
              fontSize: '0.8rem',
            }}
          >
            <option value="all">All Assignees</option>
            <option value="me">Assigned to Me</option>
            <option value="unassigned">Unassigned (Pool)</option>
            {staffProfiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.full_name || 'Staff Member'} ({p.role})
              </option>
            ))}
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              background: 'white',
              fontSize: '0.8rem',
            }}
          >
            <option value="all">All Priorities</option>
            <option value="Hot">🔥 Hot Leads</option>
            <option value="Warm">☀️ Warm Leads</option>
            <option value="Cold">❄️ Cold Leads</option>
          </select>

          {/* Quick My Assigned Leads Toggle */}
          <button
            onClick={() => {
              if (selectedAssignee === 'me') {
                setSelectedAssignee('all');
              } else {
                setSelectedAssignee('me');
              }
            }}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              border: selectedAssignee === 'me' ? '1px solid #3b82f6' : '1px solid var(--border-subtle)',
              background: selectedAssignee === 'me' ? '#eff6ff' : '#ffffff',
              color: selectedAssignee === 'me' ? '#1d4ed8' : 'var(--text-secondary)',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
            title="Filter to view leads assigned to your account"
          >
            <span>👤 My Assigned Leads</span>
            {selectedAssignee === 'me' && <span>✓</span>}
          </button>

          {/* Quick Enrolled Students Filter Toggle */}
          <button
            onClick={() => {
              if (selectedStatus === 'Converted') {
                setSelectedStatus('all');
              } else {
                setSelectedStatus('Converted');
              }
            }}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              border: selectedStatus === 'Converted' ? '1px solid #10b981' : '1px solid var(--border-subtle)',
              background: selectedStatus === 'Converted' ? '#ecfdf5' : '#ffffff',
              color: selectedStatus === 'Converted' ? '#047857' : 'var(--text-secondary)',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
            title="Filter to view only enrolled students with course details"
          >
            <span>🎓 Enrolled Students</span>
            {selectedStatus === 'Converted' && <span>✓</span>}
          </button>

          {(selectedStatus !== 'all' || selectedSource !== 'all' || selectedAssignee !== 'all' || selectedPriority !== 'all' || searchQuery !== '') && (
            <button
              onClick={() => {
                setSelectedStatus('all');
                setSelectedSource('all');
                setSelectedAssignee('all');
                setSelectedPriority('all');
                setSearchQuery('');
              }}
              className="btn btn-secondary"
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', gap: '4px' }}
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </button>
          )}

          <div style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Showing <strong>{leads.length}</strong> live database enquiries
          </div>
        </div>
      </div>

      {/* Error State */}
      {errorMessage && (
        <div style={{ padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', background: '#fef2f2', border: '1px solid #fee2e2', color: '#b91c1c', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* View Switcher: Table View vs Kanban Board View */}
      {viewMode === 'kanban' ? (
        <LeadKanbanBoard
          leads={displayedLeads}
          onOpenLeadDetail={(lead) => setSelectedLeadForDetail(lead)}
          onEditLead={onEditLead}
          onScheduleFollowUp={onScheduleFollowUpForLead}
          onStatusChange={handleStatusChange}
        />
      ) : (
        /* Leads Table Container */
        <div className="bento-card-surface fade-in-slide" style={{ padding: 0, overflow: 'hidden' }}>
          {isLoading ? (
            /* Loading Skeleton */
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem' }}>
                <RefreshCw size={20} className="spin" color="#2563eb" />
                <span>Querying live Supabase leads...</span>
              </div>
            </div>
          ) : displayedLeads.length === 0 ? (
            /* Empty / No Results State */
            <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
              <div 
                style={{ 
                  width: 56, 
                  height: 56, 
                  borderRadius: 'var(--radius-full)', 
                  background: '#f1f5f9', 
                  color: '#64748b', 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  marginBottom: '1rem',
                }}
              >
                <FolderOpen size={28} />
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                {searchQuery || selectedStatus !== 'all' || selectedSource !== 'all' || selectedAssignee !== 'all' || selectedPriority !== 'all'
                  ? 'No matching enquiries found' 
                  : 'No student leads recorded yet'}
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 1.25rem auto' }}>
                {searchQuery || selectedStatus !== 'all' || selectedSource !== 'all' || selectedAssignee !== 'all' || selectedPriority !== 'all'
                  ? 'Try broadening your search term or clearing filters to see more results.'
                  : 'Your live database is ready. Record your first enquiry to begin tracking the student admission pipeline.'}
              </p>
              {searchQuery || selectedStatus !== 'all' || selectedSource !== 'all' || selectedAssignee !== 'all' || selectedPriority !== 'all' ? (
                <button 
                  onClick={() => { setSelectedStatus('all'); setSelectedSource('all'); setSelectedAssignee('all'); setSelectedPriority('all'); setSearchQuery(''); }}
                  className="btn btn-outline"
                  style={{ fontSize: '0.85rem' }}
                >
                  Clear Search & Filters
                </button>
              ) : (
                <button onClick={onOpenCreateModal} className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
                  <Plus size={16} />
                  <span>Create Your First Lead</span>
                </button>
              )}
            </div>
          ) : (
            /* Live Data Table */
            <div className="table-responsive">
              <table className="crm-table">
                <thead>
                  <tr>
                    <th 
                      className="sortable" 
                      onClick={() => handleSort('name')}
                      style={{ minWidth: '240px' }}
                      title="Click to sort by student name"
                    >
                      Student &amp; Contact {sortField === 'name' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                    </th>
                    <th style={{ minWidth: '150px' }}>Course Track</th>
                    <th 
                      className="sortable" 
                      onClick={() => handleSort('priority')}
                      style={{ minWidth: '100px' }}
                      title="Click to sort by priority"
                    >
                      Priority {sortField === 'priority' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                    </th>
                    <th style={{ minWidth: '120px' }}>Source</th>
                    <th 
                      className="sortable" 
                      onClick={() => handleSort('status')}
                      style={{ minWidth: '140px' }}
                      title="Click to sort by status"
                    >
                      Status {sortField === 'status' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                    </th>
                    <th style={{ minWidth: '220px' }}>Assigned Counsellor</th>
                    <th style={{ minWidth: '180px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedLeads.map((lead) => {
                    const priority = extractPriority(lead.notes, lead.status);

                    return (
                      <tr key={lead.id}>
                        {/* Student Name & Contact */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                            <UserAvatar name={lead.full_name} size={36} />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <button
                                onClick={() => setSelectedLeadForDetail(lead)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  padding: 0,
                                  cursor: 'pointer',
                                  fontWeight: 700,
                                  color: '#1d4ed8',
                                  textAlign: 'left',
                                  fontSize: '0.9rem',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                }}
                                title="View student dossier & activity history"
                              >
                                <span style={{ textDecoration: 'underline', textDecorationColor: '#93c5fd' }}>{lead.full_name}</span>
                                <ExternalLink size={12} color="#2563eb" />
                              </button>

                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', marginTop: '1px' }}>
                                <Phone size={12} color="#2563eb" />
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{lead.phone}</span>
                                <button
                                  onClick={(e) => handleCopyPhone(lead.id, lead.phone, e)}
                                  title="Copy phone to clipboard"
                                  className="btn-micro-spring"
                                  style={{
                                    padding: '2px 4px',
                                    borderRadius: '4px',
                                    background: copiedPhoneId === lead.id ? '#dcfce7' : '#f1f5f9',
                                    color: copiedPhoneId === lead.id ? '#15803d' : '#64748b',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '3px',
                                    fontSize: '0.7rem',
                                    cursor: 'pointer',
                                    border: '1px solid',
                                    borderColor: copiedPhoneId === lead.id ? '#86efac' : '#e2e8f0',
                                  }}
                                >
                                  {copiedPhoneId === lead.id ? <Check size={11} /> : <Copy size={11} />}
                                  {copiedPhoneId === lead.id && <span>Copied</span>}
                                </button>
                              </div>

                              {lead.email && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-muted)', fontSize: '0.775rem' }}>
                                  <Mail size={11} />
                                  <span>{lead.email}</span>
                                </div>
                              )}

                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#94a3b8', fontSize: '0.725rem', marginTop: '1px' }}>
                                <Calendar size={11} />
                                <span>Enquired {formatDate(lead.created_at)}</span>
                              </div>

                              {lead.lost_reason && (
                                <div style={{ fontSize: '0.725rem', color: '#b91c1c', marginTop: '2px', background: '#fef2f2', padding: '1px 6px', borderRadius: '4px', border: '1px solid #fee2e2', display: 'inline-block' }}>
                                  Lost reason: {lead.lost_reason}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Course Track */}
                        <td>
                          <CourseBadge courseName={lead.course_interest} size="sm" />
                        </td>

                        {/* Dedicated Priority Column */}
                        <td>
                          {priority === 'Hot' ? (
                            <span className="priority-pill hot" title="High enrollment velocity">🔥 Hot</span>
                          ) : priority === 'Warm' ? (
                            <span className="priority-pill warm" title="Moderate prospect interest">⚡ Warm</span>
                          ) : (
                            <span className="priority-pill cold" title="Cold / Early enquiry">❄️ Cold</span>
                          )}
                        </td>

                        {/* Source */}
                        <td>
                          <span 
                            style={{ 
                              fontSize: '0.785rem', 
                              color: 'var(--text-secondary)', 
                              background: '#f8fafc', 
                              padding: '0.2rem 0.55rem', 
                              borderRadius: '6px', 
                              border: '1px solid #e2e8f0',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {lead.source}
                          </span>
                        </td>

                        {/* Interactive Status Selector with 21st.dev Pulse Dot */}
                        <td>
                          <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                            <span className={`status-pulse-dot ${lead.status.toLowerCase()}`} />
                            <select
                              value={lead.status}
                              onChange={(e) => handleStatusChange(lead, e.target.value as LeadStatus)}
                              className={getStatusBadgeClass(lead.status)}
                              style={{ cursor: 'pointer', border: '1px solid transparent', outline: 'none' }}
                              title="Click to update lead status"
                            >
                              <option value="New">New</option>
                              <option value="Contacted">Contacted</option>
                              <option value="Qualified">Qualified</option>
                              <option value="Converted">Converted</option>
                              <option value="Lost">Lost</option>
                            </select>
                          </div>
                        </td>

                        {/* Interactive Assignee Selector - WIDE, NO TRUNCATION */}
                        <td>
                          <select
                            value={lead.assigned_to || ''}
                            onChange={(e) => handleAssigneeChange(lead, e.target.value)}
                            style={{
                              fontSize: '0.8rem',
                              padding: '0.35rem 0.65rem',
                              borderRadius: 'var(--radius-sm)',
                              border: lead.assigned_to ? '1px solid #bbf7d0' : '1px solid #fde68a',
                              background: lead.assigned_to ? '#f0fdf4' : '#fffbeb',
                              color: lead.assigned_to ? '#15803d' : '#92400e',
                              fontWeight: 600,
                              cursor: 'pointer',
                              width: '100%',
                              minWidth: '200px',
                              outline: 'none',
                            }}
                            title="Assign enquiry to staff member"
                          >
                            <option value="">Unassigned (Pool)</option>
                            {staffProfiles.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.full_name} ({p.role})
                              </option>
                            ))}
                            {lead.assigned_to && !staffProfiles.some((p) => p.id === lead.assigned_to) && (
                              <option value={lead.assigned_to}>
                                {lead.assigned_profile?.full_name || 'Sarah Jenkins'} ({lead.assigned_profile?.role || 'counsellor'})
                              </option>
                            )}
                          </select>
                        </td>

                        {/* Actions */}
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem' }}>
                            {/* Prominent 1-Click WhatsApp outreach */}
                            <button
                              onClick={() => {
                                launchWhatsAppOutreach({
                                  leadId: lead.id,
                                  studentName: lead.full_name,
                                  phone: lead.phone,
                                  courseInterest: lead.course_interest,
                                });
                                toast.success(`WhatsApp consultation launched for ${lead.full_name}.`);
                              }}
                              className="btn-whatsapp btn-micro-spring"
                              title={`Chat with ${lead.full_name} on WhatsApp`}
                              aria-label={`WhatsApp ${lead.full_name}`}
                            >
                              <MessageCircle size={13} />
                              <span>WhatsApp</span>
                            </button>

                            {onScheduleFollowUpForLead && (
                              <button
                                onClick={() => onScheduleFollowUpForLead(lead)}
                                className="btn-icon btn-micro-spring"
                                style={{ width: 32, height: 32, color: '#2563eb', background: '#eff6ff', border: '1px solid #dbeafe' }}
                                title="Schedule Follow-up Reminder"
                                aria-label={`Schedule follow-up for ${lead.full_name}`}
                              >
                                <CalendarPlus size={14} />
                              </button>
                            )}
                            {onEditLead && (
                              <button
                                onClick={() => onEditLead(lead)}
                                className="btn-icon btn-micro-spring"
                                style={{ width: 32, height: 32, background: '#f8fafc', border: '1px solid var(--border-subtle)' }}
                                title="Edit Enquiry Details"
                                aria-label={`Edit ${lead.full_name}`}
                              >
                                <Edit2 size={13} color="#475569" />
                              </button>
                            )}
                            {(isAdmin || isManager) && (
                              <button
                                onClick={() => handleDeleteLead(lead)}
                                className="btn-icon btn-micro-spring"
                                style={{ width: 32, height: 32, color: '#ef4444', background: '#fef2f2', border: '1px solid #fee2e2' }}
                                title="Delete Lead (Admin/Manager)"
                                aria-label={`Delete ${lead.full_name}`}
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* 21st.dev CRM Table Pagination Bar */}
              <div className="crm-pagination">
                <div>
                  Showing <strong>{displayedLeads.length}</strong> of <strong>{leads.length}</strong> live enquiries
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button type="button" className="crm-pagination-btn" disabled>
                    <span>&larr; Previous</span>
                  </button>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '0.2rem 0.6rem', background: '#eff6ff', color: '#1d4ed8', borderRadius: '4px', border: '1px solid #bfdbfe' }}>
                    Page 1 of 1
                  </span>
                  <button type="button" className="crm-pagination-btn" disabled>
                    <span>Next &rarr;</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Lost Reason Modal */}
      <LostReasonModal
        isOpen={lostModalState.isOpen}
        onClose={() => setLostModalState({ isOpen: false, lead: null })}
        leadName={lostModalState.lead?.full_name || ''}
        onConfirm={handleConfirmLostReason}
      />

      {/* Lead Detail & Activity History Modal */}
      <LeadDetailModal
        isOpen={Boolean(selectedLeadForDetail)}
        onClose={() => setSelectedLeadForDetail(null)}
        leadId={selectedLeadForDetail?.id || null}
        initialLead={selectedLeadForDetail}
        onLeadUpdated={fetchLeads}
        onScheduleFollowUp={(lead) => {
          setSelectedLeadForDetail(null);
          if (onScheduleFollowUpForLead) onScheduleFollowUpForLead(lead);
        }}
        onEditLead={(lead) => {
          setSelectedLeadForDetail(null);
          if (onEditLead) onEditLead(lead);
        }}
      />
    </div>
  );
};
