// utils/performance.ts - 성능 최적화 유틸리티
import { useMemo, useCallback, useRef, useState, useEffect } from 'react';

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