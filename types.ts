
export interface TravelEntry {
  id: string;
  timestamp: number;
  text: string;
  imageUrl?: string;
  location?: string;
  weather?: {
    temp: string;
    condition: string;
    icon: string;
  };
  aiEnhancement?: string;
  type: 'photo' | 'voice' | 'text';
}

export type ActiveInput = 'none' | 'photo' | 'voice' | 'text';
