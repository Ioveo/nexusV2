// src/components/VideoManager.tsx

import React, { useState, useRef } from 'react';
import { Video, Category } from '../types';
import { storageService } from '../services/storageService';

interface VideoManagerProps {
  videos: Video[];
  categories: Category[];
  onUpdate: (videos: Video[]) => void;
}

const AESTHETIC_COVERS = [
    "https://images.unsplash.com/photo-1536240478700-b869070f9279?q=80&w=1000",
    "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=1000",
    "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1000"
];
const getRandomCover = () => AESTHETIC_COVERS[Math.floor(Math.random() * AESTHETIC_COVERS.length)];

export const VideoManager: React.FC<VideoManagerProps> = ({ videos, categories, onUpdate }) => {
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);

  const [state, setState] = useState({
      title: '', author: '', videoUrl: '', sourceType: 'local' as 'local' | 'external', categoryId: '', cover: '', description: '', isHero: false, adSlogan: '', isUploading: false
  });
  const coverInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const videoCats = categories.filter(c => c.type === 'video');

  const resetForm = () => {
      setState({ title: '', author: '', videoUrl: '', sourceType: 'local', categoryId: '', cover: '', description: '', isHero: false, adSlogan: '', isUploading: false });
      setMode('create');
      setEditingId(null);
  };

  const handleEdit = (video: Video) => {
      setState({
          title: video.title,
          author: video.author,
          videoUrl: video.videoUrl,
          sourceType: video.sourceType,
          categoryId: video.categoryId || '',
          cover: video.coverUrl,
          description: video.description || '',
          isHero: !!video.isHero,
          adSlogan: video.adSlogan || '',
          isUploading: false
      });
      setEditingId(video.id);
      setMode('edit');
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
      if (!state.title) return alert("请输入标题");
      setState(p => ({ ...p, isUploading: true }));
      try {
          let finalVideoUrl = state.videoUrl;
          if (state.sourceType === 'local') {
              if (videoInputRef.current?.files?.[0]) {
                  finalVideoUrl = await storageService.uploadFile(videoInputRef.current.files[0]);
              } else if (!state.videoUrl && mode === 'create') throw new Error("请选择视频文件");
          } else {
              if (!state.videoUrl) throw new Error("请输入视频链接");
          }

          const videoData: Video = {
              id: mode === 'edit' && editingId ? editingId : Date.now().toString(),
              title: state.title,
              author: state.author || "Unknown",
              coverUrl: state.cover || getRandomCover(),
              videoUrl: finalVideoUrl,
              sourceType: state.sourceType,
              category: videoCats.find(c => c.id === state.categoryId)?.name || 'General',
              categoryId: state.categoryId,
              addedAt: mode === 'edit' ? (videos.find(v => v.id === editingId)?.addedAt || Date.now()) : Date.now(),
              description: state.description,
              isHero: state.isHero,
              adSlogan: state.adSlogan
          };
          
          let updatedVideos: Video[] = [];

          // Critical: Handle Hero Exclusivity
          // If this video is set to Hero, ensure ALL others are set to false.
          if (videoData.isHero) {
              if (mode === 'edit') {
                  updatedVideos = videos.map(v => {
                      if (v.id === editingId) return videoData; // This one is true
                      return { ...v, isHero: false }; // Others false
                  });
              } else {
                  updatedVideos = [videoData, ...videos.map(v => ({ ...v, isHero: false }))];
              }
          } else {
              // Just normal update
              if (mode === 'edit') {
                  updatedVideos = videos.map(v => v.id === editingId ? videoData : v);
              } else {
                  updatedVideos = [videoData, ...videos];
              }
          }

          onUpdate(updatedVideos);
          await storageService.saveVideos(updatedVideos);
          alert("保存成功");
          resetForm();
      } catch (e: any) {
          alert("操作失败: " + e.message);
      } finally {
          setState(p => ({ ...p, isUploading: false }));
      }
  };

  const handleDelete = async (id: string) => {
      if (!confirm("确定删除？")) return;
      const vid = videos.find(v => v.id === id);
      const updated = videos.filter(v => v.id !== id);
      onUpdate(updated);
      try {
          await storageService.saveVideos(updated);
          if (vid?.sourceType === 'local' && vid.videoUrl.includes('/api/file/')) {
              await storageService.deleteFile(vid.videoUrl);
          }
      } catch(e) { console.error(e); }
  };

  return (
    <div className="max-w-5xl space-y-8">
      <div className="flex justify-between items-center">
          <h3 className="text-2xl font-bold">视频管理 ({videos.length})</h3>
          {mode === 'edit' && <button onClick={resetForm} className="px-4 py-2 bg-slate-700 rounded text-sm">取消</button>}
      </div>
      
      {/* Form */}
      <div className="bg-[#1a1a1a] p-6 rounded-xl border border-white/10 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="视频标题" value={state.title} onChange={e => setState({...state, title: e.target.value})} className="bg-black border border-white/20 p-3 rounded text-white"/>
              <div className="flex gap-2">
                  <input type="text" placeholder="作者/频道" value={state.author} onChange={e => setState({...state, author: e.target.value})} className="bg-black border border-white/20 p-3 rounded text-white flex-1"/>
                  <select value={state.categoryId} onChange={e => setState({...state, categoryId: e.target.value})} className="bg-black border border-white/20 p-3 rounded text-white w-40">
                      <option value="">选择分类...</option>
                      {videoCats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
              </div>
          </div>
          
          <input 
            type="text" 
            placeholder="广告语 (Hero Ad Slogan) - 仅在首页/Hero位置显示" 
            value={state.adSlogan} 
            onChange={e => setState({...state, adSlogan: e.target.value})} 
            className="w-full bg-black border border-orange-500/30 p-3 rounded text-orange-200 placeholder-orange-500/50 focus:border-orange-500 outline-none"
          />

          <textarea placeholder="视频简介..." value={state.description} onChange={e => setState({...state, description: e.target.value})} className="w-full bg-black border border-white/20 p-3 rounded text-white h-20 resize-none"/>
          
          <div className="flex gap-4">
             <button onClick={() => setState({...state, sourceType: 'local'})} className={`flex-1 py-2 rounded text-sm border ${state.sourceType === 'local' ? 'bg-white text-black' : 'border-white/10'}`}>本地上传</button>
             <button onClick={() => setState({...state, sourceType: 'external'})} className={`flex-1 py-2 rounded text-sm border ${state.sourceType === 'external' ? 'bg-white text-black' : 'border-white/10'}`}>外部链接</button>
          </div>
          {state.sourceType === 'local' ? (
              <input type="file" ref={videoInputRef} accept="video/*" className="w-full text-slate-400 text-sm"/>
          ) : (
              <input type="text" placeholder="MP4 URL..." value={state.videoUrl} onChange={e => setState({...state, videoUrl: e.target.value})} className="w-full bg-black border border-white/20 p-3 rounded text-white font-mono text-sm"/>
          )}
          
          <div className="p-4 border border-dashed border-white/20 rounded cursor-pointer" onClick={() => coverInputRef.current?.click()}>
                {state.cover ? (
                    <div className="flex items-center gap-2">
                        <img src={state.cover} className="w-16 h-9 rounded object-cover" />
                        <span className="text-orange-500 text-xs">封面已就绪</span>
                    </div>
                ) : <span className="text-xs text-slate-500">上传封面图 (推荐 16:9)</span>}
                <input type="file" ref={coverInputRef} onChange={async (e) => {
                    if(e.target.files?.[0]) {
                        try {
                            const url = await storageService.uploadFile(e.target.files[0]);
                            setState(p => ({...p, cover: url}));
                        } catch(e){}
                    }
                }} className="hidden"/>
          </div>

          <label className="flex items-center gap-3 p-3 border border-white/10 rounded cursor-pointer hover:bg-white/5 transition-colors">
                <input type="checkbox" checked={state.isHero} onChange={e => setState({...state, isHero: e.target.checked})} className="accent-orange-500 w-4 h-4"/>
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-white">设为主推视频 (Hero Track)</span>
                    <span className="text-[10px] text-slate-500">选中后，该视频将占据首页和影视中心顶部大屏 (会自动替换旧的主推)。</span>
                </div>
          </label>

          <button onClick={handleSubmit} disabled={state.isUploading} className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {state.isUploading ? '处理中...' : (mode === 'edit' ? '保存修改' : '发布视频')}
          </button>
      </div>
      
      {/* List */}
      <div className="space-y-2">
          {videos.map(v => (
              <div key={v.id} className={`flex items-center gap-4 p-3 bg-[#1a1a1a] rounded border transition-colors ${v.isHero ? 'border-orange-500/50' : 'border-white/5 hover:border-orange-500/30'}`}>
                  <div className="relative w-20 h-12 shrink-0">
                      <img src={v.coverUrl} className="w-full h-full object-cover rounded bg-black" />
                      {v.isHero && <div className="absolute top-0 left-0 w-full h-full border-2 border-orange-500 rounded pointer-events-none"></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                      <div className="font-bold text-white flex items-center gap-2 truncate">
                          {v.title}
                          {v.isHero && <span className="text-[9px] bg-orange-500 text-black px-1.5 py-0.5 rounded font-black uppercase tracking-wider">HERO</span>}
                      </div>
                      <div className="text-xs text-slate-500 truncate">{v.category} • {v.author}</div>
                  </div>
                  <button onClick={() => handleEdit(v)} className="px-3 py-1 bg-white/10 rounded text-xs hover:bg-white/20 transition-colors">编辑</button>
                  <button onClick={() => handleDelete(v.id)} className="px-3 py-1 bg-red-500/20 text-red-500 rounded text-xs hover:bg-red-500 hover:text-white transition-colors">删除</button>
              </div>
          ))}
      </div>
    </div>
  );
};
