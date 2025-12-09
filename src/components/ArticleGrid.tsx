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
    <div className="w-full">
        {/* HERO ARTICLE */}
        <div 
            onClick={() => onRead(hero)}
            className="group cursor-pointer relative w-full h-[500px] bg-[#111] border border-white/10 mb-8 overflow-hidden"
        >
            <div className="absolute inset-0 opacity-60 transition-opacity duration-700 group-hover:opacity-40">
                <img src={hero.coverUrl} className="w-full h-full object-cover" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
            
            <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 z-10">
                <div className="inline-block px-3 py-1 border border-cyber text-cyber text-xs font-mono uppercase tracking-widest mb-4 bg-black/50 backdrop-blur">
                    Featured_Story
                </div>
                <h3 className="text-4xl md:text-6xl font-display font-black text-white uppercase leading-[0.9] mb-4 group-hover:text-cyber transition-colors max-w-4xl">
                    {hero.title}
                </h3>
                <div className="flex items-center gap-6 text-xs font-mono text-slate-400 uppercase tracking-widest border-t border-white/10 pt-4 max-w-xl">
                    <span>By {hero.author}</span>
                    <span>{new Date(hero.publishedAt).toLocaleDateString()}</span>
                    <span className="ml-auto text-white group-hover:translate-x-2 transition-transform">Read_Now -></span>
                </div>
            </div>
        </div>

        {/* LIST */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {grid.map(article => (
                <div key={article.id} onClick={() => onRead(article)} className="group cursor-pointer flex flex-col gap-4">
                    <div className="aspect-[3/2] bg-[#111] border border-white/10 overflow-hidden relative">
                        <img src={article.coverUrl} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                        <div className="absolute top-0 right-0 bg-black text-white text-xs font-mono px-2 py-1 border-l border-b border-white/10">
                            READ
                        </div>
                    </div>
                    <div>
                        <div className="text-xs text-cyber font-mono mb-1 uppercase tracking-widest">
                            {new Date(article.publishedAt).toLocaleDateString()}
                        </div>
                        <h4 className="text-xl font-bold text-white uppercase leading-tight group-hover:text-cyber transition-colors line-clamp-2">
                            {article.title}
                        </h4>
                        <p className="text-slate-500 text-sm mt-2 line-clamp-2">{article.subtitle || article.content}</p>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};
