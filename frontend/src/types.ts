export interface StudentData {
  age: number;
  gender: 'Male' | 'Female';
  country: string;
  academic_level: 'High School' | 'Undergraduate' | 'Graduate';
  most_used_platform: string;
  purpose_of_use: 'Entertainment' | 'Education' | 'Networking' | 'News';
  avg_daily_usage_hours: number;
  daily_unlocks: number;
  study_hours: number;
  physical_activity_hours: number;
  sleep_hours_per_night: number;
  stress_level: 'Low' | 'Medium' | 'High' | 'Very High';
}

export interface PredictionResult {
  score: number;
  category: string;
  colorClass: string;
  emoji: string;
  recommendations: Recommendation[];
  insights: Insight[];
}

export interface Recommendation {
  emoji: string;
  color: string;
  text: string;
}

export interface Insight {
  icon: string;
  title: string;
  value: string;
  status: string;
}

export interface HistoryRecord {
  id: string;
  age: number;
  gender: string;
  country: string;
  academic_level: string;
  most_used_platform: string;
  purpose_of_use: string;
  avg_daily_usage_hours: number;
  daily_unlocks: number;
  study_hours: number;
  physical_activity_hours: number;
  sleep_hours_per_night: number;
  stress_level: string;
  predicted_score: number;
  created_at: string;
}

export const PLATFORMS = [
  'Instagram', 'Facebook', 'YouTube', 'TikTok', 'Twitter',
  'LinkedIn', 'Snapchat', 'WhatsApp', 'WeChat', 'LINE',
  'KakaoTalk', 'VKontakte',
];

export const COUNTRIES = [
  'India', 'USA', 'Canada', 'Australia', 'UK', 'Germany',
  'Mexico', 'Turkey', 'France', 'Other',
];

export const GENDERS = ['Male', 'Female'];

export const ACADEMIC_LEVELS = ['High School', 'Undergraduate', 'Graduate'];

export const PURPOSES = ['Entertainment', 'Education', 'Networking', 'News'];

export const STRESS_LEVELS = ['Low', 'Medium', 'High', 'Very High'];

export const DEFAULT_VALUES: StudentData = {
  age: 20,
  gender: 'Male',
  country: 'India',
  academic_level: 'Undergraduate',
  most_used_platform: 'Instagram',
  purpose_of_use: 'Entertainment',
  avg_daily_usage_hours: 3.0,
  daily_unlocks: 80,
  study_hours: 4.0,
  physical_activity_hours: 1.5,
  sleep_hours_per_night: 7.0,
  stress_level: 'Medium',
};
