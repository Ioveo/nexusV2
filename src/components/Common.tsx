
// src/components/Common.tsx
import React, { useState, useEffect } from 'react';
import { GalleryTrack } from '../types';
import { storageService } from '../services/storageService';

// --- VISUAL COMPONENTS ---

export const Marquee = ({ text, reverse = false, opacity = 1 }: { text: string, reverse?: boolean, opacity?: number }) => (
    <div className="relative flex overflow-hidden py-2 bg-transparent pointer-events-none select-none z-0" style={{ opacity }}>
        <div className={`animate-${reverse ? 'marquee-reverse' : 'marquee'} whitespace-nowrap flex gap-8 items-center`}>
            {Array(10).fill(0).map((_, i) => (
                <span key={i} className="text-[4rem] md:text-[8rem] font-display font-black text-white/5 uppercase leading-none">
                    {text}
                </span>
            ))}
        </div>
    </div>
);

export const BentoCard = ({ children, className = "", onClick }: { children?: React.ReactNode, className?: string, onClick?: () => void }) => (
    <div 
        onClick={onClick}
        className={`bg-[#080808] border border-white/10 p-6 relative overflow-hidden group hover:border-acid/50 transition-all duration-300 ${className} ${onClick ? 'cursor-pointer' : ''}`}
    >
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/30 group-hover:border-acid transition-colors"></div>
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/30 group-hover:border-acid transition-colors"></div>
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/30 group-hover:border-acid transition-colors"></div>
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/30 group-hover:border-acid transition-colors"></div>
        {children}
    </div>
);

