
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

// --- COMPONENTS ---

const PlayIcon = () => (
    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
);

const PauseIcon = () => (
    <div className="flex gap-1 h-5 items-center justify-center">
        <div className="w-1.5 h-4 bg-current"></div>
        <div className="w-1.5 h-4 bg-current"></div>
    </div>
);

// Horizontal Scrolling Row (Swimlane)
const CategoryRow = ({ title, tracks, onPlay, playingId, filter }: { title: string, tracks: GalleryTrack[], onPlay: (id: string) => void, playingId: string | null, filter?: (t: GalleryTrack) => boolean }) => {
    const displayTracks = filter ? tracks.filter(filter) : tracks;
    if (displayTracks.length === 0) return null;

    return (
        <div className="mb-12 relative z-10">
            <h3 className="text-lg md:text-xl font-bold text-white mb-4 px-4 md:px-12 flex items-center gap-2 group cursor-pointer hover:text-cyan-400 transition-colors">
                {title} 
                <span className="text-xs text-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                    查看全部 <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </span>
            </h3>
            
            <div className="flex gap-4 overflow-x-auto pb-8 px-4 md:px-12 hide-scrollbar scroll-smooth snap-x">
                {displayTracks.map((track) => {
                    const isPlaying = playingId === track.id;
                    return (
                        <div 
                            key={track.id} 
                            onClick={() => onPlay(track.id)}
                            className="flex-none w-[160px] md:w-[220px] snap-start group cursor-pointer"
                        >
                            <div className={`relative aspect-square rounded-lg overflow-hidden mb-3 border transition-all duration-300 ${isPlaying ? 'border-lime-500 shadow-[0_0_20px_rgba(132,204,22,0.4)] scale-105' : 'border-white/5 hover:border-white/30 hover:scale-105'}`}>
                                <img src={track.coverUrl} className="w-full h-full object-cover" loading="lazy" />
                                <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md ${isPlaying ? 'bg-lime-500 text-black' : 'bg-white/20 text-white hover:bg-white hover:text-black'}`}>
                                        {isPlaying ? <PauseIcon /> : <PlayIcon />}
                                    </div>
                                </div>
                                <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/60 backdrop-blur rounded text-[9px] text-white font-mono">
                                    {track.duration || getRandomDuration(track.id)}
                                </div>
                            </div>
                            
                            <div className="pr-2">
                                <h4 className={`font-bold text-sm truncate leading-tight mb-1 ${isPlaying ? 'text-lime-400' : 'text-white group-hover:text-white'}`}>{track.title}</h4>
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <span className="truncate max-w-[100px]">{track.artist}</span>
                                    {track.isHero && <span className="px-1.5 py-0.5 rounded bg-lime-500/20 text-lime-400 text-[9px] font-bold uppercase">HOT</span>}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

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
    const trending = [...tracks].sort(() => 0.5 - Math.random()).slice(0, 10); // Simulated shuffle
    const forYou = [...tracks].filter(t => t.id !== heroTrack.id).slice(0, 10);
    const remixContest = [...tracks].slice(0, 5); // Placeholder

    return (
        <div className="w-full pb-32 -mt-24"> {/* Negative margin to pull under transparent navbar */}
            
            {/* 1. NETFLIX-STYLE HERO SECTION */}
            <div className="relative w-full h-[85vh] mb-12 group">
                <div className="absolute inset-0">
                    <img src={heroTrack.coverUrl} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent"></div>
                </div>

                <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 flex flex-col items-start justify-end h-full z-20 pb-24 md:pb-32 max-w-4xl">
                    <div className="flex items-center gap-3 mb-4 animate-fade-in">
                         <span className="w-1 h-6 bg-lime-500 shadow-[0_0_10px_#84cc16]"></span>
                         <span className="text-lime-400 font-mono text-sm tracking-[0.3em] uppercase">本周主推 // V5</span>
                    </div>
                    
                    <h1 className="text-5xl md:text-8xl font-display font-black text-white leading-[0.9] mb-6 tracking-tighter drop-shadow-2xl">
                        {heroTrack.title}
                    </h1>
                    
                    <p className="text-slate-200 text-lg md:text-2xl font-light max-w-2xl mb-10 line-clamp-2 md:line-clamp-none">
                        {heroTrack.artist} • 由 NEXUS Core 生成的沉浸式音频体验。立即感受高保真声景。
                    </p>

                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => onPlay(heroTrack.id)} 
                            className="px-8 py-4 bg-white text-black font-bold text-lg uppercase tracking-widest rounded flex items-center gap-3 hover:bg-lime-400 hover:scale-105 transition-all shadow-xl"
                        >
                            {playingId === heroTrack.id ? (
                                <><PauseIcon /> <span>暂停</span></>
                            ) : (
                                <><PlayIcon /> <span>立即播放</span></>
                            )}
                        </button>
                        <button className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold text-lg uppercase tracking-widest rounded flex items-center gap-3 hover:bg-white/20 transition-all">
                            <span>更多信息</span>
                        </button>
                    </div>
                </div>

                {/* Right side visualizer hint */}
                <div className="absolute bottom-32 right-16 hidden lg:flex flex-col items-end gap-2 opacity-50">
                     <div className="flex items-end gap-1 h-16">
                         {[...Array(5)].map((_,i) => (
                             <div key={i} className="w-2 bg-white animate-pulse" style={{ height: `${Math.random()*100}%`, animationDelay: `${i*0.1}s` }}></div>
                         ))}
                     </div>
                     <span className="text-[10px] font-mono text-white">音频可视化已激活</span>
                </div>
            </div>

            {/* 2. CATEGORY SWIMLANES */}
            <div className="relative z-30 space-y-4 -mt-32 md:-mt-48 bg-gradient-to-t from-[#050505] via-[#050505]/90 to-transparent pt-32">
                <CategoryRow title="为您推荐" tracks={forYou} onPlay={onPlay} playingId={playingId} />
                <CategoryRow title="时下流行" tracks={trending} onPlay={onPlay} playingId={playingId} />
                <CategoryRow title="最新上架" tracks={newArrivals} onPlay={onPlay} playingId={playingId} />
                <CategoryRow title="混音挑战" tracks={remixContest} onPlay={onPlay} playingId={playingId} />
            </div>

        </div>
    );
};
