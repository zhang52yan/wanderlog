
import React from 'react';
import { MapPin, Clock, Quote, Cloud, Sun, CloudRain } from 'lucide-react';
import { TravelEntry } from '../types';

interface TimelineItemProps {
  entry: TravelEntry;
  isLast: boolean;
}

const TimelineItem: React.FC<TimelineItemProps> = ({ entry, isLast }) => {
  const date = new Date(entry.timestamp);
  const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dayString = date.toLocaleDateString([], { month: 'short', day: 'numeric' });

  return (
    <div className="flex gap-4 mb-10 group relative animate-in fade-in slide-in-from-left-4 duration-500">
      <div className="flex flex-col items-center">
        <div className="w-3 h-3 rounded-full bg-blue-500 ring-4 ring-blue-50 z-10"></div>
        {!isLast && <div className="w-[2px] flex-1 bg-gradient-to-b from-blue-100 to-transparent mt-2 mb-2"></div>}
      </div>
      
      <div className="flex-1">
        <div className="glass-card rounded-[24px] p-5 shadow-sm border border-white/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold mb-1">
                {dayString} • {timeString}
              </span>
              {entry.location && (
                <div className="flex items-center gap-1.5 text-zinc-800 font-bold">
                  <MapPin size={14} className="text-blue-500" />
                  <span className="text-sm">{entry.location}</span>
                </div>
              )}
            </div>

            {entry.weather && (
              <div className="flex items-center gap-2 bg-blue-50/50 px-3 py-1.5 rounded-full border border-blue-100">
                <span className="text-lg leading-none">{entry.weather.icon}</span>
                <span className="text-xs font-bold text-blue-600">{entry.weather.temp}</span>
              </div>
            )}
          </div>

          {entry.imageUrl && (
            <div className="mb-4 rounded-2xl overflow-hidden shadow-sm aspect-[4/3]">
              <img src={entry.imageUrl} alt="Memory" className="w-full h-full object-cover" />
            </div>
          )}

          <p className="text-zinc-700 text-[15px] leading-relaxed mb-4 font-medium">
            {entry.text}
          </p>

          {entry.aiEnhancement && (
            <div className="mt-4 pt-4 border-t border-zinc-100 flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 text-white">
                <Quote size={14} />
              </div>
              <p className="text-zinc-500 italic text-xs leading-relaxed self-center">
                {entry.aiEnhancement}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimelineItem;