export const SectionHeader = ({ title, sub, onMore, color="acid" }: { title: string, sub: string, onMore?: () => void, color?: string }) => {
    const colorClass = color === 'acid' ? 'text-acid' : color === 'neon' ? 'text-neon' : color === 'cyber' ? 'text-cyber' : 'text-orange-500';
    const bgClass = color === 'acid' ? 'bg-acid' : color === 'neon' ? 'bg-neon' : color === 'cyber' ? 'bg-cyber' : 'bg-orange-500';

    return (
        <div className="flex items-end justify-between mb-8 pb-2 border-b border-white/10 relative group">
            <div className={`absolute bottom-[-1px] left-0 w-12 h-[3px] ${bgClass} group-hover:w-full transition-all duration-700 ease-out`}></div>
            <div className="flex flex-col">
                <h2 className="text-3xl md:text-5xl font-display font-black text-white tracking-tighter uppercase leading-[0.85]">
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

// --- MODALS & NAV ---

export const AdminLoginModal = ({ isOpen, onClose, onLogin }: { isOpen: boolean, onClose: () => void, onLogin: (pwd: string) => Promise<boolean> }) => {
    const [pwd, setPwd] = useState('');
    const [error, setError] = useState(false);
    
    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await onLogin(pwd);
        if (success) { onClose(); setPwd(''); setError(false); } else { setError(true); setPwd(''); }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in">
             <div className="w-full max-w-sm bg-[#0a0a0a] border border-acid/30 p-8 relative shadow-[0_0_50px_rgba(204,255,0,0.1)]">
                 <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white">✕</button>
                 <h3 className="text-xl font-display font-bold text-white uppercase tracking-widest text-center mb-8">System Access</h3>
                 <form onSubmit={handleSubmit} className="space-y-4">
                     <input type="password" value={pwd} onChange={e => setPwd(e.target.value)} placeholder="输入密钥..." className="w-full bg-black border border-white/20 p-3 text-center text-white font-mono tracking-[0.5em] focus:border-acid outline-none transition-colors" autoFocus />
                     {error && <p className="text-center text-red-500 text-xs font-mono animate-pulse">ACCESS DENIED</p>}
                     <button type="submit" className="w-full py-3 bg-acid text-black font-bold uppercase tracking-widest hover:bg-white transition-colors">UNLOCK</button>
                 </form>
             </div>
        </div>
    );
};

export const FileSelectorModal = ({ isOpen, onClose, onSelect, filter }: { isOpen: boolean, onClose: () => void, onSelect: (url: string) => void, filter: 'video' | 'audio' | 'image' }) => {
    const [files, setFiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            storageService.listFiles().then(data => {
                // Filter by type roughly based on extension
                const filtered = data.filter((f: any) => {
                    const ext = f.key.split('.').pop()?.toLowerCase();
                    if (filter === 'video') return ['mp4', 'webm', 'mov'].includes(ext);
                    if (filter === 'audio') return ['mp3', 'wav', 'flac', 'ogg'].includes(ext);
                    if (filter === 'image') return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
                    return true;
                });
                setFiles(filtered);
                setLoading(false);
            });
        }
    }, [isOpen, filter]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in p-4">
            <div className="w-full max-w-4xl bg-[#111] border border-white/10 rounded-xl flex flex-col h-[80vh]">
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#1a1a1a] rounded-t-xl">
                    <h3 className="text-lg font-bold text-white">选择文件 ({filter})</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {loading ? (
                        <div className="text-center text-slate-500 py-10">Loading Library...</div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {files.map(f => (
                                <div 
                                    key={f.key} 
                                    onClick={() => { onSelect(`/api/file/${f.key}`); onClose(); }}
                                    className="p-3 bg-black border border-white/10 rounded-lg hover:border-acid/50 cursor-pointer group transition-all"
                                >
                                    <div className="aspect-square bg-[#222] rounded mb-2 flex items-center justify-center overflow-hidden">
                                        {filter === 'image' ? (
                                            <img src={`/api/file/${f.key}`} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-2xl text-slate-600 font-bold group-hover:text-acid">{f.key.split('.').pop()}</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-300 truncate mb-1">{f.key}</p>
                                    <p className="text-[10px] text-slate-500 font-mono">{(f.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            ))}
                            {files.length === 0 && <p className="col-span-full text-center text-slate-500 py-10">暂无相关文件</p>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export const ArrangementMasterDropdown = ({ onNavigate }: { onNavigate: (v: string) => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="relative group" onMouseEnter={() => setIsOpen(true)} onMouseLeave={() => setIsOpen(false)}>
            <button className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-acid px-4 py-2">
                编曲大师 <span className="text-[10px]">▼</span>
            </button>
            <div className={`absolute top-full right-0 w-64 bg-[#0a0a0a] border border-white/10 shadow-xl transition-all duration-200 z-50 ${isOpen ? 'opacity-100 translate-y-0 visible' : 'opacity-0 translate-y-2 invisible'}`}>
                <div className="p-1">
                    {[
                        { id: 'dashboard', label: '音乐工坊', sub: 'Audio Lab', color: 'text-acid', bg: 'bg-acid/10' },
                        { id: 'dashboard', label: '复刻构筑台', sub: 'Reproduction Console', color: 'text-lime-400', bg: 'bg-lime-500/10' },
                        { id: 'custom', label: '创意实验室', sub: 'Creative V5', color: 'text-neon', bg: 'bg-neon/10' }
                    ].map((item, idx) => (
                        <button key={idx} onClick={() => onNavigate(item.id)} className="flex items-center gap-3 w-full p-3 hover:bg-white/5 text-left group/item">
                            <div className={`w-8 h-8 rounded flex items-center justify-center ${item.bg} ${item.color} font-bold`}>⚡</div>
                            <div>
                                <div className="text-xs font-bold text-white uppercase">{item.label}</div>
                                <div className="text-[10px] text-slate-500">{item.sub}</div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export const Navbar = ({ onNavigate, onAdmin, onSettings, currentView, transparent = false }: any) => (
    <nav className={`fixed top-0 left-0 w-full z-[100] flex justify-between items-center px-4 md:px-8 py-4 transition-all duration-300 ${transparent ? 'bg-transparent border-transparent' : 'bg-[#050505]/80 backdrop-blur-md border-b border-white/5'}`}>
        <div onClick={() => onNavigate('home')} className="cursor-pointer group flex items-center gap-2">
             <div className="w-6 h-6 bg-acid rounded-sm shadow-[0_0_10px_#ccff00]"></div>
             <div className="font-display font-black text-2xl tracking-tighter text-white leading-none drop-shadow-md">NEXUS</div>
        </div>
        <div className="hidden lg:flex items-center gap-1">
            {[
                {id: 'home', label: '主控台'},
                {id: 'video', label: '影视中心'},
                {id: 'music', label: '精选音乐'},
                {id: 'article', label: '深度专栏'},
                {id: 'gallery', label: '视觉画廊'}
            ].map(v => (
                 <button key={v.id} onClick={() => onNavigate(v.id)} className={`px-6 py-2 text-xs font-bold uppercase tracking-widest transition-all clip-path-slant ${currentView === v.id ? 'bg-white text-black' : 'text-slate-400 hover:text-acid hover:text-black hover:bg-white/90 shadow-sm'}`}>
                    {v.label}
                 </button>
            ))}
        </div>
        <div className="flex items-center gap-2">
            <div className="hidden xl:block mr-2"><ArrangementMasterDropdown onNavigate={onNavigate} /></div>
            <button onClick={onAdmin} className="w-8 h-8 flex items-center justify-center border border-white/10 hover:border-acid/50 text-slate-400 hover:text-acid transition-colors bg-black/50 backdrop-blur rounded">⚙</button>
            <button onClick={onSettings} className="w-8 h-8 flex items-center justify-center border border-white/10 hover:border-acid/50 text-slate-400 hover:text-acid transition-colors bg-black/50 backdrop-blur rounded">🔧</button>
        </div>
    </nav>
);

// --- GLOBAL PLAYER ---

export const GlobalPlayer = ({ 
    track, 
    playingId, 
    currentTime, 
    duration, 
    onTogglePlay, 
    onSeek, 
    onToggleLyrics, 
    showLyrics, 
    onClose 
}: { 
    track: GalleryTrack | undefined, 
    playingId: string | null, 
    currentTime: number, 
    duration: number,
    onTogglePlay: () => void,
    onSeek: (e: React.MouseEvent<HTMLDivElement>) => void,
    onToggleLyrics: () => void,
    showLyrics: boolean,
    onClose: (e: React.MouseEvent) => void
}) => {
    if (!playingId) return null;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-3xl z-[150] animate-slide-up">
            <div className="bg-[#111]/90 backdrop-blur-3xl border border-white/10 rounded-full p-2 pr-6 shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex items-center gap-4 overflow-hidden relative group">
                    
                    {/* ProgressBar */}
                    <div className="absolute bottom-0 left-0 h-[2px] bg-white/20 w-full z-0 cursor-pointer hover:h-1 transition-all" onClick={onSeek}>
                        <div className="absolute top-0 left-0 h-full bg-acid transition-all duration-300" style={{ width: `${(currentTime/duration)*100}%` }}></div>
                    </div>

                    {/* Cover (Clickable for Lyrics) */}
                    <div 
                        onClick={onToggleLyrics}
                        className="relative shrink-0 w-14 h-14 rounded-full overflow-hidden border border-white/10 bg-black z-10 cursor-pointer group/cover"
                    >
                        <img src={track?.coverUrl} className="w-full h-full object-cover opacity-80 animate-[spin_8s_linear_infinite]" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/cover:opacity-100 transition-opacity">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
                        </div>
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0 z-10 flex flex-col justify-center">
                        <h4 className="text-white font-bold text-sm truncate pr-4">{track?.title}</h4>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] text-acid font-mono uppercase truncate">{track?.artist}</span>
                            <span className="text-[9px] text-slate-500 font-mono hidden md:inline-block">
                                {Math.floor(currentTime/60)}:{Math.floor(currentTime%60).toString().padStart(2,'0')} / {Math.floor(duration/60)}:{Math.floor(duration%60).toString().padStart(2,'0')}
                            </span>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-4 z-10">
                        <button onClick={onTogglePlay} className="w-10 h-10 rounded-full bg-white text-black hover:bg-acid hover:scale-110 transition-all flex items-center justify-center shadow-lg">
                            {/* Simple SVG for Play/Pause */}
                            <div className="w-3 h-3 bg-black"></div> 
                        </button>

                        <button onClick={onClose} className="w-8 h-8 rounded-full bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white flex items-center justify-center transition-all ml-1">
                            ✕
                        </button>
                    </div>
            </div>
        </div>
    );
}; 
