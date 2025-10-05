import { NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";
import fs from 'fs';
import path from 'path';

// Initialize Google GenAI client
const ai = new GoogleGenAI({});

// Utility: load a CSV file as a JSON array
// Helper function to parse CSV with proper handling of quoted fields
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

// Helper function to load and parse CSV data
function loadCSVData(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.error(`CSV file not found: ${filePath}`);
      return [];
    }

    const csvData = fs.readFileSync(filePath, 'utf8');
    const lines = csvData.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) return [];
    
    const headers = parseCSVLine(lines[0]).map(h => h.replace(/"/g, ''));
    const results = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]).map(v => v.replace(/"/g, ''));
      if (values.length >= headers.length - 2) { // Allow some tolerance for malformed rows
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = values[index] || '';
        });
        results.push(obj);
      }
    }
    
    console.log(`Loaded ${results.length} records from ${filePath}`);
    return results;
  } catch (error) {
    console.error(`Error reading CSV ${filePath}:`, error);
    return [];
  }
}

// Wrapper function to load CSV from cleaned folder
async function loadCSV(filename) {
  const filePath = path.join(process.cwd(), 'cleaned', filename);
  return loadCSVData(filePath);
}

export async function POST(request) {
  try {
    const userInput = await request.json();
    console.log('Received user input:', userInput);

    // Load CSV datasets from cleaned folder
    const restaurants = await loadCSV('VancouverRestaurants.csv');
    const activities = await loadCSV('VancouverActivities.csv');

    // Filter restaurants based on cuisine keywords and budget
    const filteredRestaurants = restaurants.filter((r) => {
      const categories = r.categories?.toLowerCase() || "";
      const priceLevel = parseInt(r.RestaurantsPriceRange2) || 0;

      // Match if the restaurant's categories have any of the user's cuisine preferences
      const matchesCuisine =
        !userInput.cuisines ||
        userInput.cuisines.some((cuisine) =>
          categories.includes(cuisine.toLowerCase())
        );

      // Match on budget (RestaurantsPriceRange2 ranges 1–4)
      const matchesBudget =
        !userInput.budgetLevel || priceLevel <= parseInt(userInput.budgetLevel);

      return matchesCuisine && matchesBudget;
    });

    // Filter activities based on activity keywords
    const filteredActivities = activities.filter((a) => {
      const type = a.type?.toLowerCase() || "";
      const use = a.use?.toLowerCase() || "";

      // Match if the activity type or use includes any of the user's selected activities
      const matchesActivity =
        !userInput.activities ||
        userInput.activities.some(
          (activity) =>
            type.includes(activity.toLowerCase()) ||
            use.includes(activity.toLowerCase())
        );

      return matchesActivity;
    });

    // Limit size to keep prompt efficient
    const selectedRestaurants = filteredRestaurants.slice(0, 15);
    const selectedActivities = filteredActivities.slice(0, 15);

    // Create Gemini prompt to generate 3 different itineraries
    const prompt = `
    You are a Vancouver-based date planner AI.
    Use the following restaurant and activity data to create 3 DIFFERENT ideal date itineraries based on the user's preferences.
    Each itinerary should be unique and offer different experiences while staying within the user's constraints.

    User preferences:
    - Date: ${userInput.date}
    - Time: ${userInput.time.start} to ${userInput.time.end}
    - Budget Level: ${userInput.budgetLevel} (${userInput.budgetLabel})
    - Preferred Activities: ${userInput.activities.join(', ')}
    - Preferred Cuisines: ${userInput.cuisines.join(', ')}

    Available Restaurant options (filtered by preferences):
    ${JSON.stringify(selectedRestaurants, null, 2)}

    Available Activity options (filtered by preferences):
    ${JSON.stringify(selectedActivities, null, 2)}

    Create 3 distinct itineraries with different themes:
    1. Romantic & Intimate
    2. Fun & Active
    3. Cultural & Relaxed

    Return ONLY valid JSON in this exact format:
    {
      "itineraries": [
        {
          "id": 1,
          "theme": "Romantic & Intimate",
          "date": "${userInput.date}",
          "time": {"start": "${userInput.time.start}", "end": "${userInput.time.end}"},
          "budgetLevel": ${userInput.budgetLevel},
          "budgetLabel": "${userInput.budgetLabel}",
          "timeline": [
            {
              "time": "HH:MM",
              "activity": "Activity Name",
              "location": "Location Name",
              "description": "Brief description",
              "type": "restaurant|activity"
            }
          ],
          "estimatedCost": "$XX-XX",
          "highlights": ["highlight1", "highlight2"]
        },
        {
          "id": 2,
          "theme": "Fun & Active",
          "date": "${userInput.date}",
          "time": {"start": "${userInput.time.start}", "end": "${userInput.time.end}"},
          "budgetLevel": ${userInput.budgetLevel},
          "budgetLabel": "${userInput.budgetLabel}",
          "timeline": [
            {
              "time": "HH:MM",
              "activity": "Activity Name",
              "location": "Location Name",
              "description": "Brief description",
              "type": "restaurant|activity"
            }
          ],
          "estimatedCost": "$XX-XX",
          "highlights": ["highlight1", "highlight2"]
        },
        {
          "id": 3,
          "theme": "Cultural & Relaxed",
          "date": "${userInput.date}",
          "time": {"start": "${userInput.time.start}", "end": "${userInput.time.end}"},
          "budgetLevel": ${userInput.budgetLevel},
          "budgetLabel": "${userInput.budgetLabel}",
          "timeline": [
            {
              "time": "HH:MM",
              "activity": "Activity Name",
              "location": "Location Name",
              "description": "Brief description",
              "type": "restaurant|activity"
            }
          ],
          "estimatedCost": "$XX-XX",
          "highlights": ["highlight1", "highlight2"]
        }
      ]
    }

    Make sure each itinerary:
    - Uses different restaurants and activities when possible
    - Fits within the specified time frame
    - Respects the budget constraints
    - Incorporates the user's preferred activities and cuisines
    - Provides a logical flow of events throughout the date
    `;

    // Send to Gemini using the new API
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    const text = response.text;
    console.log('Raw Gemini response:', text);

    // Parse Gemini's JSON output
    let itinerariesResponse;
    try {
      // Clean the response text in case there are markdown code blocks
      const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
      console.log('Cleaned response:', cleanedText);
      itinerariesResponse = JSON.parse(cleanedText);
      console.log('Parsed response structure:', JSON.stringify(itinerariesResponse, null, 2));
    } catch (err) {
      console.error("Error parsing Gemini JSON:", text);
      return NextResponse.json(
        { error: "Invalid JSON output from AI", raw: text },
        { status: 500 }
      );
    }

    // Return the 3 itineraries to the frontend
    return NextResponse.json(itinerariesResponse);

  } catch (err) {
    console.error('API Error:', err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}