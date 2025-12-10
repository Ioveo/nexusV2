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
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/30 group-hover:border-acid transition-colors"></div>
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/30 group-hover:border-acid transition-colors"></div>
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/30 group-hover:border-acid transition-colors"></div>
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/30 group-hover:border-acid transition-colors"></div>
        {children}
    </div>
);

// --- ADMIN MODAL ---
const AdminLoginModal = ({ isOpen, onClose, onLogin }: { isOpen: boolean, onClose: () => void, onLogin: (pwd: string) => Promise<boolean> }) => {
    const [pwd, setPwd] = useState('');
    const [error, setError] = useState(false);
    
    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await onLogin(pwd);
        if (success) {
            onClose();
            setPwd('');
            setError(false);
        } else {
            setError(true);
            setPwd('');
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in">
             <div className="w-full max-w-sm bg-[#0a0a0a] border border-acid/30 p-8 relative shadow-[0_0_50px_rgba(204,255,0,0.1)]">
                 <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white">✕</button>
                 <div className="text-center mb-8">
                     <div className="w-16 h-16 bg-acid/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-acid/20">
                        <svg className="w-8 h-8 text-acid" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                     </div>
                     <h3 className="text-xl font-display font-bold text-white uppercase tracking-widest">System Access</h3>
                     <p className="text-xs font-mono text-acid mt-2">身份验证 // AUTHENTICATION</p>
                 </div>
                 <form onSubmit={handleSubmit} className="space-y-4">
                     <input 
                        type="password" 
                        value={pwd}
                        onChange={e => setPwd(e.target.value)}
                        placeholder="输入密钥..."
                        className="w-full bg-black border border-white/20 p-3 text-center text-white font-mono tracking-[0.5em] focus:border-acid outline-none transition-colors"
                        autoFocus
                     />
                     {error && <p className="text-center text-red-500 text-xs font-mono animate-pulse">ACCESS DENIED // 密码错误</p>}
                     <button type="submit" className="w-full py-3 bg-acid text-black font-bold uppercase tracking-widest hover:bg-white transition-colors">
                         UNLOCK
                     </button>
                 </form>
             </div>
        </div>
    );
};

// --- ARRANGEMENT MASTER DROPDOWN ---
const ArrangementMasterDropdown = ({ onNavigate }: { onNavigate: (v: string) => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="relative group" onMouseEnter={() => setIsOpen(true)} onMouseLeave={() => setIsOpen(false)}>
            <button className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-acid px-4 py-2">
                编曲大师 <svg className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            <div className={`absolute top-full right-0 w-64 bg-[#0a0a0a] border border-white/10 shadow-xl transition-all duration-200 z-50 ${isOpen ? 'opacity-100 translate-y-0 visible' : 'opacity-0 translate-y-2 invisible'}`}>
                <div className="p-1">
                    <button onClick={() => onNavigate('dashboard')} className="flex items-center gap-3 w-full p-3 hover:bg-white/5 text-left group/item">
                        <div className="w-8 h-8 rounded bg-acid/10 flex items-center justify-center text-acid group-hover/item:bg-acid group-hover/item:text-black transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                        </div>
                        <div>
                            <div className="text-xs font-bold text-white uppercase">音乐工坊</div>
                            <div className="text-[10px] text-slate-500">Audio Lab (上传/分析)</div>
                        </div>
                    </button>

                    <button onClick={() => onNavigate('dashboard')} className="flex items-center gap-3 w-full p-3 hover:bg-white/5 text-left group/item">
                         <div className="w-8 h-8 rounded bg-lime-500/10 flex items-center justify-center text-lime-400 group-hover/item:bg-lime-400 group-hover/item:text-black transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>
                        </div>
                        <div>
                            <div className="text-xs font-bold text-white uppercase">复刻构筑台</div>
                            <div className="text-[10px] text-slate-500">Reproduction Console (需分析)</div>
                        </div>
                    </button>

                    <button onClick={() => onNavigate('custom')} className="flex items-center gap-3 w-full p-3 hover:bg-white/5 text-left group/item">
                         <div className="w-8 h-8 rounded bg-neon/10 flex items-center justify-center text-neon group-hover/item:bg-neon group-hover/item:text-black transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </div>
                        <div>
                            <div className="text-xs font-bold text-white uppercase">创意实验室</div>
                            <div className="text-[10px] text-slate-500">Creative V5 (风格生成)</div>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- NAVBAR ---
const Navbar = ({ onNavigate, onAdmin, onSettings, currentView, transparent = false }: any) => (
    <nav className={`fixed top-0 left-0 w-full z-[100] flex justify-between items-center px-4 md:px-8 py-4 transition-all duration-300 ${transparent ? 'bg-transparent border-transparent' : 'bg-[#050505]/80 backdrop-blur-md border-b border-white/5'}`}>
        <div onClick={() => onNavigate('home')} className="cursor-pointer group flex items-center gap-2">
             <div className="w-6 h-6 bg-acid rounded-sm shadow-[0_0_10px_#ccff00]"></div>
             <div className="font-display font-black text-2xl tracking-tighter text-white leading-none drop-shadow-md">NEXUS</div>
        </div>
        
        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-1">
            {[
                {id: 'home', label: '主控台'},
                {id: 'video', label: '影视中心'},
                {id: 'music', label: '精选音乐'},
                {id: 'article', label: '深度专栏'},
                {id: 'gallery', label: '视觉画廊'}
            ].map(v => (
                 <button 
                    key={v.id}
                    onClick={() => onNavigate(v.id)} 
                    className={`px-6 py-2 text-xs font-bold uppercase tracking-widest transition-all clip-path-slant ${currentView === v.id ? 'bg-white text-black' : 'text-slate-400 hover:text-acid hover:bg-white/5 shadow-sm'}`}
                 >
                    {v.label}
                 </button>
            ))}
        </div>

        {/* Tools */}
        <div className="flex items-center gap-2">
            <div className="hidden xl:block mr-2">
                <ArrangementMasterDropdown onNavigate={onNavigate} />
            </div>
            
            <button onClick={onAdmin} className="w-8 h-8 flex items-center justify-center border border-white/10 hover:border-acid/50 text-slate-400 hover:text-acid transition-colors bg-black/50 backdrop-blur rounded">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </button>
            <button onClick={onSettings} className="w-8 h-8 flex items-center justify-center border border-white/10 hover:border-acid/50 text-slate-400 hover:text-acid transition-colors bg-black/50 backdrop-blur rounded">
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
            {/* Animated Underline */}
            <div className={`absolute bottom-[-1px] left-0 w-12 h-[3px] ${bgClass} group-hover:w-full transition-all duration-700 ease-out`}></div>
            
            <div className="flex flex-col">
                <h2 className="text-4xl md:text-6xl font-display font-black text-white tracking-tighter uppercase leading-[0.85]">
                    {title}
                </h2>
                <div className={`text-[10px] font-mono font-bold tracking-[0.3em] uppercase mt-2 flex items-center gap-2 ${colorClass}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${bgClass} animate-pulse-fast`}></span>
                    {sub}
                </div>
            </div>
            
            {onMore && (
                <button onClick={onMore} className="hidden md:flex items-center gap-2 px-6 py-2 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-black hover:bg-white transition-all rounded-full hover:px-8">
                    查看全部 <span className="text-xs">&rarr;</span>
                </button>
            )}
        </div>
    );
};

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
            // Auto login check
            storageService.verifyAuth(storedPwd).then(valid => {
                if (valid) setAdminMode(true);
                else setShowLoginModal(true);
            });
        } else {
            setShowLoginModal(true);
        }
    };

    const handleLoginSubmit = async (pwd: string) => {
        const valid = await storageService.verifyAuth(pwd);
        if (valid) {
            localStorage.setItem('admin_password', pwd);
            setAdminMode(true);
            return true;
        }
        return false;
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
                            <p className="text-slate-400 text-xs font-mono mt-1">CONTENT MANAGEMENT SYSTEM // 后台管理系统</p>
                        </div>
                        <button onClick={() => setAdminMode(false)} className="px-6 py-2 border border-white/10 text-xs font-bold uppercase tracking-wider hover:bg-white hover:text-black transition-colors">
                            退出登入
                        </button>
                    </div>

                    <div className="flex gap-2 mb-8 overflow-x-auto pb-2 no-scrollbar">
                        {[
                            {id:'music', label:'音乐库 (Music)'},
                            {id:'video', label:'影视库 (Video)'},
                            {id:'article', label:'专栏库 (Editorial)'},
                            {id:'gallery', label:'画廊 (Gallery)'},
                            {id:'category', label:'分类管理 (Tags)'}
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

    // --- VIDEO PORTAL (FULLSCREEN) ---
    if (props.currentView === 'video') {
        return (
            <div className="min-h-screen bg-[#050505] text-white">
                <Navbar onNavigate={props.onNavigate} onAdmin={handleAdminClick} onSettings={props.onOpenSettings} currentView={props.currentView} transparent={true} />
                <AdminLoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} onLogin={handleLoginSubmit} />
                <VideoGrid videos={props.videos} onPauseMusic={handlePauseMusic} />
            </div>
        );
    }

    // --- HOME PORTAL (BENTO GRID DESIGN) ---
    if (props.currentView === 'home') {
        return (
            <div className="relative w-full min-h-screen bg-[#050505] text-white pb-40 overflow-hidden">
                <Navbar onNavigate={props.onNavigate} onAdmin={handleAdminClick} onSettings={props.onOpenSettings} currentView={props.currentView} />
                <AdminLoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} onLogin={handleLoginSubmit} />

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
                                    <span className="text-xs font-mono text-acid uppercase tracking-widest">System Online // 系统在线</span>
                                </div>
                                <h1 className="text-[15vw] md:text-[9rem] lg:text-[11rem] font-display font-black leading-[0.8] tracking-tighter text-white mix-blend-difference select-none">
                                    NEXUS
                                </h1>
                            </div>
                            <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-6">
                                <p className="text-xl md:text-2xl text-slate-300 font-light max-w-lg leading-relaxed">
                                    连接 <span className="text-acid font-bold">听觉</span> 与 <span className="text-neon font-bold">视觉</span> 的下一代智能终端。
                                </p>
                                <button onClick={() => props.onNavigate('music')} className="px-8 py-4 bg-white text-black font-bold uppercase tracking-widest hover:bg-acid hover:scale-105 transition-all w-full md:w-auto shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                                    探索媒体库 &rarr;
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
                             <span className="text-xs font-bold uppercase tracking-widest text-slate-300 group-hover:text-white">音频分析</span>
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
                        
                        {/* 1. CINEMA WIDGET */}
                        <section className="relative">
                            <Marquee text="CINEMA EXPERIENCE" opacity={0.05} />
                            <div className="relative z-10 -mt-20">
                                <SectionHeader title="影视中心" sub="Cinema_Database" color="orange" onMore={() => props.onNavigate('video')} />
                                <div className="hidden lg:block">
                                    <VideoGrid videos={props.videos} onPauseMusic={handlePauseMusic} />
                                </div>
                                <div className="lg:hidden text-center text-slate-500 text-xs py-4">请在视频中心查看完整内容</div>
                            </div>
                        </section>

                        {/* 2. MUSIC WIDGET */}
                        <section className="relative">
                            <Marquee text="SONIC ARCHITECTURE" reverse opacity={0.05} />
                            <div className="relative z-10 -mt-20">
                                <SectionHeader title="精选音乐" sub="Featured_Tracks" color="acid" onMore={() => props.onNavigate('music')} />
                                <MusicGrid tracks={props.tracks} onPlay={handlePlay} playingId={playingId} />
                            </div>
                        </section>

                        {/* 3. MIXED WIDGETS */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                            <section>
                                <SectionHeader title="深度专栏" sub="Editorial_Hub" color="cyber" onMore={() => props.onNavigate('article')} />
                                <ArticleGrid articles={props.articles.slice(0, 4)} onRead={setReadingArticle} />
                            </section>
                            <section>
                                <SectionHeader title="视觉画廊" sub="Gallery_Arts" color="neon" onMore={() => props.onNavigate('gallery')} />
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
                             <button onClick={() => props.onNavigate('home')} className="hover:text-white">首页</button>
                             <button onClick={() => props.onNavigate('music')} className="hover:text-white">曲库</button>
                             <button onClick={handleAdminClick} className="hover:text-acid">管理入口</button>
                        </div>
                    </div>
                </footer>
                
                {/* --- GLOBAL FLOATING CAPSULE PLAYER --- */}
                <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-3xl z-[150] transition-all duration-700 cubic-bezier(0.34, 1.56, 0.64, 1) ${playingId ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-32 opacity-0 scale-90 pointer-events-none'}`}>
                    <div className="bg-[#111]/90 backdrop-blur-3xl border border-white/10 rounded-full p-2 pr-6 shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex items-center gap-4 overflow-hidden relative group">
                         
                         {/* ProgressBar (Background) */}
                         <div className="absolute bottom-0 left-0 h-[2px] bg-white/20 w-full z-0 cursor-pointer" onClick={(e) => {
                             const rect = e.currentTarget.getBoundingClientRect();
                             const x = e.clientX - rect.left;
                             const percent = x / rect.width;
                             if(audioRef.current && duration) audioRef.current.currentTime = percent * duration;
                         }}>
                             <div className="absolute top-0 left-0 h-full bg-acid transition-all duration-300" style={{ width: `${(currentTime/duration)*100}%` }}></div>
                         </div>

                         {/* Spinning Vinyl Cover */}
                         <div className="relative shrink-0 w-14 h-14 rounded-full overflow-hidden border border-white/10 bg-black z-10">
                             <img 
                                src={currentTrack?.coverUrl} 
                                className={`w-full h-full object-cover opacity-80 ${playingId ? 'animate-[spin_8s_linear_infinite]' : ''}`} 
                             />
                             {/* Vinyl Glint */}
                             <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent rounded-full pointer-events-none"></div>
                             {/* Center Hole */}
                             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-[#111] rounded-full border border-white/20"></div>
                         </div>
                         
                         {/* Track Info */}
                         <div className="flex-1 min-w-0 z-10 flex flex-col justify-center">
                              <h4 className="text-white font-bold text-sm truncate pr-4">{currentTrack?.title}</h4>
                              <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-acid font-mono uppercase truncate">{currentTrack?.artist}</span>
                                  <span className="text-[9px] text-slate-500 font-mono hidden md:inline-block">
                                      {Math.floor(currentTime/60)}:{Math.floor(currentTime%60).toString().padStart(2,'0')} / {Math.floor(duration/60)}:{Math.floor(duration%60).toString().padStart(2,'0')}
                                  </span>
                              </div>
                         </div>

                         {/* Controls */}
                         <div className="flex items-center gap-3 z-10">
                              <button className="text-slate-500 hover:text-white transition-colors p-2"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg></button>
                              
                              <button onClick={() => { if(audioRef.current?.paused) audioRef.current.play(); else audioRef.current?.pause(); setPlayingId(null); }} className="w-10 h-10 rounded-full bg-white text-black hover:bg-acid hover:scale-110 transition-all flex items-center justify-center shadow-lg">
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                              </button>

                              <button className="text-slate-500 hover:text-white transition-colors p-2"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg></button>
                              
                              <div className="w-px h-6 bg-white/10 mx-1"></div>

                              <button onClick={() => setShowLyrics(!showLyrics)} className={`text-[10px] font-bold uppercase px-2 py-1 rounded border transition-all ${showLyrics ? 'bg-acid text-black border-acid' : 'text-slate-400 border-white/20 hover:text-white'}`}>
                                  LRC
                              </button>

                              {/* CLOSE BUTTON (Explicit) */}
                              <button 
                                onClick={(e) => { e.stopPropagation(); setPlayingId(null); }} 
                                className="w-8 h-8 rounded-full bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white flex items-center justify-center transition-all ml-1"
                                title="Close Player"
                              >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                              </button>
                         </div>
                    </div>
                </div>

                {/* HIDDEN AUDIO ELEMENT */}
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

    if (props.currentView === 'music') return <SimpleLayout title="精选音乐" subtitle="Sonic_Archive" color="acid"><MusicGrid tracks={props.tracks} onPlay={handlePlay} playingId={playingId} /></SimpleLayout>;
    if (props.currentView === 'article') return <SimpleLayout title="深度专栏" subtitle="Editorial_Hub" color="cyber"><ArticleGrid articles={props.articles} onRead={setReadingArticle} /></SimpleLayout>;
    if (props.currentView === 'gallery') return <SimpleLayout title="视觉画廊" subtitle="Visual_Arts" color="neon"><GalleryGrid images={props.gallery} /></SimpleLayout>;

    return null; // Should not reach here
}
