import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { 
  getBusinessStatusUpdateEmail, 
  getInfluencerStatusUpdateEmail, 
  getAdminAlertEmail 
} from '@/lib/email-templates';

// Secret token for authenticating internal requests
const NOTIFICATION_SECRET = process.env.NOTIFICATION_SECRET || 'devou-internal-secret-token';

export async function POST(request) {
  try {
    // 1. Basic Auth check (ensure this endpoint is not publicly abusable)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${NOTIFICATION_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { to, type, payload } = body;

    if (!to || !type || !payload) {
      return NextResponse.json({ error: 'Missing required fields: to, type, payload' }, { status: 400 });
    }

    let htmlContent = '';
    let subject = 'Jetfluenz Notification';

    // 2. Determine Email Template
    switch (type) {
      case 'business_update':
        htmlContent = getBusinessStatusUpdateEmail(payload);
        subject = `Jetfluenz: Campaign Update - ${payload.campaignName}`;
        break;
      case 'influencer_update':
        htmlContent = getInfluencerStatusUpdateEmail(payload);
        subject = `Jetfluenz: Application Update - ${payload.campaignName}`;
        break;
      case 'admin_alert':
        htmlContent = getAdminAlertEmail(payload);
        subject = `[ADMIN ALERT] ${payload.alertType}`;
        break;
      default:
        return NextResponse.json({ error: 'Invalid notification type' }, { status: 400 });
    }

    // 3. Send the email
    const result = await sendEmail({
      to,
      subject,
      html: htmlContent,
    });

    if (result.success) {
      return NextResponse.json({ success: true, messageId: result.messageId });
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

  } catch (error) {
    console.error('Email API Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
