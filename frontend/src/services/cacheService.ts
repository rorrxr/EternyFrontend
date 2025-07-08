class MemoryCache<T> {
  private cache = new Map<string, { data: T; timestamp: number; ttl: number }>();
  private maxSize: number;
  constructor(maxSize: number = 500) { this.maxSize = maxSize; }
  set(key: string, data: T, ttl: number = 5 * 60 * 1000) {
    if (this.cache.size >= this.maxSize) this.cache.delete(this.cache.keys().next().value);
    this.cache.set(key, { data, timestamp: Date.now(), ttl });
  }
  get(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() - item.timestamp > item.ttl) { this.cache.delete(key); return null; }
    this.cache.delete(key); this.cache.set(key, item); return item.data;
  }
  clear() { this.cache.clear(); }
}

export class CacheService {
  private static memoryCache = new MemoryCache<any>(500);
  static set<T>(key: string, data: T, memoryTtl: number = 5 * 60 * 1000, localTtl: number = 30 * 60 * 1000) {
    this.memoryCache.set(key, data, memoryTtl);
    try {
      localStorage.setItem(`eterny_cache_${key}`, JSON.stringify({ data, timestamp: Date.now(), ttl: localTtl }));
    } catch {}
  }
  static get<T>(key: string): T | null {
    const mem = this.memoryCache.get(key); if (mem) return mem;
    try {
      const item = localStorage.getItem(`eterny_cache_${key}`);
      if (!item) return null;
      const parsed = JSON.parse(item);
      if (Date.now() - parsed.timestamp > parsed.ttl) { localStorage.removeItem(`eterny_cache_${key}`); return null; }
      this.memoryCache.set(key, parsed.data);
      return parsed.data;
    } catch { return null; }
  }
  static clear() { this.memoryCache.clear(); }
} 