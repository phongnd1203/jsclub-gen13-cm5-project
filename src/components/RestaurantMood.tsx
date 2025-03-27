import React from 'react';
import { Sun, Moon, PartyPopper as Party, Coffee, Users, Music, Laptop, Utensils } from 'lucide-react';

interface MoodProps {
  text: string;
  time?: string;
}

const moodMap = {
  romantic: {
    icon: <Moon className="h-5 w-5 text-pink-500" />,
    color: 'bg-pink-50',
    text: 'Romantic Vibes',
  },
  energetic: {
    icon: <Party className="h-5 w-5 text-purple-500" />,
    color: 'bg-purple-50',
    text: 'Energetic & Fun',
  },
  cozy: {
    icon: <Coffee className="h-5 w-5 text-amber-500" />,
    color: 'bg-amber-50',
    text: 'Cozy & Relaxed',
  },
  social: {
    icon: <Users className="h-5 w-5 text-blue-500" />,
    color: 'bg-blue-50',
    text: 'Social Hotspot',
  },
  quiet: {
    icon: <Laptop className="h-5 w-5 text-gray-500" />,
    color: 'bg-gray-50',
    text: 'Quiet & Peaceful',
  },
  lively: {
    icon: <Music className="h-5 w-5 text-green-500" />,
    color: 'bg-green-50',
    text: 'Lively Atmosphere',
  },
};

export function detectMood(text: string, time?: string): keyof typeof moodMap {
  const hour = time ? new Date(time).getHours() : new Date().getHours();
  const words = text.toLowerCase();

  // Time-based detection
  if (hour >= 20 || hour <= 5) {
    if (words.includes('date') || words.includes('romantic') || words.includes('intimate')) {
      return 'romantic';
    }
    return 'lively';
  }

  // Keyword-based detection
  if (words.includes('quiet') || words.includes('peaceful') || words.includes('work')) {
    return 'quiet';
  }
  if (words.includes('friends') || words.includes('group') || words.includes('party')) {
    return 'social';
  }
  if (words.includes('cozy') || words.includes('comfortable') || words.includes('relax')) {
    return 'cozy';
  }
  if (words.includes('music') || words.includes('fun') || words.includes('energetic')) {
    return 'energetic';
  }

  // Default based on time
  if (hour >= 6 && hour <= 11) return 'cozy';
  if (hour >= 12 && hour <= 16) return 'social';
  if (hour >= 17 && hour <= 19) return 'lively';
  return 'energetic';
}

export function RestaurantMood({ text, time }: MoodProps) {
  const mood = detectMood(text, time);
  const { icon, color, text: moodText } = moodMap[mood];

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${color}`}>
      {icon}
      <span className="text-sm font-medium">{moodText}</span>
    </div>
  );
}