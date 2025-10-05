"use client";
import React from "react";
import { steps, classNames } from "../app/form";

interface Step {
  key: string;
  title: string;
}

interface BreadcrumbsProps {
  currentStep: number;
  onStepClick: (index: number) => void;
}

export default function Breadcrumbs({ currentStep, onStepClick }: BreadcrumbsProps) {
  const progress = (currentStep / (steps.length - 1)) * 100;

  return (
    <nav className="w-full bg-white/5 backdrop-blur-md border-t border-indigo-100/20">
      <div className="mx-auto w-full max-w-3xl py-6 px-4 md:px-8">
        <ol className="flex items-center justify-between gap-4 text-xs md:text-sm font-medium text-indigo-700">
          {steps.map((step: Step, index: number) => (
            <li key={step.key} className="flex-1">
              <button
                onClick={() => onStepClick(index)}
                className={classNames(
                  "w-full text-left transition-colors px-2 group",
                  index <= currentStep ? "text-indigo-700" : "text-slate-400"
                )}
                disabled={index > currentStep + 1}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={classNames(
                      "grid h-6 w-6 place-items-center rounded-full border text-[11px] md:text-xs transition-colors",
                      index < currentStep
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : index === currentStep
                        ? "bg-indigo-100 text-indigo-700 border-indigo-300"
                        : "bg-white/10 border-slate-300/30 text-slate-400"
                    )}
                  >
                    {index + 1}
                  </span>
                  <span className="hidden sm:inline">{step.title}</span>
                </div>
              </button>
            </li>
          ))}
        </ol>
        <div className="h-2 w-full rounded-full bg-white/10 mt-6 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </nav>
  );
}

