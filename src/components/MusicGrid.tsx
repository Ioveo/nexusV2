
// src/components/MusicGrid.tsx

import React from 'react';
import { GalleryTrack } from '../types';

// --- UTILS ---

const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
};

const getRandomDuration = (id: string) => {
    const seed = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const totalSec = 150 + (seed % 120); 
    return formatTime(totalSec);
};

const PlayIcon = () => (
    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
);

const PauseIcon = () => (
    <div className="flex gap-1 h-5 items-center justify-center">
        <div className="w-1.5 h-4 bg-current"></div>
        <div className="w-1.5 h-4 bg-current"></div>
    </div>
);

// --- NEW COMPONENTS FOR MUSIC GRID ---

// 1. HERO VISUALIZER (CSS Animated Bars)
const HeroVisualizer = ({ isPlaying }: { isPlaying: boolean }) => (
    <div className="flex items-end gap-1 h-32 opacity-80">
        {[...Array(12)].map((_, i) => (
            <div 
                key={i} 
                className={`w-3 bg-acid rounded-t-sm shadow-[0_0_10px_#ccff00] transition-all duration-300 ${isPlaying ? 'animate-[pulse-fast_0.5s_ease-in-out_infinite_alternate]' : 'h-2 opacity-30'}`}
                style={{ 
                    height: isPlaying ? `${Math.random() * 80 + 20}%` : '10%',
                    animationDelay: `${i * 0.05}s`,
                    animationDuration: `${0.4 + Math.random() * 0.4}s` 
                }}
            ></div>
        ))}
    </div>
);

// 2. SPINNING VINYL (Hero Right Side)
const SpinningVinyl = ({ coverUrl, isPlaying }: { coverUrl: string, isPlaying: boolean }) => (
    <div className="relative w-[300px] h-[300px] md:w-[500px] md:h-[500px] flex items-center justify-center">
        {/* Vinyl Disc */}
        <div className={`absolute inset-0 rounded-full bg-black border-4 border-[#1a1a1a] shadow-2xl flex items-center justify-center overflow-hidden ${isPlaying ? 'animate-spin-slow' : ''}`}>
             {/* Texture */}
             <div className="absolute inset-0 bg-[repeating-radial-gradient(#111_0,#111_2px,#000_3px,#000_4px)] opacity-80"></div>
             {/* Label / Cover */}
             <div className="w-1/2 h-1/2 rounded-full overflow-hidden border-4 border-black relative z-10">
                 <img src={coverUrl} className="w-full h-full object-cover" />
             </div>
        </div>
        {/* Glow behind */}
        <div className={`absolute inset-0 rounded-full bg-acid blur-[100px] opacity-20 transition-opacity duration-1000 ${isPlaying ? 'opacity-40 scale-110' : ''} z-[-1]`}></div>
    </div>
);

