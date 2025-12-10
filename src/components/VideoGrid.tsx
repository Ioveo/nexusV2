
import React, { useState } from 'react';
import { Video } from '../types';

interface VideoGridProps {
  videos: Video[];
  onPauseMusic?: () => void;
}

// Map categories to icons
const CATEGORY_ITEMS = [
    { name: '全部', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg> },
    { name: '电影', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" /></svg> },
    { name: 'MV', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg> },
    { name: '纪录片', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
    { name: '动画', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { name: '科幻', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> },
    { name: '创意', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg> },
];

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
    const displayVideos = videos.slice(0, 8);

    return (
        <div className="w-full py-12 px-4 md:px-12">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-1 h-6 bg-cyan-500 shadow-[0_0_10px_#06b6d4]"></div>
                <h3 className="text-2xl font-display font-bold text-white uppercase tracking-wider">热门推荐</h3>
            </div>
            
            <div className="flex w-full h-[300px] md:h-[400px] gap-2 md:gap-4 overflow-hidden">
                {displayVideos.map((video, idx) => (
                    <div 
                        key={video.id} 
                        onClick={() => onWatch(video)}
                        className="relative flex-1 group cursor-pointer overflow-hidden rounded-2xl transition-all duration-500 ease-out hover:flex-[4] hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] border border-white/5 hover:border-cyan-500/50"
                    >
                        <img src={video.coverUrl} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-100" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80 group-hover:opacity-40 transition-opacity"></div>
                        
                        <div className="absolute bottom-0 left-0 w-full p-4 md:p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500 flex flex-col justify-end bg-gradient-to-t from-black/90 to-transparent h-1/2">
                            <span className="text-cyan-400 font-mono text-[10px] uppercase tracking-widest mb-1 truncate">{video.category}</span>
                            <h4 className="text-white font-bold text-lg md:text-3xl leading-none mb-2 line-clamp-2">{video.title}</h4>
                            <p className="text-slate-300 text-xs line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity delay-100 duration-500">{video.description || "立即观看 4K 超清版本。"}</p>
                        </div>

                        <div className="absolute top-4 left-4 font-display font-black text-2xl md:text-4xl text-white/10 group-hover:text-cyan-500 group-hover:scale-150 transition-all duration-500">
                            {(idx + 1).toString().padStart(2, '0')}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// 3. BENTO GRID
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
                            
                            <div className="absolute inset-0 p-6 flex flex-col justify-end items-start opacity-100">
                                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 w-full">
                                    {video.adSlogan && (
                                        <span className="inline-block px-2 py-1 bg-purple-500 text-black text-[9px] font-bold uppercase mb-2 rounded shadow-lg">
                                            {video.adSlogan}
                                        </span>
                                    )}
                                    <h4 className={`font-bold text-white leading-tight mb-1 truncate ${rowSpan.includes('2') || colSpan.includes('2') ? 'text-2xl' : 'text-lg'}`}>
                                        {video.title}
                                    </h4>
                                    <div className="flex items-center gap-2 text-xs text-slate-400 group-hover:text-white transition-colors">
                                        <span className="truncate max-w-[100px]">{video.author}</span>
                                        <span className="w-1 h-1 bg-slate-500 rounded-full"></span>
                                        <span>{video.category}</span>
                                    </div>
                                </div>
                            </div>
                            
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

export const VideoGrid: React.FC<VideoGridProps> = ({ videos, onPauseMusic }) => {
  const [playingVideo, setPlayingVideo] = useState<Video | null>(null);
  const [filter, setFilter] = useState('全部');

  if (!videos.length) return <div className="flex items-center justify-center h-screen text-slate-500">暂无影视内容</div>;

  // 1. Identify Sections
  const heroVideo = videos.find(v => v.isVideoPageHero) || videos[0];
  const remainingVideos = videos.filter(v => v.id !== heroVideo.id);

  // Apply Category Filter
  const filteredVideos = filter === '全部' 
    ? remainingVideos 
    : remainingVideos.filter(v => v.category === filter || v.category?.includes(filter));
  
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
              
              <h1 className="text-5xl md:text-8xl lg:text-9xl font-display font-black text-white leading-[0.85] mb-8 drop-shadow-2xl tracking-tighter mix-blend-overlay opacity-90 line-clamp-2">
                  {heroVideo.title}
              </h1>

              <div className="flex flex-col md:flex-row gap-8 items-start max-w-4xl">
                   <p className="text-slate-200 text-lg md:text-xl font-light leading-relaxed border-l-4 border-cyan-500 pl-6 bg-black/30 backdrop-blur-sm p-4 rounded-r-xl line-clamp-3">
                       {heroVideo.description || "体验下一代视听合成技术。启用高保真播放引擎。"}
                   </p>
                   <div className="flex flex-col gap-1 text-xs font-mono text-slate-400 mt-2 shrink-0">
                       <span>导演: <span className="text-white">{heroVideo.author}</span></span>
                       <span>上映: <span className="text-white">2024</span></span>
                       <span>画质: <span className="text-acid">4K HDR</span></span>
                   </div>
              </div>

              <div className="flex items-center gap-6 mt-12">
                  <button onClick={() => handleWatch(heroVideo)} className="group relative px-10 py-5 bg-white text-black font-bold text-lg uppercase tracking-widest rounded-full hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)] overflow-hidden">
                      <span className="relative z-10 flex items-center gap-3"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>开始播放</span>
                      <div className="absolute inset-0 bg-acid transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 ease-out z-0"></div>
                  </button>
                  <button className="px-8 py-5 border border-white/30 text-white font-bold text-sm uppercase tracking-widest rounded-full hover:bg-white/10 backdrop-blur-md transition-all">+ 加入待看</button>
              </div>
          </div>

          {/* DYNAMIC ISLAND NAVIGATION (Centered Bottom) */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 w-full max-w-3xl flex justify-center px-4">
               <div className="flex items-center gap-1 p-1.5 rounded-full bg-black/60 backdrop-blur-2xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-x-auto max-w-full hide-scrollbar">
                    {CATEGORY_ITEMS.map(cat => (
                        <button 
                            key={cat.name}
                            onClick={() => setFilter(cat.name)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-300 group ${
                                filter === cat.name 
                                ? 'bg-acid text-black shadow-[0_0_20px_rgba(204,255,0,0.4)] scale-105' 
                                : 'text-slate-400 hover:text-acid hover:bg-white/5'
                            }`}
                        >
                            <span className={`${filter === cat.name ? 'text-black' : 'text-slate-500 group-hover:text-acid'} transition-colors`}>{cat.icon}</span>
                            <span>{cat.name}</span>
                        </button>
                    ))}
               </div>
          </div>
      </div>

      <InteractiveCarousel videos={carouselVideos} onWatch={handleWatch} />
      <BentoVideoGrid videos={bentoVideos} onWatch={handleWatch} />
      {playingVideo && <CustomVideoPlayer video={playingVideo} onClose={() => setPlayingVideo(null)} />}
    </div>
  );
};
