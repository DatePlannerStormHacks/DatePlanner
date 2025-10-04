import { NextRequest, NextResponse } from 'next/server';
import { generateDateOptions } from '@/lib/services/optionGenerator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, budget, activities, foodType, preferences } = body;

    // Validate required fields
    if (!date || !budget) {
      return NextResponse.json(
        { error: 'Date and budget are required' },
        { status: 400 }
      );
    }

    // Generate multiple options based on user parameters
    const options = await generateDateOptions({
      date,
      budget,
      activities,
      foodType,
      preferences
    });

    return NextResponse.json({
      success: true,
      options,
      count: options.length
    });

  } catch (error) {
    console.error('Error generating options:', error);
    return NextResponse.json(
      { error: 'Failed to generate date options' },
      { status: 500 }
    );
  }
}