"use server";

import { sendEmail } from '@/lib/email';
import { 
  getBusinessStatusUpdateEmail, 
  getInfluencerStatusUpdateEmail, 
  getAdminAlertEmail 
} from '@/lib/email-templates';

// Admin email configuration
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'info@devou.in';

export async function notifyAdmin(alertType, details) {
  try {
    await sendEmail({
      to: ADMIN_EMAIL,
      subject: `[ADMIN ALERT] ${alertType}`,
      html: getAdminAlertEmail({ alertType, details })
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to notify admin:', error);
    return { success: false };
  }
}

export async function notifyBusiness(toEmail, businessName, campaignName, newStatus, message) {
  if (!toEmail) return { success: false, error: 'No email provided' };
  try {
    await sendEmail({
      to: toEmail,
      subject: `Jetfluenz: Campaign Update - ${campaignName}`,
      html: getBusinessStatusUpdateEmail({ businessName, campaignName, newStatus, message })
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to notify business:', error);
    return { success: false };
  }
}

export async function notifyInfluencer(toEmail, influencerName, campaignName, applicationStatus, message) {
  if (!toEmail) return { success: false, error: 'No email provided' };
  try {
    await sendEmail({
      to: toEmail,
      subject: `Jetfluenz: Application Update - ${campaignName}`,
      html: getInfluencerStatusUpdateEmail({ influencerName, campaignName, applicationStatus, message })
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to notify influencer:', error);
    return { success: false };
  }
}
