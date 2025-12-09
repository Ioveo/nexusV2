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

// --- UI COMPONENTS ---

const Marquee = ({ text, reverse = false, opacity = 1 }: { text: string, reverse?: boolean, opacity?: number }) => (
    <div className="relative flex overflow-hidden py-2 bg-transparent pointer-events-none select-none z-0" style={{ opacity }}>
        <div className={`animate-${reverse ? 'marquee-reverse' : 'marquee'} whitespace-nowrap flex gap-8 items-center`}>
            {Array(10).fill(0).map((_, i) => (
                <span key={i} className="text-[4rem] md:text-[8rem] font-display font-black text-white/5 uppercase leading-none">
                    {text}
                </span>
            ))}
        </div>
        <div className={`absolute top-0 animate-${reverse ? 'marquee-reverse' : 'marquee'} whitespace-nowrap flex gap-8 items-center ml-[100%]`}>
            {Array(10).fill(0).map((_, i) => (
                <span key={i} className="text-[4rem] md:text-[8rem] font-display font-black text-white/5 uppercase leading-none">
                    {text}
                </span>
            ))}
        </div>
    </div>
);

const BentoCard = ({ children, className = "", onClick }: { children?: React.ReactNode, className?: string, onClick?: () => void }) => (
    <div 
        onClick={onClick}
        className={`bg-[#080808] border border-white/10 p-6 relative overflow-hidden group hover:border-acid/50 transition-all duration-300 ${className} ${onClick ? 'cursor-pointer' : ''}`}
    >
        {/* Decor */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/30"></div>
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/30"></div>
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/30"></div>
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/30"></div>
        {children}
    </div>
);

// --- NAVBAR ---
const Navbar = ({ onNavigate, onAdmin, onSettings, currentView }: any) => (
    <nav className="fixed top-0 left-0 w-full z-[100] flex justify-between items-center px-4 md:px-8 py-4 bg-[#050505]/80 backdrop-blur-md border-b border-white/5">
        <div onClick={() => onNavigate('home')} className="cursor-pointer group">
             <div className="font-display font-black text-2xl tracking-tighter text-white leading-none">NEXUS</div>
             <div className="h-0.5 w-0 bg-acid group-hover:w-full transition-all duration-300"></div>
        </div>
        
        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-1">
            {['home', 'music', 'video', 'article', 'gallery'].map(v => (
                 <button 
                    key={v}
                    onClick={() => onNavigate(v)} 
                    className={`px-6 py-2 text-xs font-bold uppercase tracking-widest transition-all clip-path-slant ${currentView === v ? 'bg-white text-black' : 'text-slate-400 hover:text-acid hover:bg-white/5'}`}
                    style={{ clipPath: 'polygon(10% 0, 100% 0, 90% 100%, 0% 100%)' }}
                 >
                    {v}
                 </button>
            ))}
        </div>

        {/* Tools */}
        <div className="flex items-center gap-4">
             <div className="hidden xl:flex gap-4 mr-4">
                <button onClick={() => onNavigate('dashboard')} className="text-xs font-mono text-slate-400 hover:text-white">[ AUDIO_LAB ]</button>
                <button onClick={() => onNavigate('custom')} className="text-xs font-mono text-slate-400 hover:text-neon">[ CREATIVE_V5 ]</button>
            </div>
            <button onClick={onAdmin} className="w-8 h-8 flex items-center justify-center border border-white/10 hover:border-acid/50 text-slate-400 hover:text-acid transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </button>
            <button onClick={onSettings} className="w-8 h-8 flex items-center justify-center border border-white/10 hover:border-acid/50 text-slate-400 hover:text-acid transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </button>
        </div>
    </nav>
);

const SectionHeader = ({ title, sub, onMore, color="acid" }: { title: string, sub: string, onMore?: () => void, color?: string }) => {
    const colorClass = color === 'acid' ? 'text-acid' : color === 'neon' ? 'text-neon' : color === 'cyber' ? 'text-cyber' : 'text-orange-500';
    const bgClass = color === 'acid' ? 'bg-acid' : color === 'neon' ? 'bg-neon' : color === 'cyber' ? 'bg-cyber' : 'bg-orange-500';

    return (
        <div className="flex items-end justify-between mb-8 pb-2 border-b border-white/10 relative group">
            <div className={`absolute bottom-[-1px] left-0 w-8 h-[2px] ${bgClass} group-hover:w-full transition-all duration-700 ease-out`}></div>
            <div>
                <div className={`text-[10px] font-mono font-bold tracking-[0.3em] uppercase mb-1 flex items-center gap-2 ${colorClass}`}>
                    <span className={`w-1 h-1 rounded-full ${bgClass} animate-pulse-fast`}></span>
                    {sub}
                </div>
                <h2 className="text-4xl md:text-6xl font-display font-bold text-white tracking-tighter uppercase leading-[0.85]">
                    {title}
                </h2>
            </div>
            {onMore && (
                <button onClick={onMore} className="hidden md:flex items-center gap-2 px-4 py-2 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-black hover:bg-white transition-all">
                    View_All
                </button>
            )}
        </div>
    );
};

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
        const pwd = prompt("AUTH_REQUIRED // ENTER PASSWORD:");
        if (!pwd) return;
        const valid = await storageService.verifyAuth(pwd);
        if (valid) {
            localStorage.setItem('admin_password', pwd);
            setAdminMode(true);
        } else {
            alert("ACCESS DENIED");
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
                            <h1 className="text-3xl font-display font-bold text-white">SYSTEM <span className="text-acid">CORE</span></h1>
                            <p className="text-slate-400 text-xs font-mono mt-1">CONTENT MANAGEMENT SYSTEM</p>
                        </div>
                        <button onClick={() => setAdminMode(false)} className="px-6 py-2 border border-white/10 text-xs font-bold uppercase tracking-wider hover:bg-white hover:text-black transition-colors">
                            LOGOUT
                        </button>
                    </div>

                    <div className="flex gap-2 mb-8 overflow-x-auto pb-2 no-scrollbar">
                        {[
                            {id:'music', label:'Music_DB'},
                            {id:'video', label:'Video_DB'},
                            {id:'article', label:'Editorial_DB'},
                            {id:'gallery', label:'Visual_DB'},
                            {id:'category', label:'Taxonomy'}
                        ].map(tab => (
                            <button 
                                key={tab.id} 
                                onClick={() => setActiveTab(tab.id)} 
                                className={`px-6 py-3 border text-sm font-bold uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-acid text-black border-acid' : 'bg-black text-slate-400 border-white/10 hover:border-white'}`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="bg-[#0f172a]/50 backdrop-blur rounded-xl border border-white/5 p-6 min-h-[500px]">
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

    // --- HOME PORTAL (BENTO GRID DESIGN) ---
    if (props.currentView === 'home') {
        return (
            <div className="relative w-full min-h-screen bg-[#050505] text-white pb-40 overflow-hidden">
                <Navbar onNavigate={props.onNavigate} onAdmin={handleAdmin} onSettings={props.onOpenSettings} currentView={props.currentView} />

                {/* BACKGROUND DECOR */}
                <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
                     <div className="absolute top-[20%] left-[-10%] w-[50vw] h-[50vw] bg-acid/5 rounded-full blur-[120px]"></div>
                     <div className="absolute bottom-[20%] right-[-10%] w-[50vw] h-[50vw] bg-neon/5 rounded-full blur-[120px]"></div>
                </div>

                {/* BENTO HERO */}
                <div className="relative z-10 pt-24 pb-12 px-4 md:px-8 max-w-[1800px] mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-12 md:grid-rows-2 gap-4 h-auto md:h-[600px] mb-24">
                        
                        {/* 1. MAIN TITLE (Large) */}
                        <BentoCard className="md:col-span-8 md:row-span-2 flex flex-col justify-between bg-[url('https://grainy-gradients.vercel.app/noise.svg')]">
                            <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-acid/10 to-transparent"></div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-2 h-2 bg-acid animate-pulse"></div>
                                    <span className="text-xs font-mono text-acid uppercase tracking-widest">System Online</span>
                                </div>
                                <h1 className="text-[15vw] md:text-[9rem] lg:text-[11rem] font-display font-black leading-[0.8] tracking-tighter text-white mix-blend-difference select-none">
                                    NEXUS
                                </h1>
                            </div>
                            <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-6">
                                <p className="text-xl md:text-2xl text-slate-300 font-light max-w-lg leading-relaxed">
                                    Connecting <span className="text-acid font-bold">Auditory</span> & <span className="text-neon font-bold">Visual</span> Intelligence.
                                </p>
                                <button onClick={() => props.onNavigate('music')} className="px-8 py-4 bg-white text-black font-bold uppercase tracking-widest hover:bg-acid hover:scale-105 transition-all w-full md:w-auto">
                                    Explore Library
                                </button>
                            </div>
                        </BentoCard>

                        {/* 2. STATS / TIME */}
                        <BentoCard className="md:col-span-4 md:row-span-1 flex flex-col justify-between group">
                             <div className="flex justify-between items-start">
                                 <span className="text-xs font-mono text-slate-500">[ DATETIME ]</span>
                                 <div className="flex gap-1">
                                     <div className="w-1 h-4 bg-acid/20"></div>
                                     <div className="w-1 h-4 bg-acid/40"></div>
                                     <div className="w-1 h-4 bg-acid"></div>
                                 </div>
                             </div>
                             <div className="text-5xl md:text-7xl font-display font-bold text-white tracking-tighter tabular-nums">
                                 {new Date().getHours().toString().padStart(2,'0')}:{new Date().getMinutes().toString().padStart(2,'0')}
                             </div>
                             <div className="text-xs font-mono text-slate-400 uppercase">
                                 Secure Connection Established
                             </div>
                        </BentoCard>

                        {/* 3. QUICK UPLOAD */}
                        <BentoCard onClick={() => fileInputRef.current?.click()} className="md:col-span-2 md:row-span-1 flex flex-col items-center justify-center text-center gap-4 hover:bg-white/5 cursor-pointer">
                             <div className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center group-hover:border-acid group-hover:scale-110 transition-all">
                                 <svg className="w-8 h-8 text-white group-hover:text-acid" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                             </div>
                             <span className="text-xs font-bold uppercase tracking-widest text-slate-300 group-hover:text-white">Analyze Audio</span>
                             <input type="file" ref={fileInputRef} onChange={(e) => e.target.files && props.onAnalyze(e.target.files[0])} className="hidden" accept="audio/*" />
                        </BentoCard>

                        {/* 4. DECORATIVE MARQUEE BOX */}
                        <BentoCard className="md:col-span-2 md:row-span-1 relative flex items-center bg-acid/5 border-acid/20">
                             <div className="absolute inset-0 flex items-center opacity-30">
                                 <div className="animate-marquee whitespace-nowrap text-[4rem] font-bold text-acid leading-none font-display">
                                     AUDIO VISUAL AUDIO VISUAL
                                 </div>
                             </div>
                             <div className="relative z-10 w-full text-center">
                                 <span className="text-4xl font-black text-acid">V5</span>
                             </div>
                        </BentoCard>
                    </div>

                    {/* SECTIONS */}
                    <div className="space-y-32">
                        
                        <section className="relative">
                            <Marquee text="CINEMA EXPERIENCE" opacity={0.05} />
                            <div className="relative z-10 -mt-20">
                                <SectionHeader title="Cinema" sub="Featured_Video" color="orange" onMore={() => props.onNavigate('video')} />
                                <VideoGrid videos={props.videos.slice(0, 10)} onPauseMusic={handlePauseMusic} />
                            </div>
                        </section>

                        <section className="relative">
                            <Marquee text="SONIC ARCHITECTURE" reverse opacity={0.05} />
                            <div className="relative z-10 -mt-20">
                                <SectionHeader title="Music" sub="Trending_Tracks" color="acid" onMore={() => props.onNavigate('music')} />
                                <MusicGrid tracks={props.tracks.slice(0, 8)} onPlay={handlePlay} playingId={playingId} />
                            </div>
                        </section>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                            <section>
                                <SectionHeader title="Editorial" sub="Deep_Dive" color="cyber" onMore={() => props.onNavigate('article')} />
                                <ArticleGrid articles={props.articles.slice(0, 2)} onRead={setReadingArticle} />
                            </section>
                            <section>
                                <SectionHeader title="Gallery" sub="Visual_Arts" color="neon" onMore={() => props.onNavigate('gallery')} />
                                <GalleryGrid images={props.gallery.slice(0, 6)} />
                            </section>
                        </div>
                    </div>
                </div>

                {/* FOOTER */}
                <footer className="mt-32 border-t border-white/10 bg-[#020202] relative overflow-hidden">
                    <Marquee text="NEXUS AUDIO LAB" opacity={0.1} />
                    <div className="max-w-7xl mx-auto px-8 py-12 flex flex-col md:flex-row justify-between items-center relative z-10">
                        <div className="text-center md:text-left mb-8 md:mb-0">
                            <h2 className="text-2xl font-display font-black text-white mb-2">NEXUS</h2>
                            <p className="text-xs text-slate-500 font-mono">© 2024 SYSTEM CORE. ALL RIGHTS RESERVED.</p>
                        </div>
                        <div className="flex gap-8 text-xs font-bold uppercase tracking-widest text-slate-500">
                             <button onClick={() => props.onNavigate('home')} className="hover:text-white">Home</button>
                             <button onClick={() => props.onNavigate('music')} className="hover:text-white">Library</button>
                             <button onClick={handleAdmin} className="hover:text-acid">Admin</button>
                        </div>
                    </div>
                </footer>
                
                {/* GLOBAL PLAYER */}
                <div className={`fixed bottom-0 left-0 w-full z-[110] transition-transform duration-500 ease-out ${playingId ? 'translate-y-0' : 'translate-y-full'}`}>
                    <div className="h-24 bg-[#0a0a0a]/90 backdrop-blur-2xl border-t border-white/10 px-4 md:px-8 flex items-center justify-between shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                         <div className="flex items-center gap-4 w-1/3">
                            {currentTrack && <img src={currentTrack.coverUrl} className="w-14 h-14 object-cover border border-white/10" />}
                            <div className="hidden md:block">
                                 <h4 className="text-white font-bold text-sm uppercase tracking-wide">{currentTrack?.title}</h4>
                                 <p className="text-xs text-acid font-mono">{currentTrack?.artist}</p>
                            </div>
                         </div>
                         
                         <div className="flex-1 max-w-xl flex flex-col justify-center items-center">
                              <div className="flex items-center gap-6 mb-3">
                                <button className="text-slate-500 hover:text-white"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg></button>
                                <button onClick={() => setPlayingId(null)} className="w-10 h-10 flex items-center justify-center bg-acid text-black hover:scale-105 transition-transform"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg></button>
                                <button className="text-slate-500 hover:text-white"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg></button>
                              </div>
                              <div className="w-full h-0.5 bg-white/10 relative group cursor-pointer">
                                 <div className="absolute top-0 left-0 h-full bg-acid group-hover:bg-white transition-colors" style={{ width: `${(currentTime/duration)*100}%` }}></div>
                              </div>
                         </div>

                         <div className="w-1/3 flex justify-end gap-4">
                             <button onClick={() => setShowLyrics(!showLyrics)} className="text-[10px] font-bold uppercase border border-white/20 px-3 py-1 text-slate-400 hover:text-white hover:border-white transition-all">Lyrics</button>
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

                {/* VISUALIZER MASCOT */}
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
            </div>
        );
    }
    
    // --- OTHER VIEWS (Simple wrappers) ---
    const SimpleLayout = ({ children, title, subtitle, color="acid" }: any) => (
        <div className="min-h-screen bg-[#050505] text-white pb-32 pt-24 px-4 md:px-8">
            <Navbar onNavigate={props.onNavigate} onAdmin={handleAdmin} onSettings={props.onOpenSettings} currentView={props.currentView} />
            <div className="max-w-[1600px] mx-auto">
                <div className="mb-12 border-b border-white/10 pb-6">
                    <h1 className="text-6xl md:text-8xl font-display font-black text-white uppercase tracking-tighter mb-2">{title}</h1>
                    <p className={`text-xl font-mono ${color === 'acid' ? 'text-acid' : color === 'neon' ? 'text-neon' : 'text-cyber'}`}>// {subtitle}</p>
                </div>
                {children}
            </div>
             {/* Global Player (Persistent) */}
             <div className={`fixed bottom-0 left-0 w-full z-[110] transition-transform duration-500 ease-out ${playingId ? 'translate-y-0' : 'translate-y-full'}`}>
                    <div className="h-24 bg-[#0a0a0a]/90 backdrop-blur-2xl border-t border-white/10 px-4 md:px-8 flex items-center justify-between shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                         <div className="flex items-center gap-4 w-1/3">
                            {currentTrack && <img src={currentTrack.coverUrl} className="w-14 h-14 object-cover border border-white/10" />}
                            <div className="hidden md:block">
                                 <h4 className="text-white font-bold text-sm uppercase tracking-wide">{currentTrack?.title}</h4>
                                 <p className="text-xs text-acid font-mono">{currentTrack?.artist}</p>
                            </div>
                         </div>
                         
                         <div className="flex-1 max-w-xl flex flex-col justify-center items-center">
                              <div className="flex items-center gap-6 mb-3">
                                <button className="text-slate-500 hover:text-white"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg></button>
                                <button onClick={() => setPlayingId(null)} className="w-10 h-10 flex items-center justify-center bg-acid text-black hover:scale-105 transition-transform"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg></button>
                                <button className="text-slate-500 hover:text-white"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg></button>
                              </div>
                              <div className="w-full h-0.5 bg-white/10 relative group cursor-pointer">
                                 <div className="absolute top-0 left-0 h-full bg-acid group-hover:bg-white transition-colors" style={{ width: `${(currentTime/duration)*100}%` }}></div>
                              </div>
                         </div>

                         <div className="w-1/3 flex justify-end gap-4">
                             <button onClick={() => setShowLyrics(!showLyrics)} className="text-[10px] font-bold uppercase border border-white/20 px-3 py-1 text-slate-400 hover:text-white hover:border-white transition-all">Lyrics</button>
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

    if (props.currentView === 'video') return <SimpleLayout title="Cinema" subtitle="Visual_Database" color="orange"><VideoGrid videos={props.videos} onPauseMusic={handlePauseMusic} /></SimpleLayout>;
    if (props.currentView === 'music') return <SimpleLayout title="Library" subtitle="Sonic_Archive" color="acid"><MusicGrid tracks={props.tracks} onPlay={handlePlay} playingId={playingId} /></SimpleLayout>;
    if (props.currentView === 'article') return <SimpleLayout title="Editorial" subtitle="Deep_Research" color="cyber"><ArticleGrid articles={props.articles} onRead={setReadingArticle} /></SimpleLayout>;
    if (props.currentView === 'gallery') return <SimpleLayout title="Gallery" subtitle="Visual_Arts" color="neon"><GalleryGrid images={props.gallery} /></SimpleLayout>;

    return null; // Should not reach here
}
