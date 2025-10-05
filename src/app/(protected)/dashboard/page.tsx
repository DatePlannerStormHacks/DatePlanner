"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { FavoriteItinerary } from '../../../../lib/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import ProtectedHeader from '@/components/ProtectedHeader';
import Image from 'next/image';

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const [favorites, setFavorites] = useState<FavoriteItinerary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<{[key: string]: boolean}>({});

  const loadFavorites = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const response = await fetch('/api/favorites');
      if (!response.ok) {
        throw new Error('Failed to fetch favorites');
      }
      const userFavorites = await response.json();
      setFavorites(userFavorites);
    } catch (err) {
      setError('Failed to load your favorite itineraries');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isLoaded && user) {
      loadFavorites();
    }
  }, [isLoaded, user, loadFavorites]);



  const handleDeleteFavorite = async (itineraryId: string) => {
    try {
      const response = await fetch(`/api/favorites?id=${itineraryId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete favorite');
      }
      setFavorites(favorites.filter(fav => fav.id !== itineraryId));
    } catch (err) {
      setError('Failed to delete itinerary');
      console.error(err);
    }
  };

  const parseItinerary = (itineraryString: string) => {
    try {
      return JSON.parse(itineraryString);
    } catch {
      return null;
    }
  };

  const formatBudget = (budgetLevel: number) => {
    return '$'.repeat(budgetLevel);
  };

  const toggleExpanded = (favoriteId: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [favoriteId]: !prev[favoriteId]
    }));
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to view your dashboard</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <ProtectedHeader />
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Welcome back, {user.firstName || user.emailAddresses[0].emailAddress}!
            </h1>
            <p className="text-gray-600">Here are your favorite date itineraries</p>
          </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {favorites.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">❤️</div>
            <h2 className="text-2xl font-semibold text-gray-600 mb-2">No favorites yet</h2>
            <p className="text-gray-500 mb-6">
              Create some itineraries and save your favorites to see them here!
            </p>
            <a
              href="/form"
              className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Plan Your First Date
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            <AnimatePresence>
              {favorites.map((favorite) => {
                const itinerary = parseItinerary(favorite.generatedItinerary);
                return (
                  <motion.div
                    key={favorite.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow w-full flex flex-col min-h-[400px]"
                  >
                    <div 
                      className="p-6 cursor-pointer flex-grow"
                      onClick={() => toggleExpanded(favorite.id!)}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-semibold text-gray-800">
                          {favorite.title}
                        </h3>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFavorite(favorite.id!);
                          }}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          title="Delete favorite"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9zM4 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 012 0v4a1 1 0 11-2 0V9zm4 0a1 1 0 112 0v4a1 1 0 11-2 0V9z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {favorite.date}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {favorite.startTime} - {favorite.endTime}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm-7-8a7 7 0 1114 0 7 7 0 01-14 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Budget: {formatBudget(favorite.budget)}
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1 mb-2">
                          {favorite.activities.map((activity: string, index: number) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                            >
                              {activity}
                            </span>
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {favorite.cuisines.map((cuisine: string, index: number) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-pink-100 text-pink-700 text-xs rounded-full"
                            >
                              {cuisine}
                            </span>
                          ))}
                        </div>
                      </div>

                      {itinerary && (
                        <div className="text-sm text-gray-600">
                          <p className="font-medium mb-1">{itinerary.theme}</p>
                          <p className="text-xs">{itinerary.estimatedCost}</p>
                        </div>
                      )}

                      {/* Expandable detailed content */}
                      <AnimatePresence>
                        {expandedItems[favorite.id!] && itinerary && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="mt-4 pt-4 border-t border-gray-200"
                          >
                            <h4 className="font-semibold text-gray-800 mb-3">Detailed Itinerary:</h4>
                            <div className="space-y-3">
                              {(itinerary.activities || itinerary.timeline || []).map((activity: {name?: string; activity?: string; description?: string; time?: string; address?: string; estimatedCost?: string; type?: string}, actIndex: number) => (
                                <div key={actIndex} className="bg-gray-50 rounded-lg p-3">
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <h5 className="font-medium text-gray-800 text-sm">
                                        {activity.name || activity.activity || 'Activity'}
                                      </h5>
                                      <p className="text-xs text-gray-600 mt-1">
                                        {activity.description || 'No description available'}
                                      </p>
                                      {activity.address && (
                                        <p className="text-xs text-gray-500 mt-1">
                                          📍 {activity.address}
                                        </p>
                                      )}
                                      {activity.type && (
                                        <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                                          {activity.type}
                                        </span>
                                      )}
                                    </div>
                                    <div className="ml-3 text-right">
                                      <p className="text-xs font-medium text-gray-700">
                                        {activity.time || 'Time TBD'}
                                      </p>
                                      {activity.estimatedCost && (
                                        <p className="text-xs text-gray-500">
                                          {activity.estimatedCost}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            {itinerary.highlights && itinerary.highlights.length > 0 && (
                              <div className="mt-4">
                                <h5 className="font-medium text-gray-800 text-sm mb-2">Highlights:</h5>
                                <ul className="list-disc list-inside space-y-1">
                                  {itinerary.highlights.map((highlight: string, index: number) => (
                                    <li key={index} className="text-xs text-gray-600">{highlight}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>

                    </div>
                    
                    {/* Click to expand indicator and calendar integration */}
                    <div className="px-6 pb-4 pt-2 border-t border-gray-200 bg-gray-50">
                      <div className="flex justify-between items-start">
                        <p className="text-xs text-gray-400">
                          Saved on {favorite.createdAt?.seconds ? 
                            new Date(favorite.createdAt.seconds * 1000).toLocaleDateString() : 
                            'Unknown date'}
                        </p>
                        <p className="text-xs text-blue-500">
                          Click above to {expandedItems[favorite.id!] ? 'collapse' : 'expand'} details
                        </p>
                      </div>
                      
                      {/* Calendar Integration */}
                      <div className="flex gap-3 mt-3 justify-center">
                        {(() => {
                          const titleFirstHalf = favorite.title.split(/[-–|]/)[0].trim();
                          
                          const downloadICS = () => {
                            const startDate = favorite.date.replace(/-/g, "");
                            const startTime = favorite.startTime.replace(":", "");
                            const endTime = favorite.endTime.replace(":", "");
                            const dtStart = `${startDate}T${startTime}00`;
                            const dtEnd = `${startDate}T${endTime}00`;
                            const icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//DatePlanner//EN\nBEGIN:VEVENT\nUID:${favorite.id}@dateplanner\nDTSTAMP:${dtStart}\nDTSTART:${dtStart}\nDTEND:${dtEnd}\nSUMMARY:${titleFirstHalf}\nDESCRIPTION:Planned with DatePlanner!\nEND:VEVENT\nEND:VCALENDAR`;
                            const blob = new Blob([icsContent.replace(/\n/g, "\r\n")], { type: "text/calendar" });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = `${titleFirstHalf || "event"}.ics`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                          };

                          return (
                            <>
                              <a
                                href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(titleFirstHalf)}&dates=${favorite.date.replace(/-/g, '')}T${favorite.startTime.replace(':', '')}00/${favorite.date.replace(/-/g, '')}T${favorite.endTime.replace(':', '')}00&details=${encodeURIComponent(`Planned with DatePlanner!${itinerary?.theme ? '\nTheme: ' + itinerary.theme : ''}${itinerary?.highlights && itinerary.highlights.length > 0 ? '\nHighlights: ' + itinerary.highlights.join(', ') : ''}`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-full p-2 shadow-md transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                title="Add to Google Calendar"
                              >
                                <Image src="/googleCalendar.png" alt="Google Calendar" width={32} height={32} />
                              </a>
                              <button
                                onClick={downloadICS}
                                className="rounded-full p-2 shadow-md transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-blue-300"
                                title="Download ICS for Apple/Outlook"
                              >
                                <Image src="/outlookCalendar.png" alt="Apple/Outlook Calendar" width={32} height={32} />
                              </button>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}