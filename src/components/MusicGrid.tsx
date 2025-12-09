// src/components/MusicGrid.tsx
import React from 'react';
import { GalleryTrack } from '../types';

const getRandomTags = (id: string) => {
    const TAGS = ['HI-RES', 'MASTER', 'FLAC', 'DOLBY', 'STEREO'];
    // Deterministic random based on ID char code
    const index = id.charCodeAt(0) % TAGS.length;
    return TAGS[index];
};

export const MusicGrid: React.FC<{ tracks: GalleryTrack[], onPlay: (id:string)=>void, playingId: string|null }> = ({ tracks, onPlay, playingId }) => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {tracks.map((t, idx) => {
                const isPlaying = playingId === t.id;
                const tag = t.sourceType === 'local' ? 'LOCAL' : t.sourceType === 'netease' ? 'CLOUD' : getRandomTags(t.id);
                
                return (
                    <div key={t.id} onClick={() => onPlay(t.id)} className="group cursor-pointer relative p-3 bg-[#0a0a0a] border border-white/5 hover:border-acid/50 rounded-xl transition-all duration-300 hover:bg-white/5">
                        <div className={`relative aspect-square bg-[#111] border border-white/5 overflow-hidden mb-4 rounded-lg transition-all duration-300 ${isPlaying ? 'border-acid shadow-[0_0_20px_rgba(204,255,0,0.2)]' : ''}`}>
                            <img src={t.coverUrl} className={`w-full h-full object-cover transition-all duration-700 ${isPlaying ? 'scale-105 opacity-40' : 'grayscale-[0.5] group-hover:grayscale-0 group-hover:scale-105'}`} />
                            
                            {/* Number Overlay */}
                            <div className="absolute top-2 left-2 px-1.5 py-0.5 text-[10px] font-bold font-mono text-white/50 bg-black/50 backdrop-blur rounded">
                                {String(idx + 1).padStart(2, '0')}
                            </div>

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
                            <div className="flex justify-between items-center">
                                <p className="text-slate-500 text-xs font-mono truncate">{t.artist}</p>
                                {t.isHero && <span className="w-2 h-2 rounded-full bg-acid animate-pulse"></span>}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
