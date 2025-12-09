// src/components/MusicGrid.tsx
import React from 'react';
import { GalleryTrack } from '../types';

export const MusicGrid: React.FC<{ tracks: GalleryTrack[], onPlay: (id:string)=>void, playingId: string|null }> = ({ tracks, onPlay, playingId }) => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {tracks.map((t, idx) => {
                const isPlaying = playingId === t.id;
                return (
                    <div key={t.id} onClick={() => onPlay(t.id)} className="group cursor-pointer">
                        <div className={`relative aspect-square bg-[#111] border border-white/10 overflow-hidden mb-4 transition-all duration-300 ${isPlaying ? 'border-acid shadow-[0_0_20px_rgba(204,255,0,0.2)]' : 'group-hover:border-white/50'}`}>
                            <img src={t.coverUrl} className={`w-full h-full object-cover transition-all duration-700 ${isPlaying ? 'scale-105 opacity-40' : 'grayscale group-hover:grayscale-0 group-hover:scale-105'}`} />
                            
                            {/* Number Overlay */}
                            <div className="absolute top-0 right-0 p-2 text-xs font-mono text-white/50 bg-black/50 backdrop-blur">
                                {String(idx + 1).padStart(2, '0')}
                            </div>

                            {/* Play Overlay */}
                            <div className={`absolute inset-0 flex items-center justify-center ${isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                                <div className={`w-12 h-12 flex items-center justify-center ${isPlaying ? 'bg-acid text-black' : 'bg-white text-black'}`}>
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
                            <h3 className={`font-bold text-sm truncate uppercase tracking-wide ${isPlaying ? 'text-acid' : 'text-white group-hover:text-acid transition-colors'}`}>{t.title}</h3>
                            <p className="text-slate-500 text-xs font-mono truncate">{t.artist}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
