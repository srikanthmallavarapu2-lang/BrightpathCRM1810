export type LeadPriority = 'Hot' | 'Warm' | 'Cold';

/**
 * Extracts priority tag from lead notes if present, or derives an intelligent default.
 */
export function extractPriority(notes?: string | null, status?: string): LeadPriority {
  if (notes) {
    if (notes.includes('[Priority: Hot]') || notes.toLowerCase().includes('priority: hot')) return 'Hot';
    if (notes.includes('[Priority: Warm]') || notes.toLowerCase().includes('priority: warm')) return 'Warm';
    if (notes.includes('[Priority: Cold]') || notes.toLowerCase().includes('priority: cold')) return 'Cold';
  }

  // Intelligent fallback based on status lifecycle
  if (status === 'Qualified' || status === 'Converted') return 'Hot';
  if (status === 'Contacted' || status === 'New') return 'Warm';
  if (status === 'Lost') return 'Cold';

  return 'Warm';
}

/**
 * Updates notes string with a structured priority tag.
 */
export function formatNotesWithPriority(existingNotes: string | null | undefined, priority: LeadPriority): string {
  const cleanNotes = (existingNotes || '')
    .replace(/\[Priority:\s*(Hot|Warm|Cold)\]/gi, '')
    .trim();

  return `[Priority: ${priority}]\n${cleanNotes}`.trim();
}
