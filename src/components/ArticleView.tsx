// src/components/ArticleView.tsx

import React, { useState, useEffect } from 'react';
import { Article, GalleryTrack } from '../types';

interface ArticleViewProps {
  article: Article;
  relatedTrack?: GalleryTrack;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onBack: () => void;
}

const CompactPlayer = ({ track, isPlaying, onToggle }: { track: GalleryTrack, isPlaying: boolean, onToggle: () => void }) => {
    const [expanded, setExpanded] = useState(false);

    // Auto expand if playing
    useEffect(() => {
        if(isPlaying) setExpanded(true);
    }, [isPlaying]);

    return (
        <div 
            onClick={() => { if(!expanded) { setExpanded(true); onToggle(); } }}
            className={`
                h-14 bg-[#1a1a1a] border border-white/10 rounded-full flex items-center gap-4 cursor-pointer transition-all duration-500 ease-out overflow-hidden relative group
                ${expanded ? 'w-full px-2 border-[#ccff00]/50' : 'w-14 justify-center hover:bg-white/10'}
            `}
        >
            {/* Play Button Icon */}
            <div 
                onClick={(e) => { e.stopPropagation(); onToggle(); }}
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors z-10 ${isPlaying ? 'bg-[#ccff00] text-black' : 'bg-white text-black'}`}
            >
                {isPlaying ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                ) : (
                    <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                )}
            </div>

            {/* Track Info (Only visible when expanded) */}
            <div className={`flex-1 min-w-0 transition-opacity duration-300 ${expanded ? 'opacity-100' : 'opacity-0'}`}>
                <div className="flex flex-col justify-center">
                    <span className="text-[10px] text-[#ccff00] font-mono uppercase tracking-widest leading-none mb-1">Audio Companion</span>
                    <div className="flex items-baseline gap-2">
                        <span className="text-sm font-bold text-white truncate">{track.title}</span>
                        <span className="text-xs text-slate-400 truncate hidden md:inline">- {track.artist}</span>
                    </div>
                </div>
            </div>
            
            {/* Waveform Animation */}
            {expanded && isPlaying && (
                 <div className="flex gap-1 pr-6 h-4 items-center">
                    <div className="w-1 bg-[#ccff00] animate-pulse h-full"></div>
                    <div className="w-1 bg-[#ccff00] animate-pulse h-2/3 delay-75"></div>
                    <div className="w-1 bg-[#ccff00] animate-pulse h-full delay-150"></div>
                 </div>
            )}
        </div>
    );
};

export const ArticleView: React.FC<ArticleViewProps> = ({ article, relatedTrack, isPlaying, onTogglePlay, onBack }) => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Advanced Content Rendering
  const renderContent = (content: string) => {
      const lines = content.split('\n');
      return lines.map((line, index) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={index} className="h-8"></div>;

          if (line.startsWith('# ')) {
              return <h2 key={index} className="text-3xl md:text-4xl font-display font-bold text-white mt-16 mb-8 leading-tight tracking-tight border-l-4 border-cyan-500 pl-6">{line.replace('# ', '')}</h2>;
          }
          if (line.startsWith('## ')) {
              return <h3 key={index} className="text-2xl font-bold text-slate-200 mt-12 mb-6 tracking-wide flex items-center gap-3"><span className="w-2 h-2 bg-[#ccff00] rounded-full"></span>{line.replace('## ', '')}</h3>;
          }
          
          // Image
          const imgMatch = line.match(/!\[(.*?)\]\((.*?)\)/);
          if (imgMatch) {
              return (
                  <div key={index} className="my-16 group">
                      <div className="rounded-xl overflow-hidden border border-white/10 shadow-2xl relative">
                          <img src={imgMatch[2]} alt={imgMatch[1]} className="w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]" />
                      </div>
                      {imgMatch[1] && <p className="text-center text-xs text-slate-500 mt-4 font-mono uppercase tracking-widest border-t border-white/5 pt-2 inline-block px-4">{imgMatch[1]}</p>}
                  </div>
              );
          }
          
          // Paragraphs
          const parts = line.split(/(\*\*.*?\*\*|\*.*?\*)/g);
          return (
              <p key={index} className="text-slate-300 text-lg md:text-xl font-light mb-8 leading-loose tracking-wide selection:bg-[#ccff00] selection:text-black text-justify">
                  {parts.map((part, i) => {
                      if (part.startsWith('**') && part.endsWith('**')) return <strong key={i} className="text-white font-bold border-b border-[#ccff00]/30">{part.slice(2, -2)}</strong>;
                      if (part.startsWith('*') && part.endsWith('*')) return <em key={i} className="text-cyan-400 not-italic font-serif italic">{part.slice(1, -1)}</em>;
                      return part;
                  })}
              </p>
          );
      });
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#050505] overflow-y-auto animate-fade-in custom-scrollbar">
        <button 
            onClick={onBack}
            className="fixed top-8 right-8 z-[120] w-12 h-12 bg-black/50 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-white hover:text-black transition-all group"
        >
            <svg className="w-6 h-6 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>

        {/* Parallax Cover */}
        <div className="relative w-full h-[60vh] overflow-hidden">
            <div className="absolute inset-0 bg-[#050505]">
                <img 
                    src={article.coverUrl} 
                    className="w-full h-full object-cover opacity-60"
                    style={{ transform: `translateY(${scrollY * 0.4}px) scale(1.05)` }} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/50 to-transparent"></div>
            </div>
            
            <div className="absolute bottom-0 left-0 w-full p-8 md:p-20 max-w-5xl mx-auto">
                <span className="inline-block px-3 py-1 rounded border border-cyan-500/30 bg-cyan-900/20 text-xs font-mono uppercase tracking-widest text-cyan-400 mb-6 backdrop-blur-md">
                    Featured Editorial
                </span>
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-black text-white leading-[0.9] mb-8 drop-shadow-2xl max-w-4xl">
                    {article.title}
                </h1>
            </div>
        </div>

        <div className="relative max-w-3xl mx-auto px-6 pb-32 -mt-10">
            {/* Meta Block */}
            <div className="flex items-center justify-between border-b border-white/10 pb-8 mb-12">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-800 border border-white/10"></div>
                    <div>
                        <div className="text-sm font-bold text-white">{article.author}</div>
                        <div className="text-xs text-slate-500 font-mono">Senior Editor</div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-sm text-slate-300 font-mono">{new Date(article.publishedAt).toLocaleDateString()}</div>
                    <div className="text-xs text-slate-500 font-mono uppercase">Read Time: 5 min</div>
                </div>
            </div>

            {/* Subtitle & Player */}
            {article.subtitle && (
                <div className="mb-16">
                    <p className="text-2xl md:text-3xl font-serif text-slate-200 leading-normal italic opacity-90 mb-8 pl-6 border-l-2 border-[#ccff00]">
                        "{article.subtitle}"
                    </p>
                    {/* Compact Integrated Player */}
                    {relatedTrack && (
                        <div className="flex items-center gap-4 pl-6">
                            <CompactPlayer track={relatedTrack} isPlaying={isPlaying} onToggle={onTogglePlay} />
                        </div>
                    )}
                </div>
            )}
            
            <div className="font-serif">
                {renderContent(article.content)}
            </div>
            
            <div className="mt-20 pt-10 border-t border-white/10 text-center">
                <div className="w-8 h-1 bg-[#ccff00] mx-auto mb-4"></div>
                <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">End of Article</p>
            </div>
        </div>
    </div>
  );
};
