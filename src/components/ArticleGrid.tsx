// src/components/ArticleGrid.tsx
import React from 'react';
import { Article } from '../types';

interface ArticleGridProps {
  articles: Article[];
  onRead: (article: Article) => void;
}

export const ArticleGrid: React.FC<ArticleGridProps> = ({ articles, onRead }) => {
  if (articles.length === 0) return null;

  // Split content: 1 Large Hero, others Grid
  const hero = articles[0];
  const grid = articles.slice(1);

  return (
    <div className="w-full flex flex-col lg:flex-row gap-8">
        {/* HERO ARTICLE (Left/Top) */}
        <div 
            onClick={() => onRead(hero)}
            className="flex-[2] group cursor-pointer relative h-[500px] lg:h-[600px] bg-[#111] border border-white/10 overflow-hidden rounded-2xl"
        >
            <div className="absolute inset-0 opacity-70 transition-opacity duration-700 group-hover:opacity-50">
                <img src={hero.coverUrl} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
            
            <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 z-10">
                <div className="inline-block px-3 py-1 border border-cyber/50 text-cyber text-xs font-mono uppercase tracking-widest mb-4 bg-black/50 backdrop-blur rounded">
                    Featured Story
                </div>
                <h3 className="text-4xl md:text-5xl lg:text-6xl font-display font-black text-white uppercase leading-[0.9] mb-4 group-hover:text-cyber transition-colors max-w-2xl">
                    {hero.title}
                </h3>
                <p className="text-slate-300 text-lg mb-6 line-clamp-2 max-w-xl font-light">{hero.subtitle}</p>
                <div className="flex items-center gap-6 text-xs font-mono text-slate-400 uppercase tracking-widest border-t border-white/10 pt-4 max-w-xl">
                    <span>By {hero.author}</span>
                    <span>{new Date(hero.publishedAt).toLocaleDateString()}</span>
                    <span className="ml-auto text-white group-hover:translate-x-2 transition-transform flex items-center gap-1">Read Now <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg></span>
                </div>
            </div>
        </div>

        {/* SIDE LIST (Right/Bottom) */}
        <div className="flex-1 flex flex-col gap-4">
            {grid.map(article => (
                <div key={article.id} onClick={() => onRead(article)} className="group cursor-pointer flex gap-4 p-4 bg-[#0a0a0a] border border-white/10 rounded-xl hover:border-white/30 transition-colors h-full">
                    <div className="w-24 h-24 md:w-32 md:h-full bg-[#111] overflow-hidden relative shrink-0 rounded-lg">
                        <img src={article.coverUrl} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                    </div>
                    <div className="flex flex-col justify-center min-w-0">
                        <div className="text-[10px] text-cyber font-mono mb-1 uppercase tracking-widest">
                            {new Date(article.publishedAt).toLocaleDateString()}
                        </div>
                        <h4 className="text-lg font-bold text-white uppercase leading-tight group-hover:text-cyber transition-colors line-clamp-2 mb-2">
                            {article.title}
                        </h4>
                        <p className="text-slate-500 text-xs line-clamp-2">{article.subtitle || article.content.substring(0, 50)}...</p>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};
