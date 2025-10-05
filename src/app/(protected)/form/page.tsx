"use client";
import DatePlanner from "./form";
import Breadcrumbs from "../../../components/Breadcrumbs";
import ProtectedHeader from "../../../components/ProtectedHeader";
import React, { useState } from "react";

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