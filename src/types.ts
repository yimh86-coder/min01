export type Gender = 'boy' | 'girl';
export type AppTheme = 'pink' | 'skyblue';

export interface ChildProfile {
  id: string;
  name: string;
  nickname: string;
  birthDate: string; // YYYY-MM-DD
  gender: Gender;
  bloodType?: string;
  birthHeight?: number; // cm
  birthWeight?: number; // kg
  photoUrl?: string;
  heroVideoUrl?: string;
}

export interface GrowthRecord {
  id: string;
  date: string; // YYYY-MM-DD
  ageMonths: number;
  height: number; // cm
  weight: number; // kg
  headCircumference?: number; // cm
  memo?: string;
}

export interface DiaryEntry {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  content: string;
  photoUrl?: string;
  mood: 'happy' | 'excited' | 'sleepy' | 'crying' | 'curious' | 'proud';
  tags: string[];
  height?: number;
  weight?: number;
}

export interface MilestoneItem {
  id: string;
  category: 'motor' | 'social' | 'language' | 'feeding' | 'teeth' | 'special';
  ageRange: '0-3m' | '4-6m' | '7-12m' | '1-2y' | '2y+';
  title: string;
  description: string;
  achieved: boolean;
  achievedDate?: string;
  notes?: string;
  photoUrl?: string;
}

export interface ToothRecord {
  id: string; // e.g., 'upper-central-incisor-left'
  name: string;
  type: 'central-incisor' | 'lateral-incisor' | 'canine' | 'first-molar' | 'second-molar';
  arch: 'upper' | 'lower';
  side: 'left' | 'right';
  typicalMonthRange: string;
  erupted: boolean;
  eruptedDate?: string;
  notes?: string;
}

export type PhotoCategory =
  | '첫걸음마'
  | '생일'
  | '여행'
  | '일상'
  | '기념일'
  | '이유식'
  | '가족'
  | '기타';

export interface AlbumPhoto {
  id: string;
  photoUrl: string;
  date: string; // YYYY-MM-DD
  category: string; // e.g., '첫걸음마', '생일', '여행', etc.
  title: string;
  memo?: string;
  location?: string;
  tags?: string[];
  isFavorite?: boolean;
}

export type BgmTrackId = 'akmu' | 'yoon' | 'custom' | 'none';

export interface MoviePeriodFilter {
  type: 'all' | '1m' | '3m' | '6m' | '1y' | 'custom' | 'category';
  startDate?: string;
  endDate?: string;
  category?: string;
}

