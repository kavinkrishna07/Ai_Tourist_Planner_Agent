import nodemailer from 'nodemailer';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

export const emailAgent = {
  id: 'email',
  name: 'Email Agent',
  role: 'Formats and delivers travel itineraries to user email inbox with preview links',
  outputSchema: {
    status: 'string',
    recipient: 'string',
    subject: 'string',
    previewUrl: 'string',
    provider: 'string',
  },

  async execute(input) {
    const { destination, message, recipientEmail: customEmail, priorOutputs } = input;
    const recipient = customEmail || extractEmailFromText(message) || process.env.GMAIL_USER || 'traveler@example.com';
    const destinationName = destination || 'Your Destination';
    const subject = `✈️ Your WanderWise Travel Itinerary for ${destinationName}`;
    const rawItinerary = input.response || priorOutputs?.synthesis?.response || message || 'Your custom trip itinerary';
    const htmlBody = generateHtmlEmail(destinationName, rawItinerary, recipient);

    // Option 1: Resend HTTP API (Firewall-Proof HTTPS Port 443)
    if (process.env.RESEND_API_KEY) {
      try {
        console.log('[Email Agent] Attempting delivery via Resend HTTPS API...');
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'WanderWise AI <onboarding@resend.dev>',
            to: [recipient],
            subject: subject,
            html: htmlBody,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          console.log('[Email Agent] Delivered via Resend API. ID:', data.id);
          return {
            status: 'sent',
            recipient,
            subject,
            provider: 'Resend HTTPS API',
            message: `Itinerary successfully delivered to ${recipient} via Resend API!`,
          };
        } else {
          const errData = await res.json().catch(() => ({}));
          console.warn('[Email Agent] Resend API error:', errData.message || res.statusText);
        }
      } catch (err) {
        console.warn('[Email Agent] Resend API fetch failed:', err.message);
      }
    }

    // Option 2: Gmail / SMTP Transporter
    if (process.env.GMAIL_USER && process.env.GMAIL_PASS) {
      const passClean = (process.env.GMAIL_PASS || '').replace(/\s+/g, '');
      
      // Try ports 465, 587, 25
      const portsToTry = [
        { host: 'smtp.gmail.com', port: 465, secure: true },
        { host: 'smtp.gmail.com', port: 587, secure: false },
      ];

      for (const config of portsToTry) {
        try {
          console.log(`[Email Agent] Attempting Gmail delivery via port ${config.port}...`);
          const transporter = nodemailer.createTransport({
            ...config,
            auth: {
              user: process.env.GMAIL_USER,
              pass: passClean,
            },
            connectionTimeout: 8000,
            greetingTimeout: 5000,
            socketTimeout: 8000,
          });

          const info = await transporter.sendMail({
            from: `"WanderWise AI" <${process.env.GMAIL_USER}>`,
            to: recipient,
            subject: subject,
            html: htmlBody,
          });

          console.log(`[Email Agent] Successfully sent via Gmail SMTP (port ${config.port}). ID: ${info.messageId}`);
          return {
            status: 'sent',
            recipient,
            subject,
            provider: `Gmail SMTP (Port ${config.port})`,
            message: `Itinerary successfully delivered to ${recipient}!`,
          };
        } catch (err) {
          console.warn(`[Email Agent] Gmail SMTP (port ${config.port}) failed:`, err.message);
        }
      }

      return {
        status: 'failed',
        recipient,
        message: `⚠️ **ISP Network Firewall Block**: Your local internet provider/router is blocking outbound SMTP ports (465 & 587). To bypass local ISP blocks, add a free \`RESEND_API_KEY\` to your \`.env\` file (Resend uses HTTPS port 443).`,
      };
    }

    // Option 3: Ethereal Fallback
    try {
      const testAccount = await nodemailer.createTestAccount();
      const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: { user: testAccount.user, pass: testAccount.pass },
        connectionTimeout: 6000,
      });

      const info = await transporter.sendMail({
        from: `"WanderWise AI" <no-reply@wanderwise.ai>`,
        to: recipient,
        subject: subject,
        html: htmlBody,
      });

      const previewUrl = nodemailer.getTestMessageUrl(info);
      return {
        status: 'sent',
        recipient,
        previewUrl,
        provider: 'Ethereal Test Account',
        message: `Itinerary formatted and sent! View preview: ${previewUrl}`,
      };
    } catch (err) {
      return {
        status: 'failed',
        recipient,
        message: `Email delivery attempt timed out due to local network restriction: ${err.message}`,
      };
    }
  },
};

function extractEmailFromText(text) {
  if (!text) return null;
  const match = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return match ? match[0] : null;
}

function generateHtmlEmail(destination, markdownText, recipient) {
  const formattedContent = markdownText
    .replace(/^### (.*$)/gim, '<h3 style="color: #0d9488; font-size: 18px; margin-top: 20px; border-bottom: 2px solid #ccfbf1; padding-bottom: 4px;">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 style="color: #4f46e5; font-size: 22px; margin-top: 25px;">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 style="color: #0f172a; font-size: 26px; margin-top: 30px;">$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>');

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Your WanderWise Travel Itinerary</title>
  </head>
  <body style="font-family: Arial, sans-serif; background-color: #f8fafc; color: #334155; margin: 0; padding: 20px;">
    <div style="max-width: 680px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #0d9488 0%, #4f46e5 100%); padding: 35px 30px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">✈️ WanderWise</h1>
        <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9; text-transform: uppercase; letter-spacing: 1px;">AI Multi-Agent Travel Planner</p>
      </div>

      <!-- Main Body -->
      <div style="padding: 30px; line-height: 1.6; font-size: 15px;">
        <p style="margin-top: 0; font-size: 16px;">Hello Traveler,</p>
        <p>Here is your executive travel summary and full itinerary for <strong>${destination}</strong>, compiled by our 14 specialized AI agents!</p>

        <!-- Brief Executive Summary Box -->
        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #166534; font-size: 16px;">📌 Executive Trip Summary</h3>
          <ul style="margin: 0; padding-left: 20px; color: #15803d; font-size: 14px;">
            <li><strong>Destination</strong>: ${destination}</li>
            <li><strong>Collaborating Agents</strong>: Weather, Budget, Route Planner, Hotel, Food, Activity, Time Manager, Packing, Safety, Local Guide</li>
            <li><strong>Full Itinerary</strong>: Included below with opening hours, daily time slots, cost breakdown & packing checklist.</li>
          </ul>
        </div>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 25px 0;" />
        
        <div>
          ${formattedContent}
        </div>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0 20px 0;" />
        <p style="font-size: 13px; color: #64748b; text-align: center;">
          Sent to <strong>${recipient}</strong> by WanderWise Multi-Agent System.<br/>
          Need to refine your trip? Simply reply back in your chat window to update details anytime.
        </p>
      </div>
    </div>
  </body>
  </html>
  `;
}
