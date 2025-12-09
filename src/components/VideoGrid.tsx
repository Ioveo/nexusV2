// src/components/VideoGrid.tsx

import React, { useState, useRef, useEffect } from 'react';
import { Video } from '../types';

interface VideoGridProps {
  videos: Video[];
  onPauseMusic?: () => void;
}

// --- CUSTOM IMMERSIVE PLAYER ---
const CustomVideoPlayer = ({ video, onClose }: { video: Video, onClose: () => void }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isPlaying, setIsPlaying] = useState(true);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [showControls, setShowControls] = useState(true);
    const controlTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Auto-hide controls
    useEffect(() => {
        const handleMouseMove = () => {
            setShowControls(true);
            if (controlTimeoutRef.current) clearTimeout(controlTimeoutRef.current);
            controlTimeoutRef.current = setTimeout(() => {
                if (isPlaying) setShowControls(false);
            }, 3000);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            if (controlTimeoutRef.current) clearTimeout(controlTimeoutRef.current);
        };
    }, [isPlaying]);

    const togglePlay = () => {
        if (!videoRef.current) return;
        if (videoRef.current.paused) {
            videoRef.current.play();
            setIsPlaying(true);
        } else {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    };

    const handleTimeUpdate = () => {
        if (!videoRef.current) return;
        const current = videoRef.current.currentTime;
        const dur = videoRef.current.duration;
        setCurrentTime(current);
        setDuration(dur);
        setProgress((current / dur) * 100);
    };

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!videoRef.current || !duration) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        videoRef.current.currentTime = pos * duration;
    };

    const toggleFullscreen = () => {
        if (!containerRef.current) return;
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            containerRef.current.requestFullscreen();
        }
    };

    const formatTime = (time: number) => {
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div ref={containerRef} className="fixed inset-0 z-[200] bg-black group flex flex-col justify-center overflow-hidden">
            <video 
                ref={videoRef}
                src={video.videoUrl} 
                className="w-full h-full object-contain bg-black"
                autoPlay 
                onClick={togglePlay}
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setIsPlaying(false)}
            />
            
            {/* Top Bar (Close Button) */}
            <div className={`absolute top-0 left-0 w-full p-6 flex justify-end transition-opacity duration-300 z-[220] ${showControls ? 'opacity-100' : 'opacity-0'}`}>
                <button onClick={onClose} className="bg-black/50 hover:bg-white/20 p-3 rounded-full backdrop-blur-md transition-colors text-white group/close">
                    <svg className="w-6 h-6 group-hover/close:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>

            {/* Bottom Controls Overlay */}
            <div className={`absolute bottom-0 left-0 w-full bg-gradient-to-t from-black via-black/80 to-transparent pt-32 pb-8 px-8 md:px-12 transition-opacity duration-300 z-[220] ${showControls ? 'opacity-100' : 'opacity-0'}`}>
                
                {/* Title info */}
                <div className="mb-6">
                    <h3 className="text-2xl font-display font-bold text-white mb-1">{video.title}</h3>
                    <p className="text-sm text-slate-300 font-mono tracking-wide uppercase">{video.author} • {video.category}</p>
                </div>

                {/* Progress Bar */}
                <div 
                    className="w-full h-1.5 bg-white/20 rounded-full cursor-pointer mb-6 relative group/bar hover:h-2 transition-all"
                    onClick={handleSeek}
                >
                    <div className="absolute top-0 left-0 h-full bg-orange-500 rounded-full relative" style={{ width: `${progress}%` }}>
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover/bar:opacity-100 shadow-[0_0_10px_rgba(255,255,255,0.5)] scale-0 group-hover/bar:scale-150 transition-all"></div>
                    </div>
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button onClick={togglePlay} className="text-white hover:text-orange-500 transition-colors">
                            {isPlaying ? (
                                <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                            ) : (
                                <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                            )}
                        </button>
                        
                        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                            <span className="text-white">{formatTime(currentTime)}</span>
                            <span className="opacity-50">/</span>
                            <span>{formatTime(duration)}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <button onClick={toggleFullscreen} className="text-white hover:text-orange-500 transition-colors">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


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
                <div className="absolute inset-0">
                    {hero.videoUrl ? (
                        <video 
                            src={hero.videoUrl} 
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700" 
                            autoPlay 
                            muted 
                            loop 
                            playsInline 
                        />
                    ) : (
                        <img src={hero.coverUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700" />
                    )}
                </div>
                
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
                
                <div className="absolute top-4 left-4 flex gap-2">
                    <span className="bg-[#e50914] text-white text-[10px] font-black uppercase px-2 py-1 rounded shadow-lg">NEXUS ORIGINAL</span>
                    <span className="bg-black/50 backdrop-blur text-white text-[10px] font-bold uppercase px-2 py-1 rounded border border-white/20">4K HDR</span>
                </div>

                <div className="absolute bottom-0 left-0 p-8 w-full">
                    {hero.adSlogan && (
                         <div className="inline-block px-3 py-1 bg-gradient-to-r from-orange-600/80 to-red-600/80 border-l-2 border-white backdrop-blur rounded-r text-white text-[10px] font-bold uppercase tracking-widest mb-3 shadow-lg">
                             {hero.adSlogan}
                         </div>
                    )}
                    <h3 className="text-4xl md:text-5xl font-display font-black text-white mb-2 leading-none uppercase text-shadow-lg">{hero.title}</h3>
                    <p className="text-slate-300 text-sm line-clamp-2 max-w-xl mb-6">{hero.description || "A cinematic masterpiece."}</p>
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

  // 1. Determine Hero (Fix: Should re-evaluate when videos prop changes)
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
    <div className="w-full">
      
      {/* --- BILLBOARD HERO (FULL SCREEN) --- */}
      <div className="relative w-full h-screen mb-8 group overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
               {/* 
                  Use Video for background if available. 
                  MUST be Muted/Autoplay/Loop/PlaysInline to autoplay on most browsers.
               */}
              {heroVideo.videoUrl ? (
                  <video 
                    src={heroVideo.videoUrl} 
                    className="w-full h-full object-cover transform transition-transform duration-[20s] group-hover:scale-105"
                    autoPlay muted loop playsInline
                  />
              ) : (
                  <img src={heroVideo.coverUrl} className="w-full h-full object-cover transform transition-transform duration-[20s] group-hover:scale-105" />
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/20 to-transparent"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/40 to-transparent"></div>
          </div>
          
          <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 lg:p-24 flex flex-col items-start justify-end h-full z-10 pb-32">
              <div className="flex items-center gap-3 mb-4 opacity-0 translate-y-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                  <span className="bg-[#e50914] text-white text-[10px] font-black uppercase px-2 py-0.5 rounded shadow-lg shadow-red-500/20">NEXUS ORIGINAL</span>
                  <span className="bg-white/10 backdrop-blur text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded border border-white/10">4K HDR</span>
              </div>
              
              {/* --- AD SLOGAN --- */}
              {heroVideo.adSlogan && (
                  <div className="opacity-0 translate-y-4 animate-slide-up mb-4" style={{ animationDelay: '0.3s' }}>
                      <span className="text-lg md:text-2xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 uppercase tracking-wide drop-shadow-xl border-l-4 border-orange-500 pl-4">
                          {heroVideo.adSlogan}
                      </span>
                  </div>
              )}
              
              <h1 className="text-4xl md:text-6xl lg:text-8xl font-display font-black text-white leading-[0.9] mb-6 max-w-5xl opacity-0 translate-y-4 animate-slide-up drop-shadow-2xl" style={{ animationDelay: '0.4s' }}>
                  {heroVideo.title}
              </h1>
              
              <p className="text-slate-200 text-lg md:text-xl max-w-2xl mb-10 line-clamp-3 font-light opacity-0 translate-y-4 animate-slide-up text-shadow" style={{ animationDelay: '0.6s' }}>
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

      {/* --- IMMERSIVE CUSTOM PLAYER MODAL --- */}
      {playingVideo && (
          <CustomVideoPlayer video={playingVideo} onClose={() => setPlayingVideo(null)} />
      )}
    </div>
  );
};
