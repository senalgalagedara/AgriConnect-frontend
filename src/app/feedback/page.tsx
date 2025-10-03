"use client";
import React from "react";
import { useFeedback } from "@/components/FeedbackContext";

export default function FeedbackPage() {
	const { open } = useFeedback();

	const handleFeedback = () => {
		open({
			title: "Share Your Feedback",
			subtitle: "Help us improve AgriConnect by sharing your thoughts and experiences",
			submitLabel: "Submit Feedback",
			homeLabel: "Return to Home",
			successTitle: "Thank you for your feedback!",
			successMessage: "Your feedback helps us create a better experience for everyone.",
			showRatingSummary: true,
			autoCloseDelay: null,
			meta: { context: "platform-feedback" },
			onSubmitted: async (data) => {
				await new Promise(r => setTimeout(r, 1000));
				console.log("Feedback submitted:", data);
			}
		});
	};

	return (
		<div className="min-h-[60vh] flex flex-col items-center justify-center gap-10 px-6 py-16">
			<div className="text-center space-y-4 max-w-xl">
				<h1 className="text-4xl font-bold tracking-tight">Feedback</h1>
				<p className="text-gray-500">
					We value your feedback! Your input helps us improve AgriConnect and provide better service to our community.
				</p>
			</div>
			<div className="flex justify-center w-full">
				<button
					onClick={handleFeedback}
					className="px-12 py-6 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-lg transition flex items-center gap-3"
				>
					<span className="text-xl">★</span>
					<span>Share Your Feedback</span>
				</button>
			</div>
			<div className="text-center text-sm text-gray-500 max-w-md">
				<p>You can provide feedback on user experience, performance, products/services, or transactions through our feedback form.</p>
			</div>
		</div>
	);
}

