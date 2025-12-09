
import React, { useState, useEffect } from 'react';
import { Article, GalleryTrack } from '../types';

interface ArticleViewProps {
  article: Article;
  relatedTrack?: GalleryTrack;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onBack: () => void;
}

// Minimal Floating Player
const MinimalPlayer = ({ track, isPlaying, onToggle }: { track: GalleryTrack, isPlaying: boolean, onToggle: () => void }) => {
    return (
        <div className="fixed bottom-8 right-8 z-[150] flex items-center gap-4 bg-black/80 backdrop-blur-xl border border-white/10 pr-6 pl-2 py-2 rounded-full shadow-[0_0_30px_rgba(0,0,0,0.5)] animate-fade-in hover:border-acid/50 transition-colors group">
            <button 
                onClick={onToggle}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isPlaying ? 'bg-acid text-black shadow-[0_0_15px_#ccff00]' : 'bg-white/10 text-white hover:bg-white hover:text-black'}`}
            >
                {isPlaying ? (
                    <div className="flex gap-1 h-3 items-end">
                        <div className="w-1 bg-black animate-[bounce_1s_infinite]"></div>
                        <div className="w-1 bg-black animate-[bounce_1.2s_infinite]"></div>
                        <div className="w-1 bg-black animate-[bounce_0.8s_infinite]"></div>
                    </div>
                ) : (
                    <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                )}
            </button>
            
            <div className="flex flex-col">
                <span className="text-[9px] text-acid font-mono uppercase tracking-widest leading-none mb-1">Audio Companion</span>
                <div className="flex flex-col leading-tight">
                    <span className="text-sm font-bold text-white max-w-[150px] truncate">{track.title}</span>
                    <span className="text-xs text-slate-400 max-w-[150px] truncate">{track.artist}</span>
                </div>
            </div>
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

  const renderContent = (content: string) => {
      const lines = content.split('\n');
      return lines.map((line, index) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={index} className="h-6"></div>;

          if (line.startsWith('# ')) {
              return <h2 key={index} className="text-3xl md:text-5xl font-display font-black text-white mt-12 mb-6 tracking-tight leading-none">{line.replace('# ', '')}</h2>;
          }
          if (line.startsWith('## ')) {
              return <h3 key={index} className="text-2xl font-bold text-acid mt-10 mb-4 tracking-wide flex items-center gap-3"><span className="w-4 h-px bg-acid"></span>{line.replace('## ', '')}</h3>;
          }
          
          const imgMatch = line.match(/!\[(.*?)\]\((.*?)\)/);
          if (imgMatch) {
              return (
                  <div key={index} className="my-12">
                      <div className="rounded border border-white/10 overflow-hidden relative">
                          <img src={imgMatch[2]} alt={imgMatch[1]} className="w-full object-cover" />
                          <div className="absolute bottom-0 left-0 bg-black/60 backdrop-blur px-3 py-1 text-[10px] text-white font-mono uppercase border-t border-r border-white/10">
                              {imgMatch[1] || 'Figure'}
                          </div>
                      </div>
                  </div>
              );
          }
          
          const parts = line.split(/(\*\*.*?\*\*|\*.*?\*)/g);
          return (
              <p key={index} className="text-slate-300 text-lg md:text-xl font-light mb-6 leading-relaxed text-justify mix-blend-screen">
                  {parts.map((part, i) => {
                      if (part.startsWith('**') && part.endsWith('**')) return <strong key={i} className="text-white font-bold decoration-acid underline decoration-2 underline-offset-4">{part.slice(2, -2)}</strong>;
                      if (part.startsWith('*') && part.endsWith('*')) return <em key={i} className="text-cyan-400 not-italic font-serif italic">{part.slice(1, -1)}</em>;
                      return part;
                  })}
              </p>
          );
      });
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#050505] overflow-y-auto animate-fade-in custom-scrollbar">
        {/* Back Button */}
        <button 
            onClick={onBack}
            className="fixed top-6 right-6 z-[120] w-12 h-12 bg-black/20 backdrop-blur-md border border-white/10 hover:border-acid rounded-full flex items-center justify-center text-white transition-all group"
        >
            <svg className="w-5 h-5 group-hover:scale-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        {/* Progress Bar */}
        <div className="fixed top-0 left-0 h-1 bg-acid z-[130]" style={{ width: `${Math.min((scrollY / (document.body.scrollHeight - window.innerHeight)) * 100, 100)}%` }}></div>

        {/* Cinematic Header */}
        <div className="relative w-full h-[50vh] md:h-[60vh] overflow-hidden">
            <div className="absolute inset-0">
                <img 
                    src={article.coverUrl} 
                    className="w-full h-full object-cover"
                    style={{ transform: `translateY(${scrollY * 0.5}px) scale(1.1)` }} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent"></div>
            </div>
            
            <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 lg:p-20 max-w-5xl mx-auto flex flex-col justify-end h-full">
                <div className="flex items-center gap-3 mb-6">
                    <span className="px-2 py-0.5 border border-acid text-acid text-[10px] font-mono uppercase tracking-widest bg-black/50 backdrop-blur">
                        Editorial
                    </span>
                    <span className="text-slate-400 text-[10px] font-mono uppercase tracking-widest">
                        {new Date(article.publishedAt).toLocaleDateString()}
                    </span>
                </div>
                
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-black text-white leading-[0.9] mb-6 tracking-tighter text-shadow-lg">
                    {article.title}
                </h1>

                {article.subtitle && (
                    <p className="text-xl md:text-2xl text-slate-200 font-light italic border-l-4 border-acid pl-6 max-w-2xl leading-relaxed">
                        {article.subtitle}
                    </p>
                )}
            </div>
        </div>

        {/* Content Body */}
        <div className="relative max-w-3xl mx-auto px-6 py-12">
            {/* Meta Row */}
            <div className="flex items-center justify-between border-b border-white/10 pb-8 mb-12">
                <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 border border-white/10 flex items-center justify-center text-xs font-bold text-white">
                         {article.author.substring(0,2).toUpperCase()}
                     </div>
                     <div className="flex flex-col">
                         <span className="text-xs font-bold text-white uppercase tracking-wide">{article.author}</span>
                         <span className="text-[10px] text-slate-500 font-mono">NEXUS SENIOR EDITOR</span>
                     </div>
                </div>
                <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                    Read Time: 5 Min
                </div>
            </div>

            {/* Markdown Content */}
            <div className="font-serif">
                {renderContent(article.content)}
            </div>

            {/* Footer */}
            <div className="mt-24 pt-12 border-t border-white/10 flex flex-col items-center gap-4 opacity-50">
                <div className="w-2 h-2 rounded-full bg-acid"></div>
                <p className="text-[10px] font-mono uppercase tracking-[0.3em]">End of Transmission</p>
            </div>
        </div>

        {/* Floating Player */}
        {relatedTrack && (
            <MinimalPlayer track={relatedTrack} isPlaying={isPlaying} onToggle={onTogglePlay} />
        )}
    </div>
  );
};
