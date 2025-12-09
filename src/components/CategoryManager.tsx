// src/components/CategoryManager.tsx

import React, { useState } from 'react';
import { Category } from '../types';
import { storageService } from '../services/storageService';

interface CategoryManagerProps {
  categories: Category[];
  onUpdate: (categories: Category[]) => void;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({ categories, onUpdate }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<Category['type']>('video');

  const handleAdd = async () => {
    if (!name.trim()) return;
    
    const newCat: Category = {
      id: `cat_${Date.now()}`,
      name: name.trim(),
      type: type
    };
    
    const updated = [...categories, newCat];
    onUpdate(updated);
    try {
        await storageService.saveCategories(updated);
        setName('');
        alert('分类添加成功');
    } catch (e) {
        alert('保存失败');
    }
  };

  const handleDelete = async (id: string) => {
    if(!confirm("确定删除分类？")) return;
    const updated = categories.filter(c => c.id !== id);
    onUpdate(updated);
    await storageService.saveCategories(updated);
  };

  const filteredCats = categories.filter(c => c.type === type);

  return (
    <div className="max-w-4xl mx-auto">
      <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
         <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
         分类标签管理
      </h3>

      {/* Add Form */}
      <div className="bg-[#111] p-6 rounded-xl border border-white/10 mb-8 flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full space-y-2">
              <label className="text-xs text-slate-500 font-bold uppercase">分类名称</label>
              <input 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                placeholder="例如: 科幻短片, 赛博朋克" 
                className="w-full bg-black border border-white/20 p-3 rounded-lg text-white"
              />
          </div>
          <div className="w-full md:w-48 space-y-2">
              <label className="text-xs text-slate-500 font-bold uppercase">所属板块</label>
              <select 
                value={type} 
                onChange={e => setType(e.target.value as any)}
                className="w-full bg-black border border-white/20 p-3 rounded-lg text-white"
              >
                  <option value="video">视频 (Cinema)</option>
                  <option value="music">音乐 (Music)</option>
                  <option value="article">文章 (Editorial)</option>
                  <option value="gallery">画廊 (Gallery)</option>
              </select>
          </div>
          <button onClick={handleAdd} className="w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg">
              添加分类
          </button>
      </div>

      {/* List */}
      <div className="bg-[#111] border border-white/10 rounded-xl overflow-hidden">
          <div className="flex border-b border-white/10">
               {['video','music','article','gallery'].map(t => (
                   <button 
                    key={t}
                    onClick={() => setType(t as any)}
                    className={`flex-1 py-3 text-sm font-bold uppercase ${type === t ? 'bg-white/10 text-white' : 'text-slate-500 hover:bg-white/5'}`}
                   >
                       {t}
                   </button>
               ))}
          </div>
          <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredCats.map(c => (
                  <div key={c.id} className="flex justify-between items-center p-3 bg-black border border-white/10 rounded-lg group hover:border-blue-500/50 transition-colors">
                      <span className="text-sm text-white font-medium">{c.name}</span>
                      <button onClick={() => handleDelete(c.id)} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity text-xs hover:text-white">✕</button>
                  </div>
              ))}
              {filteredCats.length === 0 && <p className="text-slate-500 text-sm col-span-full text-center py-4">暂无分类</p>}
          </div>
      </div>
    </div>
  );
};