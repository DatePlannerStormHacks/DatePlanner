import Header from "../../components/Header";
import ProtectedHeader from "../components/ProtectedHeader";

import { SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-200">
      {/* Conditional Header based on authentication */}
      <SignedOut>
        <Header />
      </SignedOut>
      <SignedIn>
        <ProtectedHeader />
      </SignedIn>
      
      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Plan Your Perfect Date
          </h1>
          <p className="text-xl text-gray-700 mb-8 leading-relaxed">
            DatePlanner uses artificial intelligence to create personalized date experiences 
            tailored to your budget, preferences, and location. From romantic dinners to 
            adventure activities - we&apos;ve got you covered.
          </p>

          {/* Different content for signed in vs signed out users */}
          <SignedOut>
            <div className="space-y-6">
              <p className="text-lg text-gray-600">
                Sign up now to start planning amazing dates!
              </p>
              <div className="flex gap-4 justify-center">
                <Link 
                  href="/signup"
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors"
                >
                  Get Started Free
                </Link>
                <Link 
                  href="/signin"
                  className="bg-white hover:bg-gray-50 text-purple-600 font-bold py-3 px-8 rounded-lg text-lg border-2 border-purple-600 transition-colors"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </SignedOut>

          <SignedIn>
            <div className="space-y-6">
              <p className="text-lg text-gray-600">
                Welcome back! Ready to plan your next amazing date?
              </p>
              <Link 
                href="/form"
                className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors"
              >
                Start Planning →
              </Link>
            </div>
          </SignedIn>
        </div>

        {/* Features Section */}
        <div className="mt-20 grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-white/70 backdrop-blur-sm rounded-lg p-6 text-center">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold mb-2 text-black">AI-Powered</h3>
            <p className="text-gray-600">Smart recommendations based on your preferences and budget</p>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-lg p-6 text-center">
            <div className="text-4xl mb-4">💝</div>
            <h3 className="text-xl font-semibold mb-2 text-black">Personalized</h3>
            <p className="text-gray-600">Tailored experiences for every couple and occasion</p>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-lg p-6 text-center">
            <div className="text-4xl mb-4">📅</div>
            <h3 className="text-xl font-semibold mb-2 text-black">Calendar Ready</h3>
            <p className="text-gray-600">Have it synced with your Google or Outlook Calendar</p>
          </div>
        </div>
      </main>
    </div>
  );
}
