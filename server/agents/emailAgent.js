import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { generateText } from '../services/geminiService.js';

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
    const recipient = customEmail || extractEmailFromText(message) || 'traveler@example.com';
    const destinationName = destination || 'Your Destination';
    const subject = `✈️ Your WanderWise Travel Itinerary for ${destinationName}`;

    // Create Transporter
    let transporter;
    let providerName = 'Ethereal Test Account (Zero-Config)';
    let previewUrl = null;

    if (process.env.GMAIL_USER && process.env.GMAIL_PASS) {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASS,
        },
      });
      providerName = 'Gmail SMTP Live';
    } else if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      providerName = 'Custom SMTP Live';
    } else {
      // Ethereal Fallback
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    // Build Email Body
    const rawItinerary = input.response || priorOutputs?.synthesis?.response || message || 'Your custom trip itinerary';
    const htmlBody = generateHtmlEmail(destinationName, rawItinerary, recipient);

    try {
      const info = await transporter.sendMail({
        from: `"WanderWise AI Travel Planner" <${process.env.GMAIL_USER || 'no-reply@wanderwise.ai'}>`,
        to: recipient,
        subject: subject,
        html: htmlBody,
      });

      if (providerName.includes('Ethereal')) {
        previewUrl = nodemailer.getTestMessageUrl(info);
      }

      console.log(`[Email Agent] Email sent via ${providerName}. Message ID: ${info.messageId}`);
      if (previewUrl) {
        console.log(`[Email Agent] Preview URL: ${previewUrl}`);
      }

      return {
        status: 'sent',
        recipient,
        subject,
        previewUrl,
        provider: providerName,
        message: `Itinerary successfully formatted and sent via ${providerName}.${previewUrl ? ` View email preview: ${previewUrl}` : ''}`,
      };
    } catch (err) {
      console.error('[Email Agent] Delivery error:', err.message);
      return {
        status: 'failed',
        recipient,
        error: err.message,
        message: `Could not send email: ${err.message}`,
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
    .replace(/^### (.*$)/gim, '<h3 style="color: #0d9488; font-size: 18px; margin-top: 20px;">$1</h3>')
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
    <div style="max-w: 650px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #0d9488 0%, #4f46e5 100%); padding: 35px 30px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">✈️ WanderWise</h1>
        <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9; text-transform: uppercase; letter-spacing: 1px;">AI Travel Planner</p>
      </div>

      <!-- Main Body -->
      <div style="padding: 30px; line-height: 1.6; font-size: 15px;">
        <p style="margin-top: 0;">Hello Traveler,</p>
        <p>Here is your personalized AI-generated travel plan for <strong>${destination}</strong>!</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        
        <div>
          ${formattedContent}
        </div>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0 20px 0;" />
        <p style="font-size: 13px; color: #64748b; text-align: center;">
          Sent to <strong>${recipient}</strong> by WanderWise Multi-Agent System.<br/>
          Need to make changes? Simply reply back to chat with your AI Travel Planner.
        </p>
      </div>
    </div>
  </body>
  </html>
  `;
}
