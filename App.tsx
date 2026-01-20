
import React, { useState, useEffect, useRef } from 'react';
import { Camera, Plus, MapPin, Send, Image as ImageIcon, Sparkles, Loader2, Mic, Type, X, ChevronDown, Plane } from 'lucide-react';
import { TravelEntry, ActiveInput } from './types';
import TimelineItem from './components/TimelineItem';
import CameraCapture from './components/CameraCapture';
import { enhanceMemoryAndGetWeather } from './services/geminiService';

const App: React.FC = () => {
  const [entries, setEntries] = useState<TravelEntry[]>([]);
  const [activeInput, setActiveInput] = useState<ActiveInput>('none');
  const [showCamera, setShowCamera] = useState(false);
  
  const [newEntryText, setNewEntryText] = useState('');
  const [newEntryImage, setNewEntryImage] = useState<string | null>(null);
  const [newEntryLocation, setNewEntryLocation] = useState('Current Location');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem('wanderlog_entries');
    if (saved) setEntries(JSON.parse(saved));

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setNewEntryText(transcript);
      };
    }
  }, []);

  const saveEntries = (newEntries: TravelEntry[]) => {
    setEntries(newEntries);
    localStorage.setItem('wanderlog_entries', JSON.stringify(newEntries));
  };

  const handleAddEntry = async () => {
    if (!newEntryText && !newEntryImage) return;

    setIsProcessing(true);
    const { enhancement, weather } = await enhanceMemoryAndGetWeather(newEntryText, newEntryLocation, newEntryImage || undefined);

    const entry: TravelEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      text: newEntryText || (activeInput === 'photo' ? "A captured moment." : ""),
      imageUrl: newEntryImage || undefined,
      location: newEntryLocation,
      weather: weather,
      aiEnhancement: enhancement,
      type: activeInput === 'none' ? 'text' : activeInput as any
    };

    saveEntries([entry, ...entries]);
    resetInput();
  };

  const resetInput = () => {
    setNewEntryText('');
    setNewEntryImage(null);
    setIsProcessing(false);
    setActiveInput('none');
    setIsRecording(false);
    if (recognitionRef.current) recognitionRef.current.stop();
  };

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      setNewEntryText('');
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  return (
    <div className="flex justify-center bg-zinc-200 min-h-screen">
      {/* iPhone 16 Experience Container */}
      <div className="relative w-full max-w-[430px] bg-[#FBFBFE] shadow-2xl min-h-screen flex flex-col overflow-hidden">
        
        {/* Dynamic Island / Status Area */}
        <div className="safe-top h-12 w-full flex items-center justify-center pt-2">
          <div className="w-32 h-7 bg-black rounded-full shadow-lg flex items-center justify-center">
            <div className="w-2 h-2 bg-zinc-800 rounded-full mr-12"></div>
            <div className="w-1 h-1 bg-zinc-800 rounded-full"></div>
          </div>
        </div>

        {/* Header */}
        <header className="px-6 py-6 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center text-white">
                <Plane size={14} />
              </div>
              <p className="text-zinc-400 text-[10px] font-extrabold uppercase tracking-[0.2em]">Travel Journal</p>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">WanderLog</h1>
          </div>
          <div className="w-10 h-10 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400">
            <Sparkles size={18} />
          </div>
        </header>

        {/* Main Timeline Content */}
        <main className="flex-1 px-6 overflow-y-auto pb-40 no-scrollbar">
          {entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 bg-blue-50/50 rounded-3xl flex items-center justify-center text-blue-500 mb-6 border border-blue-100/50">
                <Plus size={32} />
              </div>
              <p className="font-bold text-zinc-900 mb-2">Ready for your next trip?</p>
              <p className="text-zinc-400 text-sm max-w-[200px] font-medium leading-relaxed">
                Use the buttons below to record your first memory.
              </p>
            </div>
          ) : (
            entries.map((entry, idx) => (
              <TimelineItem 
                key={entry.id} 
                entry={entry} 
                isLast={idx === entries.length - 1} 
              />
            ))
          )}
        </main>

        {/* In-place Recording Layer */}
        {activeInput !== 'none' && (
          <div className="absolute inset-0 z-50 flex items-end bg-black/30 backdrop-blur-sm animate-in fade-in duration-300">
            <div 
              className="w-full bg-white rounded-t-[40px] p-8 pb-12 shadow-2xl animate-in slide-in-from-bottom-full duration-500 ease-out"
              style={{ paddingBottom: 'calc(3rem + env(safe-area-inset-bottom))' }}
            >
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-zinc-900 rounded-2xl flex items-center justify-center text-white">
                    {activeInput === 'photo' && <Camera size={20} />}
                    {activeInput === 'voice' && <Mic size={20} />}
                    {activeInput === 'text' && <Type size={20} />}
                  </div>
                  <h3 className="text-xl font-bold capitalize">New {activeInput}</h3>
                </div>
                <button onClick={resetInput} className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-500 active:scale-90 transition-transform">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                {activeInput === 'photo' && (
                  <div className="relative group">
                    {newEntryImage ? (
                      <div className="relative rounded-3xl overflow-hidden aspect-[4/3] shadow-lg">
                        <img src={newEntryImage} className="w-full h-full object-cover" />
                        <button 
                          onClick={() => setNewEntryImage(null)} 
                          className="absolute top-4 right-4 bg-black/60 backdrop-blur-md p-2 rounded-full text-white active:scale-90"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setShowCamera(true)}
                        className="w-full h-48 border-2 border-dashed border-zinc-100 bg-zinc-50/50 rounded-3xl flex flex-col items-center justify-center text-zinc-400 gap-3 hover:bg-zinc-50 transition-colors"
                      >
                        <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-zinc-300">
                          <Camera size={28} />
                        </div>
                        <span className="text-xs font-bold tracking-wider uppercase">Open Camera</span>
                      </button>
                    )}
                  </div>
                )}

                {activeInput === 'voice' && (
                  <div className="flex flex-col items-center py-4 gap-6">
                    <button 
                      onClick={toggleRecording}
                      className={`w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-xl ${isRecording ? 'bg-red-500 animate-pulse scale-110' : 'bg-blue-600'}`}
                    >
                      <Mic size={40} className="text-white" />
                    </button>
                    <p className={`text-sm font-bold tracking-wide transition-colors ${isRecording ? 'text-red-500' : 'text-zinc-400'}`}>
                      {isRecording ? "Transcribing Voice..." : "Tap to start recording"}
                    </p>
                  </div>
                )}

                <div className="bg-zinc-50 rounded-[28px] p-5 border border-zinc-100 focus-within:ring-2 focus-within:ring-zinc-900/5 transition-all">
                  <textarea 
                    autoFocus
                    placeholder="Capture the feeling of this moment..."
                    value={newEntryText}
                    onChange={(e) => setNewEntryText(e.target.value)}
                    className="w-full h-28 bg-transparent border-none focus:ring-0 resize-none text-[16px] font-medium placeholder:text-zinc-300"
                  />
                  <div className="flex items-center gap-3 mt-4 pt-4 border-t border-zinc-100/50">
                    <MapPin size={16} className="text-blue-500" />
                    <input 
                      type="text" 
                      value={newEntryLocation}
                      onChange={(e) => setNewEntryLocation(e.target.value)}
                      className="flex-1 bg-transparent border-none focus:ring-0 text-[13px] font-bold text-zinc-500"
                    />
                  </div>
                </div>

                <button 
                  onClick={handleAddEntry}
                  disabled={isProcessing || (!newEntryText && !newEntryImage)}
                  className="w-full bg-zinc-900 text-white py-5 rounded-3xl font-bold shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-20"
                >
                  {isProcessing ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <Plus size={20} />
                  )}
                  <span>{isProcessing ? "AI Enhancing..." : "Save to Timeline"}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Floating Navigation Toolbar */}
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[320px] z-[60] safe-bottom">
          <div className="bg-white/80 backdrop-blur-2xl border border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-full p-2 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setActiveInput('photo')}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${activeInput === 'photo' ? 'bg-zinc-900 text-white' : 'text-zinc-400 hover:bg-zinc-100'}`}
              >
                <Camera size={22} />
              </button>
              <button 
                onClick={() => setActiveInput('voice')}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${activeInput === 'voice' ? 'bg-zinc-900 text-white' : 'text-zinc-400 hover:bg-zinc-100'}`}
              >
                <Mic size={22} />
              </button>
              <button 
                onClick={() => setActiveInput('text')}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${activeInput === 'text' ? 'bg-zinc-900 text-white' : 'text-zinc-400 hover:bg-zinc-100'}`}
              >
                <Type size={22} />
              </button>
            </div>
            <div className="w-[1px] h-8 bg-zinc-100 mx-2"></div>
            <button 
              onClick={() => setActiveInput(activeInput === 'none' ? 'text' : 'none')}
              className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all ${activeInput === 'none' ? 'bg-blue-600 text-white' : 'bg-zinc-100 text-zinc-500 rotate-180'}`}
            >
              {activeInput === 'none' ? <Plus size={28} /> : <ChevronDown size={28} />}
            </button>
          </div>
        </div>

        {/* iPhone Home Bar Indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-zinc-900 rounded-full opacity-[0.05] pointer-events-none"></div>
      </div>

      {showCamera && (
        <CameraCapture 
          onCapture={(img) => { setNewEntryImage(img); setShowCamera(false); }}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
};

export default App;
