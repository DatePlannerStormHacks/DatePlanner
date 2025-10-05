"use client";
import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useUser } from '@clerk/nextjs';
import { steps, classNames } from "../../../shared/constants";

// ------------------------------------------------------------
// Date Planner Form
// A single-file, production-ready React component that renders
// a one-page sliding wizard for planning a date night.
// - Stepper/breadcrumbs at the top
// - Date (input type="date")
// - Time (start and end, input type="time")
// - Budget (slider)
// - Activities (multi-select chips)
// - Restaurant types (multi-select chips)
// - Export to JSON (downloads a file)
// Styling: TailwindCSS (no external UI libs) + Framer Motion
// ------------------------------------------------------------

const activitiesPreset = [
  "Picnic",
  "Museum",
  "Hiking",
  "Movie Night",
  "Coffee/Tea",
  "Board Games",
  "Arcade",
  "Concert",
  "Beach Walk",
  "Cooking Class",
  "Bowling",
  "Mini Golf",
];

const cuisinesPreset = [
  "Japanese",
  "Italian",
  "Korean",
  "Chinese",
  "Mexican",
  "Indian",
  "Thai",
  "Mediterranean",
  "Vegan/Vegetarian",
  "Steakhouse",
  "Cafe/Brunch",
  "Sushi",
  "Ramen",
  "Hot Pot",
];

// Constants moved to shared/constants.ts to avoid circular dependencies

function budgetLabel(level: number) {
  switch (level) {
    case 1:
      return "$ — under $10";
    case 2:
      return "$$ — $11–30";
    case 3:
      return "$$$ — $31–60";
    case 4:
    default:
      return "$$$$ — over $60";
  }
}

function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

interface DatePlannerProps {
  stepIndex?: number;
  setStepIndex?: React.Dispatch<React.SetStateAction<number>>;
}

