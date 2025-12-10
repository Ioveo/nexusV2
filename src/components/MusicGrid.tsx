
import React, { useState, useEffect, useMemo } from 'react';
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

// 1. HERO CAROUSEL
const HeroCarousel = ({ tracks, onPlay, playingId }: { tracks: GalleryTrack[], onPlay: (id: string) => void, playingId: string | null }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    // Auto rotate
    useEffect(() => {
        if (isHovered || tracks.length === 0) return;
        const interval = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % tracks.length);
        }, 6000);
        return () => clearInterval(interval);
    }, [tracks.length, isHovered]);

    if (tracks.length === 0) return null;

    const currentTrack = tracks[currentIndex];
    const isPlaying = playingId === currentTrack.id;

    const handleNext = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCurrentIndex(prev => (prev + 1) % tracks.length);
    };

    return (
        <div 
            className="relative w-full h-[85vh] min-h-[600px] mb-12 overflow-hidden group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Background Layers */}
            {tracks.map((track, idx) => (
                <div 
                    key={track.id}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                >
                    <img src={track.coverUrl} className="w-full h-full object-cover blur-[0px]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent"></div>
                </div>
            ))}

            {/* Content Content */}
            <div className="absolute inset-0 z-20 flex flex-col justify-end p-8 md:p-16 lg:p-24 pb-32 max-w-[1600px] mx-auto w-full">
                <div className="transition-all duration-700 transform translate-y-0 opacity-100">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="px-3 py-1 bg-white/10 backdrop-blur border border-white/20 text-acid text-[10px] font-black uppercase tracking-[0.2em] rounded">
                            Featured
                        </span>
                        <div className="flex gap-1">
                            {tracks.map((_, idx) => (
                                <div key={idx} className={`w-8 h-1 rounded-full transition-colors ${idx === currentIndex ? 'bg-acid' : 'bg-white/20'}`}></div>
                            ))}
                        </div>
                    </div>

                    <h1 className="text-6xl md:text-8xl lg:text-9xl font-display font-black text-white leading-[0.85] tracking-tighter drop-shadow-2xl mb-8 max-w-4xl line-clamp-2">
                        {currentTrack.title}
                    </h1>

                    <div className="flex items-center gap-6 mb-12">
                        <div className="flex -space-x-4">
                            <img src={currentTrack.coverUrl} className="w-12 h-12 rounded-full border-2 border-black object-cover" />
                            <div className="w-12 h-12 rounded-full border-2 border-black bg-white/10 backdrop-blur flex items-center justify-center text-[10px] font-bold">
                                {currentTrack.sourceType === 'local' ? 'HIFI' : 'WEB'}
                            </div>
                        </div>
                        <div className="text-2xl text-white font-light tracking-wide">{currentTrack.artist}</div>
                    </div>

                    <div className="flex items-center gap-6">
                        <button 
                            onClick={() => onPlay(currentTrack.id)} 
                            className={`group relative px-10 py-5 font-bold text-lg uppercase tracking-widest rounded-full flex items-center gap-4 transition-all shadow-2xl hover:scale-105 overflow-hidden ${isPlaying ? 'bg-acid text-black' : 'bg-white text-black'}`}
                        >
                            <span className="relative z-10 flex items-center gap-3">
                                {isPlaying ? <PauseIcon /> : <PlayIcon />}
                                <span>{isPlaying ? 'PAUSE' : 'PLAY NOW'}</span>
                            </span>
                            {/* Shine effect */}
                            <div className="absolute inset-0 bg-white/50 transform -translate-x-full group-hover:translate-x-full transition-transform duration-500 ease-out z-0 skew-x-12"></div>
                        </button>
                        
                        <button onClick={handleNext} className="w-14 h-14 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 hover:border-white text-white transition-all backdrop-blur-md">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Right Side Navigation (Hidden on mobile) */}
            <div className="absolute right-12 top-1/2 -translate-y-1/2 z-30 hidden lg:flex flex-col gap-4">
                {tracks.map((t, idx) => (
                    <button 
                        key={t.id}
                        onClick={() => setCurrentIndex(idx)}
                        className={`w-16 h-24 rounded-lg border overflow-hidden transition-all duration-300 relative group ${idx === currentIndex ? 'border-acid scale-110 shadow-[0_0_20px_#ccff0080]' : 'border-white/20 opacity-50 hover:opacity-100 hover:scale-105'}`}
                    >
                        <img src={t.coverUrl} className="w-full h-full object-cover" />
                        {idx === currentIndex && <div className="absolute inset-0 bg-acid/20"></div>}
                    </button>
                ))}
            </div>
        </div>
    );
};

