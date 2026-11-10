import React, { useState, useEffect, useCallback } from 'react';
import { Plus, RefreshCw, AlertCircle, Download } from 'lucide-react';
import { FollowUp } from '../../types/database';
import { followUpService } from '../../services/followUpService';
import { FollowUpList } from './FollowUpList';
import { ScheduleFollowUpModal } from './ScheduleFollowUpModal';
import { RescheduleModal } from './RescheduleModal';
import { useToast } from '../../context/ToastContext';
import { exportFollowUpsToCSV } from '../../utils/csvExport';

interface FollowUpsViewProps {
  onScheduleCountChange?: (count: number) => void;
  onViewLead?: (leadId: string, leadName: string) => void;
}

export const FollowUpsView: React.FC<FollowUpsViewProps> = ({ 
  onScheduleCountChange,
  onViewLead
}) => {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [rescheduleTarget, setRescheduleTarget] = useState<FollowUp | null>(null);

  const toast = useToast();

  const fetchFollowUps = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    const { followUps: data, error } = await followUpService.getFollowUps();

    if (error) {
      setErrorMessage(error);
    } else {
      setFollowUps(data);
      const overdue = data.filter(
        (f) => f.status === 'pending' && new Date(f.due_at) < new Date()
      ).length;
      if (onScheduleCountChange) {
        onScheduleCountChange(overdue);
      }
    }
    setIsLoading(false);
  }, [onScheduleCountChange]);

  useEffect(() => {
    fetchFollowUps();
  }, [fetchFollowUps]);

  const handleMarkDone = async (id: string) => {
    const { success, error } = await followUpService.completeFollowUp(id);
    if (success) {
      toast.success('Follow-up task marked as completed.');
      await fetchFollowUps();
    } else {
      toast.error(error || 'Failed to complete follow-up.');
    }
  };

  const handleDelete = async (id: string) => {
    const { success, error } = await followUpService.deleteFollowUp(id);
    if (success) {
      toast.info('Follow-up task deleted.');
      await fetchFollowUps();
    } else {
      toast.error(error || 'Could not delete follow-up.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Scheduled Follow-ups
          </h2>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Track pending callbacks, admissions consultations, and time-sensitive reminders with real-time sync.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button 
            onClick={fetchFollowUps} 
            className="btn btn-outline" 
            title="Refresh tasks from cloud database"
            style={{ padding: '0.55rem 0.75rem' }}
          >
            <RefreshCw size={15} className={isLoading ? 'spin' : ''} />
            <span>Sync</span>
          </button>
          <button
            onClick={() => {
              if (followUps.length === 0) {
                toast.info('No follow-up tasks to export.');
                return;
              }
              exportFollowUpsToCSV(followUps);
              toast.success(`Exported ${followUps.length} follow-up tasks to CSV.`);
            }}
            className="btn btn-outline"
            title="Export all follow-up tasks to CSV/Excel format"
            style={{ padding: '0.55rem 0.75rem', gap: '6px' }}
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>
          <button 
            onClick={() => setIsScheduleModalOpen(true)} 
            className="btn-shimmer"
            style={{ padding: '0.55rem 1rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={16} />
            <span>Schedule Follow-up</span>
          </button>
        </div>
      </div>

      {/* Error state */}
      {errorMessage && (
        <div style={{ padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', background: '#fef2f2', border: '1px solid #fee2e2', color: '#b91c1c', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      {isLoading ? (
        <div className="card" style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem' }}>
            <RefreshCw size={20} className="spin" color="#2563eb" />
            <span>Querying live Supabase follow-up tasks...</span>
          </div>
        </div>
      ) : (
        <FollowUpList
          followUps={followUps}
          onMarkDone={handleMarkDone}
          onReschedule={(f) => setRescheduleTarget(f)}
          onDelete={handleDelete}
          onViewLead={onViewLead}
          onOpenScheduleModal={() => setIsScheduleModalOpen(true)}
        />
      )}

      {/* Schedule Modal */}
      <ScheduleFollowUpModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onScheduled={fetchFollowUps}
      />

      {/* Reschedule Modal */}
      <RescheduleModal
        isOpen={Boolean(rescheduleTarget)}
        onClose={() => setRescheduleTarget(null)}
        followUp={rescheduleTarget}
        onRescheduled={fetchFollowUps}
      />
    </div>
  );
};
