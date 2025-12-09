
import React, { useEffect, useRef, useState } from 'react';

interface LyricsViewProps {
  title: string;
  artist: string;
  coverUrl: string;
  lyrics?: string;
  currentTime: number;
  onSeek: (time: number) => void;
  onClose: () => void;
}

interface LrcLine {
  time: number;
  text: string;
}

export const LyricsView: React.FC<LyricsViewProps> = ({ 
  title, 
  artist, 
  coverUrl, 
  lyrics, 
  currentTime, 
  onSeek,
  onClose 
}) => {
  const [parsedLyrics, setParsedLyrics] = useState<LrcLine[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse LRC
  useEffect(() => {
    if (!lyrics) {
        setParsedLyrics([]);
        return;
    }

    const lines = lyrics.split('\n');
    const parsed: LrcLine[] = [];
    const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;

    lines.forEach(line => {
      const match = line.match(timeRegex);
      if (match) {
        const min = parseInt(match[1]);
        const sec = parseInt(match[2]);
        const ms = parseInt(match[3]);
        const time = min * 60 + sec + ms / 1000;
        const text = line.replace(timeRegex, '').trim();
        if (text) {
            parsed.push({ time, text });
        }
      }
    });

    setParsedLyrics(parsed);
  }, [lyrics]);

  // Sync Active Line
  useEffect(() => {
    if (parsedLyrics.length === 0) return;
    
    // Find the current line based on time
    let index = parsedLyrics.findIndex(l => l.time > currentTime) - 1;
    if (index < 0) {
        // If we haven't reached the first line yet, or if findIndex returned -1 (meaning all lines are past, so take last one)
        // If findIndex returns -1 because ALL times are greater, it means we are at start (-1 - 1 = -2). 
        // If findIndex returns -1 because NO times are greater (end of song), it returns -1. Wait.
        // findIndex returns -1 if NO element satisfies condition (so all lines are effectively "before" or "current").
        // In that case index should be length - 1.
        
        // Let's use a simpler loop for robustness
        index = 0;
        for (let i = 0; i < parsedLyrics.length; i++) {
            if (currentTime >= parsedLyrics[i].time) {
                index = i;
            } else {
                break;
            }
        }
    }
    setActiveIndex(index);
  }, [currentTime, parsedLyrics]);

  // Auto Scroll
  useEffect(() => {
      if (containerRef.current && parsedLyrics.length > 0) {
          const activeEl = containerRef.current.children[activeIndex] as HTMLElement;
          if (activeEl) {
              activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
      }
  }, [activeIndex]);

  if (!lyrics && parsedLyrics.length === 0) {
      // Fallback for no lyrics
      return (
        <div className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-3xl flex flex-col items-center justify-center animate-fade-in">
             <div className="absolute inset-0 z-0 opacity-30">
                <img src={coverUrl} className="w-full h-full object-cover blur-[100px]" />
            </div>
            <button onClick={onClose} className="absolute top-8 right-8 text-white/50 hover:text-white z-50">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="relative z-10 text-center p-8">
                <div className="w-64 h-64 mx-auto rounded-2xl overflow-hidden shadow-2xl mb-8 border border-white/10">
                    <img src={coverUrl} className="w-full h-full object-cover" />
                </div>
                <h2 className="text-3xl font-display font-bold text-white mb-2">{title}</h2>
                <p className="text-xl text-slate-400 mb-8">{artist}</p>
                <p className="text-slate-500 font-mono">暂无歌词数据 / No Lyrics Available</p>
            </div>
        </div>
      );
  }

  return (
    <div className="fixed inset-0 z-[120] bg-[#050505] flex flex-col animate-fade-in overflow-hidden">
        {/* Blurred Background */}
        <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
            <img src={coverUrl} className="w-full h-full object-cover blur-[120px] scale-110" />
            <div className="absolute inset-0 bg-black/40"></div>
        </div>

        {/* Header */}
        <div className="relative z-20 px-8 py-6 flex justify-between items-center">
             <div className="flex flex-col">
                 <span className="text-xs font-mono text-lime-400 uppercase tracking-widest mb-1">Now Playing</span>
                 <h1 className="text-xl font-bold text-white">{title}</h1>
             </div>
             <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors backdrop-blur-md">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
             </button>
        </div>

        {/* Layout: Cover Left (Desktop) / Lyrics Center */}
        <div className="flex-1 relative z-10 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-24 p-8 lg:p-16 overflow-hidden">
            
            {/* Left: Cover Art (Hidden on mobile to save space for lyrics, or make smaller) */}
            <div className="hidden lg:block shrink-0">
                <div className="w-[400px] h-[400px] rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 relative group">
                    <img src={coverUrl} className="w-full h-full object-cover" />
                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                </div>
                <div className="mt-8 text-center">
                    <h2 className="text-3xl font-display font-bold text-white mb-2">{title}</h2>
                    <p className="text-xl text-slate-400 font-light">{artist}</p>
                </div>
            </div>

            {/* Right: Scrolling Lyrics */}
            <div className="w-full max-w-2xl h-full relative">
                {/* Mask gradients for smooth fade */}
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#050505]/0 to-transparent z-10 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#050505]/0 to-transparent z-10 pointer-events-none"></div>

                <div 
                    ref={containerRef} 
                    className="h-full overflow-y-auto custom-scrollbar px-4 py-[40vh] space-y-8 text-center"
                    style={{ scrollBehavior: 'smooth' }}
                >
                    {parsedLyrics.map((line, i) => {
                        const isActive = i === activeIndex;
                        return (
                            <p 
                                key={i}
                                onClick={() => onSeek(line.time)}
                                className={`
                                    cursor-pointer transition-all duration-500 ease-out origin-center
                                    ${isActive 
                                        ? 'text-3xl md:text-4xl font-bold text-white scale-100 blur-0 opacity-100' 
                                        : 'text-xl md:text-2xl font-medium text-slate-500 scale-95 blur-[1px] opacity-40 hover:opacity-70 hover:blur-0'
                                    }
                                `}
                            >
                                {line.text}
                            </p>
                        );
                    })}
                </div>
            </div>
        </div>
    </div>
  );
};