import { Lead, FollowUp } from '../types/database';
import { extractPriority } from './priority';

function downloadCSV(csvContent: string, filename: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeCSV(field: unknown): string {
  if (field === null || field === undefined) return '""';
  const stringValue = String(field).replace(/"/g, '""');
  return `"${stringValue}"`;
}

export function exportLeadsToCSV(leads: Lead[], filenamePrefix = 'brightpath_enquiries') {
  const headers = [
    'Student Full Name',
    'Phone',
    'Email',
    'Course Interest',
    'Status',
    'Priority',
    'Source Channel',
    'Assigned Counsellor',
    'Lost Reason',
    'Created Date'
  ];

  const rows = leads.map((lead) => [
    escapeCSV(lead.full_name),
    escapeCSV(lead.phone),
    escapeCSV(lead.email || 'N/A'),
    escapeCSV(lead.course_interest),
    escapeCSV(lead.status),
    escapeCSV(extractPriority(lead.notes, lead.status)),
    escapeCSV(lead.source),
    escapeCSV(lead.assigned_profile?.full_name || 'Unassigned'),
    escapeCSV(lead.lost_reason || 'N/A'),
    escapeCSV(new Date(lead.created_at).toLocaleString())
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadCSV(csvContent, `${filenamePrefix}_${dateStr}.csv`);
}

export function exportFollowUpsToCSV(followUps: FollowUp[], filenamePrefix = 'brightpath_followups') {
  const headers = [
    'Student Name',
    'Phone',
    'Course',
    'Follow-up Note',
    'Status',
    'Due At',
    'Completed At',
    'Assigned Counsellor'
  ];

  const rows = followUps.map((f) => [
    escapeCSV(f.lead?.full_name || 'N/A'),
    escapeCSV(f.lead?.phone || 'N/A'),
    escapeCSV(f.lead?.course_interest || 'N/A'),
    escapeCSV(f.note),
    escapeCSV(f.status),
    escapeCSV(new Date(f.due_at).toLocaleString()),
    escapeCSV(f.completed_at ? new Date(f.completed_at).toLocaleString() : 'Pending'),
    escapeCSV(f.assigned_profile?.full_name || 'Unassigned')
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadCSV(csvContent, `${filenamePrefix}_${dateStr}.csv`);
}

