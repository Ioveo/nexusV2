// src/services/storageService.ts

import { GalleryTrack, Article, GalleryImage, Video, Category } from '../types';

const API_BASE = ''; 

const getHeaders = () => {
    const pwd = localStorage.getItem('admin_password') || '';
    return {
        'Content-Type': 'application/json',
        'x-admin-password': pwd
    };
};

export const storageService = {
  async verifyAuth(password: string): Promise<boolean> {
      try {
          const res = await fetch(`${API_BASE}/api/verify-auth`, {
              method: 'POST',
              headers: { 
                  'Content-Type': 'application/json',
                  'x-admin-password': password 
              }
          });
          if (!res.ok) return false;
          return true;
      } catch (e) {
          return false;
      }
  },

  async checkR2Status(): Promise<{ ok: boolean; message: string }> {
      try {
          const res = await fetch(`${API_BASE}/api/health-check`);
          if (!res.ok) return { ok: false, message: "API Error" };
          const data = await res.json();
          return { ok: data.status === 'ok', message: data.message };
      } catch (e: any) {
          return { ok: false, message: e.message || "Network Error" };
      }
  },

  // ... [Existing methods for tracks, articles, etc.] ...
  
  async getTracks(): Promise<GalleryTrack[]> {
    const res = await fetch(`${API_BASE}/api/tracks`);
    return res.ok ? await res.json() : [];
  },
  async saveTracks(data: GalleryTrack[]) {
    await fetch(`${API_BASE}/api/tracks`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) });
  },

  async getArticles(): Promise<Article[]> {
    const res = await fetch(`${API_BASE}/api/articles`);
    return res.ok ? await res.json() : [];
  },
  async saveArticles(data: Article[]) {
    await fetch(`${API_BASE}/api/articles`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) });
  },

  async getGallery(): Promise<GalleryImage[]> {
    const res = await fetch(`${API_BASE}/api/gallery`);
    return res.ok ? await res.json() : [];
  },
  async saveGallery(data: GalleryImage[]) {
    await fetch(`${API_BASE}/api/gallery`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) });
  },

  async getVideos(): Promise<Video[]> {
    const res = await fetch(`${API_BASE}/api/videos`);
    return res.ok ? await res.json() : [];
  },
  async saveVideos(data: Video[]) {
    await fetch(`${API_BASE}/api/videos`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) });
  },

  async getCategories(): Promise<Category[]> {
    try {
      const res = await fetch(`${API_BASE}/api/categories`);
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (e) {
      console.warn("API Error", e);
      return [];
    }
  },

  async saveCategories(data: Category[]): Promise<void> {
    const res = await fetch(`${API_BASE}/api/categories`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to save categories');
  },

  // --- OPTIMIZED UPLOAD WITH PROGRESS (XHR) ---
  uploadFile(file: File, onProgress?: (percent: number) => void): Promise<string> {
    return new Promise((resolve, reject) => {
        // 1. Check size limit (Cloudflare Worker standard limit ~100MB)
        if (file.size > 99 * 1024 * 1024) {
            reject(new Error("文件过大！Cloudflare Worker 限制最大 100MB。大文件请使用外部链接。"));
            return;
        }

        const ext = file.name.split('.').pop();
        const uniqueKey = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${ext}`;
        const url = `${API_BASE}/api/upload?key=${uniqueKey}`;
        const pwd = localStorage.getItem('admin_password') || '';

        const xhr = new XMLHttpRequest();
        xhr.open('PUT', url, true);
        
        // Headers
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.setRequestHeader('x-admin-password', pwd);

        // Progress event
        xhr.upload.onprogress = (e) => {
            if (e.lengthComputable && onProgress) {
                const percentComplete = (e.loaded / e.total) * 100;
                onProgress(percentComplete);
            }
        };

        // Completion
        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const data = JSON.parse(xhr.responseText);
                    resolve(data.url);
                } catch (e) {
                    resolve(xhr.responseText); // Fallback
                }
            } else {
                try {
                    const errData = JSON.parse(xhr.responseText);
                    reject(new Error(errData.error || `Upload failed: ${xhr.statusText}`));
                } catch(e) {
                    reject(new Error(`Upload failed: ${xhr.statusText}`));
                }
            }
        };

        // Error
        xhr.onerror = () => {
            reject(new Error("Network Error during upload"));
        };

        xhr.send(file);
    });
  },

  async deleteFile(url: string): Promise<void> {
      const parts = url.split('/api/file/');
      if (parts.length > 1) {
          await fetch(`${API_BASE}/api/delete-file/${parts[1]}`, { method: 'DELETE', headers: getHeaders() });
      }
  }
};
