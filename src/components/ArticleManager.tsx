// src/components/ArticleManager.tsx

import React, { useState, useRef } from 'react';
import { Article, GalleryTrack } from '../types';
import { storageService } from '../services/storageService';

interface ArticleManagerProps {
  articles: Article[];
  tracks: GalleryTrack[];
  onAdd: (article: Article) => void;
  onDelete: (id: string) => void;
}

const AESTHETIC_COVERS = [
    "https://images.unsplash.com/photo-1620641788421-7f1c91ade639?q=80&w=1000", 
    "https://images.unsplash.com/photo-1504333638930-c8787321eee0?q=80&w=1000", 
];
const getRandomCover = () => AESTHETIC_COVERS[Math.floor(Math.random() * AESTHETIC_COVERS.length)];

export const ArticleManager: React.FC<ArticleManagerProps> = ({ articles, tracks, onAdd, onDelete }) => {
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);

  const [state, setState] = useState({
      title: '', subtitle: '', author: 'NEXUS Editor', content: '', trackId: '', cover: '', isUploading: false
  });
  const articleCoverRef = useRef<HTMLInputElement>(null);
  const contentImageRef = useRef<HTMLInputElement>(null);
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);

  const resetForm = () => {
      setState({ title: '', subtitle: '', author: 'NEXUS Editor', content: '', trackId: '', cover: '', isUploading: false });
      setMode('create');
      setEditingId(null);
  };

  const handleEdit = (article: Article) => {
      setState({
          title: article.title,
          subtitle: article.subtitle || '',
          author: article.author,
          content: article.content,
          trackId: article.trackId || '',
          cover: article.coverUrl,
          isUploading: false
      });
      setEditingId(article.id);
      setMode('edit');
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const insertAtCursor = (before: string, after: string = "") => {
      if (!contentTextareaRef.current) return;
      const textarea = contentTextareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = state.content;
      const newText = text.substring(0, start) + before + text.substring(start, end) + after + text.substring(end);
      
      setState(p => ({ ...p, content: newText }));
      setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + before.length, end + before.length);
      }, 0);
  };

  const handleContentImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setState(p => ({ ...p, isUploading: true }));
      try {
          // Use standard upload
          const url = await storageService.uploadFile(file);
          insertAtCursor(`\n![Image](${url})\n`);
      } catch (e) {
          alert("图片插入失败");
      } finally {
          setState(p => ({ ...p, isUploading: false }));
          if (contentImageRef.current) contentImageRef.current.value = '';
      }
  };

  const handleArticleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
          const url = await storageService.uploadFile(file);
          setState(p => ({ ...p, cover: url }));
      } catch (e) { alert("封面上传失败"); }
  };

  const handlePublish = async () => {
      if (!state.title || !state.content) return alert("标题和内容不能为空");
      setState(p => ({ ...p, isUploading: true }));
      try {
          let cover = state.cover || getRandomCover();
          const articleData: Article = {
              id: mode === 'edit' && editingId ? editingId : Date.now().toString(),
              title: state.title,
              subtitle: state.subtitle,
              author: state.author || "NEXUS Editor",
              content: state.content,
              coverUrl: cover,
              trackId: state.trackId,
              publishedAt: mode === 'edit' ? (articles.find(a => a.id === editingId)?.publishedAt || Date.now()) : Date.now()
          };
          
          if (mode === 'edit' && editingId) {
              onDelete(editingId); 
          }
          onAdd(articleData);

          alert(mode === 'edit' ? "文章更新成功！" : "文章发布成功！");
          resetForm();
      } catch (e) {
          alert("发布失败");
      } finally {
          setState(p => ({ ...p, isUploading: false }));
      }
  };

  return (
    <div className="max-w-5xl space-y-8">
        <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold hidden md:block">撰写深度专栏</h3>
            {mode === 'edit' && (
              <button onClick={resetForm} className="px-4 py-2 bg-slate-700 text-white rounded text-sm hover:bg-slate-600">
                  取消编辑
              </button>
            )}
        </div>

        <div className={`max-w-4xl space-y-6 bg-[#111] p-6 rounded-xl border ${mode === 'edit' ? 'border-cyan-500/50' : 'border-white/10'}`}>
            <input type="text" value={state.title} onChange={e => setState({...state, title: e.target.value})} placeholder="文章标题" className="w-full bg-black border border-white/20 p-4 rounded-xl text-xl font-bold outline-none focus:border-cyan-500 text-white"/>
            <input type="text" value={state.subtitle} onChange={e => setState({...state, subtitle: e.target.value})} placeholder="副标题 (可选)" className="w-full bg-black border border-white/10 p-3 rounded-lg text-slate-300 outline-none"/>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" value={state.author} onChange={e => setState({...state, author: e.target.value})} placeholder="作者" className="bg-black border border-white/10 p-3 rounded-lg outline-none text-white"/>
                <select value={state.trackId} onChange={e => setState({...state, trackId: e.target.value})} className="bg-black border border-white/10 p-3 rounded-lg outline-none text-slate-300">
                    <option value="">-- 关联伴读音乐 --</option>
                    {tracks.map(t => <option key={t.id} value={t.id}>{t.title} - {t.artist}</option>)}
                </select>
            </div>

            <div className="p-4 border border-dashed border-white/20 rounded-xl cursor-pointer hover:border-cyan-500 transition-colors" onClick={() => articleCoverRef.current?.click()}>
                {state.cover ? (
                    <div className="relative">
                        <img src={state.cover} className="h-48 w-full object-cover rounded" />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity text-xs">点击更换封面</div>
                    </div>
                ) : <span className="text-slate-500 text-sm flex items-center justify-center h-20">上传文章封面图 (如未上传将自动随机生成)</span>}
                <input type="file" ref={articleCoverRef} onChange={handleArticleCoverUpload} className="hidden" accept="image/*"/>
            </div>

            {/* Rich Text Toolbar */}
            <div className="flex items-center gap-2 p-2 bg-[#1a1a1a] rounded-t-xl border border-white/10 border-b-0 overflow-x-auto text-white">
                <button onClick={() => insertAtCursor('# ')} className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded text-xs font-bold shrink-0" title="大标题">H1</button>
                <button onClick={() => insertAtCursor('## ')} className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded text-xs font-bold shrink-0" title="副标题">H2</button>
                <button onClick={() => insertAtCursor('**', '**')} className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded text-xs font-bold shrink-0" title="加粗">B</button>
                <button onClick={() => insertAtCursor('*', '*')} className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded text-xs font-bold shrink-0" title="斜体">I</button>
                <div className="w-px h-4 bg-white/10 mx-1 shrink-0"></div>
                <button onClick={() => contentImageRef.current?.click()} className="px-3 py-1 bg-cyan-900/30 text-cyan-400 hover:bg-cyan-900/50 rounded text-xs font-bold flex items-center gap-1 shrink-0" title="上传插图">
                    插入图片
                </button>
                <input type="file" ref={contentImageRef} onChange={handleContentImageUpload} className="hidden" accept="image/*"/>
            </div>

            <textarea 
                ref={contentTextareaRef}
                value={state.content} 
                onChange={e => setState({...state, content: e.target.value})} 
                placeholder="在此撰写正文... 支持 Markdown 语法" 
                className="w-full h-[500px] bg-black border border-white/10 p-4 rounded-b-xl outline-none resize-none font-sans text-slate-300 leading-relaxed font-mono text-sm" 
            />
            
            <button onClick={handlePublish} disabled={state.isUploading} className="w-full py-4 bg-cyan-500 text-black font-bold rounded-xl hover:bg-cyan-400 disabled:opacity-50">
                {state.isUploading ? 'UPLOADING...' : '发布文章'}
            </button>
        </div>

        <div className="space-y-4 pt-8 border-t border-white/10">
            <h3 className="text-2xl font-bold mb-6 hidden md:block">文章列表 ({articles.length})</h3>
            {articles.map(a => (
                <div key={a.id} className="flex items-center gap-4 p-4 bg-[#111] rounded-xl border border-white/5 group hover:border-cyan-500/30 transition-colors">
                    <img src={a.coverUrl} className="w-16 h-10 rounded bg-slate-800 object-cover" />
                    <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm truncate text-white">{a.title}</div>
                        <div className="text-xs text-slate-500 truncate">{a.author} • {new Date(a.publishedAt).toLocaleDateString()}</div>
                    </div>
                    <div className="flex gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEdit(a)} className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-xs rounded">编辑</button>
                        <button onClick={() => onDelete(a.id)} className="text-red-500 text-xs px-3 py-1 bg-red-500/10 rounded hover:bg-red-500 hover:text-white shrink-0">删除</button>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};
