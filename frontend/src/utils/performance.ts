// utils/performance.ts - 성능 최적화 유틸리티
import React, { useMemo, useCallback, useRef, useState, useEffect, memo } from 'react';

// 메모이제이션 헬퍼
export const useStableMemo = <T>(factory: () => T, deps: React.DependencyList): T => {
  return useMemo(factory, deps);
};

// 디바운스 훅 (단순화된 버전)
export const useDebounce = (value: string, delay: number): string => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// 무한 스크롤 훅
export const useInfiniteScroll = (
  callback: () => void,
  hasMore: boolean,
  isLoading: boolean
) => {
  const observer = useRef<IntersectionObserver>();
  
  const lastElementRef = useCallback((node: HTMLElement | null) => {
    if (isLoading || !hasMore) return;
    
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        callback();
      }
    }, { threshold: 1.0 });
    
    if (node) observer.current.observe(node);
  }, [callback, hasMore, isLoading]);

  return lastElementRef;
};

// 가상화 도우미 함수
export const createVirtualizedList = <T>(items: T[], itemHeight: number) => {
  return {
    items,
    itemHeight,
    totalHeight: items.length * itemHeight,
    getVisibleItems: (scrollTop: number, containerHeight: number) => {
      const startIndex = Math.floor(scrollTop / itemHeight);
      const endIndex = Math.min(startIndex + Math.ceil(containerHeight / itemHeight), items.length);
      return {
        startIndex,
        endIndex,
        visibleItems: items.slice(startIndex, endIndex)
      };
    }
  };
};

// 가상화된 리스트를 위한 간단한 헬퍼 함수들
export const createVirtualList = (items: any[], itemHeight: number = 80) => {
  return {
    items,
    itemHeight,
    totalHeight: items.length * itemHeight,
    getVisibleRange: (scrollTop: number, containerHeight: number) => {
      const startIndex = Math.floor(scrollTop / itemHeight);
      const endIndex = Math.min(startIndex + Math.ceil(containerHeight / itemHeight), items.length);
      return { startIndex, endIndex };
    }
  };
};

// 성능 모니터링 훅
export const usePerformanceMonitor = (componentName: string) => {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(Date.now());
  
  useEffect(() => {
    renderCount.current += 1;
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTime.current;
    
    if (import.meta.env.DEV && timeSinceLastRender > 16) {
      console.warn(`${componentName} 렌더링 성능 경고: ${timeSinceLastRender}ms (${renderCount.current}번째 렌더)`);
    }
    
    lastRenderTime.current = now;
  });
  
  return { renderCount: renderCount.current };
};

// 메모리 사용량 최적화를 위한 아이템 캐시
export class ItemCache<T> {
  private cache = new Map<string, T>();
  private maxSize: number;
  private accessOrder: string[] = [];

  constructor(maxSize: number = 1000) {
    this.maxSize = maxSize;
  }

  get(key: string): T | undefined {
    const item = this.cache.get(key);
    if (item) {
      // LRU 업데이트
      this.updateAccessOrder(key);
    }
    return item;
  }

  set(key: string, item: T): void {
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      // 가장 오래된 아이템 제거
      const oldestKey = this.accessOrder.shift();
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, item);
    this.updateAccessOrder(key);
  }

  private updateAccessOrder(key: string): void {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
    this.accessOrder.push(key);
  }

  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
  }

  size(): number {
    return this.cache.size;
  }
} 