import React from 'react';
import { 
  Phone, 
  MessageCircle, 
  CalendarPlus, 
  Edit2, 
  User, 
  Calendar,
  ExternalLink,
  Flame,
  Sun,
  Snowflake
} from 'lucide-react';
import { Lead, LeadStatus } from '../../types/database';
import { extractPriority, LeadPriority } from '../../utils/priority';
import { launchWhatsAppOutreach, launchPhoneCall } from '../../utils/outreach';
import { useToast } from '../../context/ToastContext';
import { UserAvatar } from '../../components/common/UserAvatar';
import { CourseBadge } from '../../components/common/CourseBadge';

export interface LeadKanbanBoardProps {
  leads: Lead[];
  onOpenLeadDetail: (lead: Lead) => void;
  onEditLead?: (lead: Lead) => void;
  onScheduleFollowUp?: (lead: Lead) => void;
  onStatusChange: (lead: Lead, newStatus: LeadStatus) => void;
}

const STAGES: Array<{ status: LeadStatus; label: string; color: string; bg: string; border: string }> = [
  { status: 'New', label: 'New Enquiries', color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe' },
  { status: 'Contacted', label: 'Contacted', color: '#6d28d9', bg: '#f5f3ff', border: '#ddd6fe' },
  { status: 'Qualified', label: 'Qualified', color: '#b45309', bg: '#fffbeb', border: '#fde68a' },
  { status: 'Converted', label: 'Converted', color: '#047857', bg: '#ecfdf5', border: '#a7f3d0' },
  { status: 'Lost', label: 'Lost', color: '#b91c1c', bg: '#fef2f2', border: '#fecaca' },
];

export const LeadKanbanBoard: React.FC<LeadKanbanBoardProps> = ({
  leads,
  onOpenLeadDetail,
  onEditLead,
  onScheduleFollowUp,
  onStatusChange,
}) => {
  const toast = useToast();

  const getPriorityBadge = (priority: LeadPriority) => {
    switch (priority) {
      case 'Hot':
        return (
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              color: '#dc2626',
              background: '#fef2f2',
              border: '1px solid #fee2e2',
              borderRadius: 'var(--radius-full)',
              padding: '0.15rem 0.5rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
            }}
          >
            <Flame size={12} /> Hot
          </span>
        );
      case 'Warm':
        return (
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              color: '#d97706',
              background: '#fffbeb',
              border: '1px solid #fef3c7',
              borderRadius: 'var(--radius-full)',
              padding: '0.15rem 0.5rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
            }}
          >
            <Sun size={12} /> Warm
          </span>
        );
      case 'Cold':
      default:
        return (
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 600,
              color: '#64748b',
              background: '#f1f5f9',
              border: '1px solid #e2e8f0',
              borderRadius: 'var(--radius-full)',
              padding: '0.15rem 0.5rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
            }}
          >
            <Snowflake size={12} /> Cold
          </span>
        );
    }
  };

  const handleWhatsApp = async (e: React.MouseEvent, lead: Lead) => {
    e.stopPropagation();
    try {
      await launchWhatsAppOutreach({
        leadId: lead.id,
        studentName: lead.full_name,
        phone: lead.phone,
        courseInterest: lead.course_interest,
      });
      toast.success(`WhatsApp consultation launched for ${lead.full_name}.`);
    } catch {
      toast.error('Could not initiate WhatsApp conversation.');
    }
  };

  const handlePhone = async (e: React.MouseEvent, lead: Lead) => {
    e.stopPropagation();
    try {
      await launchPhoneCall({
        leadId: lead.id,
        studentName: lead.full_name,
        phone: lead.phone,
        courseInterest: lead.course_interest,
      });
    } catch {
      toast.error('Could not initiate phone call.');
    }
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '1rem',
        alignItems: 'flex-start',
        overflowX: 'auto',
        paddingBottom: '1rem',
      }}
    >
      {STAGES.map((stage) => {
        const stageLeads = leads.filter((l) => l.status === stage.status);

        return (
          <div
            key={stage.status}
            style={{
              background: '#f8fafc',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              padding: '0.85rem',
              minHeight: '480px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)',
            }}
          >
            {/* Column Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingBottom: '0.65rem',
                borderBottom: `2px solid ${stage.color}`,
                marginBottom: '0.85rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {stage.label}
                </span>
              </div>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: stage.color,
                  background: stage.bg,
                  border: `1px solid ${stage.border}`,
                  padding: '0.15rem 0.5rem',
                  borderRadius: 'var(--radius-full)',
                }}
              >
                {stageLeads.length}
              </span>
            </div>

            {/* Column Body / Cards List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
              {stageLeads.length === 0 ? (
                <div
                  style={{
                    padding: '2.5rem 1rem',
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    fontSize: '0.785rem',
                    border: '1px dashed #cbd5e1',
                    borderRadius: 'var(--radius-md)',
                    background: '#ffffff',
                    margin: 'auto 0',
                  }}
                >
                  No enquiries in this stage
                </div>
              ) : (
                stageLeads.map((lead) => {
                  const priority = extractPriority(lead.notes, lead.status);

                  return (
                    <div
                      key={lead.id}
                      className="card fade-in-slide"
                      style={{
                        padding: '0.85rem 1rem',
                        background: '#ffffff',
                        border: '1px solid var(--border-subtle)',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                        cursor: 'pointer',
                        borderRadius: 'var(--radius-md)',
                      }}
                      onClick={() => onOpenLeadDetail(lead)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.08)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
                      }}
                    >
                      {/* Top strip: Avatar, Name & Priority */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.45rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <UserAvatar name={lead.full_name} size={30} />
                          <div>
                            <div style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-main)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <span>{lead.full_name}</span>
                              <ExternalLink size={11} color="#2563eb" />
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '1px' }}>
                              <Calendar size={10} /> {new Date(lead.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </div>
                          </div>
                        </div>

                        {getPriorityBadge(priority)}
                      </div>

                      {/* Course badge */}
                      <div style={{ marginBottom: '0.55rem' }}>
                        <CourseBadge courseName={lead.course_interest} size="sm" />
                      </div>

                      {/* Lost reason if applicable */}
                      {lead.lost_reason && (
                        <div
                          style={{
                            fontSize: '0.72rem',
                            color: '#b91c1c',
                            background: '#fef2f2',
                            padding: '0.25rem 0.45rem',
                            borderRadius: 'var(--radius-sm)',
                            marginBottom: '0.5rem',
                          }}
                        >
                          Reason: {lead.lost_reason}
                        </div>
                      )}

                      {/* Contact & 1-Click Outreach Buttons */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          borderTop: '1px solid #f1f5f9',
                          paddingTop: '0.5rem',
                          marginTop: '0.35rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <button
                            onClick={(e) => handleWhatsApp(e, lead)}
                            className="btn btn-outline"
                            style={{
                              padding: '0.25rem 0.5rem',
                              fontSize: '0.72rem',
                              gap: '3px',
                              color: '#16a34a',
                              borderColor: '#bbf7d0',
                              background: '#f0fdf4',
                            }}
                            title="Chat on WhatsApp (auto-logs activity)"
                          >
                            <MessageCircle size={12} />
                            <span>WhatsApp</span>
                          </button>

                          <button
                            onClick={(e) => handlePhone(e, lead)}
                            className="btn-icon"
                            style={{ width: 26, height: 26, color: '#2563eb' }}
                            title={`Call ${lead.phone}`}
                          >
                            <Phone size={12} />
                          </button>
                        </div>

                        {/* Stage transition quick selector */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <select
                            value={lead.status}
                            onChange={(e) => {
                              e.stopPropagation();
                              onStatusChange(lead, e.target.value as LeadStatus);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              fontSize: '0.7rem',
                              padding: '0.2rem 0.35rem',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid var(--border-subtle)',
                              background: '#ffffff',
                              cursor: 'pointer',
                              fontWeight: 600,
                            }}
                            title="Move to another stage"
                          >
                            <option value="New">New</option>
                            <option value="Contacted">Contacted</option>
                            <option value="Qualified">Qualified</option>
                            <option value="Converted">Converted</option>
                            <option value="Lost">Lost</option>
                          </select>
                        </div>
                      </div>

                      {/* Card Footer: Assignee attribution */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginTop: '0.45rem',
                          fontSize: '0.7rem',
                          color: 'var(--text-muted)',
                        }}
                      >
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <User size={11} /> {lead.assigned_profile?.full_name || 'Unassigned'}
                        </span>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {onEditLead && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditLead(lead);
                              }}
                              style={{
                                color: 'var(--text-secondary)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '2px',
                                fontWeight: 600,
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: 0,
                                fontSize: '0.7rem',
                              }}
                              title="Edit enquiry"
                            >
                              <Edit2 size={11} />
                              <span>Edit</span>
                            </button>
                          )}

                          {onScheduleFollowUp && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onScheduleFollowUp(lead);
                              }}
                              style={{
                                color: 'var(--primary-600)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '2px',
                                fontWeight: 600,
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: 0,
                                fontSize: '0.7rem',
                              }}
                              title="Schedule reminder"
                            >
                              <CalendarPlus size={11} />
                              <span>Remind</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