// 2. PERSPECTIVE CARDS (3D Tilt for Trending)
const PerspectiveRow = ({ tracks, onPlay, playingId }: { tracks: GalleryTrack[], onPlay: (id: string) => void, playingId: string | null }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tracks.slice(0, 3).map((track, i) => {
            const isPlaying = playingId === track.id;
            return (
                <div 
                    key={track.id} 
                    onClick={() => onPlay(track.id)}
                    className="group relative h-72 rounded-3xl cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:-translate-y-2 perspective-1000"
                >
                    <div className="absolute inset-0 rounded-3xl overflow-hidden border border-white/5 group-hover:border-acid/50 transition-colors shadow-2xl bg-[#111]">
                        <img src={track.coverUrl} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
                        
                        <div className="absolute bottom-0 left-0 p-8 w-full">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-acid font-mono text-[10px] uppercase tracking-widest">#{i + 1} Trending</span>
                            </div>
                            <h3 className="text-3xl font-display font-bold text-white mb-1 truncate">{track.title}</h3>
                            <p className="text-sm text-slate-300">{track.artist}</p>
                        </div>
                        
                        {/* Play Overlay */}
                        <div className={`absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isPlaying ? 'opacity-100' : ''}`}>
                            <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-transform duration-300 group-hover:scale-110 ${isPlaying ? 'bg-acid text-black' : 'bg-white text-black'}`}>
                                {isPlaying ? <PauseIcon /> : <PlayIcon />}
                            </div>
                        </div>
                    </div>
                </div>
            );
        })}
    </div>
);

// 3. NEON LIST (New Arrivals)
const NeonList = ({ tracks, onPlay, playingId }: { tracks: GalleryTrack[], onPlay: (id: string) => void, playingId: string | null }) => (
    <div className="flex flex-col gap-3">
        {tracks.slice(0, 6).map((track, idx) => {
            const isPlaying = playingId === track.id;
            return (
                <div 
                    key={track.id} 
                    onClick={() => onPlay(track.id)}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 cursor-pointer group hover:scale-[1.01] ${isPlaying ? 'bg-white/10 border-acid/50' : 'bg-[#0a0a0a] border-white/5 hover:bg-white/5 hover:border-white/20'}`}
                >
                    <div className={`w-6 text-center font-display font-bold text-lg ${idx < 3 ? 'text-acid' : 'text-slate-600'}`}>{(idx + 1).toString().padStart(2, '0')}</div>
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 shadow-lg">
                        <img src={track.coverUrl} className="w-full h-full object-cover" />
                        {isPlaying && <div className="absolute inset-0 bg-acid/80 flex items-center justify-center text-black"><PauseIcon /></div>}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className={`font-bold text-base truncate ${isPlaying ? 'text-acid' : 'text-white'}`}>{track.title}</h4>
                        <div className="text-xs text-slate-500 truncate">{track.artist}</div>
                    </div>
                    <div className="text-xs font-mono text-slate-600 group-hover:text-white transition-colors">{getRandomDuration(track.id)}</div>
                </div>
            );
        })}
    </div>
);

// 4. WIDE SWIMLANE (For You)
const SwimlaneRow = ({ tracks, onPlay, playingId }: { tracks: GalleryTrack[], onPlay: (id: string) => void, playingId: string | null }) => (
    <div className="flex gap-8 overflow-x-auto pb-8 hide-scrollbar snap-x">
        {tracks.map(track => {
            const isPlaying = playingId === track.id;
            return (
                <div 
                    key={track.id} 
                    onClick={() => onPlay(track.id)}
                    className="flex-none w-[240px] snap-start group cursor-pointer"
                >
                    <div className={`relative aspect-square rounded-3xl overflow-hidden mb-5 border transition-all duration-300 ${isPlaying ? 'border-acid shadow-[0_0_30px_rgba(204,255,0,0.2)] scale-105' : 'border-white/5 hover:border-white/30 hover:scale-105'}`}>
                        <img src={track.coverUrl} className="w-full h-full object-cover" />
                        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                             <div className={`w-14 h-14 rounded-full flex items-center justify-center backdrop-blur-md shadow-xl ${isPlaying ? 'bg-acid text-black' : 'bg-white/20 text-white hover:bg-white hover:text-black'}`}>
                                {isPlaying ? <PauseIcon /> : <PlayIcon />}
                            </div>
                        </div>
                    </div>
                    <div>
                        <h4 className={`font-bold text-lg truncate mb-1 ${isPlaying ? 'text-acid' : 'text-white'}`}>{track.title}</h4>
                        <div className="text-sm text-slate-500">{track.artist}</div>
                    </div>
                </div>
            );
        })}
    </div>
);

