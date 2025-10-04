import { NextRequest, NextResponse } from 'next/server';
import { sendItineraryEmail } from '@/lib/services/emailService';
import { createCalendarEvent } from '@/lib/services/calendarService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { itinerary, userEmail, userName } = body;

    // Validate required fields
    if (!itinerary || !userEmail) {
      return NextResponse.json(
        { error: 'Itinerary and user email are required' },
        { status: 400 }
      );
    }

    // Create Google Calendar event
    const calendarLink = await createCalendarEvent(itinerary);

    // Send email with itinerary and calendar link
    const emailResult = await sendItineraryEmail({
      userEmail,
      userName,
      itinerary,
      calendarLink
    });

    return NextResponse.json({
      success: true,
      emailSent: emailResult.success,
      calendarLink
    });

  } catch (error) {
    console.error('Error sending itinerary:', error);
    return NextResponse.json(
      { error: 'Failed to send itinerary' },
      { status: 500 }
    );
  }
}