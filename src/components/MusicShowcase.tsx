// src/components/MusicShowcase.tsx

import React, { useState, useEffect, useRef } from 'react';
import { GalleryTrack, Article, GalleryImage, Video, Category } from '../types';
import { SonicMascot } from './SonicMascot';
import { LyricsView } from './LyricsView';
import { ArticleView } from './ArticleView';
import { storageService } from '../services/storageService';

// Module Imports
import { MusicGrid } from './MusicGrid';
import { MusicManager } from './MusicManager';
import { VideoGrid } from './VideoGrid';
import { VideoManager } from './VideoManager';
import { ArticleGrid } from './ArticleGrid';
import { ArticleManager } from './ArticleManager';
import { GalleryGrid } from './GalleryGrid';
import { GalleryManager } from './GalleryManager';
import { CategoryManager } from './CategoryManager';

interface MusicShowcaseProps {
  currentView: 'home' | 'music' | 'video' | 'article' | 'gallery';
  tracks: GalleryTrack[];
  videos: Video[];
  articles: Article[];
  gallery: GalleryImage[];
  categories: Category[];
  
  onUpdateTracks: (d: any) => void;
  onUpdateVideos: (d: any) => void;
  onUpdateArticles: (d: any) => void;
  onUpdateGallery: (d: any) => void;
  onUpdateCategories: (d: any) => void;
  
  onNavigate: (view: any) => void;
  onOpenSettings: () => void;
  onAnalyze: (file: File) => void;
}

// --- NEW ANIMATED LOGO ---
const AnimatedLogo = () => (
    <div className="flex items-center gap-3 group cursor-pointer">
        <div className="flex items-end justify-center gap-[3px] w-8 h-8 p-1 bg-white/5 rounded-lg border border-white/10 group-hover:border-[#ccff00]/50 transition-colors">
            <div className="w-[3px] bg-[#ccff00] h-full animate-[wave_0.8s_ease-in-out_infinite]"></div>
            <div className="w-[3px] bg-[#ccff00] h-1/2 animate-[wave_1.2s_ease-in-out_infinite]"></div>
            <div className="w-[3px] bg-[#ccff00] h-3/4 animate-[wave_0.6s_ease-in-out_infinite]"></div>
        </div>
        <div className="flex flex-col">
            <span className="font-display font-black text-xl tracking-tighter text-white leading-none">NEXUS</span>
            <span className="text-[9px] font-mono text-slate-500 tracking-[0.2em] uppercase group-hover:text-[#ccff00] transition-colors">Audio Lab</span>
        </div>
    </div>
);

