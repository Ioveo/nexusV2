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
    const [activeTab, setActiveTab] = useState('dashboard'); // Changed default to dashboard for admin
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

    // --- RENDER CONTENT HELPERS ---

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
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-lime-500/5 to-transparent pointer-events-none"></div>

                <div className="relative z-10 p-8 md:p-12 max-w-[1600px] mx-auto">
                    {/* Header */}
                    <div className="mb-8 flex items-end justify-between">
                         <div>
                             <h2 className="text-3xl font-bold text-white mb-2 uppercase">{activeTab.replace('_', ' ')}</h2>
                             <p className="text-slate-500 text-sm font-mono">Administration Module Active</p>
                         </div>
                         <div className="flex items-center gap-2 px-3 py-1 bg-lime-500/10 border border-lime-500/20 rounded-full">
                             <div className="w-2 h-2 bg-lime-500 rounded-full animate-pulse"></div>
                             <span className="text-[10px] text-lime-500 font-mono uppercase tracking-widest">Server Online</span>
                         </div>
                    </div>

                    {/* Dashboard View */}
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
                            <div className="col-span-full mt-8 bg-[#111]/50 border border-white/10 rounded-xl p-8 text-center border-dashed">
                                <p className="text-slate-500 text-sm">请从左侧菜单选择要管理的资源模块。</p>
                            </div>
                        </div>
                    )}

                    {/* Modules */}
                    <div className="animate-fade-in">
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

    const renderHomeView = () => (
        <div className="relative z-10 pt-24 pb-12 px-4 md:px-8 max-w-[1800px] mx-auto">
            {/* BENTO HERO */}
            <div className="grid grid-cols-1 md:grid-cols-12 md:grid-rows-2 gap-4 h-auto md:h-[600px] mb-24">
                <BentoCard className="md:col-span-8 md:row-span-2 flex flex-col justify-between bg-[url('https://grainy-gradients.vercel.app/noise.svg')]">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-2 h-2 bg-acid animate-pulse"></div>
                            <span className="text-xs font-mono text-acid uppercase tracking-widest">System Online</span>
                        </div>
                        <h1 className="text-[15vw] md:text-[9rem] font-display font-black leading-[0.8] tracking-tighter text-white mix-blend-difference">NEXUS</h1>
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-6">
                        <p className="text-xl md:text-2xl text-slate-300 font-light max-w-lg">连接 <span className="text-acid font-bold">听觉</span> 与 <span className="text-neon font-bold">视觉</span> 的下一代智能终端。</p>
                        <button onClick={() => props.onNavigate('music')} className="px-8 py-4 bg-white text-black font-bold uppercase tracking-widest hover:bg-acid transition-all">探索媒体库 &rarr;</button>
                    </div>
                </BentoCard>
                <BentoCard className="md:col-span-4 md:row-span-1 flex flex-col justify-between">
                        <div className="text-5xl font-display font-bold text-white tracking-tighter">{new Date().getHours().toString().padStart(2,'0')}:{new Date().getMinutes().toString().padStart(2,'0')}</div>
                        <div className="text-xs font-mono text-slate-400 uppercase">Secure Connection</div>
                </BentoCard>
                <BentoCard onClick={() => fileInputRef.current?.click()} className="md:col-span-2 md:row-span-1 flex flex-col items-center justify-center text-center gap-4 hover:bg-white/5 cursor-pointer">
                        <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:border-acid">⚡</div>
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-300">音频分析</span>
                        <input type="file" ref={fileInputRef} onChange={(e) => e.target.files && props.onAnalyze(e.target.files[0])} className="hidden" accept="audio/*" />
                </BentoCard>
                <BentoCard className="md:col-span-2 md:row-span-1 relative flex items-center bg-acid/5 border-acid/20">
                        <div className="w-full text-center"><span className="text-4xl font-black text-acid">V5</span></div>
                </BentoCard>
            </div>

            <div className="space-y-32">
                <section>
                    <Marquee text="CINEMA EXPERIENCE" opacity={0.05} />
                    <div className="relative z-10 -mt-20">
                        <SectionHeader title="影视中心" sub="影视数据库 / Cinema DB" color="orange" onMore={() => props.onNavigate('video')} />
                        <div className="hidden lg:block"><VideoGrid videos={props.videos} onPauseMusic={handlePauseMusic} /></div>
                        <div className="lg:hidden text-center text-slate-500 text-xs">请在桌面端获得最佳观影体验</div>
                    </div>
                </section>
                <section>
                    <SectionHeader title="精选音乐" sub="精选歌单 / Featured Tracks" color="acid" onMore={() => props.onNavigate('music')} />
                    <MusicGrid tracks={props.tracks} onPlay={handlePlay} playingId={playingId} />
                </section>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                    <section>
                        <SectionHeader title="深度专栏" sub="深度编辑 / Editorial Hub" color="cyber" onMore={() => props.onNavigate('article')} />
                        <ArticleGrid articles={props.articles.slice(0, 2)} onRead={setReadingArticle} />
                    </section>
                    <section>
                        <SectionHeader title="视觉画廊" sub="艺术画廊 / Visual Arts" color="neon" onMore={() => props.onNavigate('gallery')} />
                        <GalleryGrid images={props.gallery.slice(0, 6)} />
                    </section>
                </div>
            </div>
            
             <footer className="mt-32 border-t border-white/10 bg-[#020202] py-12 text-center text-xs text-slate-500 font-mono">
                NEXUS AUDIO LAB © 2024 SYSTEM CORE
            </footer>
        </div>
    );

    // Determines what main content to render based on `currentView`
    const renderContent = () => {
        if (adminMode) return renderAdminPanel();
        if (readingArticle) return null; // ArticleView overlays everything, handled below in root return

        switch(props.currentView) {
            case 'home': 
                return renderHomeView();
            case 'video':
                // Video Grid (Transparent BG implied by not having bg-color on wrapper in VideoGrid)
                return <VideoGrid videos={props.videos} onPauseMusic={handlePauseMusic} />;
            case 'music':
                return (
                    <div className="pt-24 md:pt-0"> {/* Special padding for Music view if needed, but MusicGrid handles hero */}
                        <MusicGrid tracks={props.tracks} onPlay={handlePlay} playingId={playingId} />
                    </div>
                );
            case 'article':
                return (
                    <div className="pt-24 px-4 md:px-8 max-w-[1600px] mx-auto">
                        <SectionHeader title="深度专栏" sub="Editorial_Hub" color="cyber" />
                        <ArticleGrid articles={props.articles} onRead={setReadingArticle} />
                    </div>
                );
            case 'gallery':
                return (
                    <div className="pt-24 px-4 md:px-8 max-w-[1600px] mx-auto">
                        <SectionHeader title="视觉画廊" sub="Visual_Arts" color="neon" />
                        <GalleryGrid images={props.gallery} />
                    </div>
                );
            default: return null;
        }
    };

    // --- ROOT RENDER ---
    return (
        <div className={`min-h-screen bg-[#050505] text-white ${adminMode ? '' : 'pb-32'}`}>
            <AdminLoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} onLogin={handleLoginSubmit} />
            
            {/* Navbar - Hide in Admin, or if reading article */}
            {!adminMode && !readingArticle && (
                <Navbar 
                    onNavigate={props.onNavigate} 
                    onAdmin={handleAdminClick} 
                    onSettings={props.onOpenSettings} 
                    currentView={props.currentView} 
                    transparent={props.currentView === 'video' || props.currentView === 'music'} 
                />
            )}

            {/* Main Content Area */}
            {renderContent()}

            {/* Article Overlay */}
            {readingArticle && (
                <ArticleView 
                    article={readingArticle} 
                    relatedTrack={props.tracks.find(t => t.id === readingArticle.trackId)} 
                    isPlaying={playingId === readingArticle.trackId}
                    onTogglePlay={() => handlePlay(readingArticle.trackId || null)}
                    onBack={() => setReadingArticle(null)}
                />
            )}

            {/* GLOBAL AUDIO - PERSISTENT IN DOM */}
            {/* This ensures audio doesn't restart when React re-renders layout components */}
            {currentTrack && (
                <audio 
                    ref={audioRef} 
                    src={getAudioSrc(currentTrack)} 
                    autoPlay 
                    preload="metadata"
                    crossOrigin="anonymous" 
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={() => setPlayingId(null)}
                    onError={(e) => {
                        console.error("Audio playback error:", e);
                    }} 
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
