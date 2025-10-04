'use client';

import { useState } from 'react';
import { DateOption } from '@/lib/services/optionGenerator';
import { DetailedItinerary } from '@/lib/services/geminiService';

interface DatePlannerProps {}

export default function DatePlanner({}: DatePlannerProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    date: '',
    budget: 100,
    activities: [] as string[],
    foodType: '',
    preferences: {
      timeOfDay: 'evening' as const,
      transportation: 'driving' as const,
      dietaryRestrictions: [] as string[]
    }
  });
  const [options, setOptions] = useState<DateOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<DateOption | null>(null);
  const [itinerary, setItinerary] = useState<DetailedItinerary | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerateOptions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/generate-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      if (data.success) {
        setOptions(data.options);
        setStep(3);
      }
    } catch (error) {
      console.error('Error generating options:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = async (option: DateOption) => {
    setSelectedOption(option);
    setLoading(true);
    
    try {
      const response = await fetch('/api/create-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedOption: option,
          userPreferences: formData.preferences
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setItinerary(data.itinerary);
        setStep(4);
      }
    } catch (error) {
      console.error('Error creating itinerary:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendItinerary = async () => {
    if (!itinerary || !userEmail) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/send-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itinerary,
          userEmail,
          userName: 'Date Planner User'
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setStep(5);
      }
    } catch (error) {
      console.error('Error sending itinerary:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🌟 DatePlanner
          </h1>
          <p className="text-lg text-gray-600">
            Plan the perfect date with AI-powered recommendations
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step >= i
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {i}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>Date & Budget</span>
            <span>Preferences</span>
            <span>Choose Option</span>
            <span>Review</span>
            <span>Complete</span>
          </div>
        </div>

        {/* Step 1: Date and Budget */}
        {step === 1 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-6">When and How Much?</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget: ${formData.budget}
                </label>
                <input
                  type="range"
                  min="50"
                  max="500"
                  step="25"
                  value={formData.budget}
                  onChange={(e) => setFormData({...formData, budget: parseInt(e.target.value)})}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>$50</span>
                  <span>$500</span>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => setStep(2)}
                disabled={!formData.date}
                className="w-full bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Continue to Preferences
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Preferences */}
        {step === 2 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-6">What are you in the mood for?</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Food Type
                </label>
                <select
                  value={formData.foodType}
                  onChange={(e) => setFormData({...formData, foodType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Any cuisine</option>
                  <option value="italian">Italian</option>
                  <option value="japanese">Japanese</option>
                  <option value="mexican">Mexican</option>
                  <option value="indian">Indian</option>
                  <option value="chinese">Chinese</option>
                  <option value="thai">Thai</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Time
                </label>
                <select
                  value={formData.preferences.timeOfDay}
                  onChange={(e) => setFormData({
                    ...formData,
                    preferences: {
                      ...formData.preferences,
                      timeOfDay: e.target.value as any
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="morning">Morning</option>
                  <option value="afternoon">Afternoon</option>
                  <option value="evening">Evening</option>
                  <option value="all-day">All Day</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Activities (check all that interest you)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['Park Visit', 'Museum', 'Concert', 'Sports', 'Shopping', 'Movies'].map((activity) => (
                    <label key={activity} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.activities.includes(activity)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              activities: [...formData.activities, activity]
                            });
                          } else {
                            setFormData({
                              ...formData,
                              activities: formData.activities.filter(a => a !== activity)
                            });
                          }
                        }}
                        className="mr-2"
                      />
                      {activity}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-300"
              >
                Back
              </button>
              <button
                onClick={handleGenerateOptions}
                disabled={loading}
                className="flex-1 bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 disabled:bg-gray-300"
              >
                {loading ? 'Generating...' : 'Generate Options'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Choose Option */}
        {step === 3 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-6">Choose Your Perfect Date</h2>
            
            <div className="grid gap-4">
              {options.map((option) => (
                <div
                  key={option.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-purple-500 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => handleSelectOption(option)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-lg">
                      {option.restaurant.name} + {option.activity.name}
                    </h3>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-semibold">
                      ${option.estimatedCost}
                    </span>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-medium text-purple-600">🍽️ Restaurant</div>
                      <div>{option.restaurant.cuisine} • {option.restaurant.priceRange}</div>
                      <div>⭐ {option.restaurant.rating}/5</div>
                    </div>
                    <div>
                      <div className="font-medium text-purple-600">🎯 Activity</div>
                      <div>{option.activity.type}</div>
                      <div>📍 {option.activity.location}</div>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="text-xs text-gray-500">Available times:</div>
                    <div className="flex gap-2 mt-1">
                      {option.timeSlots.map((time) => (
                        <span key={time} className="bg-gray-100 px-2 py-1 rounded text-xs">
                          {time}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <button
                onClick={() => setStep(2)}
                className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-300"
              >
                Back to Preferences
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Review Itinerary */}
        {step === 4 && itinerary && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-6">Your Perfect Date Itinerary</h2>
            
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-purple-600">{itinerary.title}</h3>
              <p className="text-gray-600">Date: {itinerary.date}</p>
              <p className="text-gray-600">Estimated Cost: ${itinerary.totalEstimatedCost}</p>
            </div>

            <div className="space-y-4 mb-6">
              {itinerary.timeline.map((item, index) => (
                <div key={index} className="border-l-4 border-purple-500 pl-4 py-2">
                  <div className="font-semibold text-purple-600">{item.time}</div>
                  <div className="font-medium">{item.activity}</div>
                  <div className="text-sm text-gray-600">📍 {item.location} • ⏱️ {item.duration}</div>
                  <div className="text-sm text-gray-500 mt-1">{item.notes}</div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address (to receive your itinerary)
              </label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
              />
              
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-300"
                >
                  Choose Different Option
                </button>
                <button
                  onClick={handleSendItinerary}
                  disabled={!userEmail || loading}
                  className="flex-1 bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 disabled:bg-gray-300"
                >
                  {loading ? 'Sending...' : 'Send to Email & Calendar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Complete */}
        {step === 5 && (
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-semibold mb-4">Your Date is Planned!</h2>
            <p className="text-gray-600 mb-6">
              We've sent your detailed itinerary to your email with a link to add it to your Google Calendar.
            </p>
            <button
              onClick={() => {
                setStep(1);
                setOptions([]);
                setSelectedOption(null);
                setItinerary(null);
                setUserEmail('');
                setFormData({
                  date: '',
                  budget: 100,
                  activities: [],
                  foodType: '',
                  preferences: {
                    timeOfDay: 'evening',
                    transportation: 'driving',
                    dietaryRestrictions: []
                  }
                });
              }}
              className="bg-purple-600 text-white py-3 px-6 rounded-md hover:bg-purple-700"
            >
              Plan Another Date
            </button>
          </div>
        )}

        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
              <span>Processing...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}