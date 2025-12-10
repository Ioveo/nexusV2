// src/components/MusicManager.tsx

import React, { useState, useRef, useEffect } from 'react';
import { GalleryTrack } from '../types';
import { storageService } from '../services/storageService';
import { FileSelectorModal } from './Common';

interface MusicManagerProps {
  tracks: GalleryTrack[];
  onAdd: (track: GalleryTrack) => void;
  onDelete: (id: string) => void;
  onUpdate?: (tracks: GalleryTrack[]) => void;
}

const AESTHETIC_COVERS = [
    "https://images.unsplash.com/photo-1614850523060-8da1d56ae167?q=80&w=1000&auto=format&fit=crop", 
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop", 
    "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1000&auto=format&fit=crop", 
];
const getRandomCover = () => AESTHETIC_COVERS[Math.floor(Math.random() * AESTHETIC_COVERS.length)];

export const MusicManager: React.FC<MusicManagerProps> = ({ tracks, onAdd, onDelete, onUpdate }) => {
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);

  const [state, setState] = useState({
      title: '', artist: '', cover: '', sourceType: 'local' as GalleryTrack['sourceType'],
      inputValue: '', lyrics: '', audioFile: null as File | null, isHero: false, isUploading: false
  });
  
  const [uploadProgress, setUploadProgress] = useState(0);
  const [r2Status, setR2Status] = useState<{ok: boolean, message: string} | null>(null);
  const [showFileSelector, setShowFileSelector] = useState(false); // New state

  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  
  const [auditionId, setAuditionId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
      storageService.checkR2Status().then(setR2Status);
  }, []);

  const resetForm = () => {
      setState({ title: '', artist: '', cover: '', sourceType: 'local', inputValue: '', lyrics: '', audioFile: null, isHero: false, isUploading: false });
      setMode('create');
      setEditingId(null);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleEdit = (track: GalleryTrack) => {
      setState({
          title: track.title,
          artist: track.artist,
          cover: track.coverUrl,
          sourceType: track.sourceType,
          inputValue: track.sourceType === 'local' ? '' : track.src,
          lyrics: track.lyrics || '',
          audioFile: null,
          isHero: !!track.isHero,
          isUploading: false
      });
      setEditingId(track.id);
      setMode('edit');
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTrackPublish = async () => {
      if (!state.title || !state.artist) return alert("信息不完整");
      setState(p => ({ ...p, isUploading: true }));
      setUploadProgress(0);

      try {
          let finalSrc = state.inputValue;
          
          if (state.sourceType === 'local') {
              if (state.audioFile) {
                  finalSrc = await storageService.uploadFile(
                      state.audioFile,
                      (pct) => setUploadProgress(pct)
                  );
              } else if (mode === 'create' && !state.inputValue) {
                  // If creating and no file AND no inputValue (from selector), throw error
                  throw new Error("请选择音频文件 (上传或从库中选择)");
              } else {
                   // If editing and no new file, keep existing. If create and have inputValue, use it.
                   if (mode === 'edit' && !state.inputValue) {
                       finalSrc = tracks.find(t => t.id === editingId)?.src || '';
                   }
              }
          } else if (state.sourceType === 'netease') {
              const match = state.inputValue.match(/id=(\d+)/) || state.inputValue.match(/\/song\/(\d+)/);
              if (match) finalSrc = match[1];
              else if (/^\d+$/.test(state.inputValue)) finalSrc = state.inputValue;
              else if (mode === 'create') throw new Error("无效 ID");
          }

          // Auto Fill Cover
          let cover = state.cover || getRandomCover();
          
          const trackData: GalleryTrack = {
              id: mode === 'edit' && editingId ? editingId : Date.now().toString(),
              title: state.title,
              artist: state.artist,
              coverUrl: cover,
              sourceType: state.sourceType,
              src: finalSrc,
              addedAt: mode === 'edit' ? (tracks.find(t => t.id === editingId)?.addedAt || Date.now()) : Date.now(),
              lyrics: state.lyrics,
              isHero: state.isHero
          };

          if (mode === 'edit' && onUpdate) {
              const updatedTracks = tracks.map(t => t.id === editingId ? trackData : t);
              onUpdate(updatedTracks);
              alert("更新成功");
          } else {
              onAdd(trackData);
              alert("发布成功" + (!state.cover ? " (自动生成封面)" : ""));
          }
          resetForm();
      } catch (e: any) { alert(e.message); } 
      finally { setState(p => ({ ...p, isUploading: false })); setUploadProgress(0); }
  };

  const getAudioSrc = (track: GalleryTrack) => {
      if (track.sourceType === 'netease') return `https://music.163.com/song/media/outer/url?id=${track.src}.mp3`;
      return track.src;
  }

  // Helper to format path display
  const formatPathDisplay = (path: string) => {
      if (!path) return '';
      if (path.startsWith('/api/file/')) return '云端资源 (R2 Direct Link)';
      return path;
  };

  return (
    <div className="max-w-5xl space-y-8">
        <FileSelectorModal 
            isOpen={showFileSelector} 
            onClose={() => setShowFileSelector(false)} 
            filter="audio"
            onSelect={(url) => setState(prev => ({...prev, inputValue: url, sourceType: 'local'}))}
        />

        <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
                <h3 className="text-2xl font-bold hidden md:block">音乐管理 ({tracks.length})</h3>
                {r2Status && (
                  <div className={`px-2 py-1 rounded text-[10px] font-mono border flex items-center gap-1 ${r2Status.ok ? 'bg-lime-500/10 border-lime-500/30 text-lime-500' : 'bg-red-500/10 border-red-500/30 text-red-500'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${r2Status.ok ? 'bg-lime-500' : 'bg-red-500'}`}></div>
                      R2: {r2Status.ok ? 'Ready' : r2Status.message}
                  </div>
                )}
            </div>
            {mode === 'edit' && (
                <button onClick={resetForm} className="px-4 py-2 bg-slate-700 text-white rounded text-sm hover:bg-slate-600">
                    取消编辑
                </button>
            )}
        </div>

        <div className={`max-w-2xl space-y-6 bg-[#111] p-6 rounded-xl border ${mode === 'edit' ? 'border-lime-500/50' : 'border-white/10'}`}>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
                  {mode === 'edit' ? '正在编辑歌曲' : '发布新作品'}
            </h4>
            <input type="text" placeholder="标题" value={state.title} onChange={e => setState({...state, title: e.target.value})} className="w-full bg-black border border-white/10 p-3 rounded-lg text-white"/>
            <input type="text" placeholder="艺术家" value={state.artist} onChange={e => setState({...state, artist: e.target.value})} className="w-full bg-black border border-white/10 p-3 rounded-lg text-white"/>
            
            <div className="grid grid-cols-4 gap-2">
                {['local','netease','qq','link'].map(t => (
                    <button key={t} onClick={() => setState({...state, sourceType: t as any})} className={`py-2 rounded border text-xs font-bold uppercase ${state.sourceType === t ? 'bg-white text-black' : 'border-white/10 text-slate-500'}`}>{t}</button>
                ))}
            </div>
            
            {state.sourceType === 'local' ? 
            <div className="space-y-2 p-3 bg-black rounded border border-white/10">
                <div className="flex gap-3">
                    <div className="flex-1">
                        <p className="text-[10px] text-slate-500 mb-1 uppercase font-bold">上传新音频</p>
                        <input type="file" ref={fileInputRef} onChange={e => e.target.files && setState({...state, audioFile: e.target.files[0]})} className="text-sm text-slate-400 w-full"/>
                    </div>
                    <div className="w-px bg-white/10"></div>
                    <div className="flex-1 flex flex-col justify-end">
                        <p className="text-[10px] text-slate-500 mb-1 uppercase font-bold">选择已有音频</p>
                        <button onClick={() => setShowFileSelector(true)} className="w-full py-1.5 bg-white/10 hover:bg-white/20 rounded text-sm text-white">媒体库</button>
                    </div>
                </div>
                {state.inputValue && !state.audioFile && (
                    <p className="text-xs text-lime-400 mt-2 truncate">资源就绪: {formatPathDisplay(state.inputValue)}</p>
                )}
                {mode === 'edit' && !state.inputValue && !state.audioFile && <p className="text-[10px] text-lime-400">保留原音频</p>}
            </div> :
            <input type="text" placeholder="链接或ID" value={state.inputValue} onChange={e => setState({...state, inputValue: e.target.value})} className="w-full bg-black border border-white/10 p-3 rounded-lg text-white font-mono text-sm"/>
            }

            <div className="p-4 border border-dashed border-white/20 rounded cursor-pointer" onClick={() => coverInputRef.current?.click()}>
                {state.cover ? (
                    <div className="flex items-center gap-2">
                        <img src={state.cover} className="w-8 h-8 rounded object-cover" />
                        <span className="text-lime-500 text-xs">封面已就绪 (点击更换)</span>
                    </div>
                ) : <span className="text-xs text-slate-500">点击上传封面 (留空将自动随机生成)</span>}
                <input type="file" ref={coverInputRef} onChange={async (e) => {
                    if(e.target.files) {
                        try {
                            const url = await storageService.uploadFile(e.target.files[0]);
                            setState(p => ({...p, cover: url}));
                        } catch(e){}
                    }
                }} className="hidden"/>
            </div>

            <label className="flex items-center gap-3 p-3 border border-white/10 rounded cursor-pointer hover:bg-white/5">
                <input type="checkbox" checked={state.isHero} onChange={e => setState({...state, isHero: e.target.checked})} />
                <span className="text-sm text-slate-300">设为主推 (Hero Track)</span>
            </label>

            <textarea 
                placeholder="LRC 歌词 (可选)" 
                value={state.lyrics} 
                onChange={e => setState({...state, lyrics: e.target.value})} 
                className="w-full h-32 bg-black border border-white/10 p-3 rounded-lg text-slate-300 font-mono text-xs resize-none"
            />

            <button onClick={handleTrackPublish} disabled={state.isUploading} className={`w-full py-4 font-bold rounded-xl disabled:opacity-50 relative overflow-hidden ${mode === 'edit' ? 'bg-lime-600 hover:bg-lime-500 text-white' : 'bg-lime-500 text-black hover:bg-lime-400'}`}>
                <div className="relative z-10">{state.isUploading ? `Uploading... ${Math.round(uploadProgress)}%` : (mode === 'edit' ? '保存修改' : '发布')}</div>
                {state.isUploading && (
                    <div className="absolute top-0 left-0 h-full bg-black/20 transition-all duration-300 z-0" style={{ width: `${uploadProgress}%` }}></div>
                )}
            </button>
        </div>

        <div className="space-y-4 pt-8 border-t border-white/10">
            {tracks.map(t => (
                <div key={t.id} className="flex items-center gap-4 p-4 bg-[#111] rounded-xl border border-white/5 hover:border-lime-500/30 transition-colors group">
                    <img src={t.coverUrl} className="w-10 h-10 rounded bg-slate-800 object-cover" />
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                             <div className="font-bold text-sm truncate text-white">{t.title}</div>
                             {t.isHero && <span className="text-[10px] bg-lime-500 text-black px-1.5 rounded font-bold">HERO</span>}
                        </div>
                        <div className="text-xs text-slate-500 truncate">{t.artist}</div>
                    </div>
                    
                    <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button 
                            onClick={() => setAuditionId(auditionId === t.id ? null : t.id)} 
                            className={`w-8 h-8 rounded-full flex items-center justify-center border ${auditionId === t.id ? 'bg-lime-500 text-black border-lime-500' : 'border-white/20 text-slate-400 hover:text-white'}`}
                        >
                            {auditionId === t.id ? (
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                            ) : (
                                <svg className="w-3 h-3 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                            )}
                        </button>
                        
                        <button onClick={() => handleEdit(t)} className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-xs rounded">编辑</button>
                        <button onClick={() => onDelete(t.id)} className="text-red-500 text-xs px-3 py-1 bg-red-500/10 rounded hover:bg-red-500 hover:text-white shrink-0 ml-2">删除</button>
                    </div>
                </div>
            ))}
        </div>
        
        {auditionId && (
            <audio 
                ref={audioRef}
                src={getAudioSrc(tracks.find(t => t.id === auditionId)!)}
                autoPlay
                onEnded={() => setAuditionId(null)}
                onError={() => setAuditionId(null)}
                {...{ referrerPolicy: "no-referrer" } as any}
            />
        )}
    </div>
  );
};
