import { activityService } from '../services/activityService';

/**
 * Normalizes phone numbers for WhatsApp international format.
 * Defaults 10-digit numbers to +91 (India) or retains provided country codes.
 */
export function formatWhatsAppNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `91${digits}`;
  }
  return digits;
}

export interface OutreachOptions {
  leadId: string;
  studentName: string;
  phone: string;
  courseInterest: string;
}

/**
 * Launches WhatsApp with pre-filled admissions consultation message
 * and automatically logs an audit trail event.
 */
export async function launchWhatsAppOutreach({
  leadId,
  studentName,
  phone,
  courseInterest,
}: OutreachOptions): Promise<void> {
  const formattedNumber = formatWhatsAppNumber(phone);
  const message = `Hello ${studentName}, thank you for your enquiry regarding the ${courseInterest} course at BrightPath Academy! When would be a convenient time for a brief 5-minute consultation to discuss your career goals, syllabus, and upcoming batch timings?`;

  const waUrl = `https://wa.me/${formattedNumber}?text=${encodeURIComponent(message)}`;
  window.open(waUrl, '_blank', 'noopener,noreferrer');

  // Automatically log to immutable activity history
  try {
    await activityService.logActivity({
      lead_id: leadId,
      activity_type: 'note_added',
      description: `Initiated direct WhatsApp consultation with ${studentName} (${phone}) for ${courseInterest}.`,
      metadata: {
        channel: 'WhatsApp',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.warn('Could not auto-log WhatsApp outreach activity:', err);
  }
}

/**
 * Initiates direct phone call via tel: link and logs outreach.
 */
export async function launchPhoneCall({
  leadId,
  studentName,
  phone,
  courseInterest,
}: OutreachOptions): Promise<void> {
  window.location.href = `tel:${phone}`;

  try {
    await activityService.logActivity({
      lead_id: leadId,
      activity_type: 'note_added',
      description: `Initiated direct telephone call with ${studentName} (${phone}) for ${courseInterest}.`,
      metadata: {
        channel: 'Phone',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.warn('Could not auto-log phone call activity:', err);
  }
}