// --- MAIN MUSIC GRID COMPONENT ---
export const MusicGrid: React.FC<{ tracks: GalleryTrack[], onPlay: (id:string)=>void, playingId: string|null }> = ({ tracks, onPlay, playingId }) => {
    
    // 1. MEMOIZE LISTS TO PREVENT JUMPING
    const { heroTracks, newArrivals, trending, forYou } = useMemo(() => {
        if (tracks.length === 0) return { heroTracks: [], newArrivals: [], trending: [], forYou: [] };
        
        const sortedByDate = [...tracks].sort((a, b) => b.addedAt - a.addedAt);
        const hero = tracks.filter(t => t.isHero);
        
        // If no hero tracks, take top 5 newest as hero
        const finalHero = hero.length > 0 ? hero : sortedByDate.slice(0, 5);
        
        // Pseudo-random sort that stays stable until tracks change
        const shuffle = [...tracks].sort((a, b) => {
            const valA = a.id.charCodeAt(0) + a.title.length;
            const valB = b.id.charCodeAt(0) + b.title.length;
            return valA - valB;
        });

        return {
            heroTracks: finalHero,
            newArrivals: sortedByDate.slice(0, 10),
            trending: shuffle.slice(0, 6), // Top 6 trending
            forYou: shuffle.slice(6, 16)   // Next 10 for you
        };
    }, [tracks]);

    if (tracks.length === 0) return (
        <div className="flex items-center justify-center h-[50vh] text-slate-500 font-mono flex-col gap-4">
            <div className="w-16 h-16 border-2 border-slate-700 rounded-full flex items-center justify-center text-3xl">?</div>
            <p>暂无音频档案 (NO AUDIO ARCHIVES)</p>
        </div>
    );

    return (
        <div className="w-full pb-32 -mt-24">
            
            {/* 1. HERO CAROUSEL */}
            <HeroCarousel tracks={heroTracks} onPlay={onPlay} playingId={playingId} />

            {/* 2. CONTENT SECTIONS */}
            <div className="relative z-20 max-w-[1600px] mx-auto px-4 md:px-12 space-y-24">
                
                {/* Section A: Trending & New Arrivals Split */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                    {/* Trending (2/3) */}
                    <div className="lg:col-span-2">
                         <div className="flex items-end justify-between mb-10 pb-4 border-b border-white/10">
                            <div>
                                <h2 className="text-4xl font-display font-black text-white uppercase tracking-tight">时下流行 <span className="text-acid">///</span></h2>
                                <p className="text-xs font-mono text-slate-500 mt-2 tracking-widest">GLOBAL TRENDS ANALYTICS</p>
                            </div>
                         </div>
                         <PerspectiveRow tracks={trending} onPlay={onPlay} playingId={playingId} />
                    </div>

                    {/* New Arrivals (1/3) */}
                    <div className="lg:col-span-1">
                        <div className="flex items-end justify-between mb-10 pb-4 border-b border-white/10">
                            <div>
                                <h2 className="text-4xl font-display font-black text-white uppercase tracking-tight">最新上架</h2>
                                <p className="text-xs font-mono text-slate-500 mt-2 tracking-widest">JUST ARRIVED</p>
                            </div>
                         </div>
                         <NeonList tracks={newArrivals} onPlay={onPlay} playingId={playingId} />
                    </div>
                </div>

                {/* Section B: For You (Wide Slider) */}
                <div>
                     <div className="flex items-end justify-between mb-10 pb-4 border-b border-white/10">
                        <div>
                            <h2 className="text-4xl font-display font-black text-white uppercase tracking-tight">为您推荐 <span className="text-purple-500">///</span></h2>
                            <p className="text-xs font-mono text-slate-500 mt-2 tracking-widest">ALGORITHMIC CURATION</p>
                        </div>
                     </div>
                     <SwimlaneRow tracks={forYou} onPlay={onPlay} playingId={playingId} />
                </div>

            </div>
        </div>
    );
};
