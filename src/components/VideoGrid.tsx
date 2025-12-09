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
      <div className="flex gap-4 overflow-x-auto pb-8 pr-12 no-scrollbar scroll-smooth">
          {videos.map((video) => (
              <div 
                key={video.id} 
                className="min-w-[300px] md:min-w-[400px] group cursor-pointer relative"
                onClick={() => handleWatch(video)}
              >
                  <div className="aspect-video rounded-lg overflow-hidden border border-white/10 group-hover:border-[#ccff00] transition-colors relative">
                      <img src={video.coverUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center items-center p-6">
                          <div className="w-12 h-12 bg-[#ccff00] rounded-full flex items-center justify-center mb-4 transform scale-0 group-hover:scale-100 transition-transform delay-100">
                              <svg className="w-5 h-5 text-black fill-current translate-x-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                          </div>
                          <h4 className="text-white font-bold text-center text-lg translate-y-4 group-hover:translate-y-0 transition-transform duration-300">{video.title}</h4>
                          <p className="text-[#ccff00] text-xs font-mono mt-2 uppercase tracking-widest">{video.category}</p>
                      </div>
                  </div>
              </div>
          ))}
      </div>

      {/* Full Screen Modal */}
      {playingVideo && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-2xl animate-fade-in" onClick={() => setPlayingVideo(null)}>
              <button className="absolute top-8 right-8 text-white hover:text-[#ccff00]">
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <div className="w-full max-w-7xl px-4" onClick={e => e.stopPropagation()}>
                  <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10">
                      <video src={playingVideo.videoUrl} controls autoPlay className="w-full h-full" />
                  </div>
                  <h2 className="mt-8 text-4xl font-display font-bold text-white">{playingVideo.title}</h2>
              </div>
          </div>
      )}
    </div>
  );
};