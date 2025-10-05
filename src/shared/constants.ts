// Shared constants and utilities for the DatePlanner form and components

export const steps = [
  { key: "date", title: "Date" },
  { key: "time", title: "Time" },
  { key: "budget", title: "Budget" },
  { key: "activities", title: "Activities" },
  { key: "cuisines", title: "Restaurants" },
  { key: "review", title: "Review & Export" },
] as const;

export type StepKey = (typeof steps)[number]["key"];

export function classNames(...xs: (string | false | undefined)[]) {
  return xs.filter(Boolean).join(" ");
}