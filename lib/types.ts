export interface UserProfile {
  domains: string[];
  tone: 'playful' | 'balanced' | 'rigorous';
  background: string;
  name?: string;
}

export interface ExplanationLevel {
  level: 1 | 2 | 3;
  label: string;
  content: string;
}

export interface Explanation {
  id: string;
  concept: string;
  domain: string;
  domainEmoji: string;
  levels: ExplanationLevel[];
  timestamp: Date;
}

export const INTEREST_DOMAINS = [
  { id: 'music', label: 'Music', emoji: '🎵' },
  { id: 'cooking', label: 'Cooking', emoji: '🍳' },
  { id: 'sports', label: 'Sports', emoji: '⚽' },
  { id: 'cinema', label: 'Cinema & stories', emoji: '🎬' },
  { id: 'gaming', label: 'Gaming', emoji: '🎮' },
  { id: 'nature', label: 'Nature & biology', emoji: '🌿' },
  { id: 'architecture', label: 'Architecture', emoji: '🏛️' },
  { id: 'fashion', label: 'Fashion & design', emoji: '✂️' },
  { id: 'travel', label: 'Travel & geography', emoji: '✈️' },
  { id: 'finance', label: 'Finance & markets', emoji: '📈' },
  { id: 'philosophy', label: 'Philosophy', emoji: '💭' },
  { id: 'technology', label: 'Technology', emoji: '💻' },
  { id: 'art', label: 'Visual art', emoji: '🎨' },
  { id: 'psychology', label: 'Psychology', emoji: '🧠' },
  { id: 'writing', label: 'Writing & literature', emoji: '📖' },
  { id: 'relationships', label: 'Relationships', emoji: '🤝' },
];

export const BACKGROUNDS = [
  { id: 'highschool', label: 'High school' },
  { id: 'humanities', label: 'University — humanities' },
  { id: 'stem', label: 'University — STEM' },
  { id: 'professional', label: 'Working professional' },
  { id: 'graduate', label: 'Graduate / researcher' },
];
