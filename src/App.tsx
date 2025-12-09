// src/App.tsx

import React, { useState, useRef, useEffect } from 'react';
import { AnalysisStatus, AudioAnalysisResult, CreativeGeneratorRequest, GalleryTrack, Video, GalleryImage, Article, Category } from './types';
import { analyzeAudioWithGemini, analyzeMusicMetadata, generateCreativeSunoPlan, generateInstantRemix } from './services/geminiService';
import { storageService } from './services/storageService';
import { Visualizer } from './components/Visualizer';
import { AnalysisDisplay } from './components/AnalysisDisplay';
import { SunoBuilder } from './components/SunoBuilder';
import { CustomGenerator } from './components/CustomGenerator';
import { MusicShowcase } from './components/MusicShowcase';
import { SettingsModal } from './components/SettingsModal';

// ... (PRESET DATA kept as is, ensure you have the full list from previous response) ...
const PRESET_TRACKS: GalleryTrack[] = [
    { id: "p1", title: "Neon Blade", artist: "MoonDeity", coverUrl: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=1000", sourceType: "netease", src: "1954302324", addedAt: 1715000000000 },
    { id: "p2", title: "After Dark", artist: "Mr.Kitty", coverUrl: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=1000", sourceType: "netease", src: "1330348068", addedAt: 1715000001000 },
];
// (Assume other presets are defined here as per previous code)
const PRESET_VIDEOS: Video[] = [
    { id: 'v1', title: 'Tears of Steel', author: 'Blender', videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', coverUrl: 'https://images.unsplash.com/photo-1535016120720-40c6874c3b1c?q=80&w=1000', sourceType: 'external', category: 'Sci-Fi', addedAt: Date.now(), isHero: true },
    { id: 'v2', title: 'Sintel', author: 'Blender', videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', coverUrl: 'https://images.unsplash.com/photo-1618331835717-801e976710b2?q=80&w=1000', sourceType: 'external', category: 'Animation', addedAt: Date.now() },
    { id: 'v3', title: 'Big Buck Bunny', author: 'Blender', videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', coverUrl: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=1000', sourceType: 'external', category: 'Comedy', addedAt: Date.now() },
    { id: 'v4', title: 'Volcano', author: 'Earth Studio', videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Volcano.mp4', coverUrl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=1000', sourceType: 'external', category: 'Nature', addedAt: Date.now() },
     { id: 'v5', title: 'For Bigger Blazes', author: 'Google', videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', coverUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1000', sourceType: 'external', category: 'Tech Demo', addedAt: Date.now() }
];
const PRESET_GALLERY: GalleryImage[] = [
    { id: 'g1', title: 'Cyber City', url: 'https://images.unsplash.com/photo-1535905557558-afc4877a26fc?q=80&w=1000', uploadedAt: Date.now() },
    { id: 'g2', title: 'Neon Horizon', url: 'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=1000', uploadedAt: Date.now() },
];
const PRESET_ARTICLES: Article[] = [
    { id: 'a1', title: 'Future Sound', subtitle: 'AI Music Evolution', author: 'NEXUS', publishedAt: Date.now(), coverUrl: 'https://images.unsplash.com/photo-1614726365723-49cfae97c694?q=80&w=1000', content: '# Future Sound' }
];
const PRESET_CATEGORIES: Category[] = [
    { id: 'c1', name: 'Sci-Fi', type: 'video' },
    { id: 'c2', name: 'Animation', type: 'video' },
    { id: 'c3', name: 'Nature', type: 'video' },
    { id: 'c4', name: 'Pop', type: 'music' }
];

// --- ICONS ---
const UploadIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-lime-400 group-hover:text-lime-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>);
const LinkIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-cyan-400 group-hover:text-cyan-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>);

// --- COMPONENTS ---
const IntroScreen = ({ onComplete }: { onComplete: () => void }) => {
    const [phase, setPhase] = useState(0);
    useEffect(() => {
        setTimeout(() => setPhase(1), 500);
        setTimeout(() => setPhase(2), 2500);
        setTimeout(onComplete, 3000);
    }, [onComplete]);
    return (
        <div className={`fixed inset-0 z-[300] bg-[#050505] flex flex-col items-center justify-center transition-opacity duration-500 ${phase === 2 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            <div className={`relative z-10 text-center transition-all duration-1000 transform ${phase >= 1 ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}>
                 <h1 className="text-8xl font-display font-black text-white tracking-tighter mix-blend-difference glitch" data-text="NEXUS">NEXUS</h1>
                 <p className="text-[#ccff00] font-mono text-sm mt-4 tracking-[1em] uppercase animate-pulse">SYSTEM ONLINE</p>
            </div>
        </div>
    );
};

const LoadingScreen = ({ status }: { status: AnalysisStatus }) => (
    <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/90 backdrop-blur-xl">
        <div className="w-16 h-16 border-4 border-[#ccff00]/30 border-t-[#ccff00] rounded-full animate-spin mb-8"></div>
        <h3 className="text-2xl font-display text-white tracking-widest uppercase animate-pulse">Processing</h3>
        <p className="text-[#ccff00] font-mono text-xs mt-2">{status}</p>
    </div>
);

function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [view, setView] = useState<'home' | 'music' | 'video' | 'article' | 'gallery' | 'dashboard' | 'builder' | 'custom'>('home');
  const [activeUploadTab, setActiveUploadTab] = useState<'upload' | 'link'>('upload');
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [analysisData, setAnalysisData] = useState<AudioAnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [remixTags, setRemixTags] = useState<string[]>([]);
  const [linkInput, setLinkInput] = useState('');

  // Data State
  const [tracks, setTracks] = useState<GalleryTrack[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- INITIALIZATION ---
  useEffect(() => {
      const init = async () => {
          try {
              const [t, v, a, g, c] = await Promise.all([
                  storageService.getTracks(),
                  storageService.getVideos(),
                  storageService.getArticles(),
                  storageService.getGallery(),
                  storageService.getCategories()
              ]);
              
              if (t.length === 0) { setTracks(PRESET_TRACKS); await storageService.saveTracks(PRESET_TRACKS); } else setTracks(t);
              if (v.length === 0) { setVideos(PRESET_VIDEOS); await storageService.saveVideos(PRESET_VIDEOS); } else setVideos(v);
              if (a.length === 0) { setArticles(PRESET_ARTICLES); await storageService.saveArticles(PRESET_ARTICLES); } else setArticles(a);
              if (g.length === 0) { setGallery(PRESET_GALLERY); await storageService.saveGallery(PRESET_GALLERY); } else setGallery(g);
              if (c.length === 0) { setCategories(PRESET_CATEGORIES); await storageService.saveCategories(PRESET_CATEGORIES); } else setCategories(c);
              
          } catch(e) {
              console.error("Init failed", e);
              setTracks(PRESET_TRACKS); setVideos(PRESET_VIDEOS); setArticles(PRESET_ARTICLES); setGallery(PRESET_GALLERY);
          }
      };
      init();
  }, []);

  const updateData = (key: string, data: any) => {
      if (key === 'tracks') { setTracks(data); storageService.saveTracks(data); }
      if (key === 'videos') { setVideos(data); storageService.saveVideos(data); }
      if (key === 'articles') { setArticles(data); storageService.saveArticles(data); }
      if (key === 'gallery') { setGallery(data); storageService.saveGallery(data); }
      if (key === 'categories') { setCategories(data); storageService.saveCategories(data); }
  };

  // --- TOOL HANDLERS ---
  const resetState = () => {
    setStatus(AnalysisStatus.IDLE);
    setAnalysisData(null);
    setErrorMsg(null);
    setLinkInput('');
  };

  const handleFileAnalysis = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      resetState();
      setStatus(AnalysisStatus.PROCESSING_AUDIO);
      try {
          const base64 = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onload = () => resolve((reader.result as string).split(',')[1]);
              reader.readAsDataURL(file);
          });
          setStatus(AnalysisStatus.ANALYZING_AI);
          const result = await analyzeAudioWithGemini(base64, file.type);
          setAnalysisData(result);
          setStatus(AnalysisStatus.COMPLETE);
          setView('dashboard');
      } catch(e: any) {
          setErrorMsg(e.message);
          setStatus(AnalysisStatus.ERROR);
      }
  };
  
  const handleLinkAnalysis = async () => {
      if (!linkInput.trim()) return;
      resetState();
      setStatus(AnalysisStatus.ANALYZING_AI);
      try {
          const result = await analyzeMusicMetadata(linkInput);
          setAnalysisData(result);
          setStatus(AnalysisStatus.COMPLETE);
          setView('dashboard');
      } catch(e: any) {
          setErrorMsg(e.message);
          setStatus(AnalysisStatus.ERROR);
      }
  };

  const handleCreative = async (req: CreativeGeneratorRequest) => {
      setStatus(AnalysisStatus.CREATING_PLAN);
      try {
          const res = await generateCreativeSunoPlan(req);
          setAnalysisData(res);
          setStatus(AnalysisStatus.COMPLETE);
          setView('builder');
      } catch(e: any) { setErrorMsg(e.message); setStatus(AnalysisStatus.ERROR); }
  };
  
  const handleInstantRemix = async () => {
      if (!analysisData) return;
      setStatus(AnalysisStatus.CREATING_PLAN); 
      try {
          const result = await generateInstantRemix(analysisData);
          setAnalysisData(result);
          setStatus(AnalysisStatus.COMPLETE);
          setView('builder'); 
      } catch (err: any) {
          setErrorMsg("自动复刻生成失败，请检查 API Key 设置。");
          setStatus(AnalysisStatus.ERROR);
      }
  };

  return (
    <div className="bg-[#050505] min-h-screen text-slate-100 font-sans selection:bg-[#ccff00] selection:text-black">
        {showIntro && <IntroScreen onComplete={() => setShowIntro(false)} />}
        <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        
        {(status === AnalysisStatus.PROCESSING_AUDIO || status === AnalysisStatus.ANALYZING_AI || status === AnalysisStatus.CREATING_PLAN) && (
            <LoadingScreen status={status} />
        )}

        {status === AnalysisStatus.ERROR && (
             <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur">
                 <div className="bg-red-950/50 p-8 rounded-xl border border-red-500/50 text-center">
                     <h3 className="text-xl font-bold text-red-500 mb-2">Error</h3>
                     <p className="text-red-200 mb-4">{errorMsg}</p>
                     <button onClick={() => { setStatus(AnalysisStatus.IDLE); setErrorMsg(null); }} className="px-4 py-2 bg-red-600 rounded text-white">关闭</button>
                 </div>
             </div>
        )}

        {/* --- MAIN PORTAL & LANDING PAGES --- */}
        {['home', 'music', 'video', 'article', 'gallery'].includes(view) && (
            <MusicShowcase 
                currentView={view as 'home' | 'music' | 'video' | 'article' | 'gallery'} 
                tracks={tracks}
                videos={videos}
                articles={articles}
                gallery={gallery}
                categories={categories}
                onUpdateTracks={d => updateData('tracks', d)}
                onUpdateVideos={d => updateData('videos', d)}
                onUpdateArticles={d => updateData('articles', d)}
                onUpdateGallery={d => updateData('gallery', d)}
                onUpdateCategories={d => updateData('categories', d)}
                
                onNavigate={(v) => setView(v as any)}
                onOpenSettings={() => setIsSettingsOpen(true)}
                onAnalyze={(file) => {
                     // Hacky way to reuse handleFileChange logic
                     const event = { target: { files: [file] } } as any;
                     handleFileAnalysis(event);
                }}
            />
        )}

        {/* --- TOOL PAGES --- */}
        {['dashboard', 'builder', 'custom'].includes(view) && (
            <div className="min-h-screen relative bg-[#0a0a0a]">
                {/* Tool Navbar */}
                <div className="fixed top-0 left-0 w-full h-16 bg-black/90 border-b border-white/10 z-50 flex items-center justify-between px-6 backdrop-blur-xl">
                    <div className="flex items-center gap-6">
                        <button onClick={() => setView('home')} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group">
                            <span className="p-1 rounded-full bg-white/5 group-hover:bg-white/20"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg></span>
                            <span className="text-xs font-bold uppercase tracking-wider">返回首页</span>
                        </button>
                        <div className="h-4 w-px bg-white/10"></div>
                        <span className="text-sm font-mono text-[#ccff00] uppercase tracking-widest">{view === 'dashboard' ? 'Studio 音频工坊' : view === 'custom' ? 'Creative Lab 创意实验室' : 'Builder 复刻构筑台'}</span>
                    </div>
                </div>
                
                <div className="pt-24 px-4 md:px-8 max-w-7xl mx-auto">
                    
                    {/* STUDIO DASHBOARD (Restore Fig 1 UI here) */}
                    {view === 'dashboard' && !analysisData && (
                        <div className="min-h-[70vh] flex flex-col items-center justify-center animate-fade-in px-4">
                            <div className="text-center mb-16 relative">
                                <h1 className="text-6xl md:text-8xl font-display font-bold text-white relative z-10 tracking-tighter leading-tight glitch" data-text="解构 听觉 灵魂">
                                    解构 <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-cyan-400">听觉 灵魂</span>
                                </h1>
                                <p className="text-lg md:text-xl text-slate-400 font-light max-w-2xl mx-auto leading-relaxed mt-4">
                                    深度解析音频节奏、音色与作曲结构。<br/>
                                    或在 <button onClick={() => setView('custom')} className="text-pink-400 hover:text-pink-300 font-bold border-b border-pink-500/50 hover:border-pink-300">创意实验室</button> 中由 AI 自动生成全曲词曲代码。
                                </p>
                            </div>

                            <div className="flex flex-col md:flex-row gap-8 w-full max-w-4xl mb-16">
                                <div onClick={() => setActiveUploadTab('upload')} className={`flex-1 group cursor-pointer relative overflow-hidden rounded-2xl border transition-all duration-300 ${activeUploadTab === 'upload' ? 'bg-white/5 border-lime-500/50 shadow-[0_0_40px_rgba(132,204,22,0.15)] scale-[1.02]' : 'bg-black/40 border-white/10 hover:border-white/30 hover:bg-white/5'}`}>
                                    {activeUploadTab === 'upload' && <div className="absolute top-0 left-0 w-full h-1 bg-lime-500 shadow-[0_0_10px_#84cc16]"></div>}
                                    <div className="p-10 flex flex-col items-center text-center h-full">
                                        <div className="mb-6 p-4 rounded-full bg-white/5 group-hover:bg-lime-500/10 transition-colors border border-white/5 group-hover:border-lime-500/30"><UploadIcon /></div>
                                        <h3 className="text-2xl font-display font-bold text-white mb-2">上传音频文件</h3>
                                        <p className="text-slate-500 text-sm mb-6">分析本地文件 (MP3, WAV, FLAC)</p>
                                        {activeUploadTab === 'upload' && (<div onClick={() => fileInputRef.current?.click()} className="mt-auto w-full py-4 rounded-xl bg-lime-500 hover:bg-lime-400 text-black font-bold tracking-wide uppercase transition-transform active:scale-95 shadow-lg shadow-lime-500/20">选择文件</div>)}
                                        <input type="file" ref={fileInputRef} onChange={handleFileAnalysis} accept="audio/*" className="hidden" />
                                    </div>
                                </div>

                                <div onClick={() => setActiveUploadTab('link')} className={`flex-1 group cursor-pointer relative overflow-hidden rounded-2xl border transition-all duration-300 ${activeUploadTab === 'link' ? 'bg-white/5 border-cyan-500/50 shadow-[0_0_40px_rgba(6,182,212,0.15)] scale-[1.02]' : 'bg-black/40 border-white/10 hover:border-white/30 hover:bg-white/5'}`}>
                                    {activeUploadTab === 'link' && <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500 shadow-[0_0_10px_#06b6d4]"></div>}
                                    <div className="p-10 flex flex-col items-center text-center h-full">
                                        <div className="mb-6 p-4 rounded-full bg-white/5 group-hover:bg-cyan-500/10 transition-colors border border-white/5 group-hover:border-cyan-500/30"><LinkIcon /></div>
                                        <h3 className="text-2xl font-display font-bold text-white mb-2">链接 / 搜索</h3>
                                        <p className="text-slate-500 text-sm mb-6">通过歌名或链接分析云端数据</p>
                                        {activeUploadTab === 'link' && (
                                            <div className="mt-auto w-full flex gap-2" onClick={(e) => e.stopPropagation()}>
                                                <input type="text" value={linkInput} onChange={(e) => setLinkInput(e.target.value)} placeholder="例如：周杰伦 - 晴天" className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors placeholder-slate-600" onKeyDown={(e) => e.key === 'Enter' && handleLinkAnalysis()}/>
                                                <button onClick={handleLinkAnalysis} className="bg-cyan-500 hover:bg-cyan-400 text-black px-6 rounded-lg font-bold">开始</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {view === 'dashboard' && analysisData && (
                        <AnalysisDisplay 
                            data={analysisData} 
                            onReset={() => { setAnalysisData(null); }} 
                            onOpenBuilder={() => setView('builder')} 
                            onRemixStyle={(tags) => { setRemixTags(tags); setView('custom'); }} 
                            onInstantRemix={handleInstantRemix} 
                        />
                    )}
                    {view === 'builder' && analysisData && (
                        <SunoBuilder 
                            data={analysisData} 
                            onBack={() => setView('dashboard')} 
                        />
                    )}
                    {view === 'custom' && (
                        <CustomGenerator 
                            onGenerate={handleCreative} 
                            isLoading={status === AnalysisStatus.CREATING_PLAN} 
                            initialTags={remixTags}
                        />
                    )}
                </div>
            </div>
        )}
    </div>
  );
}

export default App;