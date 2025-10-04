import path from 'path';
import { promises as fs } from 'fs';

export interface DateOption {
  id: string;
  restaurant: {
    name: string;
    cuisine: string;
    priceRange: string;
    rating: number;
    reservationUrl?: string;
  };
  activity: {
    name: string;
    type: string;
    location: string;
    duration: string;
    cost: number;
    bookingUrl?: string;
  };
  estimatedCost: number;
  timeSlots: string[];
}

export interface UserParameters {
  date: string;
  budget: number;
  activities: string[];
  foodType: string;
  preferences: {
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'all-day';
    transportation: 'walking' | 'driving' | 'transit';
    dietaryRestrictions?: string[];
  };
}

export async function generateDateOptions(params: UserParameters): Promise<DateOption[]> {
  try {
    // Load your existing data files
    const dataPath = path.join(process.cwd(), 'data');
    
    // Load restaurant data
    const restaurantData = await fs.readFile(
      path.join(dataPath, 'vancouver_yelp_food.csv'), 
      'utf-8'
    );
    
    // Load parks data for activities
    const parksData = await fs.readFile(
      path.join(dataPath, 'parks.json'), 
      'utf-8'
    );
    
    // Parse the data (you'll need to implement CSV parsing)
    const restaurants = parseRestaurantData(restaurantData);
    const activities = parseActivityData(parksData);
    
    // Filter based on user preferences
    const filteredRestaurants = filterRestaurants(restaurants, params);
    const filteredActivities = filterActivities(activities, params);
    
    // Generate multiple combinations
    const options: DateOption[] = [];
    
    for (let i = 0; i < Math.min(5, filteredRestaurants.length); i++) {
      for (let j = 0; j < Math.min(3, filteredActivities.length); j++) {
        const restaurant = filteredRestaurants[i];
        const activity = filteredActivities[j];
        
        const estimatedCost = restaurant.priceLevel + activity.cost;
        
        if (estimatedCost <= params.budget) {
          options.push({
            id: `option-${i}-${j}`,
            restaurant: {
              name: restaurant.name,
              cuisine: restaurant.cuisine,
              priceRange: getPriceRange(restaurant.priceLevel),
              rating: restaurant.rating,
              reservationUrl: generateReservationUrl(restaurant.name)
            },
            activity: {
              name: activity.name,
              type: activity.type,
              location: activity.location,
              duration: activity.duration,
              cost: activity.cost,
              bookingUrl: activity.bookingUrl
            },
            estimatedCost,
            timeSlots: generateTimeSlots(params.preferences.timeOfDay)
          });
        }
      }
    }
    
    return options.slice(0, 5); // Return top 5 options
    
  } catch (error) {
    console.error('Error generating date options:', error);
    throw new Error('Failed to generate date options');
  }
}

function parseRestaurantData(csvData: string) {
  // Simple CSV parsing - you might want to use a library like csv-parse
  const lines = csvData.split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1).map(line => {
    const values = line.split(',');
    return {
      name: values[0] || 'Unknown Restaurant',
      cuisine: values[1] || 'General',
      rating: parseFloat(values[2]) || 4.0,
      priceLevel: parseInt(values[3]) || 2
    };
  }).filter(restaurant => restaurant.name !== 'Unknown Restaurant');
}

function parseActivityData(jsonData: string) {
  try {
    const data = JSON.parse(jsonData);
    // Assuming parks.json has features array
    return data.features?.map((feature: any) => ({
      name: feature.properties?.NAME || 'Park Activity',
      type: 'Park Visit',
      location: feature.properties?.ADDRESS || 'Vancouver',
      duration: '2 hours',
      cost: 0, // Parks are usually free
      bookingUrl: null
    })) || [];
  } catch {
    return [];
  }
}

function filterRestaurants(restaurants: any[], params: UserParameters) {
  return restaurants.filter(restaurant => {
    if (params.foodType && params.foodType !== 'any') {
      return restaurant.cuisine.toLowerCase().includes(params.foodType.toLowerCase());
    }
    return true;
  }).sort((a, b) => b.rating - a.rating);
}

function filterActivities(activities: any[], params: UserParameters) {
  return activities.filter(activity => {
    if (params.activities.length > 0) {
      return params.activities.some(userActivity => 
        activity.type.toLowerCase().includes(userActivity.toLowerCase()) ||
        activity.name.toLowerCase().includes(userActivity.toLowerCase())
      );
    }
    return true;
  });
}

function getPriceRange(priceLevel: number): string {
  const ranges = ['$', '$$', '$$$', '$$$$'];
  return ranges[priceLevel - 1] || '$$';
}

function generateReservationUrl(restaurantName: string): string {
  // Generate a mock reservation URL - in reality, you'd integrate with OpenTable, Resy, etc.
  return `https://www.opentable.com/s/?query=${encodeURIComponent(restaurantName)}`;
}

function generateTimeSlots(timeOfDay: string): string[] {
  const slots = {
    morning: ['9:00 AM', '10:30 AM', '12:00 PM'],
    afternoon: ['12:00 PM', '2:00 PM', '4:00 PM'],
    evening: ['5:00 PM', '7:00 PM', '9:00 PM'],
    'all-day': ['9:00 AM', '12:00 PM', '3:00 PM', '6:00 PM', '8:00 PM']
  };
  
  return slots[timeOfDay as keyof typeof slots] || slots['all-day'];
}