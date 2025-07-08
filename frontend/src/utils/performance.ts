import { useMemo, useCallback, useRef } from 'react';
import { debounce } from 'lodash-es';

export const useStableMemo = <T>(factory: () => T, deps: React.DependencyList): T => {
  return useMemo(factory, deps);
};

export const useDebounce = <T extends (...args: any[]) => any>(callback: T, delay: number): T => {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;
  return useMemo(() => debounce((...args: Parameters<T>) => callbackRef.current(...args), delay) as T, [delay]);
};

export const useInfiniteScroll = (callback: () => void, hasMore: boolean, isLoading: boolean) => {
  const observer = useRef<IntersectionObserver>();
  const lastElementRef = useCallback((node: HTMLElement | null) => {
    if (isLoading || !hasMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) callback();
    }, { threshold: 1.0 });
    if (node) observer.current.observe(node);
  }, [callback, hasMore, isLoading]);
  return lastElementRef;
}; 