// --- NAVBAR ---
const Navbar = ({ onNavigate, onAdmin, onSettings, currentView }: any) => (
    <nav className="fixed top-0 left-0 w-full z-[100] flex justify-between items-center px-8 py-4 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 transition-all">
        <div onClick={() => onNavigate('home')}>
             <AnimatedLogo />
        </div>
        
        {/* Main Nav - Desktop */}
        <div className="hidden lg:flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/5">
            <button onClick={() => onNavigate('home')} className={`px-5 py-2 rounded-full text-xs font-bold uppercase transition-all ${currentView === 'home' ? 'bg-[#ccff00] text-black shadow-[0_0_15px_rgba(204,255,0,0.3)]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>首页</button>
            <button onClick={() => onNavigate('music')} className={`px-5 py-2 rounded-full text-xs font-bold uppercase transition-all ${currentView === 'music' ? 'bg-[#ccff00] text-black shadow-[0_0_15px_rgba(204,255,0,0.3)]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>音乐库</button>
            <button onClick={() => onNavigate('video')} className={`px-5 py-2 rounded-full text-xs font-bold uppercase transition-all ${currentView === 'video' ? 'bg-orange-500 text-black shadow-[0_0_15px_rgba(249,115,22,0.3)]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>影视中心</button>
            <button onClick={() => onNavigate('article')} className={`px-5 py-2 rounded-full text-xs font-bold uppercase transition-all ${currentView === 'article' ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>深度专栏</button>
            <button onClick={() => onNavigate('gallery')} className={`px-5 py-2 rounded-full text-xs font-bold uppercase transition-all ${currentView === 'gallery' ? 'bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>视觉画廊</button>
        </div>

        {/* Tools */}
        <div className="flex items-center gap-4">
            <div className="hidden xl:flex gap-3">
                <button onClick={() => onNavigate('dashboard')} className="text-xs font-bold uppercase text-slate-300 hover:text-[#ccff00] transition-colors border-b border-transparent hover:border-[#ccff00]">音频工坊</button>
                <button onClick={() => onNavigate('custom')} className="text-xs font-bold uppercase text-slate-300 hover:text-[#ff00ff] transition-colors border-b border-transparent hover:border-[#ff00ff]">创意实验室</button>
                <button onClick={() => onNavigate('builder')} className="text-xs font-bold uppercase text-slate-300 hover:text-[#00ffff] transition-colors border-b border-transparent hover:border-[#00ffff]">复刻台</button>
            </div>
            <div className="h-6 w-px bg-white/10 hidden xl:block"></div>
            <button onClick={onAdmin} className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-xs font-bold text-slate-300 hover:text-white hover:border-[#ccff00]/50 hover:bg-[#ccff00]/10 transition-all uppercase tracking-wider">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                CMS
            </button>
            <button onClick={onSettings} className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors border border-white/5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </button>
        </div>
    </nav>
);

const SectionHeader = ({ title, sub, onMore, color="lime" }: { title: string, sub: string, onMore?: () => void, color?: string }) => (
    <div className="flex items-end justify-between mb-8 pb-4 border-b border-white/5 relative group">
        <div className={`absolute bottom-[-1px] left-0 w-0 h-px bg-${color}-500 group-hover:w-32 transition-all duration-700`}></div>
        <div>
            <div className={`text-${color}-500 text-[10px] font-mono font-bold tracking-[0.3em] uppercase mb-3 flex items-center gap-2`}>
                <span className={`w-1.5 h-1.5 bg-${color}-500 rounded-full animate-pulse`}></span>
                {sub}
            </div>
            <h2 className="text-3xl md:text-5xl font-display font-black text-white tracking-tight">{title}</h2>
        </div>
        {onMore && (
            <button onClick={onMore} className="hidden md:flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors group/btn">
                View All <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
            </button>
        )}
    </div>
);

export const MusicShowcase: React.FC<MusicShowcaseProps> = (props) => {
    const [adminMode, setAdminMode] = useState(false);
    const [activeTab, setActiveTab] = useState('music');
    const [playingId, setPlayingId] = useState<string|null>(null);
    const [readingArticle, setReadingArticle] = useState<Article | null>(null);
    const [showLyrics, setShowLyrics] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Audio Refs
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const handleAdmin = async () => {
        const pwd = prompt("请输入管理员密码:");
        if (!pwd) return;
        const valid = await storageService.verifyAuth(pwd);
        if (valid) {
            localStorage.setItem('admin_password', pwd);
            setAdminMode(true);
        } else {
            alert("密码错误");
        }
    };
    
    // --- Audio Logic ---
    const currentTrack = props.tracks.find(t => t.id === playingId);
    
    const handlePlay = (id: string | null) => {
        if (playingId === id) setPlayingId(null);
        else setPlayingId(id);
    };

    const handlePauseMusic = () => setPlayingId(null);

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
            setDuration(audioRef.current.duration || 0);
        }
    };

    const handleSeek = (time: number) => {
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };
    
    const getAudioSrc = (track: GalleryTrack | undefined) => {
        if (!track) return "";
        if (track.sourceType === 'local') return track.src;
        if (track.sourceType === 'netease') {
            return `https://music.163.com/song/media/outer/url?id=${track.src}.mp3`;
        }
        return track.src;
    };
    
    // --- RENDER ARTICLE VIEW ---
    if (readingArticle) {
        return (
            <ArticleView 
                article={readingArticle} 
                relatedTrack={props.tracks.find(t => t.id === readingArticle.trackId)} 
                isPlaying={playingId === readingArticle.trackId}
                onTogglePlay={() => handlePlay(readingArticle.trackId || null)}
                onBack={() => setReadingArticle(null)}
            />
        );
    }

    // --- CMS VIEW ---
    if (adminMode) {
        return (
             <div className="min-h-screen bg-[#020617] text-white pt-24 px-4 md:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-8 border-b border-white/10 pb-6 gap-4">
                        <div>
                            <h1 className="text-3xl font-display font-bold text-white">创作者中心 <span className="text-[#ccff00]">CMS</span></h1>
                            <p className="text-slate-400 text-sm mt-1">管理您的多媒体内容资产</p>
                        </div>
                        <button onClick={() => setAdminMode(false)} className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm font-bold uppercase tracking-wider transition-colors">
                            退出管理
                        </button>
                    </div>

                    <div className="flex gap-2 mb-8 overflow-x-auto pb-2 no-scrollbar">
                        {[
                            {id:'music', label:'🎵 音乐库'},
                            {id:'video', label:'🎬 视频库'},
                            {id:'article', label:'📰 文章专栏'},
                            {id:'gallery', label:'🎨 视觉画廊'},
                            {id:'category', label:'🏷️ 分类管理'}
                        ].map(tab => (
                            <button 
                                key={tab.id} 
                                onClick={() => setActiveTab(tab.id)} 
                                className={`px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-[#ccff00] text-black shadow-lg' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'}`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="bg-[#0f172a] rounded-2xl border border-white/5 p-6 min-h-[500px]">
                        {activeTab === 'music' && <MusicManager tracks={props.tracks} onAdd={t => props.onUpdateTracks([t, ...props.tracks])} onDelete={id => props.onUpdateTracks(props.tracks.filter(t => t.id !== id))} onUpdate={props.onUpdateTracks}/>}
                        {activeTab === 'video' && <VideoManager videos={props.videos} categories={props.categories} onUpdate={props.onUpdateVideos} />}
                        {activeTab === 'article' && <ArticleManager articles={props.articles} tracks={props.tracks} onAdd={a => props.onUpdateArticles([a, ...props.articles])} onDelete={id => props.onUpdateArticles(props.articles.filter(a => a.id !== id))} />}
                        {activeTab === 'gallery' && <GalleryManager images={props.gallery} onUpdate={props.onUpdateGallery} />}
                        {activeTab === 'category' && <CategoryManager categories={props.categories} onUpdate={props.onUpdateCategories} />}
                    </div>
                </div>
            </div>
        );
    }

    // --- LANDING PAGE: VIDEO (NETFLIX STYLE) ---
    if (props.currentView === 'video') {
        const heroVideo = props.videos.find(v => v.isHero) || props.videos[0];
        const videoCats = props.categories.filter(c => c.type === 'video');
        
        return (
            <div className="min-h-screen bg-[#050505] text-white pb-32">
                <Navbar onNavigate={props.onNavigate} onAdmin={handleAdmin} onSettings={props.onOpenSettings} currentView={props.currentView} />
                
                {/* Cinema Hero */}
                <div className="relative w-full h-[70vh]">
                    {heroVideo && (
                         <div className="absolute inset-0">
                            <img src={heroVideo.coverUrl} className="w-100 h-100 object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/20 to-transparent"></div>
                            <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-transparent"></div>
                            
                            <div className="absolute bottom-0 left-0 p-12 md:p-24 max-w-4xl animate-fade-in-up">
                                <div className="text-orange-500 font-bold uppercase tracking-widest text-sm mb-4">今日主推</div>
                                <h1 className="text-6xl md:text-8xl font-display font-black mb-6 leading-none drop-shadow-2xl">{heroVideo.title}</h1>
                                <p className="text-xl text-slate-300 mb-8 max-w-xl line-clamp-3">{heroVideo.description || "探索未来的电影叙事体验。"}</p>
                                <button className="px-8 py-3 bg-white text-black font-bold rounded hover:bg-orange-500 transition-colors flex items-center gap-2">
                                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg> 立即观看
                                </button>
                            </div>
                         </div>
                    )}
                </div>

                <div className="px-8 md:px-16 -mt-20 relative z-10 space-y-12">
                    {videoCats.length > 0 ? videoCats.map(cat => {
                        const catVideos = props.videos.filter(v => v.categoryId === cat.id || v.category === cat.name);
                        if(catVideos.length === 0) return null;
                        return (
                            <section key={cat.id}>
                                <h3 className="text-xl font-bold text-white mb-4 pl-2 border-l-4 border-orange-500">{cat.name}</h3>
                                <VideoGrid videos={catVideos} onPauseMusic={handlePauseMusic} />
                            </section>
                        )
                    }) : (
                         <section>
                            <h3 className="text-xl font-bold text-white mb-6">全部视频</h3>
                            <VideoGrid videos={props.videos} onPauseMusic={handlePauseMusic} />
                        </section>
                    )}
                </div>
            </div>
        );
    }

    // --- LANDING PAGE: MUSIC ---
    if (props.currentView === 'music') {
        return (
            <div className="min-h-screen bg-[#050505] text-white pb-32 pt-24 px-8">
                <Navbar onNavigate={props.onNavigate} onAdmin={handleAdmin} onSettings={props.onOpenSettings} currentView={props.currentView} />
                <div className="max-w-[1600px] mx-auto">
                    <div className="flex items-center justify-between mb-12">
                        <h1 className="text-6xl font-display font-bold">音乐库 <span className="text-[#ccff00]">Library</span></h1>
                        <div className="flex gap-2">
                             <button className="px-6 py-2 rounded-full border border-white/10 hover:bg-white/10 transition-all text-sm font-bold">最新上架</button>
                             <button className="px-6 py-2 rounded-full border border-white/10 hover:bg-white/10 transition-all text-sm font-bold">热门排行</button>
                        </div>
                    </div>
                    
                    <MusicGrid tracks={props.tracks} onPlay={handlePlay} playingId={playingId} />
                </div>
                {/* Re-render Global Player Here for Persistence */}
                 <div className={`fixed bottom-0 left-0 w-full z-[110] transition-transform duration-500 ${playingId ? 'translate-y-0' : 'translate-y-full'}`}>
                    <div className="h-24 bg-[#0a0a0a]/90 backdrop-blur-3xl border-t border-white/10 px-6 flex items-center justify-between">
                         <div className="flex items-center gap-4 w-1/4">
                            {currentTrack && <img src={currentTrack.coverUrl} className="w-14 h-14 rounded object-cover" />}
                            <div>
                                 <h4 className="text-white font-bold text-sm">{currentTrack?.title}</h4>
                                 <p className="text-xs text-slate-400">{currentTrack?.artist}</p>
                            </div>
                         </div>
                         <div className="flex-1 max-w-2xl px-8 flex flex-col justify-center">
                              <div className="flex items-center justify-center gap-4 mb-2">
                                <button onClick={() => setPlayingId(null)} className="w-8 h-8 flex items-center justify-center bg-white text-black rounded-full hover:scale-105"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg></button>
                              </div>
                              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                 <div className="h-full bg-[#ccff00]" style={{ width: `${(currentTime/duration)*100}%` }}></div>
                              </div>
                         </div>
                         <div className="w-1/4 flex justify-end gap-4">
                             <button onClick={() => setShowLyrics(!showLyrics)} className="text-xs font-bold uppercase text-slate-400 hover:text-[#ccff00]">Lyrics</button>
                         </div>
                    </div>
                    {currentTrack && (
                        <audio 
                            ref={audioRef} 
                            src={getAudioSrc(currentTrack)} 
                            autoPlay 
                            onTimeUpdate={handleTimeUpdate}
                            onEnded={() => setPlayingId(null)} 
                            {...{ referrerPolicy: "no-referrer" } as any} 
                        />
                    )}
                </div>
            </div>
        );
    }
    
     // --- LANDING PAGE: ARTICLE ---
    if (props.currentView === 'article') {
        return (
            <div className="min-h-screen bg-[#050505] text-white pb-32 pt-24 px-8">
                <Navbar onNavigate={props.onNavigate} onAdmin={handleAdmin} onSettings={props.onOpenSettings} currentView={props.currentView} />
                <div className="max-w-[1400px] mx-auto">
                    <h1 className="text-6xl font-display font-bold mb-16 text-center">深度专栏 <span className="text-[#00ffff]">Editorial</span></h1>
                    <ArticleGrid articles={props.articles} onRead={setReadingArticle} />
                </div>
            </div>
        );
    }

    // --- LANDING PAGE: GALLERY ---
    if (props.currentView === 'gallery') {
        return (
            <div className="min-h-screen bg-[#050505] text-white pb-32 pt-24 px-8">
                <Navbar onNavigate={props.onNavigate} onAdmin={handleAdmin} onSettings={props.onOpenSettings} currentView={props.currentView} />
                <div className="max-w-[1800px] mx-auto">
                    <h1 className="text-6xl font-display font-bold mb-12">视觉画廊 <span className="text-[#ff00ff]">Visual Arts</span></h1>
                    <GalleryGrid images={props.gallery} />
                </div>
            </div>
        );
    }

    // --- HOME PORTAL (Default) ---
    return (
        <div className="relative w-full min-h-screen bg-[#050505] text-white pb-40">
            <Navbar onNavigate={props.onNavigate} onAdmin={handleAdmin} onSettings={props.onOpenSettings} currentView={props.currentView} />

            {/* HERO */}
            <header className="relative w-full h-[90vh] flex flex-col justify-center items-center overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/50 via-transparent to-[#050505] pointer-events-none"></div>
                
                <div className="z-10 text-center px-4 max-w-5xl mx-auto space-y-8 animate-fade-in-up">
                    <h1 className="text-9xl md:text-[13rem] font-display font-black leading-[0.85] tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 glitch" data-text="NEXUS">
                        NEXUS
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-400 font-light tracking-wide max-w-2xl mx-auto">
                        连接 <span className="text-[#ccff00] font-bold">听觉</span> 与 <span className="text-[#ff00ff] font-bold">视觉</span> 的无界创意生态。
                    </p>
                    <div className="flex justify-center gap-4">
                        <button onClick={() => props.onNavigate('music')} className="px-8 py-4 bg-white text-black font-bold text-lg rounded-full hover:bg-[#ccff00] transition-colors">
                            探索内容库
                        </button>
                        <button onClick={() => fileInputRef.current?.click()} className="px-8 py-4 bg-white/10 backdrop-blur border border-white/20 text-white font-bold text-lg rounded-full hover:bg-white/20 transition-colors flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                            快速分析音频
                        </button>
                        <input type="file" ref={fileInputRef} onChange={(e) => e.target.files && props.onAnalyze(e.target.files[0])} className="hidden" accept="audio/*" />
                    </div>
                </div>
            </header>

            {/* SECTIONS PREVIEW */}
            <main className="max-w-[1800px] mx-auto px-6 md:px-12 space-y-40">
                <section>
                    <SectionHeader title="影视中心" sub="Cinema" color="orange" onMore={() => props.onNavigate('video')} />
                    <VideoGrid videos={props.videos.slice(0, 5)} onPauseMusic={handlePauseMusic} /> 
                </section>
                <section>
                    <SectionHeader title="精选音乐" sub="Music" color="lime" onMore={() => props.onNavigate('music')} />
                    <MusicGrid tracks={props.tracks.slice(0, 8)} onPlay={handlePlay} playingId={playingId} />
                </section>
                <section>
                    <SectionHeader title="深度专栏" sub="Editorial" color="cyan" onMore={() => props.onNavigate('article')} />
                    <ArticleGrid articles={props.articles.slice(0, 2)} onRead={setReadingArticle} />
                </section>
                <section>
                    <SectionHeader title="视觉画廊" sub="Gallery" color="purple" onMore={() => props.onNavigate('gallery')} />
                    <GalleryGrid images={props.gallery.slice(0, 8)} />
                </section>
            </main>

            <footer className="mt-32 py-24 border-t border-white/10 bg-black text-center">
                <h2 className="text-[10rem] font-display font-black text-[#111] leading-none select-none">NEXUS</h2>
                <div className="flex justify-center gap-8 mt-[-40px] text-xs font-mono uppercase tracking-widest text-slate-500">
                    <span>© 2024 Nexus Audio</span>
                    <button onClick={handleAdmin} className="hover:text-[#ccff00]">CMS Login</button>
                </div>
            </footer>
            
            {/* Global Player (Home) */}
            <div className={`fixed bottom-0 left-0 w-full z-[110] transition-transform duration-500 ${playingId ? 'translate-y-0' : 'translate-y-full'}`}>
                <div className="h-24 bg-[#0a0a0a]/90 backdrop-blur-3xl border-t border-white/10 px-6 flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        {currentTrack && <img src={currentTrack.coverUrl} className="w-14 h-14 rounded object-cover" />}
                        <div>
                             <h4 className="text-white font-bold text-sm">{currentTrack?.title}</h4>
                             <p className="text-xs text-slate-400">{currentTrack?.artist}</p>
                        </div>
                     </div>
                     <div className="flex-1 max-w-2xl px-8 flex flex-col justify-center">
                          <div className="flex items-center justify-center gap-4 mb-2">
                                <button onClick={() => setPlayingId(null)} className="w-8 h-8 flex items-center justify-center bg-white text-black rounded-full hover:scale-105"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg></button>
                          </div>
                          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                               <div className="h-full bg-[#ccff00]" style={{ width: `${(currentTime/duration)*100}%` }}></div>
                          </div>
                     </div>
                     <div className="w-1/4 flex justify-end gap-4">
                         <button onClick={() => setShowLyrics(!showLyrics)} className="text-xs font-bold uppercase text-slate-400 hover:text-[#ccff00]">Lyrics</button>
                     </div>
                </div>
                {currentTrack && (
                    <audio 
                        ref={audioRef} 
                        src={getAudioSrc(currentTrack)} 
                        autoPlay 
                        onTimeUpdate={handleTimeUpdate}
                        onEnded={() => setPlayingId(null)} 
                        {...{ referrerPolicy: "no-referrer" } as any} 
                    />
                )}
            </div>
        </div>
    );
}