// 3. PERSPECTIVE CARDS (3D Tilt for Trending)
const PerspectiveRow = ({ tracks, onPlay, playingId }: { tracks: GalleryTrack[], onPlay: (id: string) => void, playingId: string | null }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tracks.slice(0, 3).map(track => {
            const isPlaying = playingId === track.id;
            return (
                <div 
                    key={track.id} 
                    onClick={() => onPlay(track.id)}
                    className="group relative h-64 rounded-2xl cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:-translate-y-2"
                >
                    <div className="absolute inset-0 rounded-2xl overflow-hidden border border-white/5 group-hover:border-acid/50 transition-colors shadow-2xl bg-[#111]">
                        <img src={track.coverUrl} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 p-6 w-full">
                            <div className="text-acid font-mono text-[10px] uppercase tracking-widest mb-1">Trending #{Math.floor(Math.random()*10)+1}</div>
                            <h3 className="text-2xl font-display font-bold text-white mb-1 truncate">{track.title}</h3>
                            <p className="text-sm text-slate-300">{track.artist}</p>
                        </div>
                        {/* Play Overlay */}
                        <div className={`absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isPlaying ? 'opacity-100' : ''}`}>
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isPlaying ? 'bg-acid text-black' : 'bg-white text-black'}`}>
                                {isPlaying ? <PauseIcon /> : <PlayIcon />}
                            </div>
                        </div>
                    </div>
                </div>
            );
        })}
    </div>
);

// 4. NEON LIST (New Arrivals)
const NeonList = ({ tracks, onPlay, playingId }: { tracks: GalleryTrack[], onPlay: (id: string) => void, playingId: string | null }) => (
    <div className="flex flex-col gap-2">
        {tracks.slice(0, 5).map((track, idx) => {
            const isPlaying = playingId === track.id;
            return (
                <div 
                    key={track.id} 
                    onClick={() => onPlay(track.id)}
                    className={`flex items-center gap-4 p-3 rounded-xl border transition-all duration-300 cursor-pointer group hover:scale-[1.01] ${isPlaying ? 'bg-white/10 border-acid/50' : 'bg-[#0a0a0a] border-white/5 hover:bg-white/5 hover:border-white/20'}`}
                >
                    <div className={`w-6 text-center font-display font-bold text-lg ${idx < 3 ? 'text-acid' : 'text-slate-600'}`}>{(idx + 1).toString().padStart(2, '0')}</div>
                    <div className="relative w-12 h-12 rounded overflow-hidden shrink-0">
                        <img src={track.coverUrl} className="w-full h-full object-cover" />
                        {isPlaying && <div className="absolute inset-0 bg-acid/80 flex items-center justify-center text-black"><PauseIcon /></div>}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className={`font-bold text-sm truncate ${isPlaying ? 'text-acid' : 'text-white'}`}>{track.title}</h4>
                        <div className="text-xs text-slate-500 truncate">{track.artist}</div>
                    </div>
                    <div className="text-xs font-mono text-slate-600 group-hover:text-white transition-colors">{getRandomDuration(track.id)}</div>
                </div>
            );
        })}
    </div>
);

// 5. WIDE SWIMLANE (For You)
const SwimlaneRow = ({ tracks, onPlay, playingId }: { tracks: GalleryTrack[], onPlay: (id: string) => void, playingId: string | null }) => (
    <div className="flex gap-6 overflow-x-auto pb-8 hide-scrollbar snap-x">
        {tracks.map(track => {
            const isPlaying = playingId === track.id;
            return (
                <div 
                    key={track.id} 
                    onClick={() => onPlay(track.id)}
                    className="flex-none w-[200px] snap-start group cursor-pointer"
                >
                    <div className={`relative aspect-square rounded-2xl overflow-hidden mb-4 border transition-all duration-300 ${isPlaying ? 'border-acid shadow-[0_0_20px_rgba(204,255,0,0.3)] scale-105' : 'border-white/5 hover:border-white/30 hover:scale-105'}`}>
                        <img src={track.coverUrl} className="w-full h-full object-cover" />
                        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                             <div className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md ${isPlaying ? 'bg-acid text-black' : 'bg-white/20 text-white hover:bg-white hover:text-black'}`}>
                                {isPlaying ? <PauseIcon /> : <PlayIcon />}
                            </div>
                        </div>
                    </div>
                    <div>
                        <h4 className={`font-bold text-base truncate mb-1 ${isPlaying ? 'text-acid' : 'text-white'}`}>{track.title}</h4>
                        <div className="text-xs text-slate-500">{track.artist}</div>
                    </div>
                </div>
            );
        })}
    </div>
);

