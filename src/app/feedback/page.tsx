"use client";
import React from "react";
import { useFeedback } from "@feedback/FeedbackContext";

// Demo page to manually trigger the feedback modal in different configurations
export default function FeedbackDemoPage() {
	const { open } = useFeedback();

	const handleBasic = () => {
		open({
			title: "Session feedback",
			subtitle: "Let us know how your experience was",
			onSubmitted: async (data) => {
				// Simulate network latency
				await new Promise(r => setTimeout(r, 800));
				console.log("Feedback submitted (basic):", data);
			}
		});
	};

	const handleCustomSuccess = () => {
		open({
			title: "Rate your delivery",
			subtitle: "How was the delivery experience?",
			submitLabel: "Send rating",
			homeLabel: "Back home",
			rejoinLabel: "Track again",
			successTitle: "Thanks for rating!",
			successMessage: "Your feedback helps us improve logistics and delivery speed.",
			showRatingSummary: true,
			autoCloseDelay: null, // keep success screen open until user closes
			meta: { source: "feedback-demo", context: "custom-success" },
			onSubmitted: async (data) => {
				await new Promise(r => setTimeout(r, 1000));
				console.log("Feedback submitted (custom):", data);
			},
			onClosed: () => console.log("Feedback modal closed")
		});
	};

	return (
		<div className="min-h-[60vh] flex flex-col items-center justify-center gap-10 px-6 py-16">
			<div className="text-center space-y-4 max-w-xl">
				<h1 className="text-4xl font-bold tracking-tight">Feedback Modal Demo</h1>
				<p className="text-gray-500">Use the buttons below to open the reusable feedback modal in different modes. This page is only for development/demo purposes and can be removed later.</p>
			</div>
			<div className="flex flex-col sm:flex-row gap-6">
				<button
					onClick={handleBasic}
					className="px-8 py-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-lg transition"
				>
					Open basic feedback
				</button>
				<button
					onClick={handleCustomSuccess}
					className="px-8 py-4 rounded-2xl bg-white border border-gray-300 hover:border-gray-400 text-gray-800 font-semibold shadow-lg transition"
				>
					Open custom success example
				</button>
			</div>
			<div className="pt-4 text-xs text-gray-400">Path: app/feedback/page.tsx</div>
		</div>
	);
}

