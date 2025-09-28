"use client";
// Helper components & hooks for feedback modal.
// Usage examples:
// 1. Simple button:
//    <FeedbackButton label="Rate session" />
// 2. Programmatic open:
//    const { open } = useFeedback();
//    open({
//      title: "Rate your purchase",
//      successTitle: "Thanks!",
//      successMessage: "We appreciate your input.",
//      showRatingSummary: true,
//      autoCloseDelay: 4000, // or null to disable auto close
//      onSubmitted: async (data) => await fetch('/api/feedback',{method:'POST', body: JSON.stringify(data)})
//    });

import React from "react";
import { useFeedback } from "./FeedbackContext";
import { OpenFeedbackOptions } from "@/interface/Feedback";

export function FeedbackButton({ label = "Feedback", ...opts }: { label?: string } & OpenFeedbackOptions) {
  const { open } = useFeedback();
  return (
    <button
      type="button"
      onClick={() => open(opts)}
      className="inline-flex items-center gap-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2 shadow-sm transition"
    >
      <span>★</span>
      <span>{label}</span>
    </button>
  );
}

export { useFeedback } from "./FeedbackContext";