// src/components/VideoGrid.tsx

import React, { useState } from 'react';
import { Video } from '../types';

interface VideoGridProps {
  videos: Video[];
  onPauseMusic?: () => void;
}

export const VideoGrid: React.FC<VideoGridProps> = ({ videos, onPauseMusic }) => {
  const [playingVideo, setPlayingVideo] = useState<Video | null>(null);

  if (!videos.length) return null;

  const handleWatch = (video: Video) => {
      if (onPauseMusic) onPauseMusic();
      setPlayingVideo(video);
  };

  return (
    <div className="w-full">
      {/* Horizontal Slider */}
      <div className="flex gap-6 overflow-x-auto pb-8 pr-12 no-scrollbar scroll-smooth snap-x">
          {videos.map((video) => (
              <div 
                key={video.id} 
                className="min-w-[320px] md:min-w-[450px] snap-center group cursor-pointer relative"
                onClick={() => handleWatch(video)}
              >
                  {/* Card Container */}
                  <div className="aspect-video bg-[#111] border border-white/10 group-hover:border-[#ff7700] transition-all duration-300 relative overflow-hidden">
                      <img src={video.coverUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-100" />
                      
                      {/* Tech Overlay Lines */}
                      <div className="absolute top-0 left-0 w-full h-[1px] bg-white/10 z-10"></div>
                      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-white/10 z-10"></div>
                      
                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                          <div className="w-16 h-16 bg-[#ff7700] flex items-center justify-center shadow-[0_0_30px_#ff7700]">
                              <svg className="w-6 h-6 text-black fill-current translate-x-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                          </div>
                      </div>

                      {/* Info Badge */}
                      <div className="absolute top-4 left-4 bg-black/80 px-2 py-1 border border-white/10 text-[10px] font-mono text-white uppercase tracking-widest z-20">
                          {video.category}
                      </div>
                  </div>

                  {/* Title Below */}
                  <div className="mt-4 flex justify-between items-start">
                      <div>
                          <h4 className="text-white font-display font-bold text-lg leading-none group-hover:text-[#ff7700] transition-colors">{video.title}</h4>
                          <p className="text-slate-500 text-xs font-mono mt-1 uppercase">{video.author}</p>
                      </div>
                      <div className="text-white/20 font-display font-bold text-2xl group-hover:text-white/40">
                          0{videos.indexOf(video) + 1}
                      </div>
                  </div>
              </div>
          ))}
      </div>

      {/* Full Screen Modal */}
      {playingVideo && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-2xl animate-fade-in" onClick={() => setPlayingVideo(null)}>
              <button className="absolute top-8 right-8 text-white hover:text-[#ff7700]">
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <div className="w-full max-w-7xl px-4" onClick={e => e.stopPropagation()}>
                  <div className="aspect-video bg-black overflow-hidden shadow-2xl border border-white/10">
                      <video src={playingVideo.videoUrl} controls autoPlay className="w-full h-full" />
                  </div>
                  <h2 className="mt-8 text-4xl font-display font-bold text-white">{playingVideo.title}</h2>
              </div>
          </div>
      )}
    </div>
  );
};
