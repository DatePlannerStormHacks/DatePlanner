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
    const userInput = req.body; // e.g., { date, vibe, budget, cuisinePreference }

    //  Load and filter CSV datasets
    const restaurants = await loadCSV("./VancouverRestaurants.csv");
    const activities = await loadCSV("./VancouverActivities.csv");

    // Basic filtering logic to narrow down options based on user input (to improve later) ***********************
    const filteredRestaurants = restaurants.filter(
      (r) =>
        r.vibe.toLowerCase().includes(userInput.vibe.toLowerCase()) ||
        r.cuisine.toLowerCase().includes(userInput.cuisinePreference?.toLowerCase() || "")
    );

    const filteredActivities = activities.filter((a) =>
      a.vibe.toLowerCase().includes(userInput.vibe.toLowerCase())
    );

    // Limit size to keep prompt efficient
    const selectedRestaurants = filteredRestaurants.slice(0, 10);
    const selectedActivities = filteredActivities.slice(0, 10);

    // Create Gemini prompt --> REWORD HOW EVER WE'D PREFER ************************
    // Use the provided data -> use user preferences -> select the best matching options -> return a single itinerary in JSON
    const prompt = `
You are a Vancouver-based date planner AI.
Use the following datasets to build ONE ideal itinerary that fits the user's preferences.

User preferences:
${JSON.stringify(userInput, null, 2)}

Available restaurants:
${JSON.stringify(selectedRestaurants, null, 2)}

Available activities:
${JSON.stringify(selectedActivities, null, 2)}

Choose 1 restaurant and 2-3 activities that match the user's vibe, budget, and cuisine preferences.
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

