/**
 * Standard test script to verify email functionality.
 * 
 * Usage:
 * Set your environment variables and run this script to test SMTP.
 * 
 * Example:
 * SMTP_HOST=mail.devou.in SMTP_PORT=465 SMTP_USER=noreply@devou.in SMTP_PASSWORD=password node test-email.js
 */

const nodemailer = require('nodemailer');
const templates = require('./src/lib/email-templates.js');

async function runTest() {
  console.log("Configuring transporter...");
  console.log("Host:", process.env.SMTP_HOST);
  console.log("Port:", process.env.SMTP_PORT);
  console.log("User:", process.env.SMTP_USER);
  
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: true, 
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  try {
    console.log("Sending Business Update Test...");
    let info = await transporter.sendMail({
      from: `"Jetfluenz Services" <${process.env.SMTP_USER}>`,
      to: 'alanjohnchacko.live@gmail.com',
      subject: "Test Business Update",
      html: templates.getBusinessStatusUpdateEmail({
        businessName: "Test Business",
        campaignName: "Summer Promo 2026",
        newStatus: "Approved",
        message: "Your campaign is now live on the platform!"
      })
    });
    console.log("Business Update Message ID: %s", info.messageId);

    console.log("Sending Influencer Update Test...");
    info = await transporter.sendMail({
      from: `"Jetfluenz Services" <${process.env.SMTP_USER}>`,
      to: 'alanjohnchacko.live@gmail.com',
      subject: "Test Influencer Application Update",
      html: templates.getInfluencerStatusUpdateEmail({
        influencerName: "Alan Influencer",
        campaignName: "Winter Campaign",
        applicationStatus: "Selected",
        message: "Please review the contract details in your dashboard."
      })
    });
    console.log("Influencer Update Message ID: %s", info.messageId);

    console.log("Sending Admin Alert Test...");
    info = await transporter.sendMail({
      from: `"Jetfluenz System Alert" <${process.env.SMTP_USER}>`,
      to: 'alanjohnchacko.live@gmail.com',
      subject: "TEST ADMIN ALERT",
      html: templates.getAdminAlertEmail({
        alertType: "New Error Log",
        details: "Database query failed to retrieve campaign data at /api/campaigns."
      })
    });
    console.log("Admin Alert Message ID: %s", info.messageId);

    console.log("All test emails sent successfully!");
  } catch (error) {
    console.error("Failed to send email.");
    console.error("Error details:", error);
  }
}

runTest();
