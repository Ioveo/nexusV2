
import React from 'react';
import { GalleryTrack } from '../types';

const getRandomTags = (id: string) => {
    const TAGS = ['HI-RES', 'MASTER', 'FLAC', 'DOLBY', 'STEREO'];
    const index = id.charCodeAt(0) % TAGS.length;
    return TAGS[index];
};

export const MusicGrid: React.FC<{ tracks: GalleryTrack[], onPlay: (id:string)=>void, playingId: string|null }> = ({ tracks, onPlay, playingId }) => {
    if (tracks.length === 0) return null;

    const heroTrack = tracks.find(t => t.isHero) || tracks[0];
    const otherTracks = tracks.filter(t => t.id !== heroTrack.id);
    const topCharts = otherTracks.slice(0, 5); // Top 5
    const newArrivals = otherTracks.slice(5);  // Rest

    return (
        <div className="space-y-12">
            
            {/* HERO CARD */}
            <div className="w-full h-[400px] rounded-2xl overflow-hidden relative group border border-white/10">
                <div className="absolute inset-0">
                    <img src={heroTrack.coverUrl} className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent"></div>
                </div>
                
                <div className="absolute inset-0 p-12 flex flex-col justify-center items-start z-10">
                    <div className="inline-block px-3 py-1 bg-acid text-black text-xs font-bold uppercase tracking-widest mb-4 rounded">
                        Track of the Week
                    </div>
                    <h1 className="text-6xl font-display font-black text-white uppercase mb-2 tracking-tighter">
                        {heroTrack.title}
                    </h1>
                    <p className="text-2xl text-slate-300 font-light mb-8 font-mono">
                        {heroTrack.artist}
                    </p>
                    <button 
                        onClick={() => onPlay(heroTrack.id)}
                        className="px-8 py-4 bg-white hover:bg-acid text-black font-bold uppercase tracking-widest rounded-full transition-all flex items-center gap-3"
                    >
                         {playingId === heroTrack.id ? (
                             <span className="flex gap-1 h-3 items-end">
                                <span className="w-1 bg-black animate-[bounce_1s_infinite]"></span>
                                <span className="w-1 bg-black animate-[bounce_1.2s_infinite]"></span>
                                <span className="w-1 bg-black animate-[bounce_0.8s_infinite]"></span>
                             </span>
                         ) : (
                             <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                         )}
                         {playingId === heroTrack.id ? 'Now Playing' : 'Listen Now'}
                    </button>
                </div>
                
                {/* Visualizer Decoration */}
                <div className="absolute bottom-0 right-0 w-1/2 h-full opacity-30 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                
                {/* LEFT: TOP CHARTS */}
                <div className="lg:col-span-1 space-y-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2 border-b border-white/10 pb-4">
                        <span className="text-acid">#</span> TOP CHARTS
                    </h3>
                    <div className="flex flex-col gap-2">
                        {topCharts.map((t, idx) => (
                            <div 
                                key={t.id} 
                                onClick={() => onPlay(t.id)}
                                className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-colors group ${playingId === t.id ? 'bg-white/10 border-l-2 border-acid' : 'hover:bg-white/5 border-l-2 border-transparent'}`}
                            >
                                <span className={`text-2xl font-black font-display w-8 text-center ${idx < 3 ? 'text-white' : 'text-slate-600'}`}>
                                    {String(idx + 1).padStart(2, '0')}
                                </span>
                                <img src={t.coverUrl} className="w-12 h-12 rounded object-cover bg-slate-800" />
                                <div className="flex-1 min-w-0">
                                    <h4 className={`font-bold text-sm truncate ${playingId === t.id ? 'text-acid' : 'text-white group-hover:text-white'}`}>
                                        {t.title}
                                    </h4>
                                    <p className="text-xs text-slate-500 truncate">{t.artist}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* RIGHT: NEW ARRIVALS GRID */}
                <div className="lg:col-span-3 space-y-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2 border-b border-white/10 pb-4">
                        <span className="text-acid">///</span> NEW ARRIVALS
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {newArrivals.map((t, idx) => {
                            const isPlaying = playingId === t.id;
                            const tag = getRandomTags(t.id);
                            
                            return (
                                <div key={t.id} onClick={() => onPlay(t.id)} className="group cursor-pointer relative p-3 bg-[#0a0a0a] border border-white/5 hover:border-acid/50 rounded-xl transition-all duration-300 hover:bg-white/5 hover:-translate-y-1">
                                    <div className={`relative aspect-square bg-[#111] border border-white/5 overflow-hidden mb-4 rounded-lg transition-all duration-300 ${isPlaying ? 'border-acid shadow-[0_0_20px_rgba(204,255,0,0.2)]' : ''}`}>
                                        <img src={t.coverUrl} className={`w-full h-full object-cover transition-all duration-700 ${isPlaying ? 'scale-105 opacity-40' : 'grayscale-[0.5] group-hover:grayscale-0 group-hover:scale-105'}`} />
                                        
                                        {/* Tech Tag */}
                                        <div className={`absolute top-2 right-2 px-1.5 py-0.5 text-[9px] font-bold font-mono uppercase tracking-wide rounded ${isPlaying ? 'bg-acid text-black' : 'bg-black/60 text-slate-300'}`}>
                                            {tag}
                                        </div>

                                        {/* Play Overlay */}
                                        <div className={`absolute inset-0 flex items-center justify-center ${isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                                            <div className={`w-12 h-12 flex items-center justify-center rounded-full ${isPlaying ? 'bg-acid text-black' : 'bg-white text-black hover:scale-110 transition-transform'}`}>
                                                {isPlaying ? (
                                                    <div className="flex gap-1 h-4 items-end">
                                                        <div className="w-1 bg-black animate-viz-bar" style={{animationDuration:'0.4s'}}></div>
                                                        <div className="w-1 bg-black animate-viz-bar" style={{animationDuration:'0.6s'}}></div>
                                                        <div className="w-1 bg-black animate-viz-bar" style={{animationDuration:'0.5s'}}></div>
                                                    </div>
                                                ) : (
                                                    <svg className="w-5 h-5 fill-current ml-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <h3 className={`font-bold text-sm truncate uppercase tracking-wide mb-1 ${isPlaying ? 'text-acid' : 'text-white group-hover:text-acid transition-colors'}`}>{t.title}</h3>
                                        <p className="text-slate-500 text-xs font-mono truncate">{t.artist}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
