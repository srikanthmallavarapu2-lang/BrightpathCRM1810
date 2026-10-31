import React, { useState, useEffect, useCallback } from 'react';
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
  List
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

  const displayedLeads = leads.filter((lead) => {
    if (selectedPriority !== 'all') {
      return extractPriority(lead.notes, lead.status) === selectedPriority;
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Action and Filter Toolbar */}
      <div 
        className="card" 
        style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          {/* Live Search Box */}
          <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
            <Search 
              size={18} 
              color="#94a3b8" 
              style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} 
            />
            <input
              type="text"
              placeholder="Search by student name, phone, email, course..."
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

            {/* Quick Create Button */}
            <button onClick={onOpenCreateModal} className="btn btn-primary" style={{ fontSize: '0.8rem' }}>
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
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
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
              <table style={{ width: '100%', minWidth: '680px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '0.85rem 1.25rem', fontWeight: 600 }}>Student Name &amp; Priority</th>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Contact Info</th>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Course Interest</th>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Source</th>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Status</th>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Assignee</th>
                    <th style={{ padding: '0.85rem 1.25rem', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedLeads.map((lead) => {
                    const priority = extractPriority(lead.notes, lead.status);

                    return (
                      <tr 
                        key={lead.id}
                        style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.15s ease' }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        {/* Student Name & Avatar */}
                        <td style={{ padding: '0.85rem 1.25rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <UserAvatar name={lead.full_name} size={34} />
                            <div>
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
                                  fontSize: '0.875rem',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                }}
                                title="View student dossier & activity history"
                              >
                                <span style={{ textDecoration: 'underline', textDecorationColor: '#93c5fd' }}>{lead.full_name}</span>
                                <ExternalLink size={12} color="#2563eb" />
                              </button>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                                <span
                                  style={{
                                    fontSize: '0.68rem',
                                    fontWeight: 700,
                                    padding: '0.1rem 0.4rem',
                                    borderRadius: 'var(--radius-full)',
                                    background: priority === 'Hot' ? '#fef2f2' : priority === 'Warm' ? '#fffbeb' : '#f1f5f9',
                                    color: priority === 'Hot' ? '#dc2626' : priority === 'Warm' ? '#d97706' : '#64748b',
                                    border: `1px solid ${priority === 'Hot' ? '#fee2e2' : priority === 'Warm' ? '#fef3c7' : '#e2e8f0'}`,
                                  }}
                                >
                                  {priority === 'Hot' ? '🔥 Hot' : priority === 'Warm' ? '☀️ Warm' : '❄️ Cold'}
                                </span>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                  <Calendar size={11} /> {formatDate(lead.created_at)}
                                </div>
                              </div>

                              {lead.lost_reason && (
                                <div style={{ fontSize: '0.72rem', color: '#b91c1c', marginTop: '3px' }}>
                                  Reason: {lead.lost_reason}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Contact Info */}
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.825rem' }}>
                            <Phone size={13} color="#2563eb" /> {lead.phone}
                          </div>
                          {lead.email && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.785rem', marginTop: '2px' }}>
                              <Mail size={13} /> {lead.email}
                            </div>
                          )}
                        </td>

                        {/* Course Interest */}
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <CourseBadge courseName={lead.course_interest} size="sm" />
                        </td>

                        {/* Source */}
                        <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>
                          {lead.source}
                        </td>

                        {/* Interactive Status Selector */}
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <select
                            value={lead.status}
                            onChange={(e) => handleStatusChange(lead, e.target.value as LeadStatus)}
                            className={getStatusBadgeClass(lead.status)}
                            style={{ cursor: 'pointer', border: '1px solid transparent', outline: 'none' }}
                            title="Click to update status"
                          >
                            <option value="New">New</option>
                            <option value="Contacted">Contacted</option>
                            <option value="Qualified">Qualified</option>
                            <option value="Converted">Converted</option>
                            <option value="Lost">Lost</option>
                          </select>
                        </td>

                        {/* Assignee */}
                        <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)', fontSize: '0.825rem' }}>
                          {lead.assigned_profile?.full_name || 'Unassigned (Pool)'}
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                            {/* 1-Click WhatsApp consultation button */}
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
                              className="btn-icon"
                              style={{ width: 30, height: 30, color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0' }}
                              title="Chat on WhatsApp"
                              aria-label={`WhatsApp ${lead.full_name}`}
                            >
                              <MessageCircle size={14} />
                            </button>

                            {onScheduleFollowUpForLead && (
                              <button
                                onClick={() => onScheduleFollowUpForLead(lead)}
                                className="btn-icon"
                                style={{ width: 30, height: 30, color: '#2563eb' }}
                                title="Schedule Follow-up Reminder"
                                aria-label={`Schedule follow-up for ${lead.full_name}`}
                              >
                                <CalendarPlus size={14} />
                              </button>
                            )}
                            {onEditLead && (
                              <button
                                onClick={() => onEditLead(lead)}
                                className="btn-icon"
                                style={{ width: 30, height: 30 }}
                                title="Edit Enquiry Details"
                                aria-label={`Edit ${lead.full_name}`}
                              >
                                <Edit2 size={14} />
                              </button>
                            )}
                            {(isAdmin || isManager) && (
                              <button
                                onClick={() => handleDeleteLead(lead)}
                                className="btn-icon"
                                style={{ width: 30, height: 30, color: '#ef4444' }}
                                title="Delete Lead (Admin/Manager)"
                                aria-label={`Delete ${lead.full_name}`}
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
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
