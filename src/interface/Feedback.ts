export type FeedbackType = 'user-experience' | 'performance' | 'product_service' | 'transactional';

export interface FeedbackData {
  rating: number;
  comment: string;              // Frontend canonical text body
  feedbackType: FeedbackType;   // Frontend canonical type
  message?: string;             // Mirror of comment when sending to backend
  createdAt?: string;
  userId?: string;
  // Allow extension (e.g., orderId, userId)
  meta?: Record<string, any>;
}

export interface OpenFeedbackOptions {
  title?: string;
  subtitle?: string;
  submitLabel?: string;
  homeLabel?: string;
  rejoinLabel?: string;
  meta?: Record<string, any>;
  onSubmitted?: (data: FeedbackData) => void | Promise<void>;
  onClosed?: () => void;
  // Success screen customization
  successTitle?: string;
  successMessage?: string;
  showRatingSummary?: boolean; // show rating + comment snippet on success
  autoCloseDelay?: number | null; // ms. null disables auto close
}

export interface FeedbackContextValue {
  open: (options?: OpenFeedbackOptions) => void;
  close: () => void;
  isOpen: boolean;
}