
// src/components/VideoGrid.tsx

import React, { useState, useRef, useEffect } from 'react';
import { Video } from '../types';

interface VideoGridProps {
  videos: Video[];
  onPauseMusic?: () => void;
}

const VIDEO_CATEGORIES = ['全部', '电影', 'MV', '纪录片', '动画', '科幻', '创意'];

// --- SUB-COMPONENTS ---

const CustomVideoPlayer = ({ video, onClose }: { video: Video, onClose: () => void }) => {
    return (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex flex-col justify-center animate-fade-in">
            <button onClick={onClose} className="absolute top-6 right-6 z-50 text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition-colors">✕</button>
            <video src={video.videoUrl} controls autoPlay className="w-full h-full object-contain max-h-[100vh] shadow-2xl" />
        </div>
    );
};

// 2. INTERACTIVE ACCORDION CAROUSEL (Wave Effect)
const InteractiveCarousel = ({ videos, onWatch }: { videos: Video[], onWatch: (v: Video) => void }) => {
    if (videos.length === 0) return null;
    
    // We display 8 videos. If fewer, we just show what we have.
    const displayVideos = videos.slice(0, 8);

    return (
        <div className="w-full py-12 px-4 md:px-12">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-1 h-6 bg-cyan-500 shadow-[0_0_10px_#06b6d4]"></div>
                <h3 className="text-2xl font-display font-bold text-white uppercase tracking-wider">热门推荐</h3>
            </div>
            
            {/* The Accordion Container */}
            <div className="flex w-full h-[400px] gap-2 md:gap-4 overflow-hidden">
                {displayVideos.map((video, idx) => (
                    <div 
                        key={video.id} 
                        onClick={() => onWatch(video)}
                        className="relative flex-1 group cursor-pointer overflow-hidden rounded-2xl transition-all duration-500 ease-out hover:flex-[4] hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] border border-white/5 hover:border-cyan-500/50"
                    >
                        {/* Background Image */}
                        <img src={video.coverUrl} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-100" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80 group-hover:opacity-40 transition-opacity"></div>
                        
                        {/* Content (Hidden until expanded) */}
                        <div className="absolute bottom-0 left-0 w-full p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500 flex flex-col justify-end bg-gradient-to-t from-black/90 to-transparent h-1/2">
                            <span className="text-cyan-400 font-mono text-[10px] uppercase tracking-widest mb-1">{video.category}</span>
                            <h4 className="text-white font-bold text-xl md:text-3xl leading-none mb-2 line-clamp-2">{video.title}</h4>
                            <p className="text-slate-300 text-xs line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity delay-100 duration-500">{video.description || "立即观看 4K 超清版本。"}</p>
                        </div>

                        {/* Rank Number (Visible when collapsed) */}
                        <div className="absolute top-4 left-4 font-display font-black text-4xl text-white/10 group-hover:text-cyan-500 group-hover:scale-150 transition-all duration-500">
                            {(idx + 1).toString().padStart(2, '0')}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// 3. BENTO GRID (Advanced Hierarchical Layout)
const BentoVideoGrid = ({ videos, onWatch }: { videos: Video[], onWatch: (v: Video) => void }) => {
    if (videos.length === 0) return null;

    return (
        <div className="w-full py-12 px-4 md:px-12 bg-gradient-to-t from-[#050505] to-transparent">
             <div className="flex items-center gap-3 mb-8">
                <div className="w-1 h-6 bg-purple-500 shadow-[0_0_10px_#a855f7]"></div>
                <h3 className="text-2xl font-display font-bold text-white uppercase tracking-wider">精选片单</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 auto-rows-[250px] gap-4">
                {videos.map((video, idx) => {
                    // Algorithmic Bento Pattern:
                    // 0: Large Square (2x2)
                    // 3: Wide Rectangle (2x1)
                    // 6: Tall Rectangle (1x2)
                    // Others: Standard (1x1)
                    let colSpan = "col-span-1";
                    let rowSpan = "row-span-1";
                    
                    if (idx === 0) { colSpan = "md:col-span-2"; rowSpan = "md:row-span-2"; }
                    else if (idx === 3) { colSpan = "md:col-span-2"; }
                    else if (idx === 6) { rowSpan = "md:row-span-2"; }

                    return (
                        <div 
                            key={video.id} 
                            onClick={() => onWatch(video)}
                            className={`relative group cursor-pointer overflow-hidden rounded-2xl border border-white/5 bg-[#111] hover:border-purple-500/50 transition-all duration-300 hover:z-10 hover:shadow-2xl ${colSpan} ${rowSpan}`}
                        >
                            <img src={video.coverUrl} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-70 group-hover:opacity-100" />
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-300"></div>
                            
                            {/* Overlay Info */}
                            <div className="absolute inset-0 p-6 flex flex-col justify-end items-start opacity-100">
                                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                    {video.adSlogan && (
                                        <span className="inline-block px-2 py-1 bg-purple-500 text-black text-[9px] font-bold uppercase mb-2 rounded shadow-lg">
                                            {video.adSlogan}
                                        </span>
                                    )}
                                    <h4 className={`font-bold text-white leading-tight mb-1 ${rowSpan.includes('2') || colSpan.includes('2') ? 'text-2xl' : 'text-lg'}`}>
                                        {video.title}
                                    </h4>
                                    <div className="flex items-center gap-2 text-xs text-slate-400 group-hover:text-white transition-colors">
                                        <span>{video.author}</span>
                                        <span className="w-1 h-1 bg-slate-500 rounded-full"></span>
                                        <span>{video.category}</span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Play Button Icon */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white/10 backdrop-blur rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-50 group-hover:scale-100">
                                <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-white border-b-[10px] border-b-transparent ml-1"></div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// --- MAIN PAGE COMPONENT ---

export const VideoGrid: React.FC<VideoGridProps> = ({ videos, onPauseMusic }) => {
  const [playingVideo, setPlayingVideo] = useState<Video | null>(null);
  const [filter, setFilter] = useState('全部');

  if (!videos.length) return (
      <div className="flex items-center justify-center h-screen text-slate-500">
          暂无影视内容
      </div>
  );

  // 1. Identify Sections
  const heroVideo = videos.find(v => v.isVideoPageHero) || videos[0];
  
  // Filter remaining videos
  const remainingVideos = videos.filter(v => v.id !== heroVideo.id);

  // Apply Category Filter
  const filteredVideos = filter === '全部' 
    ? remainingVideos 
    : remainingVideos.filter(v => v.category === filter || v.category?.includes(filter));
  
  // 2. Split for Accordion vs Bento
  const carouselVideos = filteredVideos.slice(0, 8);
  const bentoVideos = filteredVideos.slice(8);

  const handleWatch = (video: Video) => { 
      if (onPauseMusic) onPauseMusic(); 
      setPlayingVideo(video); 
  };

  return (
    <div className="w-full pb-24 -mt-24">
      {/* 1. CINEMA HERO (Full Screen) */}
      <div className="relative w-full h-[90vh] mb-0 group overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
              {heroVideo.videoUrl ? (
                  <video src={heroVideo.videoUrl} className="w-full h-full object-cover" autoPlay muted loop playsInline /> 
              ) : (
                  <img src={heroVideo.coverUrl} className="w-full h-full object-cover" />
              )}
              {/* Cinematic Vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/20 to-transparent"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent"></div>
          </div>

          <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 lg:p-24 flex flex-col items-start justify-end h-full z-10 pb-32 max-w-6xl">
              {/* Badges */}
              <div className="flex items-center gap-3 mb-6 animate-fade-in">
                   <div className="px-3 py-1 bg-white/10 backdrop-blur border border-white/20 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded">
                       NEXUS CINEMA
                   </div>
                   {heroVideo.category && (
                       <span className="text-cyan-400 text-xs font-bold uppercase tracking-widest border-l border-white/20 pl-3">
                           {heroVideo.category}
                       </span>
                   )}
              </div>
              
              {/* Title */}
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-display font-black text-white leading-[0.85] mb-8 drop-shadow-2xl tracking-tighter mix-blend-overlay opacity-90">
                  {heroVideo.title}
              </h1>

              {/* Description & Meta */}
              <div className="flex flex-col md:flex-row gap-8 items-start max-w-4xl">
                   <p className="text-slate-200 text-lg md:text-xl font-light leading-relaxed border-l-4 border-cyan-500 pl-6 bg-black/30 backdrop-blur-sm p-4 rounded-r-xl">
                       {heroVideo.description || "体验下一代视听合成技术。启用高保真播放引擎。"}
                   </p>
                   <div className="flex flex-col gap-1 text-xs font-mono text-slate-400 mt-2">
                       <span>导演: <span className="text-white">{heroVideo.author}</span></span>
                       <span>上映: <span className="text-white">2024</span></span>
                       <span>画质: <span className="text-acid">4K HDR</span></span>
                   </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-6 mt-12">
                  <button 
                    onClick={() => handleWatch(heroVideo)} 
                    className="group relative px-10 py-5 bg-white text-black font-bold text-lg uppercase tracking-widest rounded-full hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)] overflow-hidden"
                  >
                      <span className="relative z-10 flex items-center gap-3">
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                          开始播放
                      </span>
                      <div className="absolute inset-0 bg-cyan-400 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 ease-out z-0"></div>
                  </button>
                  
                  <button className="px-8 py-5 border border-white/30 text-white font-bold text-sm uppercase tracking-widest rounded-full hover:bg-white/10 backdrop-blur-md transition-all">
                      + 加入待看
                  </button>
              </div>
          </div>
      </div>

      {/* CATEGORY NAV (Floating) */}
      <div className="sticky top-20 z-40 px-4 md:px-12 py-4 -mt-20 mb-4 pointer-events-none">
           <div className="inline-flex items-center gap-2 p-2 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl pointer-events-auto overflow-x-auto max-w-full hide-scrollbar">
                {VIDEO_CATEGORIES.map(cat => (
                    <button 
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all ${
                            filter === cat 
                            ? 'bg-white text-black shadow-lg scale-105' 
                            : 'text-slate-400 hover:text-white hover:bg-white/10'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
           </div>
      </div>

      {/* 2. INTERACTIVE SLIDER (Hover Wave) */}
      <InteractiveCarousel videos={carouselVideos} onWatch={handleWatch} />

      {/* 3. BENTO GRID (The Rest) */}
      <BentoVideoGrid videos={bentoVideos} onWatch={handleWatch} />

      {/* Video Modal Player */}
      {playingVideo && <CustomVideoPlayer video={playingVideo} onClose={() => setPlayingVideo(null)} />}
    </div>
  );
};
