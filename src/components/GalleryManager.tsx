// src/components/GalleryManager.tsx

import React, { useState, useRef } from 'react';
import { GalleryImage } from '../types';
import { storageService } from '../services/storageService';

interface GalleryManagerProps {
  images: GalleryImage[];
  onUpdate: (images: GalleryImage[]) => void;
}

export const GalleryManager: React.FC<GalleryManagerProps> = ({ images, onUpdate }) => {
  const [title, setTitle] = useState('');
  const [sourceType, setSourceType] = useState<'upload' | 'link'>('upload');
  const [inputValue, setInputValue] = useState(''); // For link
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePublish = async () => {
    if (!title) return alert("请输入标题");
    
    setIsUploading(true);
    try {
      let finalUrl = '';

      if (sourceType === 'upload') {
          if (!file) throw new Error("请选择图片文件");
          finalUrl = await storageService.uploadFile(file);
      } else {
          if (!inputValue) throw new Error("请输入图片链接");
          finalUrl = inputValue;
      }

      const newImage: GalleryImage = {
        id: Date.now().toString(),
        url: finalUrl,
        title: title,
        uploadedAt: Date.now()
      };
      
      const updated = [newImage, ...images];
      onUpdate(updated);
      await storageService.saveGallery(updated);
      
      // Reset
      setTitle('');
      setFile(null);
      setInputValue('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      alert("发布成功");
    } catch (e: any) {
      alert("操作失败: " + e.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定删除此图片？")) return;
    const imgToDelete = images.find(i => i.id === id);
    const updated = images.filter(i => i.id !== id);
    
    onUpdate(updated); 
    
    try {
      await storageService.saveGallery(updated); 
      if (imgToDelete?.url && imgToDelete.url.includes('/api/file/')) {
        await storageService.deleteFile(imgToDelete.url);
      }
    } catch (e) {
      console.error("Delete sync error", e);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-bold text-white flex items-center gap-2">
              <span className="w-2 h-8 bg-purple-500 rounded-full"></span>
              画廊管理 <span className="text-sm font-mono text-slate-500 font-normal">({images.length} items)</span>
          </h3>
      </div>
      
      {/* Input Area */}
      <div className="bg-[#111] p-6 md:p-8 rounded-2xl border border-white/10 mb-10 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
            <svg className="w-32 h-32 text-purple-500" fill="currentColor" viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
        </div>

        <div className="relative z-10 space-y-6">
            <div className="flex gap-4">
                <button onClick={() => setSourceType('upload')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${sourceType === 'upload' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>本地上传 (R2)</button>
                <button onClick={() => setSourceType('link')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${sourceType === 'link' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>第三方链接</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Title / Description</label>
                    <input 
                        type="text" 
                        value={title} 
                        onChange={e => setTitle(e.target.value)} 
                        placeholder="给这张图片起个名字..." 
                        className="w-full bg-black border border-white/20 rounded-xl p-4 text-white outline-none focus:border-purple-500 transition-colors"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Source</label>
                    {sourceType === 'upload' ? (
                        <div className="relative group">
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={e => e.target.files && setFile(e.target.files[0])} 
                                className="w-full bg-black border border-white/20 rounded-xl p-3 text-slate-400 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:bg-white/10 file:text-white hover:file:bg-white/20 cursor-pointer"
                                accept="image/*"
                            />
                        </div>
                    ) : (
                        <input 
                            type="text" 
                            value={inputValue} 
                            onChange={e => setInputValue(e.target.value)} 
                            placeholder="https://example.com/image.jpg" 
                            className="w-full bg-black border border-white/20 rounded-xl p-4 text-white outline-none focus:border-purple-500 font-mono text-sm"
                        />
                    )}
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button 
                    onClick={handlePublish} 
                    disabled={isUploading} 
                    className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-purple-400 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                    {isUploading ? <span className="animate-spin">◐</span> : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>}
                    {isUploading ? 'Uploading...' : '发布到画廊'}
                </button>
            </div>
        </div>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {images.map(img => (
          <div key={img.id} className="group relative aspect-square bg-[#111] rounded-xl overflow-hidden border border-white/5 hover:border-purple-500/50 transition-colors">
            <img src={img.url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
            <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 p-4">
              <span className="text-xs text-white font-bold text-center line-clamp-2">{img.title}</span>
              <button onClick={() => handleDelete(img.id)} className="px-4 py-1.5 bg-red-500/20 text-red-400 border border-red-500/50 text-xs rounded-full hover:bg-red-500 hover:text-white transition-all">
                Delete
              </button>
            </div>
            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur rounded px-2 py-0.5 text-[10px] text-slate-300 font-mono">
                {new Date(img.uploadedAt).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};