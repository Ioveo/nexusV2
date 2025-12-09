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
          if (!trimmed) return <div key={index} className="h-6"></div>;

          if (line.startsWith('# ')) {
              return <h2 key={index} className="text-3xl md:text-5xl font-display font-bold text-white mt-16 mb-8 leading-tight tracking-tight border-l-4 border-[#00ffff] pl-6">{line.replace('# ', '')}</h2>;
          }
          if (line.startsWith('## ')) {
              return <h3 key={index} className="text-2xl font-bold text-[#ccff00] mt-12 mb-6 tracking-wide">{line.replace('## ', '')}</h3>;
          }
          
          // Image
          const imgMatch = line.match(/!\[(.*?)\]\((.*?)\)/);
          if (imgMatch) {
              return (
                  <div key={index} className="my-16 group">
                      <div className="rounded-xl overflow-hidden border border-white/10 shadow-2xl relative">
                          <img src={imgMatch[2]} alt={imgMatch[1]} className="w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]" />
                      </div>
                      {imgMatch[1] && <p className="text-center text-xs text-slate-500 mt-4 font-mono uppercase tracking-widest">{imgMatch[1]}</p>}
                  </div>
              );
          }
          
          // Paragraphs
          const parts = line.split(/(\*\*.*?\*\*|\*.*?\*)/g);
          return (
              <p key={index} className="text-slate-300 text-lg md:text-xl font-light mb-8 leading-loose tracking-wide selection:bg-[#ccff00] selection:text-black">
                  {parts.map((part, i) => {
                      if (part.startsWith('**') && part.endsWith('**')) return <strong key={i} className="text-white font-bold">{part.slice(2, -2)}</strong>;
                      if (part.startsWith('*') && part.endsWith('*')) return <em key={i} className="text-[#00ffff] not-italic">{part.slice(1, -1)}</em>;
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
            className="fixed top-8 right-8 z-[120] w-12 h-12 bg-black/50 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
        >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="relative w-full h-[70vh] overflow-hidden">
            <div className="absolute inset-0 bg-[#050505]">
                <img 
                    src={article.coverUrl} 
                    className="w-full h-full object-cover opacity-80"
                    style={{ transform: `translateY(${scrollY * 0.4}px) scale(1.05)` }} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent"></div>
            </div>
            
            <div className="absolute bottom-0 left-0 w-full p-8 md:p-20 max-w-5xl mx-auto">
                <span className="inline-block px-3 py-1 rounded border border-[#00ffff]/30 bg-[#00ffff]/10 text-xs font-mono uppercase tracking-widest text-[#00ffff] mb-8 backdrop-blur-md">
                    Editorial Feature
                </span>
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-black text-white leading-tight mb-8 drop-shadow-2xl">
                    {article.title}
                </h1>
                <div className="flex items-center gap-8 text-sm text-slate-300 font-mono tracking-wider">
                    <span className="flex items-center gap-2 font-bold text-white">
                        <div className="w-8 h-8 rounded-full bg-slate-700"></div>
                        {article.author}
                    </span>
                    <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                    <span>5 MIN READ</span>
                </div>
            </div>
        </div>

        <div className="relative max-w-3xl mx-auto px-6 py-20">
            {article.subtitle && (
                <div className="mb-16 pb-12 border-b border-white/10">
                    <p className="text-2xl md:text-3xl font-serif text-white leading-normal italic text-opacity-90">
                        "{article.subtitle}"
                    </p>
                    {/* Integrated Player */}
                    {relatedTrack && (
                        <div onClick={onTogglePlay} className={`mt-8 w-full h-20 bg-[#111] border border-white/10 rounded-2xl flex items-center px-6 gap-6 cursor-pointer hover:bg-[#161616] transition-colors group ${isPlaying ? 'border-[#ccff00]/50' : ''}`}>
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors ${isPlaying ? 'bg-[#ccff00] text-black' : 'bg-white text-black group-hover:scale-110'}`}>
                                {isPlaying ? <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg> : <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>}
                            </div>
                            <div className="flex-1">
                                <span className="text-[10px] font-mono text-[#ccff00] uppercase tracking-wider block mb-1">Audio Companion</span>
                                <span className="text-lg font-bold text-white">{relatedTrack.title}</span>
                                <span className="text-sm text-slate-400 ml-2">- {relatedTrack.artist}</span>
                            </div>
                        </div>
                    )}
                </div>
            )}
            
            <div className="font-serif">
                {renderContent(article.content)}
            </div>
        </div>
    </div>
  );
};