import { Resend } from 'resend';
import { DetailedItinerary } from './geminiService';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailData {
  userEmail: string;
  userName?: string;
  itinerary: DetailedItinerary;
  calendarLink: string;
}

export async function sendItineraryEmail(data: EmailData) {
  try {
    const { userEmail, userName, itinerary, calendarLink } = data;
    
    const htmlContent = generateEmailHTML(itinerary, calendarLink, userName);
    
    const emailResult = await resend.emails.send({
      from: 'DatePlanner <noreply@yourapp.com>',
      to: [userEmail],
      subject: `Your DatePlanner Itinerary: ${itinerary.title}`,
      html: htmlContent,
    });

    return {
      success: true,
      emailId: emailResult.data?.id,
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

function generateEmailHTML(itinerary: DetailedItinerary, calendarLink: string, userName?: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your DatePlanner Itinerary</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          margin-bottom: 20px;
        }
        .timeline-item {
          background: #f8f9fa;
          border-left: 4px solid #667eea;
          padding: 15px;
          margin: 10px 0;
          border-radius: 4px;
        }
        .timeline-time {
          font-weight: bold;
          color: #667eea;
          font-size: 18px;
        }
        .timeline-activity {
          font-size: 16px;
          margin: 5px 0;
        }
        .timeline-notes {
          color: #666;
          font-size: 14px;
          margin: 5px 0;
        }
        .links {
          margin: 10px 0;
        }
        .link-button {
          display: inline-block;
          background: #667eea;
          color: white;
          padding: 8px 16px;
          text-decoration: none;
          border-radius: 4px;
          margin: 2px;
          font-size: 12px;
        }
        .calendar-section {
          background: #e8f5e8;
          border: 2px solid #4caf50;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          margin: 20px 0;
        }
        .calendar-button {
          background: #4caf50;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: bold;
          display: inline-block;
          margin: 10px;
        }
        .tips-section {
          background: #fff3cd;
          border: 1px solid #ffc107;
          border-radius: 4px;
          padding: 15px;
          margin: 20px 0;
        }
        .cost-badge {
          background: #28a745;
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🌟 ${itinerary.title}</h1>
        <p>${userName ? `Hi ${userName}!` : 'Hi there!'} Your perfect date is planned!</p>
        <p><strong>Date:</strong> ${itinerary.date}</p>
        <p><strong>Estimated Cost:</strong> <span class="cost-badge">$${itinerary.totalEstimatedCost}</span></p>
      </div>

      <div class="calendar-section">
        <h2>📅 Add to Your Calendar</h2>
        <p>Don't forget your date! Click below to add this itinerary to your Google Calendar:</p>
        <a href="${calendarLink}" class="calendar-button">Add to Google Calendar</a>
      </div>

      <h2>⏰ Your Itinerary</h2>
      ${itinerary.timeline.map(item => `
        <div class="timeline-item">
          <div class="timeline-time">${item.time}</div>
          <div class="timeline-activity"><strong>${item.activity}</strong></div>
          <div style="color: #666; font-size: 14px;">📍 ${item.location} • ⏱️ ${item.duration}</div>
          <div class="timeline-notes">${item.notes}</div>
          <div class="links">
            ${item.links.reservation ? `<a href="${item.links.reservation}" class="link-button">Make Reservation</a>` : ''}
            ${item.links.booking ? `<a href="${item.links.booking}" class="link-button">Book Activity</a>` : ''}
            ${item.links.directions ? `<a href="${item.links.directions}" class="link-button">Get Directions</a>` : ''}
          </div>
        </div>
      `).join('')}

      ${itinerary.tips.length > 0 ? `
        <div class="tips-section">
          <h3>💡 Helpful Tips</h3>
          <ul>
            ${itinerary.tips.map(tip => `<li>${tip}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      ${itinerary.emergencyContacts.length > 0 ? `
        <div style="background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 4px; padding: 15px; margin: 20px 0;">
          <h3>📞 Emergency Contacts</h3>
          <ul>
            ${itinerary.emergencyContacts.map(contact => `<li>${contact}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      <div style="text-align: center; margin: 40px 0; padding: 20px; background: #f8f9fa; border-radius: 8px;">
        <h3>Have an amazing date! 💕</h3>
        <p>From the DatePlanner team</p>
        <p style="font-size: 12px; color:#666;">
          Need to make changes? Visit our app or contact support.
        </p>
      </div>
    </body>
    </html>
  `;
}