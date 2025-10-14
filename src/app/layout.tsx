import "../styles/globals.css";
import { FeedbackProvider } from "../components/FeedbackContext";
import { AuthProvider } from "@/context/AuthContext";
import React from 'react';
import Chatbot from "@/components/Chatbot";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="app-root" suppressHydrationWarning>
        <AuthProvider>
          <FeedbackProvider>{children}</FeedbackProvider>
        </AuthProvider>
        <Chatbot />
      </body>
    </html>
  );
}
