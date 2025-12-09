// src/components/ArticleGrid.tsx
import React from 'react';
import { Article } from '../types';

interface ArticleGridProps {
  articles: Article[];
  onRead: (article: Article) => void;
}

export const ArticleGrid: React.FC<ArticleGridProps> = ({ articles, onRead }) => {
  if (articles.length === 0) return null;

  // Split content: 1 Hero, 3 Side, Rest Grid
  const hero = articles[0];
  const side = articles.slice(1, 4);
  const grid = articles.slice(4);

  return (
    <div className="w-full space-y-16">
        
        {/* --- MAGAZINE HERO SECTION --- */}
        <div className="flex flex-col lg:flex-row gap-12">
            
            {/* Left: Hero Article */}
            <div 
                className="lg:w-2/3 group cursor-pointer relative h-[500px] lg:h-[600px] rounded-2xl overflow-hidden shadow-2xl border border-white/5"
                onClick={() => onRead(hero)}
            >
                <img src={hero.coverUrl} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                
                <div className="absolute bottom-0 left-0 w-full p-8 md:p-12">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 bg-cyan-500 text-black text-xs font-bold uppercase tracking-widest rounded-full">Featured Story</span>
                        <span className="text-slate-300 text-xs font-mono">{new Date(hero.publishedAt).toLocaleDateString()}</span>
                    </div>
                    <h3 className="text-3xl md:text-5xl font-display font-black text-white mb-4 leading-tight group-hover:text-cyan-400 transition-colors">{hero.title}</h3>
                    <p className="text-slate-300 text-lg line-clamp-2 max-w-2xl font-light leading-relaxed">{hero.subtitle || hero.content.slice(0, 100)}</p>
                    
                    <div className="mt-8 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white border border-white/20">{hero.author[0]}</div>
                        <span className="text-sm font-bold text-white">{hero.author}</span>
                        <span className="text-slate-500 text-xs mx-2">•</span>
                        <span className="text-slate-400 text-xs uppercase tracking-wider">5 Min Read</span>
                    </div>
                </div>
            </div>

            {/* Right: Trending List */}
            <div className="lg:w-1/3 flex flex-col gap-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
                    <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400">Trending Now</h4>
                </div>
                
                {side.map((article, idx) => (
                    <div key={article.id} onClick={() => onRead(article)} className="group cursor-pointer flex gap-4 items-start">
                        <div className="text-2xl font-display font-black text-white/20 group-hover:text-cyan-500/50 transition-colors">0{idx + 2}</div>
                        <div className="flex-1">
                            <h4 className="text-lg font-bold text-white leading-snug mb-2 group-hover:text-cyan-400 transition-colors line-clamp-2">{article.title}</h4>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <span className="font-bold text-slate-400 uppercase">{article.author}</span>
                                <span>•</span>
                                <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <div className="w-24 h-24 shrink-0 rounded-lg overflow-hidden border border-white/5">
                            <img src={article.coverUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>
                    </div>
                ))}

                {side.length === 0 && (
                    <div className="h-full flex items-center justify-center text-slate-600 text-sm italic border border-dashed border-white/10 rounded-xl">
                        More stories coming soon...
                    </div>
                )}
            </div>
        </div>

        {/* --- LATEST GRID --- */}
        {grid.length > 0 && (
            <div className="pt-12 border-t border-white/10">
                <h3 className="text-2xl font-display font-bold text-white mb-8">Latest Articles</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                    {grid.map(article => (
                        <div key={article.id} onClick={() => onRead(article)} className="group cursor-pointer">
                            <div className="aspect-[16/10] rounded-xl overflow-hidden mb-6 border border-white/5 relative">
                                <img src={article.coverUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                            </div>
                            <div className="flex items-center gap-3 mb-3 text-xs">
                                <span className="text-cyan-500 font-bold uppercase tracking-wider">Editorial</span>
                                <span className="text-slate-600">•</span>
                                <span className="text-slate-500">{new Date(article.publishedAt).toLocaleDateString()}</span>
                            </div>
                            <h4 className="text-xl font-bold text-white mb-3 leading-tight group-hover:text-cyan-400 transition-colors">{article.title}</h4>
                            <p className="text-slate-400 text-sm leading-relaxed line-clamp-3">{article.subtitle || article.content}</p>
                            
                            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">
                                Read Story <span className="group-hover:translate-x-1 transition-transform">→</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>
  );
};