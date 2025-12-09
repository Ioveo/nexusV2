// src/components/VideoGrid.tsx

import React, { useState } from 'react';
import { Video } from '../types';

interface VideoGridProps {
  videos: Video[];
  onPauseMusic?: () => void;
}

// --- HOME WIDGET (Dashboard Version) ---
export const HomeVideoWidget = ({ videos, onWatch }: { videos: Video[], onWatch: (v: Video) => void }) => {
    if (videos.length === 0) return null;
    const hero = videos.find(v => v.isHero) || videos[0];
    const trending = videos.filter(v => v.id !== hero.id).slice(0, 3);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-auto lg:h-[500px]">
            {/* Left Hero */}
            <div 
                onClick={() => onWatch(hero)}
                className="lg:col-span-8 relative rounded-2xl overflow-hidden group cursor-pointer border border-white/10 hover:border-orange-500/50 transition-all"
            >
                <img src={hero.coverUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
                
                <div className="absolute top-4 left-4 flex gap-2">
                    <span className="bg-[#e50914] text-white text-[10px] font-black uppercase px-2 py-1 rounded shadow-lg">NEXUS ORIGINAL</span>
                    <span className="bg-black/50 backdrop-blur text-white text-[10px] font-bold uppercase px-2 py-1 rounded border border-white/20">4K HDR</span>
                </div>

                <div className="absolute bottom-0 left-0 p-8 w-full">
                    <h3 className="text-4xl md:text-5xl font-display font-black text-white mb-2 leading-none uppercase">{hero.title}</h3>
                    <p className="text-slate-300 text-sm line-clamp-2 max-w-xl mb-6">{hero.description || "A cinematic masterpiece. Experience visual storytelling at its finest."}</p>
                    <button className="px-6 py-3 bg-white text-black font-bold uppercase tracking-widest rounded flex items-center gap-2 hover:bg-orange-500 transition-colors">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                        立即播放
                    </button>
                </div>
            </div>

            {/* Right List */}
            <div className="lg:col-span-4 flex flex-col gap-4">
                {trending.map((v, i) => (
                    <div 
                        key={v.id} 
                        onClick={() => onWatch(v)}
                        className="flex-1 flex gap-4 p-3 bg-[#111] rounded-xl border border-white/5 hover:border-white/30 cursor-pointer group transition-all"
                    >
                        <div className="w-32 h-full bg-slate-900 rounded-lg overflow-hidden relative shrink-0">
                             <img src={v.coverUrl} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                             <div className="absolute top-1 left-1 w-6 h-6 bg-black/60 backdrop-blur rounded flex items-center justify-center text-xs font-bold text-white border border-white/10">
                                 {i + 1}
                             </div>
                        </div>
                        <div className="flex flex-col justify-center min-w-0 py-1">
                            <div className="text-[10px] text-orange-500 font-bold uppercase tracking-wider mb-1">{v.category}</div>
                            <h4 className="text-white font-bold leading-tight mb-1 truncate group-hover:text-orange-500 transition-colors">{v.title}</h4>
                            <p className="text-[10px] text-slate-500 font-mono uppercase">Directed by {v.author}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


// --- MAIN PAGE COMPONENT ---

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
                        <div className="aspect-video bg-[#111] rounded border border-white/5 overflow-hidden relative transition-all duration-300 group-hover:border-acid/50 group-hover:scale-110 group-hover:shadow-[0_0_40px_rgba(0,0,0,0.6)] z-0 group-hover:z-50 origin-center">
                            <img src={video.coverUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                            {/* Play Icon */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100">
                                <div className="w-12 h-12 bg-acid/90 rounded-full flex items-center justify-center shadow-lg">
                                    <svg className="w-5 h-5 text-black ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 opacity-60 group-hover:opacity-100 transition-opacity pl-1">
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

  // 1. Determine Hero
  const heroVideo = videos.find(v => v.isHero) || videos[0];
  const otherVideos = videos.filter(v => v.id !== heroVideo.id);

  // 2. Featured (First 4 non-hero)
  const featured = otherVideos.slice(0, 4);
  const remaining = otherVideos.slice(4);

  // 3. Group Remaining by Category
  const categories: Record<string, Video[]> = {};
  [...featured, ...remaining].forEach(v => {
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
      <div className="relative w-full h-[65vh] md:h-[85vh] mb-8 group overflow-hidden">
          <div className="absolute inset-0">
              <img src={heroVideo.coverUrl} className="w-full h-full object-cover transform transition-transform duration-[20s] group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/20 to-transparent"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/40 to-transparent"></div>
          </div>
          
          <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 lg:p-24 flex flex-col items-start justify-end h-full z-10">
              <div className="flex items-center gap-3 mb-4 opacity-0 translate-y-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                  <span className="bg-[#e50914] text-white text-[10px] font-black uppercase px-2 py-0.5 rounded shadow-lg shadow-red-500/20">NEXUS 原创</span>
                  <span className="bg-white/10 backdrop-blur text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded border border-white/10">4K HDR</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl lg:text-9xl font-display font-black text-white leading-[0.85] mb-6 max-w-5xl opacity-0 translate-y-4 animate-slide-up drop-shadow-2xl" style={{ animationDelay: '0.4s' }}>
                  {heroVideo.title}
              </h1>
              
              <p className="text-slate-200 text-lg md:text-2xl max-w-2xl mb-10 line-clamp-3 font-light opacity-0 translate-y-4 animate-slide-up text-shadow" style={{ animationDelay: '0.6s' }}>
                  {heroVideo.description || "一部电影杰作。体验高清画质和沉浸式音效带来的视觉盛宴。"}
              </p>
              
              <div className="flex items-center gap-4 opacity-0 translate-y-4 animate-slide-up" style={{ animationDelay: '0.8s' }}>
                  <button onClick={() => handleWatch(heroVideo)} className="px-8 py-4 bg-white hover:bg-slate-200 text-black font-bold text-lg uppercase tracking-widest rounded transition-all transform hover:scale-105 flex items-center gap-3 shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                      <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                      立即播放
                  </button>
                  <button className="px-8 py-4 bg-gray-500/40 hover:bg-gray-500/50 backdrop-blur border border-white/10 text-white font-bold text-lg uppercase tracking-widest rounded transition-colors flex items-center gap-3">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      更多信息
                  </button>
              </div>
          </div>
      </div>

      {/* --- FEATURED TOP 4 (Netflix Style) --- */}
      {featured.length > 0 && (
          <div className="relative z-20 -mt-24 mb-16 px-8 md:px-12">
              <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                  <span className="text-acid">///</span> 本周热门 (Trending)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {featured.map((v, i) => (
                      <div key={v.id} onClick={() => handleWatch(v)} className="aspect-video bg-[#111] rounded-lg border border-white/10 overflow-hidden relative group cursor-pointer hover:scale-105 transition-all duration-300 shadow-2xl hover:border-acid/50 z-0 hover:z-50">
                          <img src={v.coverUrl} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors"></div>
                          <div className="absolute bottom-0 left-0 w-full p-3 bg-gradient-to-t from-black to-transparent">
                              <h4 className="text-white font-bold text-sm truncate">{v.title}</h4>
                          </div>
                          {/* Rank Number */}
                          <div className="absolute top-2 right-2 text-4xl font-display font-black text-white/10 group-hover:text-acid transition-colors leading-none">
                              {i + 1}
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

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
                  className="absolute top-8 right-8 z-50 text-white/50 hover:text-white p-2 bg-black/50 rounded-full backdrop-blur"
              >
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              
              <div className="w-full h-full max-w-[1920px] mx-auto flex flex-col">
                  <div className="flex-1 bg-black relative flex items-center justify-center">
                      <video 
                        src={playingVideo.videoUrl} 
                        controls 
                        autoPlay 
                        className="max-w-full max-h-full w-full h-full shadow-[0_0_100px_rgba(255,255,255,0.1)]"
                      />
                  </div>
                  <div className="h-32 bg-[#0a0a0a] border-t border-white/10 px-8 md:px-16 flex items-center justify-between shrink-0">
                      <div>
                          <div className="flex items-center gap-3 mb-1">
                              <span className="text-[10px] font-bold bg-white/10 text-white px-2 py-0.5 rounded">{playingVideo.category}</span>
                              <span className="text-[10px] font-bold bg-acid/10 text-acid px-2 py-0.5 rounded">HD</span>
                          </div>
                          <h2 className="text-3xl font-display font-bold text-white">{playingVideo.title}</h2>
                          <p className="text-slate-500 text-sm font-mono mt-1">Directed by {playingVideo.author} // NEXUS STUDIOS</p>
                      </div>
                      <div className="text-right hidden md:block">
                          <div className="text-white text-lg font-bold">即将播放</div>
                          <div className="text-slate-500 text-sm">5秒后自动播放下一集...</div>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
