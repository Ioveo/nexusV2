// src/components/MusicGrid.tsx
import React from 'react';
import { GalleryTrack } from '../types';

export const MusicGrid: React.FC<{ tracks: GalleryTrack[], onPlay: (id:string)=>void, playingId: string|null }> = ({ tracks, onPlay, playingId }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {tracks.map(t => {
                const isPlaying = playingId === t.id;
                return (
                    <div key={t.id} onClick={() => onPlay(t.id)} className="group bg-white/5 rounded-2xl p-4 border border-white/5 hover:bg-white/10 hover:border-cyan-500/30 transition-all cursor-pointer">
                        <div className="aspect-square rounded-xl overflow-hidden mb-4 relative">
                            <img src={t.coverUrl} className="w-full h-full object-cover" />
                            <div className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity ${isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isPlaying ? 'bg-cyan-500 text-black' : 'bg-white/20 backdrop-blur text-white'}`}>
                                    {isPlaying ? (
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                                    ) : (
                                        <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                    )}
                                </div>
                            </div>
                        </div>
                        <h3 className="text-white font-bold text-base truncate mb-1">{t.title}</h3>
                        <p className="text-slate-400 text-sm truncate">{t.artist}</p>
                    </div>
                );
            })}
        </div>
    );
};