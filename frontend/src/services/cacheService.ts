// services/cacheService.ts - 캐싱 전략
interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  maxSize: number;
  persistOnError?: boolean;
}

class MemoryCache<T> {
  private cache = new Map<string, { data: T; timestamp: number; ttl: number }>();
  private maxSize: number;

  constructor(maxSize: number = 1000) {
    this.maxSize = maxSize;
  }

  set(key: string, data: T, ttl: number): void {
    // LRU 구현: 캐시 크기 초과 시 가장 오래된 항목 제거
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    // TTL 체크
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    // 접근 시 맨 뒤로 이동 (LRU)
    this.cache.delete(key);
    this.cache.set(key, item);
    
    return item.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

export class CacheService {
  private static memoryCache = new MemoryCache<any>(500);
  
  // 캐시 키 생성
  static generateKey(prefix: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|');
    return `${prefix}:${sortedParams}`;
  }

  // 메모리 캐시 (빠른 액세스)
  static setMemory<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    this.memoryCache.set(key, data, ttl);
  }

  static getMemory<T>(key: string): T | null {
    return this.memoryCache.get(key);
  }

  // 로컬 스토리지 캐시 (지속성)
  static setLocal<T>(key: string, data: T, ttl: number = 30 * 60 * 1000): void {
    try {
      const item = {
        data,
        timestamp: Date.now(),
        ttl
      };
      localStorage.setItem(`eterny_cache_${key}`, JSON.stringify(item));
    } catch (error) {
      console.warn('로컬 스토리지 저장 실패:', error);
    }
  }

  static getLocal<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(`eterny_cache_${key}`);
      if (!item) return null;

      const parsed = JSON.parse(item);
      if (Date.now() - parsed.timestamp > parsed.ttl) {
        localStorage.removeItem(`eterny_cache_${key}`);
        return null;
      }

      return parsed.data;
    } catch (error) {
      console.warn('로컬 스토리지 읽기 실패:', error);
      return null;
    }
  }

  // 하이브리드 캐시 (메모리 -> 로컬 스토리지 순서)
  static get<T>(key: string): T | null {
    // 1. 메모리 캐시 먼저 확인
    const memoryData = this.getMemory<T>(key);
    if (memoryData) return memoryData;

    // 2. 로컬 스토리지 확인
    const localData = this.getLocal<T>(key);
    if (localData) {
      // 로컬에서 찾은 데이터를 메모리에도 저장
      this.setMemory(key, localData, 5 * 60 * 1000);
      return localData;
    }

    return null;
  }

  static set<T>(key: string, data: T, memoryTtl: number = 5 * 60 * 1000, localTtl: number = 30 * 60 * 1000): void {
    this.setMemory(key, data, memoryTtl);
    this.setLocal(key, data, localTtl);
  }

  static invalidate(pattern: string): void {
    // 메모리 캐시 무효화
    this.memoryCache.clear();

    // 로컬 스토리지 무효화
    try {
      Object.keys(localStorage)
        .filter(key => key.includes(pattern))
        .forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.warn('캐시 무효화 실패:', error);
    }
  }
} 