import React, { useState, useEffect, useCallback } from 'react';
import { 
  X, 
  Phone, 
  Mail, 
  GraduationCap, 
  Calendar, 
  User, 
  CalendarPlus, 
  Edit3, 
  Clock, 
  Send, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { Lead, Activity, FollowUp, LeadStatus } from '../../types/database';
import { leadService } from '../../services/leadService';
import { activityService } from '../../services/activityService';
import { followUpService } from '../../services/followUpService';
import { ActivityTimeline } from '../activities/ActivityTimeline';
import { LostReasonModal } from './LostReasonModal';
import { OverdueBadge } from '../../components/common/OverdueBadge';
import { useToast } from '../../context/ToastContext';

interface LeadDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadId: string | null;
  onLeadUpdated: () => void;
  onScheduleFollowUp: (lead: Lead) => void;
  onEditLead: (lead: Lead) => void;
}

export const LeadDetailModal: React.FC<LeadDetailModalProps> = ({
  isOpen,
  onClose,
  leadId,
  onLeadUpdated,
  onScheduleFollowUp,
  onEditLead,
}) => {
  const [lead, setLead] = useState<Lead | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLostModalOpen, setIsLostModalOpen] = useState(false);

  const toast = useToast();

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const fetchLeadData = useCallback(async () => {
    if (!leadId) return;
    setIsLoading(true);
    setErrorMessage(null);

    const [leadRes, actRes, followRes] = await Promise.all([
      leadService.getLeadById(leadId),
      activityService.getActivitiesByLeadId(leadId),
      followUpService.getFollowUps({ leadId }),
    ]);

    if (leadRes.error) {
      setErrorMessage(leadRes.error);
    } else {
      setLead(leadRes.lead);
    }

    setActivities(actRes.activities);
    setFollowUps(followRes.followUps);
    setIsLoading(false);
  }, [leadId]);

  useEffect(() => {
    if (isOpen && leadId) {
      fetchLeadData();
      setNewNote('');
    }
  }, [isOpen, leadId, fetchLeadData]);

  if (!isOpen) return null;

  const handleStatusChange = async (newStatus: LeadStatus) => {
    if (!lead) return;
    if (newStatus === 'Lost') {
      setIsLostModalOpen(true);
      return;
    }

    const { success, error } = await leadService.updateLeadStatus(lead.id, newStatus);
    if (success) {
      toast.success(`Pipeline status updated to ${newStatus}.`);
      await fetchLeadData();
      onLeadUpdated();
    } else {
      toast.error(error || 'Failed to update status.');
    }
  };

  const handleConfirmLostReason = async (reason: string) => {
    if (!lead) return;
    const { success, error } = await leadService.updateLeadStatus(lead.id, 'Lost', reason);
    if (success) {
      toast.info('Student enquiry marked as Lost.');
      await fetchLeadData();
      onLeadUpdated();
    } else {
      toast.error(error || 'Failed to update status.');
      throw new Error(error || 'Failed to update status.');
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead || !newNote.trim()) return;

    setIsSubmittingNote(true);
    const { success, error } = await activityService.addCounsellorNote(lead.id, newNote);
    if (success) {
      toast.success('Interaction note posted to timeline.');
      setNewNote('');
      await fetchLeadData();
      onLeadUpdated();
    } else {
      toast.error(error || 'Failed to add note.');
    }
    setIsSubmittingNote(false);
  };

  const handleMarkFollowUpDone = async (followUpId: string) => {
    const { success, error } = await followUpService.completeFollowUp(followUpId);
    if (success) {
      toast.success('Follow-up task marked as completed.');
      await fetchLeadData();
      onLeadUpdated();
    } else {
      toast.error(error || 'Could not complete follow-up task.');
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

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.72)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 130,
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        className="card fade-in-slide"
        style={{
          width: '100%',
          maxWidth: '860px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.35)',
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="lead-dossier-title"
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 'var(--radius-full)',
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.2rem',
              }}
            >
              {lead?.full_name ? lead.full_name.charAt(0).toUpperCase() : 'S'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h2 id="lead-dossier-title" style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {lead?.full_name || 'Student Enquiry Dossier'}
                </h2>
                {lead && (
                  <select
                    value={lead.status}
                    onChange={(e) => handleStatusChange(e.target.value as LeadStatus)}
                    className={getStatusBadgeClass(lead.status)}
                    style={{ cursor: 'pointer', border: '1px solid transparent', outline: 'none', fontSize: '0.75rem' }}
                    title="Change status"
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Converted">Converted</option>
                    <option value="Lost">Lost</option>
                  </select>
                )}
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Enquiry recorded &bull; Source: <strong>{lead?.source || 'Direct'}</strong>
              </p>
            </div>
          </div>

          {/* Quick Top Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {lead && (
              <>
                <button
                  onClick={() => onScheduleFollowUp(lead)}
                  className="btn btn-primary"
                  style={{ fontSize: '0.8rem', padding: '0.45rem 0.8rem', gap: '5px' }}
                >
                  <CalendarPlus size={14} />
                  <span>Schedule Task</span>
                </button>
                <button
                  onClick={() => onEditLead(lead)}
                  className="btn btn-outline"
                  style={{ fontSize: '0.8rem', padding: '0.45rem 0.8rem', gap: '5px' }}
                >
                  <Edit3 size={14} />
                  <span>Edit</span>
                </button>
              </>
            )}
            <button onClick={onClose} className="btn-icon" aria-label="Close dialog">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div style={{ margin: '1rem 1.5rem 0 1.5rem', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', background: '#fef2f2', border: '1px solid #fee2e2', color: '#b91c1c', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Modal Body: Two-Column Responsive Layout */}
        <div style={{ flex: '1', overflowY: 'auto', padding: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {/* Left Column: Student Profile Details & Follow-ups */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Student Info Card */}
            <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Contact &amp; Admission Info
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                  <Phone size={15} color="#2563eb" />
                  <span style={{ fontWeight: 600 }}>{lead?.phone || 'No phone'}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                  <Mail size={15} color="#64748b" />
                  <span>{lead?.email || 'No email provided'}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                  <GraduationCap size={15} color="#4f46e5" />
                  <span>Course: <strong>{lead?.course_interest}</strong></span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                  <User size={15} color="#059669" />
                  <span>Assignee: <strong>{lead?.assigned_profile?.full_name || 'Unassigned (Pool)'}</strong></span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  <Calendar size={13} />
                  <span>Created: {lead ? new Date(lead.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : ''}</span>
                </div>
              </div>

              {lead?.lost_reason && (
                <div style={{ marginTop: '0.85rem', padding: '0.6rem 0.8rem', background: '#fef2f2', borderRadius: 'var(--radius-sm)', border: '1px solid #fee2e2', color: '#b91c1c', fontSize: '0.8rem' }}>
                  <strong>Lost Reason:</strong> {lead.lost_reason}
                </div>
              )}
            </div>

            {/* Scheduled Follow-ups for this lead */}
            <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Clock size={15} color="#2563eb" />
                  <span>Scheduled Follow-ups ({followUps.filter(f => f.status === 'pending').length})</span>
                </h4>
                {lead && (
                  <button 
                    onClick={() => onScheduleFollowUp(lead)} 
                    style={{ fontSize: '0.75rem', color: '#2563eb', background: 'none', border: 'none', fontWeight: 600, cursor: 'pointer' }}
                  >
                    + Add Reminder
                  </button>
                )}
              </div>

              {followUps.length === 0 ? (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  No reminders scheduled for this student.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {followUps.slice(0, 4).map((f) => {
                    const isOverdue = f.status === 'pending' && new Date(f.due_at) < new Date();
                    return (
                      <div
                        key={f.id}
                        style={{
                          padding: '0.65rem 0.8rem',
                          borderRadius: 'var(--radius-sm)',
                          background: isOverdue ? '#fef2f2' : f.status === 'completed' ? '#f0fdf4' : '#f8fafc',
                          border: '1px solid var(--border-subtle)',
                          fontSize: '0.8rem',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{f.note}</span>
                          {f.status === 'pending' ? (
                            <button
                              onClick={() => handleMarkFollowUpDone(f.id)}
                              className="btn btn-outline"
                              style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem', gap: '3px' }}
                              title="Mark Done"
                            >
                              <CheckCircle2 size={12} color="#16a34a" />
                              <span>Done</span>
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600 }}>Completed</span>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '0.3rem' }}>
                          {isOverdue ? (
                            <OverdueBadge dueAt={f.due_at} showRelativeTime={false} />
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              Due: {new Date(f.due_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Quick Note Logger + Activity Timeline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Quick Note Composer */}
            <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                Log Interaction Note
              </h4>
              <form onSubmit={handleAddNote} style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <textarea
                  rows={2}
                  required
                  placeholder="Record counsellor discussion, student doubts, course preference..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.8rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.825rem',
                    resize: 'vertical',
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="submit"
                    disabled={isSubmittingNote || !newNote.trim()}
                    className="btn btn-primary"
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem', gap: '4px' }}
                  >
                    <Send size={13} />
                    <span>{isSubmittingNote ? 'Recording...' : 'Post Note'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Activity History Stepper */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  Audit Trail &amp; History ({activities.length})
                </h4>
                <button
                  onClick={fetchLeadData}
                  className="btn-icon"
                  style={{ width: 28, height: 28 }}
                  title="Refresh Timeline"
                >
                  <RefreshCw size={13} className={isLoading ? 'spin' : ''} />
                </button>
              </div>

              <ActivityTimeline activities={activities} isLoading={isLoading} />
            </div>
          </div>
        </div>
      </div>

      {/* Lost Reason Modal if status moved to Lost inside Dossier */}
      <LostReasonModal
        isOpen={isLostModalOpen}
        onClose={() => setIsLostModalOpen(false)}
        leadName={lead?.full_name || ''}
        onConfirm={handleConfirmLostReason}
      />
    </div>
  );
};
