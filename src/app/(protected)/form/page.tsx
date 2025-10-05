"use client";
import DatePlanner from "./form";
import Breadcrumbs from "../../../components/Breadcrumbs";
import React, { useState } from "react";
import Link from "next/link";
import { SignedIn, UserButton } from "@clerk/nextjs";
import "../../../../styles/Header.css";

// Custom Header Component for Protected Form Page using Header.css
const ProtectedHeader = () => {
  return (
    <header className="header sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <img
            src="./logo.png"
            alt="DatePlanner Logo"
            className="h-14 w-14 border-2 border-gray-800 rounded-full"
          />
          <span className="text-xl font-bold text-custom-sage">DatePlanner</span>
        </Link>

        <div className="flex gap-4 items-center">
          <SignedIn>
            <Link href="/profile">
              <button className="bg-custom-mint hover:bg-custom-sage text-white font-black py-2 px-4 rounded transition-colors">
                Profile
              </button>
            </Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </header>
  );
};

export default function ProtectedDashboard() {
  // For Breadcrumbs, sync with DatePlanner's stepIndex
  const [stepIndex, setStepIndex] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-200">
      <ProtectedHeader />
      <div className="w-full flex flex-col items-center">
        <div className="w-full max-w-4xl px-6 md:px-10 mt-2">
          <Breadcrumbs currentStep={stepIndex} onStepClick={setStepIndex} />
        </div>
        <main className="w-full">
          {/* Pass stepIndex and setStepIndex to DatePlanner for sync, or keep DatePlanner logic as is if not needed */}
          <DatePlanner stepIndex={stepIndex} setStepIndex={setStepIndex} />
        </main>
      </div>
    </div>
  );
}