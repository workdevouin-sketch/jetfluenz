const wrapHtml = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      line-height: 1.5;
      color: #222222;
      background-color: #f2f2f2;
      margin: 0;
      padding: 0;
    }
    .wrapper {
      padding: 40px 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e0e0e0;
    }
    .header {
      background-color: #2008b9;
      padding: 24px 32px;
    }
    .header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 24px;
      font-weight: bold;
      letter-spacing: -0.5px;
    }
    .content {
      padding: 32px;
    }
    .footer {
      background-color: #f2f2f2;
      padding: 32px;
      text-align: center;
      font-size: 12px;
      color: #656565;
    }
    .footer a {
      color: #656565;
      text-decoration: underline;
    }
    .greeting {
      font-size: 20px;
      font-weight: 500;
      color: #222222;
      margin-bottom: 24px;
    }
    .status-section {
      margin-top: 24px;
      margin-bottom: 24px;
    }
    .status-label {
      font-size: 14px;
      color: #656565;
      margin-bottom: 4px;
    }
    .status-value {
      font-size: 16px;
      font-weight: 600;
      color: #2008b9;
    }
    hr {
      border: 0;
      border-top: 1px solid #e0e0e0;
      margin: 24px 0;
    }
    .message-box {
      font-size: 14px;
      color: #444444;
      margin: 20px 0;
    }
    .admin-alert {
      background-color: #fff0f0;
      border-left: 4px solid #d93025;
      padding: 16px;
      margin: 20px 0;
    }
    .btn-container {
      margin-top: 32px;
      margin-bottom: 16px;
    }
    .btn {
      display: inline-block;
      background-color: #2008b9;
      color: #ffffff !important;
      text-decoration: none;
      padding: 12px 24px;
      border-radius: 100px; /* Fully rounded like Upwork */
      font-weight: 600;
      font-size: 14px;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>jetfluenz</h1>
      </div>
      <div class="content">
        ${content}
      </div>
    </div>
    <div class="footer">
      <p>
        <a href="https://jetfluenz.com/unsubscribe">Unsubscribe</a> | 
        <a href="https://jetfluenz.com/privacy">Privacy Policy</a> | 
        <a href="https://jetfluenz.com/support">Contact Support</a>
      </p>
      <p>&copy; ${new Date().getFullYear()} Jetfluenz.</p>
    </div>
  </div>
</body>
</html>
`;

// Helper to determine status color
const getStatusColor = (status) => {
  const s = status.toLowerCase();
  if (['approved', 'selected', 'completed', 'active', 'live'].includes(s)) return 'status-green';
  if (['pending', 'in review', 'applied'].includes(s)) return 'status-yellow';
  if (['rejected', 'declined', 'cancelled'].includes(s)) return 'status-red';
  return 'status-blue'; // Default
};


/**
 * Generates an email template for business status updates
 * 
 * @param {Object} payload
 * @param {string} payload.businessName 
 * @param {string} payload.campaignName
 * @param {string} payload.newStatus
 * @param {string} [payload.message]
 */
export const getBusinessStatusUpdateEmail = ({ businessName, campaignName, newStatus, message }) => {
  const content = `
    <div class="greeting">Status update for ${campaignName}</div>
    <p>Hi ${businessName},</p>
    <p>There has been an update regarding your campaign on Jetfluenz.</p>
    
    <div class="status-section">
      <div class="status-label">Campaign</div>
      <div style="font-weight: 600; color: #222;">${campaignName}</div>
      <br/>
      <div class="status-label">New Status</div>
      <div class="status-value">${newStatus}</div>
    </div>
    
    <hr />
    
    ${message ? `
    <div class="message-box">
      ${message}
    </div>
    ` : ''}
    
    <div class="btn-container">
      <a href="https://jetfluenz.com/dashboard/business" class="btn">View in Dashboard</a>
    </div>
    
    <p style="font-size: 14px; color: #656565; margin-top: 32px;">
      If you have questions, please reach out to your Jetfluenz representative.
    </p>
  `;
  return wrapHtml(content);
};

/**
 * Generates an email template for influencer application updates
 * 
 * @param {Object} payload
 * @param {string} payload.influencerName
 * @param {string} payload.campaignName
 * @param {string} payload.applicationStatus
 * @param {string} [payload.message]
 */
export const getInfluencerStatusUpdateEmail = ({ influencerName, campaignName, applicationStatus, message }) => {
  const content = `
    <div class="greeting">Application update</div>
    <p>Hi ${influencerName},</p>
    <p>Your application status for a campaign has been updated:</p>
    
    <div class="status-section">
      <div class="status-label">Campaign</div>
      <div style="font-weight: 600; color: #222;">${campaignName}</div>
      <br/>
      <div class="status-label">Application Status</div>
      <div class="status-value">${applicationStatus}</div>
    </div>
    
    <hr />
    
    ${message ? `
    <div class="message-box">
      ${message}
    </div>
    ` : ''}
    
    <div class="btn-container">
      <a href="https://jetfluenz.com/dashboard/influencer" class="btn">Go to Dashboard</a>
    </div>
    
    <p style="font-size: 14px; color: #656565; margin-top: 32px;">
      If you have any questions, please contact the Jetfluenz support team.
    </p>
  `;
  return wrapHtml(content);
};

/**
 * Generates a system alert template for admins
 * 
 * @param {Object} payload
 * @param {string} payload.alertType
 * @param {string} payload.details
 */
export const getAdminAlertEmail = ({ alertType, details }) => {
  const content = `
    <div class="greeting">System Alert</div>
    <p>Hi Admin,</p>
    <p>A system event requires your attention.</p>
    
    <div class="status-section">
      <div class="status-label">Alert Type</div>
      <div style="font-weight: 600; color: #d93025;">${alertType}</div>
    </div>
    
    <hr />
    
    <div class="admin-alert">
      <strong>Details:</strong><br/>
      ${details}
    </div>
    
    <div class="btn-container">
      <a href="https://jetfluenz.com/admin" class="btn">View Admin Panel</a>
    </div>
  `;
  return wrapHtml(content);
};
