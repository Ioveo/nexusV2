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

  // ... [Existing methods for tracks, articles, etc. kept same] ...
  
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

  // --- CATEGORIES (NEW) ---
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

  // ... [File upload methods kept same] ...
  async uploadFile(file: File): Promise<string> {
    const ext = file.name.split('.').pop();
    const uniqueKey = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${ext}`;
    const res = await fetch(`${API_BASE}/api/upload?key=${uniqueKey}`, {
      method: 'PUT',
      headers: { 'Content-Type': file.type, 'x-admin-password': localStorage.getItem('admin_password') || '' },
      body: file
    });
    if (!res.ok) throw new Error('Upload Failed');
    const data = await res.json();
    return data.url;
  },

  async deleteFile(url: string): Promise<void> {
      const parts = url.split('/api/file/');
      if (parts.length > 1) {
          await fetch(`${API_BASE}/api/delete-file/${parts[1]}`, { method: 'DELETE', headers: getHeaders() });
      }
  }
};