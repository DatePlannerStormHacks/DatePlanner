import { GoogleGenerativeAI } from '@google/generative-ai';
import { DateOption } from './optionGenerator';

export interface DetailedItinerary {
  title: string;
  date: string;
  totalEstimatedCost: number;
  timeline: ItineraryItem[];
  tips: string[];
  emergencyContacts: string[];
}

export interface ItineraryItem {
  time: string;
  activity: string;
  location: string;
  duration: string;
  notes: string;
  links: {
    reservation?: string;
    booking?: string;
    directions?: string;
  };
}

export async function createDetailedItinerary(
  selectedOption: DateOption,
  userPreferences: any = {}
): Promise<DetailedItinerary> {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = createItineraryPrompt(selectedOption, userPreferences);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the structured response from Gemini
    const itinerary = parseGeminiResponse(text, selectedOption);
    
    return itinerary;
    
  } catch (error) {
    console.error('Error creating detailed itinerary:', error);
    throw new Error('Failed to create detailed itinerary with Gemini API');
  }
}

function createItineraryPrompt(option: DateOption, preferences: any): string {
  return `
Create a detailed date itinerary based on the following information:

**Selected Option:**
- Restaurant: ${option.restaurant.name} (${option.restaurant.cuisine}, ${option.restaurant.priceRange})
- Activity: ${option.activity.name} (${option.activity.type}, ${option.activity.location})
- Total Budget: $${option.estimatedCost}
- Available Time Slots: ${option.timeSlots.join(', ')}

**User Preferences:**
${preferences.timeOfDay ? `Preferred time: ${preferences.timeOfDay}` : ''}
${preferences.transportation ? `Transportation: ${preferences.transportation}` : ''}
${preferences.dietaryRestrictions ? `Dietary restrictions: ${preferences.dietaryRestrictions.join(', ')}` : ''}

**Requirements:**
1. Create a realistic timeline with specific times
2. Include travel time between locations
3. Suggest optimal order of activities
4. Provide helpful tips and recommendations
5. Include booking/reservation recommendations
6. Add backup plans in case of weather or closures

**Response Format (JSON):**
{
  "title": "Romantic Date in Vancouver",
  "date": "Selected date",
  "totalEstimatedCost": ${option.estimatedCost},
  "timeline": [
    {
      "time": "6:00 PM",
      "activity": "Dinner at [Restaurant Name]",
      "location": "Restaurant address",
      "duration": "1.5 hours",
      "notes": "Make reservation in advance. Try their signature dish.",
      "links": {
        "reservation": "reservation URL",
        "directions": "Google Maps URL"
      }
    }
  ],
  "tips": [
    "Dress code recommendations",
    "Parking information",
    "Weather considerations"
  ],
  "emergencyContacts": [
    "Restaurant phone number",
    "Activity venue contact"
  ]
}

Please provide a complete, realistic itinerary that maximizes the date experience within the budget.
  `;
}

function parseGeminiResponse(response: string, option: DateOption): DetailedItinerary {
  try {
    // Try to extract JSON from the response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const jsonStr = jsonMatch[0];
      const parsed = JSON.parse(jsonStr);
      
      // Validate and structure the response
      return {
        title: parsed.title || `Date at ${option.restaurant.name}`,
        date: parsed.date || new Date().toISOString().split('T')[0],
        totalEstimatedCost: parsed.totalEstimatedCost || option.estimatedCost,
        timeline: parsed.timeline || createFallbackTimeline(option),
        tips: parsed.tips || [],
        emergencyContacts: parsed.emergencyContacts || []
      };
    }
  } catch (error) {
    console.error('Error parsing Gemini response:', error);
  }
  
  // Fallback if parsing fails
  return createFallbackItinerary(option);
}

function createFallbackTimeline(option: DateOption): ItineraryItem[] {
  return [
    {
      time: option.timeSlots[0] || '6:00 PM',
      activity: `Dinner at ${option.restaurant.name}`,
      location: 'Restaurant location',
      duration: '1.5 hours',
      notes: `Enjoy ${option.restaurant.cuisine} cuisine. ${option.restaurant.priceRange} price range.`,
      links: {
        reservation: option.restaurant.reservationUrl,
        directions: `https://maps.google.com/maps?q=${encodeURIComponent(option.restaurant.name + ' Vancouver')}`
      }
    },
    {
      time: option.timeSlots[1] || '8:00 PM',
      activity: option.activity.name,
      location: option.activity.location,
      duration: option.activity.duration,
      notes: `${option.activity.type} activity. Great for couples!`,
      links: {
        booking: option.activity.bookingUrl || undefined,
        directions: `https://maps.google.com/maps?q=${encodeURIComponent(option.activity.location)}`
      }
    }
  ];
}

function createFallbackItinerary(option: DateOption): DetailedItinerary {
  return {
    title: `Date Night at ${option.restaurant.name}`,
    date: new Date().toISOString().split('T')[0],
    totalEstimatedCost: option.estimatedCost,
    timeline: createFallbackTimeline(option),
    tips: [
      'Check restaurant hours and make reservations',
      'Consider traffic and parking',
      'Dress appropriately for the weather'
    ],
    emergencyContacts: []
  };
}