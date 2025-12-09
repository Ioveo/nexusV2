// src/components/GalleryGrid.tsx

import React, { useState } from 'react';
import { GalleryImage } from '../types';

export const GalleryGrid: React.FC<{ images: GalleryImage[] }> = ({ images }) => {
  const [active, setActive] = useState<GalleryImage | null>(null);
  if (!images.length) return null;

  return (
    <div>
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {images.map(img => (
                <div key={img.id} onClick={() => setActive(img)} className="break-inside-avoid relative group rounded-xl overflow-hidden cursor-pointer">
                    <img src={img.url} className="w-full rounded-xl border border-white/5 hover:border-cyan-500/50 transition-all duration-500" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                         <span className="text-white text-sm font-bold">{img.title}</span>
                    </div>
                </div>
            ))}
        </div>
        
        {active && (
            <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4" onClick={() => setActive(null)}>
                <img src={active.url} className="max-w-full max-h-[90vh] rounded shadow-2xl" />
            </div>
        )}
    </div>
  );
};