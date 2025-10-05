import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import fs from "fs";
import csv from "csv-parser";
import { GoogleGenerativeAI } from "@google/generative-ai";


// Load environment variables from .env file
dotenv.config();
const app = express();
// Lets Express automatically parse JSON requests
app.use(bodyParser.json());

// Initialize Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Utility: load a CSV file as a JSON array
// Read a CSV file and convert it to a JSON array --> Returns a Promise that resolves to an array of objects (1/row in CSV)
function loadCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = []; // Array to hold all rows
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", reject);
  });
}

// Main itinerary endpoint: Handles POSTreuests to /generate-itinerary --> Expects the front-end to send user input in JSON
app.post("/generate-itinerary", async (req, res) => {
  try {
    const userInput = req.body; 

    //  Load and filter CSV datasets
    const restaurants = await loadCSV("./VancouverRestaurants.csv");
    const activities = await loadCSV("./VancouverActivities.csv");

    // Filter restaurants based on cuisine keywords and budget --> filtering can be improved more if have time
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
        !userInput.budget || priceLevel <= parseInt(userInput.budget);

    return matchesCuisine && matchesBudget;
    });

    // Filter activities based on activity keywords
    const filteredActivities = activities.filter((a) => {
    const type = a.type?.toLowerCase() || "";
    const use = a.use?.toLowerCase() || "";

    // Match if the activity type or use includes any of the user’s selected activities
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
    const selectedRestaurants = filteredRestaurants.slice(0, 10);
    const selectedActivities = filteredActivities.slice(0, 10);

    // Create Gemini prompt --> REWORD HOW EVER WE'D PREFER ************************
    // Use the provided data -> use user preferences -> select the best matching options -> return a single itinerary in JSON
    const prompt = `
    You are a Vancouver-based date planner.
    Use the following restaurant and activity data to create ONE ideal date itinerary based on the user's preferences.

    User preferences:
    ${JSON.stringify(userInput, null, 2)}

    Restaurant options (filtered from CSV):
    ${JSON.stringify(filteredRestaurants.slice(0, 10), null, 2)}

    Activity options (filtered from CSV):
    ${JSON.stringify(filteredActivities.slice(0, 10), null, 2)}

    Return ONLY JSON in this format:
    {
    "date": "YYYY-MM-DD",
    "time": {"start": "HH:MM", "end": "HH:MM"},
    "budgetLevel": number,
    "budgetLabel": string,
    "activities": [string],
    "cuisines": [string]
    }
    `;


    // Send to Gemini 
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    // Generate the content
    const result = await model.generateContent(prompt);
    // Extract the text response from Gemini
    const text = result.response.text();

    // Parse Gemini’s JSON output
    let itinerary;
    try {
      itinerary = JSON.parse(text);
    } catch (err) {
      console.error("Error parsing Gemini JSON:", text);
      return res.status(500).json({ error: "Invalid JSON output", raw: text }); // Give raw text and show error if AI response is not a valid JSON
    }

    // If good, send itinerary back to frontend
    res.json(itinerary);
  } catch (err) { // Error handling
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