export default function DatePlannerForm() {
  const { user } = useUser();
  const [stepIndex, setStepIndex] = useState(0);

  // Form data states
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [budget, setBudget] = useState(2);
  const [activities, setActivities] = useState<string[]>([]);
  const [cuisines, setCuisines] = useState<string[]>([]);

  // API state
  const [isGenerating, setIsGenerating] = useState(false);
  const [itineraries, setItineraries] = useState<Array<{
    theme: string;
    activities?: Array<{
      name: string;
      description: string;
      time: string;
      address?: string;
      estimatedCost?: string;
    }>;
    timeline?: Array<{
      name?: string;
      activity?: string;
      description?: string;
      time: string;
      address?: string;
      estimatedCost?: string;
    }>;
  }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [savingFavorites, setSavingFavorites] = useState<{[key: number]: boolean}>({});
  const [favoritedItineraries, setFavoritedItineraries] = useState<{[key: number]: string | null}>({});

  const currentStep = steps[stepIndex];

  const isValid = useMemo(() => {
    switch (currentStep.key) {
      case "date":
        return Boolean(date);
      case "time":
        return Boolean(startTime); // endTime optional
      case "budget":
        return budget >= 1 && budget <= 4;
      case "activities":
      case "cuisines":
        return true; // optional
      case "review":
        return true;
      default:
        return false;
    }
  }, [currentStep.key, date, startTime, budget]);

  function goNext() {
    if (!isValid) return;
    if (stepIndex < steps.length - 1) setStepIndex(stepIndex + 1);
  }

  function goBack() {
    if (stepIndex > 0) setStepIndex(stepIndex - 1);
  }

  function toggleItem(list: string[], setList: (v: string[]) => void, item: string) {
    setList(
      list.includes(item) ? list.filter((x) => x !== item) : [...list, item]
    );
  }

  async function generateItineraries() {
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await fetch('/api/generate-itinerary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date,
          time: { start: startTime || null, end: endTime || null },
          budgetLevel: budget,
          activities,
          cuisines,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate itineraries: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Received data from API:', data);
      setItineraries(data.itineraries || []);
      // Reset favorite states when new itineraries are generated
      setFavoritedItineraries({});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate itineraries');
      console.error('Error generating itineraries:', err);
    } finally {
      setIsGenerating(false);
    }
  }

  const dataForExport = {
    date,
    time: { start: startTime || null, end: endTime || null },
    budgetLevel: budget,
    budgetLabel: budgetLabel(budget),
    activities,
    cuisines,
  };

  const direction = 1; // simple slide; could compute based on index delta

  async function toggleFavorite(itinerary: { theme: string; activities?: Array<{name: string; description: string; time: string; address?: string; estimatedCost?: string}>; timeline?: Array<{name?: string; activity?: string; description?: string; time: string; address?: string; estimatedCost?: string}> }, index: number) {
    if (!user) {
      alert('Please sign in to save favorites');
      return;
    }

    const isFavorited = favoritedItineraries[index];
    setSavingFavorites(prev => ({ ...prev, [index]: true }));
    
    try {
      if (isFavorited) {
        // Remove from favorites
        const response = await fetch(`/api/favorites?id=${isFavorited}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to remove favorite');
        }

        setFavoritedItineraries(prev => ({ ...prev, [index]: null }));
        alert('Itinerary removed from favorites!');
      } else {
        // Add to favorites
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: `${itinerary.theme || `Itinerary ${index + 1}`} - ${date}`,
            date,
            startTime,
            endTime,
            budget,
            activities,
            cuisines,
            generatedItinerary: itinerary
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to save favorite');
        }

        const result = await response.json();
        setFavoritedItineraries(prev => ({ ...prev, [index]: result.id }));
        alert('Itinerary saved to favorites!');
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
      alert('Failed to update favorite. Please try again.');
    } finally {
      setSavingFavorites(prev => ({ ...prev, [index]: false }));
    }
  }

  return (
  <div className="relative overflow-hidden p-6 pt-0 md:p-8 md:pt-0 max-w-2xl mx-auto">
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={currentStep.key}
          initial={{ opacity: 0, x: 30 * direction }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 * direction }}
          transition={{ type: "spring", stiffness: 220, damping: 26 }}
          className="min-h-[320px]"
        >
          {currentStep.key === "date" && (
            <section className="space-y-6">
              <h2 className="step-title">When?</h2>
              <div className="grid gap-4 sm:max-w-sm">
                <label className="text-sm font-medium text-slate-700">Pick a date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white p-3 shadow-sm outline-none ring-indigo-300 placeholder-slate-400 focus:ring text-black"
                />
              </div>
            </section>
          )}
          {currentStep.key === "time" && (
            <section className="space-y-6">
              <h2 className="step-title">What time?</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:max-w-xl">
                <div>
                  <label className="text-sm font-medium text-slate-700">Start time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3 shadow-sm outline-none ring-indigo-300 placeholder-slate-400 focus:ring text-black"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">End time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3 shadow-sm outline-none ring-indigo-300 placeholder-slate-400 focus:ring text-black"
                  />
                </div>
              </div>
            </section>
          )}
          {currentStep.key === "budget" && (
            <section className="space-y-6">
              <h2 className="step-title">Budget</h2>
              <div className="sm:max-w-xl">
                <input
                  type="range"
                  min={1}
                  max={4}
                  step={1}
                  value={budget}
                  onChange={(e) => setBudget(parseInt(e.target.value))}
                  className="w-full accent-indigo-600"
                />
                <div className="mt-2 flex justify-between text-sm text-slate-600">
                  <span>$</span>
                  <span>$$</span>
                  <span>$$$</span>
                  <span>$$$$</span>
                </div>
                <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700">
                  Selected: {budgetLabel(budget)}
                </p>
              </div>
            </section>
          )}
          {currentStep.key === "activities" && (
            <section className="space-y-6">
              <h2 className="step-title">Pick some activities</h2>
              <p className="text-sm text-slate-600">Choose any that sound fun. You can always change these later.</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {activitiesPreset.map((item) => {
                  const active = activities.includes(item);
                  return (
                    <button
                      key={item}
                      onClick={() => toggleItem(activities, setActivities, item)}
                      className={classNames(
                        "rounded-2xl border px-3 py-2 text-sm font-medium shadow-sm transition",
                        active
                          ? "border-indigo-600 bg-indigo-600 text-white"
                          : "border-slate-300 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50"
                      )}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </section>
          )}
          {currentStep.key === "cuisines" && (
            <section className="space-y-6">
              <h2 className="step-title">What kind of food are we feeling?</h2>
              <p className="text-sm text-slate-600">Select cuisines you both like.</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {cuisinesPreset.map((item) => {
                  const active = cuisines.includes(item);
                  return (
                    <button
                      key={item}
                      onClick={() => toggleItem(cuisines, setCuisines, item)}
                      className={classNames(
                        "rounded-2xl border px-3 py-2 text-sm font-medium shadow-sm transition",
                        active
                          ? "border-fuchsia-600 bg-fuchsia-600 text-white"
                          : "border-slate-300 bg-white text-slate-700 hover:border-fuchsia-300 hover:bg-fuchsia-50"
                      )}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </section>
          )}
          {currentStep.key === "review" && (
            <section className="space-y-6">
              <h2 className="step-title">Review & Generate Itineraries</h2>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Date</dt>
                    <dd className="text-slate-800">{date || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Time</dt>
                    <dd className="text-slate-800">
                      {startTime || "—"}
                      {endTime ? ` → ${endTime}` : ""}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Budget</dt>
                    <dd className="text-slate-800">{budgetLabel(budget)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Activities</dt>
                    <dd className="text-slate-800">{activities.length ? activities.join(", ") : "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Restaurant Types</dt>
                    <dd className="text-slate-800">{cuisines.length ? cuisines.join(", ") : "—"}</dd>
                  </div>
                </dl>
              </div>

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={generateItineraries}
                  disabled={isGenerating}
                  className={classNames(
                    "rounded-2xl px-5 py-3 font-semibold shadow-md transition focus:outline-none focus:ring-2 focus:ring-indigo-300",
                    isGenerating
                      ? "cursor-not-allowed bg-indigo-400 text-white"
                      : "bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white hover:brightness-110"
                  )}
                >
                  {isGenerating ? "Generating..." : "🎯 Generate 3 Date Ideas"}
                </button>
                <button
                  onClick={() => downloadJson("date-plan.json", dataForExport)}
                  className="rounded-2xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  Export JSON
                </button>
                <button
                  onClick={() => {
                    setDate("");
                    setStartTime("");
                    setEndTime("");
                    setBudget(2);
                    setActivities([]);
                    setCuisines([]);
                    setStepIndex(0);
                    setItineraries([]);
                    setError(null);
                  }}
                  className="rounded-2xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  Reset
                </button>
              </div>

              {itineraries.length > 0 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-slate-800">Your Date Ideas</h3>
                  <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
                    {itineraries.map((itinerary, index) => {
                      const activities = itinerary.activities || itinerary.timeline || [];
                      return (
                        <div key={index} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="text-lg font-semibold text-slate-800">{itinerary.theme || `Itinerary ${index + 1}`}</h4>
                            <button
                              onClick={() => toggleFavorite(itinerary, index)}
                              disabled={savingFavorites[index]}
                              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm ${
                                favoritedItineraries[index] 
                                  ? 'bg-red-500 text-white hover:bg-red-600 disabled:bg-red-300' 
                                  : 'bg-pink-600 text-white hover:bg-pink-700 disabled:bg-pink-300'
                              }`}
                            >
                              {savingFavorites[index] ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                  {favoritedItineraries[index] ? 'Removing...' : 'Saving...'}
                                </>
                              ) : (
                                <>
                                  {favoritedItineraries[index] ? (
                                    <>💔 Remove Favorite</>
                                  ) : (
                                    <>❤️ Save Favorite</>
                                  )}
                                </>
                              )}
                            </button>
                          </div>
                          <div className="space-y-4">
                            {activities.length > 0 ? activities.map((activity, actIndex: number) => (
                              <div key={actIndex} className="rounded-xl bg-slate-50 p-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h5 className="font-medium text-slate-800">
                                      {activity.name || 
                                       ('activity' in activity ? activity.activity : null) || 
                                       'Activity'}
                                    </h5>
                                    <p className="text-sm text-slate-600">{activity.description || 'No description available'}</p>
                                    {activity.address && (
                                      <p className="text-xs text-slate-500 mt-1">📍 {activity.address}</p>
                                    )}
                                  </div>
                                  <div className="ml-4 text-right">
                                    <p className="text-sm font-medium text-slate-700">{activity.time || 'Time TBD'}</p>
                                    {activity.estimatedCost && (
                                      <p className="text-xs text-slate-500">{activity.estimatedCost}</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )) : (
                              <div className="text-center text-slate-500 py-4">
                                No activities found for this itinerary
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>
          )}
        </motion.div>
      </AnimatePresence>
      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={goBack}
          disabled={stepIndex === 0}
          className={classNames(
            "rounded-2xl px-4 py-2 text-sm font-semibold transition",
            stepIndex === 0
              ? "cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400"
              : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
          )}
        >
          ← Back
        </button>
        {currentStep.key !== "review" ? (
          <button
            onClick={goNext}
            disabled={!isValid}
            className={classNames(
              "rounded-2xl px-5 py-2 text-sm font-semibold transition",
              isValid
                ? "bg-indigo-600 text-white shadow-md hover:brightness-110"
                : "cursor-not-allowed bg-slate-200 text-slate-400"
            )}
          >
            Next →
          </button>
        ) : null}
      </div>
    </div>);
}