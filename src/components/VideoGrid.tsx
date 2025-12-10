// src/components/VideoGrid.tsx

import React, { useState, useRef, useEffect } from 'react';
import { Video } from '../types';

interface VideoGridProps {
  videos: Video[];
  onPauseMusic?: () => void;
}

const CustomVideoPlayer = ({ video, onClose }: { video: Video, onClose: () => void }) => {
    // ... [Same logic as before, just ensuring it compiles] ...
    // Using a streamlined version for the fix
    const videoRef = useRef<HTMLVideoElement>(null);
    return (
        <div className="fixed inset-0 z-[200] bg-black flex flex-col justify-center">
            <button onClick={onClose} className="absolute top-6 right-6 z-50 text-white bg-black/50 p-3 rounded-full">✕</button>
            <video src={video.videoUrl} controls autoPlay className="w-full h-full object-contain max-h-[100vh]" />
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
            <div onClick={() => onWatch(hero)} className="lg:col-span-8 relative rounded-2xl overflow-hidden group cursor-pointer border border-white/10 hover:border-orange-500/50 transition-all">
                <img src={hero.coverUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-8 w-full">
                    {hero.adSlogan && <div className="inline-block px-2 py-1 bg-orange-500 text-black text-[10px] font-bold uppercase mb-2">{hero.adSlogan}</div>}
                    <h3 className="text-4xl font-display font-black text-white mb-2 uppercase">{hero.title}</h3>
                    <button className="px-6 py-3 bg-white text-black font-bold uppercase tracking-widest rounded flex items-center gap-2 hover:bg-orange-500 transition-colors">立即播放</button>
                </div>
            </div>
            {/* Right List */}
            <div className="lg:col-span-4 flex flex-col gap-4">
                {trending.map((v, i) => (
                    <div key={v.id} onClick={() => onWatch(v)} className="flex-1 flex gap-4 p-3 bg-[#111] rounded-xl border border-white/5 hover:border-white/30 cursor-pointer group transition-all">
                        <div className="w-24 h-full bg-slate-900 rounded-lg overflow-hidden relative shrink-0"><img src={v.coverUrl} className="w-full h-full object-cover" /></div>
                        <div className="flex flex-col justify-center min-w-0 py-1">
                            <h4 className="text-white font-bold leading-tight mb-1 truncate group-hover:text-orange-500">{v.title}</h4>
                            <p className="text-[10px] text-slate-500 font-mono uppercase">{v.author}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const CategoryRow = ({ title, videos, onWatch }: { title: string, videos: Video[], onWatch: (v: Video) => void }) => {
    if (videos.length === 0) return null;
    return (
        <div className="mb-12">
            <h3 className="text-lg font-bold text-white mb-4 px-8 md:px-12 flex items-center gap-2"><div className="w-1 h-4 bg-acid"></div>{title}</h3>
            <div className="flex gap-4 overflow-x-auto pb-8 px-8 md:px-12 no-scrollbar scroll-smooth snap-x">
                {videos.map(video => (
                    <div key={video.id} onClick={() => onWatch(video)} className="min-w-[280px] snap-start group cursor-pointer relative">
                        <div className="aspect-video bg-[#111] rounded border border-white/5 overflow-hidden relative transition-all duration-300 group-hover:border-acid/50 group-hover:scale-105">
                            <img src={video.coverUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100" />
                        </div>
                        <div className="mt-4 pl-1"><h4 className="text-sm font-bold text-white truncate">{video.title}</h4></div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const VideoGrid: React.FC<VideoGridProps> = ({ videos, onPauseMusic }) => {
  const [playingVideo, setPlayingVideo] = useState<Video | null>(null);
  if (!videos.length) return null;

  const heroVideo = videos.find(v => v.isHero) || videos[0];
  const otherVideos = videos.filter(v => v.id !== heroVideo.id);
  const featured = otherVideos.slice(0, 4);
  const remaining = otherVideos.slice(4);
  const categories: Record<string, Video[]> = {};
  [...featured, ...remaining].forEach(v => { const cat = v.category || 'Uncategorized'; if (!categories[cat]) categories[cat] = []; categories[cat].push(v); });

  const handleWatch = (video: Video) => { if (onPauseMusic) onPauseMusic(); setPlayingVideo(video); };

  return (
    <div className="w-full">
      <div className="relative w-full h-screen mb-8 group overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
              {heroVideo.videoUrl ? <video src={heroVideo.videoUrl} className="w-full h-full object-cover" autoPlay muted loop playsInline /> : <img src={heroVideo.coverUrl} className="w-full h-full object-cover" />}
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/20 to-transparent"></div>
          </div>
          <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 lg:p-24 flex flex-col items-start justify-end h-full z-10 pb-32">
              <div className="flex items-center gap-3 mb-4"><span className="bg-[#e50914] text-white text-[10px] font-black uppercase px-2 py-0.5 rounded shadow-lg">NEXUS ORIGINAL</span></div>
              {heroVideo.adSlogan && <div className="mb-4"><span className="text-2xl font-display font-bold text-orange-500 uppercase border-l-4 border-orange-500 pl-4">{heroVideo.adSlogan}</span></div>}
              <h1 className="text-5xl md:text-7xl font-display font-black text-white leading-[0.9] mb-6 max-w-5xl drop-shadow-2xl">{heroVideo.title}</h1>
              <p className="text-slate-200 text-lg max-w-2xl mb-10 line-clamp-3 font-light">{heroVideo.description || "A cinematic masterpiece."}</p>
              <div className="flex items-center gap-4"><button onClick={() => handleWatch(heroVideo)} className="px-8 py-4 bg-white text-black font-bold text-lg uppercase tracking-widest rounded flex items-center gap-3 hover:bg-orange-500 transition-colors">立即播放</button></div>
          </div>
      </div>
      {/* Featured & Categories */}
      <div className="relative z-20 -mt-24 mb-16 px-8 md:px-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          {featured.map((v, i) => (
              <div key={v.id} onClick={() => handleWatch(v)} className="aspect-video bg-[#111] rounded-lg border border-white/10 overflow-hidden relative group cursor-pointer hover:scale-105 transition-all shadow-2xl hover:border-acid/50">
                  <img src={v.coverUrl} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors"></div>
                  <div className="absolute bottom-0 left-0 w-full p-3 bg-gradient-to-t from-black to-transparent"><h4 className="text-white font-bold text-sm truncate">{v.title}</h4></div>
              </div>
          ))}
      </div>
      <div className="space-y-4 relative z-20">{Object.entries(categories).map(([cat, vids]) => <CategoryRow key={cat} title={cat} videos={vids} onWatch={handleWatch} />)}</div>
      {playingVideo && <CustomVideoPlayer video={playingVideo} onClose={() => setPlayingVideo(null)} />}
    </div>
  );
};