// --- MAIN MUSIC GRID COMPONENT ---
export const MusicGrid: React.FC<{ tracks: GalleryTrack[], onPlay: (id:string)=>void, playingId: string|null }> = ({ tracks, onPlay, playingId }) => {
    if (tracks.length === 0) return (
        <div className="flex items-center justify-center h-[50vh] text-slate-500 font-mono flex-col gap-4">
            <div className="w-16 h-16 border-2 border-slate-700 rounded-full flex items-center justify-center text-3xl">?</div>
            <p>暂无音频档案 (NO AUDIO ARCHIVES)</p>
        </div>
    );

    // Sort/Filter Logic
    const heroTrack = tracks.find(t => t.isHero) || tracks[0];
    const newArrivals = [...tracks].sort((a, b) => b.addedAt - a.addedAt).slice(0, 10);
    const trending = [...tracks].sort(() => 0.5 - Math.random()).slice(0, 10);
    const forYou = [...tracks].filter(t => t.id !== heroTrack.id).slice(0, 10);

    const isHeroPlaying = playingId === heroTrack.id;

    return (
        <div className="w-full pb-32 -mt-24">
            
            {/* 1. INTERACTIVE HERO SECTION */}
            <div className="relative w-full h-screen min-h-[700px] mb-12 flex items-center overflow-hidden">
                {/* Dynamic BG */}
                <div className="absolute inset-0 z-0">
                    <img src={heroTrack.coverUrl} className="w-full h-full object-cover blur-[100px] opacity-40 scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent"></div>
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                </div>

                <div className="relative z-10 w-full max-w-[1600px] mx-auto px-4 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    
                    {/* Left: Info & Controls */}
                    <div className="flex flex-col items-start gap-8 pt-24 md:pt-0">
                        <div className="flex items-center gap-3">
                             <span className="w-1 h-8 bg-acid shadow-[0_0_15px_#ccff00]"></span>
                             <div className="flex flex-col">
                                 <span className="text-acid font-mono text-sm tracking-[0.3em] uppercase font-bold">Featured Track</span>
                                 <span className="text-slate-500 text-[10px] uppercase tracking-widest">Sonic Laboratory V5</span>
                             </div>
                        </div>
                        
                        <h1 className="text-6xl md:text-8xl lg:text-9xl font-display font-black text-white leading-[0.85] tracking-tighter drop-shadow-2xl mix-blend-overlay">
                            {heroTrack.title}
                        </h1>
                        
                        <div className="flex items-center gap-6">
                            <img src={heroTrack.coverUrl} className="w-12 h-12 rounded-full border border-white/20" />
                            <div className="text-xl md:text-2xl text-white font-light tracking-wide">{heroTrack.artist}</div>
                        </div>

                        <div className="flex items-center gap-6 mt-4">
                            <button 
                                onClick={() => onPlay(heroTrack.id)} 
                                className={`px-10 py-5 font-bold text-lg uppercase tracking-widest rounded-full flex items-center gap-4 transition-all shadow-2xl hover:scale-105 ${isHeroPlaying ? 'bg-acid text-black shadow-acid/40' : 'bg-white text-black shadow-white/20'}`}
                            >
                                {isHeroPlaying ? (
                                    <><PauseIcon /> <span>暂停播放</span></>
                                ) : (
                                    <><PlayIcon /> <span>立即试听</span></>
                                )}
                            </button>
                            <div className="hidden md:block">
                                <HeroVisualizer isPlaying={isHeroPlaying} />
                            </div>
                        </div>
                    </div>

                    {/* Right: Spinning Vinyl (Hidden on mobile) */}
                    <div className="hidden lg:flex justify-center items-center perspective-[2000px]">
                         <div className="transform rotate-y-12 rotate-x-6 hover:rotate-y-0 hover:rotate-x-0 transition-transform duration-1000 ease-out">
                             <SpinningVinyl coverUrl={heroTrack.coverUrl} isPlaying={isHeroPlaying} />
                         </div>
                    </div>
                </div>
            </div>

            {/* 2. CONTENT SECTIONS */}
            <div className="relative z-20 max-w-[1600px] mx-auto px-4 md:px-12 space-y-24">
                
                {/* Section A: Trending & New Arrivals Split */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Trending (2/3) */}
                    <div className="lg:col-span-2">
                         <div className="flex items-end justify-between mb-8 pb-2 border-b border-white/10">
                            <h2 className="text-3xl font-display font-bold text-white uppercase tracking-tight">时下流行 <span className="text-acid">///</span></h2>
                            <span className="text-xs font-mono text-slate-500">GLOBAL TRENDS</span>
                         </div>
                         <PerspectiveRow tracks={trending} onPlay={onPlay} playingId={playingId} />
                    </div>

                    {/* New Arrivals (1/3) */}
                    <div className="lg:col-span-1">
                        <div className="flex items-end justify-between mb-8 pb-2 border-b border-white/10">
                            <h2 className="text-3xl font-display font-bold text-white uppercase tracking-tight">最新上架</h2>
                            <span className="text-xs font-mono text-slate-500">FRESH DROPS</span>
                         </div>
                         <NeonList tracks={newArrivals} onPlay={onPlay} playingId={playingId} />
                    </div>
                </div>

                {/* Section B: For You (Wide Slider) */}
                <div>
                     <div className="flex items-end justify-between mb-8 pb-2 border-b border-white/10">
                        <h2 className="text-3xl font-display font-bold text-white uppercase tracking-tight">为您推荐 <span className="text-purple-500">///</span></h2>
                        <span className="text-xs font-mono text-slate-500">CURATED FOR YOU</span>
                     </div>
                     <SwimlaneRow tracks={forYou} onPlay={onPlay} playingId={playingId} />
                </div>

            </div>
        </div>
    );
};
