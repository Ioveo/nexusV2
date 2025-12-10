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
    const [activeTab, setActiveTab] = useState('music');
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
    
    // --- LAYOUT WRAPPER ---
    const MainLayout = ({ children, transparent = false }: { children: React.ReactNode, transparent?: boolean }) => (
        <div className={`min-h-screen bg-[#050505] text-white ${transparent ? '' : 'pb-32'}`}>
            <Navbar onNavigate={props.onNavigate} onAdmin={handleAdminClick} onSettings={props.onOpenSettings} currentView={props.currentView} transparent={transparent} />
            <AdminLoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} onLogin={handleLoginSubmit} />
            
            {children}

            {/* Global Audio Elements */}
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

            {currentTrack && (
                <audio 
                    ref={audioRef} 
                    src={getAudioSrc(currentTrack)} 
                    autoPlay 
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={() => setPlayingId(null)} 
                    {...{ referrerPolicy: "no-referrer" } as any} 
                    className="hidden"
                />
            )}
        </div>
    );

    // --- VIEW ROUTING ---

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

    if (adminMode) {
        // CMS View (Simplified for brevity, logic remains in Manager components)
        return (
             <div className="min-h-screen bg-[#020617] text-white pt-24 px-4 md:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center mb-8 pb-6 border-b border-white/10">
                        <h1 className="text-3xl font-display font-bold">SYSTEM CORE <span className="text-acid text-sm ml-2">CMS</span></h1>
                        <button onClick={() => setAdminMode(false)} className="px-4 py-2 border border-white/20 text-xs">EXIT</button>
                    </div>
                    <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
                        {['music','video','article','gallery','category'].map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2 text-xs font-bold uppercase border ${activeTab === tab ? 'bg-acid text-black border-acid' : 'border-white/10'}`}>{tab}</button>
                        ))}
                    </div>
                    <div className="bg-[#0f172a]/50 border border-white/5 p-6 rounded-xl min-h-[500px]">
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

    if (props.currentView === 'video') {
        return (
            <MainLayout transparent={true}>
                <VideoGrid videos={props.videos} onPauseMusic={handlePauseMusic} />
            </MainLayout>
        );
    }

    if (props.currentView === 'home') {
        return (
            <MainLayout>
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
                                <SectionHeader title="影视中心" sub="Cinema_Database" color="orange" onMore={() => props.onNavigate('video')} />
                                <div className="hidden lg:block"><VideoGrid videos={props.videos} onPauseMusic={handlePauseMusic} /></div>
                                <div className="lg:hidden text-center text-slate-500 text-xs">Please view on desktop</div>
                            </div>
                        </section>
                        <section>
                            <SectionHeader title="精选音乐" sub="Featured_Tracks" color="acid" onMore={() => props.onNavigate('music')} />
                            <MusicGrid tracks={props.tracks} onPlay={handlePlay} playingId={playingId} />
                        </section>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                            <section>
                                <SectionHeader title="深度专栏" sub="Editorial_Hub" color="cyber" onMore={() => props.onNavigate('article')} />
                                <ArticleGrid articles={props.articles.slice(0, 2)} onRead={setReadingArticle} />
                            </section>
                            <section>
                                <SectionHeader title="视觉画廊" sub="Gallery_Arts" color="neon" onMore={() => props.onNavigate('gallery')} />
                                <GalleryGrid images={props.gallery.slice(0, 6)} />
                            </section>
                        </div>
                    </div>
                </div>
                
                <footer className="mt-32 border-t border-white/10 bg-[#020202] py-12 text-center text-xs text-slate-500 font-mono">
                    NEXUS AUDIO LAB © 2024 SYSTEM CORE
                </footer>
            </MainLayout>
        );
    }

    // Default Page Wrapper
    const SimpleLayout = ({ children, title, subtitle, color }: any) => (
        <MainLayout>
            <div className="max-w-[1600px] mx-auto pt-24 px-4 md:px-8">
                <div className="mb-12 border-b border-white/10 pb-6">
                    <h1 className="text-5xl md:text-7xl font-display font-black text-white uppercase tracking-tighter mb-2">{title}</h1>
                    <p className={`text-xl font-mono text-${color}`}>{subtitle}</p>
                </div>
                {children}
            </div>
        </MainLayout>
    );

    if (props.currentView === 'music') return <SimpleLayout title="精选音乐" subtitle="// Sonic_Archive" color="acid"><MusicGrid tracks={props.tracks} onPlay={handlePlay} playingId={playingId} /></SimpleLayout>;
    if (props.currentView === 'article') return <SimpleLayout title="深度专栏" subtitle="// Editorial_Hub" color="cyber"><ArticleGrid articles={props.articles} onRead={setReadingArticle} /></SimpleLayout>;
    if (props.currentView === 'gallery') return <SimpleLayout title="视觉画廊" subtitle="// Visual_Arts" color="neon"><GalleryGrid images={props.gallery} /></SimpleLayout>;

    return null;
};
