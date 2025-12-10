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
    // Generate a consistent pseudo-random duration between 2:30 and 4:30 based on ID
    const seed = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const totalSec = 150 + (seed % 120); 
    return formatTime(totalSec);
};

// --- ANIMATION HERO COMPONENT ---
const SonicWaveHero = () => {
    return (
        <div className="w-full h-[300px] md:h-[400px] bg-[#0a0a0a] rounded-3xl overflow-hidden relative border border-white/10 group mb-12">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a] to-[#050505]"></div>
            
            {/* Animated Bars */}
            <div className="absolute inset-0 flex items-center justify-center gap-2 md:gap-4 opacity-70">
                {Array.from({ length: 20 }).map((_, i) => (
                    <div 
                        key={i} 
                        className="w-3 md:w-6 bg-gradient-to-t from-purple-600 to-cyan-400 rounded-full animate-pulse"
                        style={{ 
                            height: `${30 + Math.random() * 50}%`,
                            animationDuration: `${0.5 + Math.random()}s`,
                            animationDelay: `${i * 0.05}s`
                        }}
                    ></div>
                ))}
            </div>

            {/* Overlay Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-8 text-center">
                <h1 className="text-4xl md:text-7xl font-display font-black text-white tracking-tighter mb-4 drop-shadow-2xl">
                    SONIC <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">UNIVERSE</span>
                </h1>
                <p className="text-slate-400 font-mono text-xs md:text-sm uppercase tracking-[0.3em] bg-black/50 backdrop-blur px-4 py-2 rounded-full border border-white/10">
                    Discover The Next Generation Sound
                </p>
            </div>
            
            {/* Bottom Fade */}
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#050505] to-transparent"></div>
        </div>
    );
};

// --- MAIN MUSIC GRID COMPONENT ---
export const MusicGrid: React.FC<{ tracks: GalleryTrack[], onPlay: (id:string)=>void, playingId: string|null }> = ({ tracks, onPlay, playingId }) => {
    if (tracks.length === 0) return (
        <div className="text-center py-20 text-slate-500 font-mono">
            NO TRACKS FOUND IN ARCHIVE
        </div>
    );

    // Sort by newest for "New Arrivals" (top 4)
    const sortedTracks = [...tracks].sort((a, b) => b.addedAt - a.addedAt);
    const newArrivals = sortedTracks.slice(0, 4);
    // The rest for the list
    const hotList = sortedTracks.slice(4); 
    // If not enough tracks, just show all in list too or duplicate logic
    const listDisplay = sortedTracks; // Let's show all in list for completeness, or just hotList

    return (
        <div className="w-full pb-20">
            {/* 1. HERO ANIMATION */}
            <SonicWaveHero />

            {/* 2. NEW ARRIVALS (GRID OF 4) */}
            <section className="mb-16">
                <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                    <span className="w-2 h-8 bg-purple-500 rounded-full"></span>
                    最新上架 <span className="text-sm font-normal text-slate-500 font-mono ml-2">// NEW_ARRIVALS</span>
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {newArrivals.map(track => {
                         const isPlaying = playingId === track.id;
                         return (
                            <div key={track.id} onClick={() => onPlay(track.id)} className="group cursor-pointer">
                                <div className={`aspect-square rounded-2xl overflow-hidden relative mb-4 border transition-all duration-300 ${isPlaying ? 'border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.3)]' : 'border-white/10 hover:border-white/30'}`}>
                                    <img src={track.coverUrl} className={`w-full h-full object-cover transition-transform duration-700 ${isPlaying ? 'scale-110' : 'group-hover:scale-110'}`} />
                                    <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md ${isPlaying ? 'bg-purple-500 text-white' : 'bg-white/20 text-white hover:bg-white hover:text-black'}`}>
                                            {isPlaying ? (
                                                <div className="flex gap-1 h-4 items-end">
                                                    <div className="w-1 bg-current animate-[bounce_1s_infinite]"></div>
                                                    <div className="w-1 bg-current animate-[bounce_1.2s_infinite]"></div>
                                                    <div className="w-1 bg-current animate-[bounce_0.8s_infinite]"></div>
                                                </div>
                                            ) : (
                                                <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h4 className={`font-bold text-base truncate mb-1 ${isPlaying ? 'text-purple-400' : 'text-white group-hover:text-purple-400 transition-colors'}`}>{track.title}</h4>
                                    <p className="text-xs text-slate-500 font-mono truncate">{track.artist}</p>
                                </div>
                            </div>
                         );
                    })}
                </div>
            </section>

            {/* 3. HOT SONGS LIST */}
            <section>
                 <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                    <span className="w-2 h-8 bg-cyan-500 rounded-full"></span>
                    热门歌曲 <span className="text-sm font-normal text-slate-500 font-mono ml-2">// TOP_CHARTS</span>
                </h3>
                
                <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden">
                    {/* Header */}
                    <div className="grid grid-cols-[50px_auto_1fr_1fr_80px] md:grid-cols-[60px_60px_2fr_1.5fr_1.5fr_80px] gap-4 p-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-white/5">
                        <div className="text-center">#</div>
                        <div className="hidden md:block">Cover</div>
                        <div>Title</div>
                        <div>Artist</div>
                        <div className="hidden md:block">Album / Source</div>
                        <div className="text-right pr-4">Time</div>
                    </div>

                    {/* Rows */}
                    <div className="divide-y divide-white/5">
                        {listDisplay.map((track, index) => {
                             const isPlaying = playingId === track.id;
                             return (
                                <div 
                                    key={track.id} 
                                    onClick={() => onPlay(track.id)}
                                    className={`grid grid-cols-[50px_auto_1fr_1fr_80px] md:grid-cols-[60px_60px_2fr_1.5fr_1.5fr_80px] gap-4 p-3 md:p-4 items-center hover:bg-white/5 transition-colors cursor-pointer group ${isPlaying ? 'bg-white/5' : ''}`}
                                >
                                    <div className="text-center font-mono text-slate-500 text-sm flex items-center justify-center">
                                        {isPlaying ? (
                                            <span className="text-purple-400 animate-pulse">▶</span>
                                        ) : (
                                            <span className="group-hover:text-white">{index + 1}</span>
                                        )}
                                    </div>
                                    <div className="hidden md:block">
                                        <img src={track.coverUrl} className="w-10 h-10 rounded bg-slate-800 object-cover" />
                                    </div>
                                    <div className="font-bold text-sm text-white truncate group-hover:text-purple-400 transition-colors">
                                        {track.title}
                                    </div>
                                    <div className="text-xs text-slate-400 truncate">
                                        {track.artist}
                                    </div>
                                    <div className="hidden md:block text-xs text-slate-500 truncate font-mono">
                                        {track.album || (track.sourceType === 'local' ? 'NEXUS Originals' : 'External Source')}
                                    </div>
                                    <div className="text-right pr-4 text-xs font-mono text-slate-500">
                                        {track.duration || getRandomDuration(track.id)}
                                    </div>
                                </div>
                             );
                        })}
                    </div>
                </div>
            </section>
        </div>
    );
};
