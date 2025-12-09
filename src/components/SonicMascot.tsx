
import React, { useState, useEffect, useRef } from 'react';

interface SonicMascotProps {
  isPlaying: boolean;
  audioData?: Uint8Array; // Optional real audio data
  sourceType: 'local' | 'external' | 'netease' | 'qq' | 'link' | null;
}

export const SonicMascot: React.FC<SonicMascotProps> = ({ isPlaying, audioData, sourceType }) => {
  const [position, setPosition] = useState({ x: window.innerWidth - 150, y: window.innerHeight - 200 });
  const [isDragging, setIsDragging] = useState(false);
  const [relPos, setRelPos] = useState({ x: 0, y: 0 });
  const [energy, setEnergy] = useState(1);
  const mascotRef = useRef<HTMLDivElement>(null);

  // --- Dragging Logic ---
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!mascotRef.current) return;
    setIsDragging(true);
    const rect = mascotRef.current.getBoundingClientRect();
    setRelPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      // Boundary checks
      const newX = Math.min(Math.max(0, e.clientX - relPos.x), window.innerWidth - 80);
      const newY = Math.min(Math.max(0, e.clientY - relPos.y), window.innerHeight - 80);
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, relPos]);

  // --- Beat Simulation Logic ---
  useEffect(() => {
    let animationFrame: number;
    
    const loop = (timestamp: number) => {
      if (!isPlaying) {
        setEnergy(1);
        return;
      }

      // 1. Real Audio Reactivity (Local Files)
      if (sourceType === 'local' && audioData && audioData.length > 0) {
        // Calculate average volume from bass frequencies (first few bins)
        let sum = 0;
        const bassBins = 8;
        for(let i=0; i<bassBins; i++) {
            sum += audioData[i];
        }
        const avg = sum / bassBins;
        // Map 0-255 to scale 1.0 - 1.4
        const scale = 1 + (avg / 255) * 0.4;
        setEnergy(scale);
      } 
      // 2. Simulated Reactivity (External/NetEase Links due to CORS)
      // If we are playing but have no audio data (or it's external), simulate a beat
      else {
        // A simple sine wave bounce roughly at 120 BPM (500ms interval)
        const beatDuration = 500; 
        const progress = (timestamp % beatDuration) / beatDuration;
        
        // Snap scale for a "kick" effect
        // 0.0 -> 0.2 is the kick (scale up), 0.2 -> 1.0 is release
        if (progress < 0.2) {
             // Linear interpolation 1.0 -> 1.25
             setEnergy(1 + (progress * 5) * 0.25);
        } else {
             // Linear interpolation 1.25 -> 1.0
             setEnergy(1.25 - ((progress - 0.2) * 1.25) * 0.25);
        }
      }

      animationFrame = requestAnimationFrame(loop);
    };

    animationFrame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrame);
  }, [isPlaying, audioData, sourceType]);


  return (
    <div 
      ref={mascotRef}
      onMouseDown={handleMouseDown}
      className="fixed z-[100] cursor-grab active:cursor-grabbing transition-transform duration-75 ease-out select-none"
      style={{ 
        left: position.x, 
        top: position.y,
        transform: `scale(${energy}) rotate(${isDragging ? '10deg' : '0deg'})`,
      }}
    >
      {/* --- THE MASCOT: "NOTE-BOY" --- */}
      <div className="relative w-24 h-24">
         
         {/* Aura Glow */}
         <div className={`absolute inset-0 rounded-full blur-xl transition-all duration-500 ${isPlaying ? 'bg-lime-400/60 animate-pulse' : 'bg-cyan-500/20'}`}></div>

         {/* Head Body */}
         <div className="absolute inset-2 bg-[#1a1a1a] rounded-full border-2 border-white/20 shadow-2xl flex items-center justify-center overflow-hidden">
            
            {/* Visor / Face Area */}
            <div className="w-16 h-10 bg-black rounded-lg flex items-center justify-center gap-2 relative z-10 border border-white/5">
                {/* Eyes */}
                {isPlaying ? (
                    <>
                        <div className="w-3 h-1 bg-lime-400 rounded-full animate-bounce shadow-[0_0_5px_#84cc16]"></div>
                        <div className="w-3 h-1 bg-lime-400 rounded-full animate-bounce shadow-[0_0_5px_#84cc16]" style={{ animationDelay: '0.1s' }}></div>
                    </>
                ) : (
                    <>
                        <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                    </>
                )}
            </div>

            {/* Headphones */}
            <div className="absolute left-[-5px] top-1/2 -translate-y-1/2 w-4 h-12 bg-slate-700 rounded-r-lg border-l border-white/10"></div>
            <div className="absolute right-[-5px] top-1/2 -translate-y-1/2 w-4 h-12 bg-slate-700 rounded-l-lg border-r border-white/10"></div>
            <div className="absolute top-[-5px] left-1/2 -translate-x-1/2 w-20 h-20 rounded-full border-[6px] border-slate-700 border-b-transparent z-0"></div>

         </div>

         {/* Music Note Stem (Hair/Antenna) */}
         <div className={`absolute -top-6 right-0 w-2 h-16 bg-gradient-to-t from-slate-700 to-lime-400 rounded-full origin-bottom transition-transform duration-200 ${isPlaying ? 'animate-[wave_0.5s_ease-in-out_infinite_alternate]' : ''}`}>
             <div className="absolute -top-2 -right-2 w-6 h-4 bg-lime-400 rounded-full shadow-[0_0_10px_#84cc16]"></div>
         </div>

         {/* Chat Bubble (Status) */}
         <div className={`absolute -top-12 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-bold px-2 py-1 rounded-lg opacity-0 transition-opacity whitespace-nowrap ${isDragging ? 'opacity-100' : ''}`}>
            {isPlaying ? "VIBING!" : "Zzz..."}
         </div>

      </div>
    </div>
  );
};
