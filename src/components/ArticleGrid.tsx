
import React, { useState } from 'react';
import { Video } from '../types';

interface VideoGridProps {
  videos: Video[];
  onPauseMusic?: () => void;
}

const CategoryRow = ({ title, videos, onWatch }: { title: string, videos: Video[], onWatch: (v: Video) => void }) => {
    if (videos.length === 0) return null;
    return (
        <div className="mb-12">
            <h3 className="text-lg font-bold text-white mb-4 px-8 md:px-12 flex items-center gap-2">
                <div className="w-1 h-4 bg-acid"></div>
                {title} <span className="text-slate-600 text-xs font-mono ml-2 font-normal">({videos.length})</span>
            </h3>
            <div className="flex gap-4 overflow-x-auto pb-8 px-8 md:px-12 no-scrollbar scroll-smooth snap-x">
                {videos.map(video => (
                    <div 
                        key={video.id} 
                        onClick={() => onWatch(video)}
                        className="min-w-[280px] md:min-w-[320px] snap-start group cursor-pointer relative"
                    >
                        <div className="aspect-video bg-[#111] rounded border border-white/5 overflow-hidden relative transition-all duration-300 group-hover:border-acid/50 group-hover:scale-105 group-hover:shadow-[0_0_30px_rgba(0,0,0,0.5)] z-0 group-hover:z-10">
                            <img src={video.coverUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                            {/* Play Icon */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100">
                                <div className="w-12 h-12 bg-acid/90 rounded-full flex items-center justify-center shadow-lg">
                                    <svg className="w-5 h-5 text-black ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                </div>
                            </div>
                        </div>
                        <div className="mt-3 opacity-60 group-hover:opacity-100 transition-opacity">
                            <h4 className="text-sm font-bold text-white truncate">{video.title}</h4>
                            <p className="text-[10px] text-slate-500 font-mono uppercase">{video.author}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const VideoGrid: React.FC<VideoGridProps> = ({ videos, onPauseMusic }) => {
  const [playingVideo, setPlayingVideo] = useState<Video | null>(null);

  if (!videos.length) return null;

  // 1. Determine Hero (First one marked isHero, or just the first one)
  const heroVideo = videos.find(v => v.isHero) || videos[0];
  const otherVideos = videos.filter(v => v.id !== heroVideo.id);

  // 2. Group by Category
  const categories: Record<string, Video[]> = {};
  otherVideos.forEach(v => {
      const cat = v.category || 'Uncategorized';
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(v);
  });

  const handleWatch = (video: Video) => {
      if (onPauseMusic) onPauseMusic();
      setPlayingVideo(video);
  };

  return (
    <div className="w-full -mt-8">
      
      {/* --- BILLBOARD HERO --- */}
      <div className="relative w-full h-[60vh] md:h-[80vh] mb-12 group overflow-hidden">
          <div className="absolute inset-0">
              <img src={heroVideo.coverUrl} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/40 to-transparent"></div>
          </div>
          
          <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 lg:p-24 flex flex-col items-start justify-end h-full z-10">
              <div className="flex items-center gap-3 mb-4 opacity-0 translate-y-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                  <span className="bg-acid text-black text-[10px] font-black uppercase px-2 py-0.5 rounded">Featured Cinema</span>
                  <span className="text-white/70 text-xs font-bold uppercase tracking-widest">{heroVideo.category}</span>
              </div>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-black text-white leading-[0.9] mb-6 max-w-4xl opacity-0 translate-y-4 animate-slide-up" style={{ animationDelay: '0.4s' }}>
                  {heroVideo.title}
              </h1>
              <p className="text-slate-300 text-lg md:text-xl max-w-xl mb-8 line-clamp-3 font-light opacity-0 translate-y-4 animate-slide-up" style={{ animationDelay: '0.6s' }}>
                  {heroVideo.description || "Experience visual storytelling at its finest. High definition playback available now."}
              </p>
              
              <div className="flex items-center gap-4 opacity-0 translate-y-4 animate-slide-up" style={{ animationDelay: '0.8s' }}>
                  <button onClick={() => handleWatch(heroVideo)} className="px-8 py-4 bg-white hover:bg-acid text-black font-bold uppercase tracking-widest rounded transition-colors flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                      Watch Now
                  </button>
                  <button className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold uppercase tracking-widest rounded transition-colors backdrop-blur">
                      More Info
                  </button>
              </div>
          </div>
      </div>

      {/* --- CATEGORY ROWS --- */}
      <div className="space-y-4 relative z-20">
          {Object.entries(categories).map(([cat, vids]) => (
              <CategoryRow key={cat} title={cat} videos={vids} onWatch={handleWatch} />
          ))}
      </div>

      {/* --- IMMERSIVE MODAL --- */}
      {playingVideo && (
          <div className="fixed inset-0 z-[200] bg-black animate-fade-in flex items-center justify-center">
              <button 
                  onClick={() => setPlayingVideo(null)}
                  className="absolute top-8 right-8 z-50 text-white/50 hover:text-white p-2"
              >
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              
              <div className="w-full h-full max-w-[1920px] mx-auto flex flex-col">
                  <div className="flex-1 bg-black relative">
                      <video 
                        src={playingVideo.videoUrl} 
                        controls 
                        autoPlay 
                        className="w-full h-full object-contain"
                      />
                  </div>
                  <div className="h-24 bg-[#111] border-t border-white/10 px-8 flex items-center justify-between">
                      <div>
                          <h2 className="text-white font-bold text-xl">{playingVideo.title}</h2>
                          <p className="text-slate-500 text-xs font-mono uppercase mt-1">{playingVideo.category} / {playingVideo.author}</p>
                      </div>
                      <div className="text-slate-400 text-xs font-mono">
                          NEXUS CINEMA PLAYER V5
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
