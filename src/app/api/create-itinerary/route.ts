import { NextRequest, NextResponse } from 'next/server';
import { createDetailedItinerary } from '@/lib/services/geminiService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { selectedOption, userPreferences } = body;

    // Validate required fields
    if (!selectedOption) {
      return NextResponse.json(
        { error: 'Selected option is required' },
        { status: 400 }
      );
    }

    // Send to Gemini API to create detailed itinerary
    const detailedItinerary = await createDetailedItinerary(
      selectedOption,
      userPreferences
    );

    return NextResponse.json({
      success: true,
      itinerary: detailedItinerary
    });

  } catch (error) {
    console.error('Error creating itinerary:', error);
    return NextResponse.json(
      { error: 'Failed to create detailed itinerary' },
      { status: 500 }
    );
  }
}