
// src/components/MusicShowcase.tsx

import React, { useState, useRef } from 'react';
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

// Shared UI
import { Navbar, AdminLoginModal, SectionHeader, Marquee, BentoCard, GlobalPlayer } from './Common';

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

export const MusicShowcase: React.FC<MusicShowcaseProps> = (props) => {
    const [adminMode, setAdminMode] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard'); 
    const [playingId, setPlayingId] = useState<string|null>(null);
    const [readingArticle, setReadingArticle] = useState<Article | null>(null);
    const [showLyrics, setShowLyrics] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Audio Refs
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const handleAdminClick = () => {
        const storedPwd = localStorage.getItem('admin_password');
        if (storedPwd) {
            storageService.verifyAuth(storedPwd).then(valid => {
                if (valid) setAdminMode(true); else setShowLoginModal(true);
            });
        } else { setShowLoginModal(true); }
    };

    const handleLoginSubmit = async (pwd: string) => {
        const valid = await storageService.verifyAuth(pwd);
        if (valid) { localStorage.setItem('admin_password', pwd); setAdminMode(true); return true; }
        return false;
    };
    
    // --- Audio Logic ---
    const currentTrack = props.tracks.find(t => t.id === playingId);
    
    const handlePlay = (id: string | null) => {
        if (playingId === id) setPlayingId(null); else setPlayingId(id);
    };

    const handlePauseMusic = () => setPlayingId(null);

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
            setDuration(audioRef.current.duration || 0);
        }
    };

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        if (audioRef.current && duration) {
            const rect = e.currentTarget.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            audioRef.current.currentTime = percent * duration;
        }
    };
    
    const getAudioSrc = (track: GalleryTrack | undefined) => {
        if (!track) return "";
        if (track.sourceType === 'local') return track.src;
        if (track.sourceType === 'netease') return `https://music.163.com/song/media/outer/url?id=${track.src}.mp3`;
        return track.src;
    };

    // --- ADMIN PANEL ---
    const AdminSidebarItem = ({ id, label, icon }: { id: string, label: string, icon: React.ReactNode }) => (
        <button 
            onClick={() => setActiveTab(id)}
            className={`w-full flex items-center gap-4 px-6 py-4 transition-all duration-300 border-r-2 ${activeTab === id ? 'border-lime-500 bg-white/5 text-white' : 'border-transparent text-slate-500 hover:text-white hover:bg-white/5'}`}
        >
            <div className={`w-5 h-5 ${activeTab === id ? 'text-lime-400' : 'text-slate-500'}`}>{icon}</div>
            <span className="text-sm font-bold uppercase tracking-wider">{label}</span>
        </button>
    );

    const renderAdminPanel = () => (
         <div className="fixed inset-0 z-[150] bg-[#050505] text-white flex">
            {/* Sidebar */}
            <div className="w-64 h-full bg-[#0a0a0a] border-r border-white/10 flex flex-col">
                <div className="p-8 border-b border-white/10">
                    <h1 className="text-2xl font-display font-black text-white tracking-tighter">NEXUS <span className="text-lime-500">CORE</span></h1>
                    <p className="text-[10px] text-slate-500 font-mono mt-2 uppercase tracking-widest">System Administration</p>
                </div>
                
                <div className="flex-1 py-6 overflow-y-auto">
                    <AdminSidebarItem id="dashboard" label="概览仪表盘" icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>} />
                    <AdminSidebarItem id="music" label="音乐资源管理" icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>} />
                    <AdminSidebarItem id="video" label="影视库管理" icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>} />
                    <AdminSidebarItem id="article" label="专栏文章管理" icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>} />
                    <AdminSidebarItem id="gallery" label="视觉画廊管理" icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} />
                    <AdminSidebarItem id="category" label="全局分类配置" icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>} />
                </div>

                <div className="p-6 border-t border-white/10">
                    <button onClick={() => setAdminMode(false)} className="w-full py-3 border border-white/20 hover:border-red-500 hover:text-red-500 text-slate-400 font-bold uppercase tracking-widest text-xs transition-colors rounded">
                        退出安全模式
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 bg-[#050505] overflow-y-auto custom-scrollbar relative">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
                <div className="relative z-10 p-8 md:p-12 max-w-[1600px] mx-auto">
                    {/* Header */}
                    <div className="mb-8 flex items-end justify-between">
                         <div>
                             <h2 className="text-3xl font-bold text-white mb-2 uppercase">{activeTab.replace('_', ' ')}</h2>
                             <p className="text-slate-500 text-sm font-mono">Administration Module Active</p>
                         </div>
                    </div>

                    {/* Modules */}
                    <div className="animate-fade-in">
                        {activeTab === 'dashboard' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[
                                    { label: "Total Tracks", val: props.tracks.length, color: "text-lime-400", bg: "bg-lime-500/10" },
                                    { label: "Video Assets", val: props.videos.length, color: "text-orange-400", bg: "bg-orange-500/10" },
                                    { label: "Articles", val: props.articles.length, color: "text-cyan-400", bg: "bg-cyan-500/10" },
                                    { label: "Gallery Items", val: props.gallery.length, color: "text-purple-400", bg: "bg-purple-500/10" }
                                ].map((stat, i) => (
                                    <div key={i} className="bg-[#111]/80 backdrop-blur border border-white/10 p-6 rounded-xl hover:border-white/30 transition-all group">
                                        <div className={`w-12 h-12 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center mb-4 text-xl font-bold`}>
                                            {i === 0 ? '♫' : i === 1 ? '▶' : i === 2 ? 'Aa' : '▣'}
                                        </div>
                                        <div className="text-3xl font-display font-bold text-white mb-1 group-hover:translate-x-1 transition-transform">{stat.val}</div>
                                        <div className="text-xs text-slate-500 uppercase tracking-widest font-mono">{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {activeTab === 'music' && <MusicManager tracks={props.tracks} onAdd={t => props.onUpdateTracks([t, ...props.tracks])} onDelete={id => props.onUpdateTracks(props.tracks.filter(t => t.id !== id))} onUpdate={props.onUpdateTracks}/>}
                        {activeTab === 'video' && <VideoManager videos={props.videos} categories={props.categories} onUpdate={props.onUpdateVideos} />}
                        {activeTab === 'article' && <ArticleManager articles={props.articles} tracks={props.tracks} onAdd={a => props.onUpdateArticles([a, ...props.articles])} onDelete={id => props.onUpdateArticles(props.articles.filter(a => a.id !== id))} />}
                        {activeTab === 'gallery' && <GalleryManager images={props.gallery} onUpdate={props.onUpdateGallery} />}
                        {activeTab === 'category' && <CategoryManager categories={props.categories} onUpdate={props.onUpdateCategories} />}
                    </div>
                </div>
            </div>
        </div>
    );

    // --- HOME VIEW REDESIGNED ---
    const renderHomeView = () => {
        const heroVideo = props.videos.find(v => v.isHero) || props.videos[0];
        
        return (
            <div className="relative z-10 w-full min-h-screen text-white overflow-hidden pb-32">
                {/* 1. DYNAMIC BACKGROUND LAYER */}
                <div className="fixed inset-0 bg-aurora opacity-30 pointer-events-none z-[-1]"></div>
                <div className="fixed inset-0 bg-gradient-to-b from-transparent via-[#050505]/50 to-[#050505] z-[-1]"></div>
                
                {/* 2. IMMERSIVE HERO (Edge to Edge) */}
                <div className="relative w-full h-screen mb-8 group overflow-hidden">
                    {/* Hero Content Background */}
                    <div className="absolute inset-0">
                        {heroVideo ? (
                            heroVideo.videoUrl ? 
                            <video src={heroVideo.videoUrl} className="w-full h-full object-cover" autoPlay muted loop playsInline /> 
                            : <img src={heroVideo.coverUrl} className="w-full h-full object-cover" />
                        ) : <div className="w-full h-full bg-slate-900"></div>}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/20 to-transparent"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent"></div>
                    </div>

                    {/* Hero Text */}
                    <div className="absolute bottom-0 left-0 p-8 md:p-16 lg:p-24 w-full md:w-2/3 flex flex-col items-start gap-6 pb-32">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                            <span className="text-xs font-bold uppercase tracking-widest">全站首映</span>
                        </div>
                        <h1 className="text-6xl md:text-8xl font-display font-black leading-none tracking-tighter drop-shadow-2xl mix-blend-overlay opacity-90">
                            {heroVideo?.title || "NEXUS AUDIO"}
                        </h1>
                        <p className="text-lg md:text-xl text-slate-200 font-light max-w-xl leading-relaxed border-l-4 border-acid pl-6 bg-black/20 backdrop-blur-sm p-4 rounded-r-xl">
                            {heroVideo?.description || "体验下一代视听合成技术。"}
                        </p>
                        <div className="flex items-center gap-4 mt-4">
                            <button onClick={() => props.onNavigate('video')} className="px-8 py-4 bg-white text-black font-bold uppercase tracking-widest rounded-xl hover:bg-acid hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                                立即观看
                            </button>
                            <button onClick={() => props.onNavigate('music')} className="px-8 py-4 bg-black/30 backdrop-blur-md border border-white/30 text-white font-bold uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all">
                                探索更多
                            </button>
                        </div>
                    </div>
                </div>

                {/* 3. FLOATING DOCK NAVIGATION */}
                <div className="sticky top-[90vh] z-50 flex justify-center -mt-24 pointer-events-none">
                    <div className="pointer-events-auto bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-2 flex items-center gap-2 shadow-[0_10px_40px_rgba(0,0,0,0.5)] animate-float">
                        {[
                            { id: 'music', icon: '♫', label: 'Music' },
                            { id: 'video', icon: '▶', label: 'Cinema' },
                            { id: 'article', icon: 'Aa', label: 'Read' },
                            { id: 'gallery', icon: '▣', label: 'Art' },
                            { id: 'dashboard', icon: '⚡', label: 'Studio' }
                        ].map(item => (
                            <button 
                                key={item.id} 
                                onClick={() => props.onNavigate(item.id)}
                                className="w-16 h-16 rounded-xl flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-white hover:bg-white/10 hover:scale-110 transition-all group relative"
                            >
                                <span className="text-xl group-hover:text-acid transition-colors">{item.icon}</span>
                                <span className="text-[9px] font-bold uppercase tracking-wider">{item.label}</span>
                                <div className="absolute -bottom-1 w-1 h-1 bg-acid rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 4. CONTENT SWIMLANES */}
                <div className="relative z-20 max-w-[1800px] mx-auto space-y-32 px-4 md:px-12 mt-32">
                    
                    {/* Latest Music */}
                    <section>
                         <div className="flex items-end justify-between mb-12 border-b border-white/10 pb-4">
                            <div>
                                <h2 className="text-4xl md:text-5xl font-display font-bold uppercase tracking-tight">Sonic Layers</h2>
                                <p className="text-sm font-mono text-acid mt-2 tracking-[0.3em]">/// LATEST_AUDIO_DROPS</p>
                            </div>
                            <button onClick={() => props.onNavigate('music')} className="hidden md:block text-xs font-bold uppercase tracking-widest hover:text-acid transition-colors">View All Music &rarr;</button>
                        </div>
                        <MusicGrid tracks={props.tracks.slice(0, 10)} onPlay={handlePlay} playingId={playingId} />
                    </section>

                    {/* Articles & Gallery Split */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
                        <section className="bg-white/5 border border-white/5 rounded-3xl p-8 hover:border-cyan-500/30 transition-colors group">
                            <SectionHeader title="Editorial" sub="Deep_Dive" color="cyber" onMore={() => props.onNavigate('article')} />
                            <div className="mt-8">
                                <ArticleGrid articles={props.articles.slice(0, 2)} onRead={setReadingArticle} />
                            </div>
                        </section>
                        
                        <section className="bg-white/5 border border-white/5 rounded-3xl p-8 hover:border-neon/30 transition-colors group">
                            <SectionHeader title="Gallery" sub="Visual_Arts" color="neon" onMore={() => props.onNavigate('gallery')} />
                            <div className="mt-8">
                                <GalleryGrid images={props.gallery.slice(0, 4)} />
                            </div>
                        </section>
                    </div>

                    {/* Tools CTA */}
                    <section className="relative rounded-[3rem] overflow-hidden bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-white/10 p-12 md:p-24 text-center">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
                        <h2 className="text-4xl md:text-7xl font-display font-black mb-8">CREATE WITH AI</h2>
                        <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-12 font-light">
                            Analyze audio structure, generate Suno prompts, and explore musical DNA with our advanced AI tools.
                        </p>
                        <button onClick={() => fileInputRef.current?.click()} className="px-12 py-5 bg-white text-black font-bold text-lg rounded-full hover:bg-acid hover:scale-105 transition-all shadow-xl uppercase tracking-widest">
                            Start Analysis
                        </button>
                        <input type="file" ref={fileInputRef} onChange={(e) => e.target.files && props.onAnalyze(e.target.files[0])} className="hidden" accept="audio/*" />
                    </section>
                </div>

                <footer className="mt-32 border-t border-white/10 bg-[#020202] py-12 text-center text-xs text-slate-500 font-mono">
                    NEXUS AUDIO LAB © 2024 SYSTEM CORE // DESIGNED FOR THE FUTURE
                </footer>
            </div>
        );
    };

    // --- ROOT RENDER ---
    return (
        <div className={`min-h-screen bg-[#050505] text-white ${adminMode ? '' : 'pb-0'}`}>
            <AdminLoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} onLogin={handleLoginSubmit} />
            
            {/* Navbar */}
            {!adminMode && !readingArticle && (
                <Navbar 
                    onNavigate={props.onNavigate} 
                    onAdmin={handleAdminClick} 
                    onSettings={props.onOpenSettings} 
                    currentView={props.currentView} 
                    transparent={true} // Always transparent for new layout
                />
            )}

            {/* Content Switcher */}
            {adminMode ? renderAdminPanel() : (
                readingArticle ? (
                    <ArticleView 
                        article={readingArticle} 
                        relatedTrack={props.tracks.find(t => t.id === readingArticle.trackId)} 
                        isPlaying={playingId === readingArticle.trackId}
                        onTogglePlay={() => handlePlay(readingArticle.trackId || null)}
                        onBack={() => setReadingArticle(null)}
                    />
                ) : (
                    <>
                        {props.currentView === 'home' && renderHomeView()}
                        {props.currentView === 'music' && (
                            <div className="pt-24 min-h-screen bg-black/90">
                                <MusicGrid tracks={props.tracks} onPlay={handlePlay} playingId={playingId} />
                            </div>
                        )}
                        {props.currentView === 'video' && <VideoGrid videos={props.videos} onPauseMusic={handlePauseMusic} />}
                        {props.currentView === 'article' && (
                            <div className="pt-24 px-4 md:px-8 max-w-[1600px] mx-auto min-h-screen">
                                <SectionHeader title="深度专栏" sub="Editorial_Hub" color="cyber" />
                                <ArticleGrid articles={props.articles} onRead={setReadingArticle} />
                            </div>
                        )}
                        {props.currentView === 'gallery' && (
                            <div className="pt-24 px-4 md:px-8 max-w-[1600px] mx-auto min-h-screen">
                                <SectionHeader title="视觉画廊" sub="Visual_Arts" color="neon" />
                                <GalleryGrid images={props.gallery} />
                            </div>
                        )}
                    </>
                )
            )}

            {/* GLOBAL AUDIO */}
            {currentTrack && (
                <audio 
                    ref={audioRef} 
                    src={getAudioSrc(currentTrack)} 
                    autoPlay 
                    preload="metadata"
                    crossOrigin="anonymous" 
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={() => setPlayingId(null)}
                    onError={(e) => { console.error("Audio playback error:", e); }} 
                    {...{ referrerPolicy: "no-referrer" } as any} 
                    className="hidden"
                />
            )}

            {/* Global Players */}
            {!adminMode && (
                <>
                    <GlobalPlayer 
                        track={currentTrack} 
                        playingId={playingId} 
                        currentTime={currentTime} 
                        duration={duration} 
                        onTogglePlay={() => { if(audioRef.current?.paused) audioRef.current.play(); else audioRef.current?.pause(); setPlayingId(null); }}
                        onSeek={handleSeek}
                        onToggleLyrics={() => setShowLyrics(!showLyrics)}
                        showLyrics={showLyrics}
                        onClose={(e) => { e.stopPropagation(); setPlayingId(null); }}
                    />
                    
                    <SonicMascot isPlaying={!!playingId} sourceType={currentTrack?.sourceType || null} />
                    
                    {showLyrics && currentTrack && (
                        <LyricsView 
                            title={currentTrack.title} 
                            artist={currentTrack.artist} 
                            coverUrl={currentTrack.coverUrl} 
                            lyrics={currentTrack.lyrics}
                            currentTime={currentTime}
                            onSeek={(t) => { if (audioRef.current) audioRef.current.currentTime = t; }}
                            onClose={() => setShowLyrics(false)}
                        />
                    )}
                </>
            )}
        </div>
    );
};
