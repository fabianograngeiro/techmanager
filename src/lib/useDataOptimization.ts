/**
 * React Hooks for Data Optimization
 * 
 * - useIncrementalLoad: Progressive loading of large datasets
 * - usePaginated: Pagination state management
 * - useLazyImage: Lazy load images with IntersectionObserver
 * - useDebouncedValue: Debounced state value
 * - useThrottledCallback: Throttled callback execution
 * - useVirtualScroll: Virtual scrolling for long lists
 * - useMemorySafeSearch: Search with RAM optimization
 */

import { useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import {
  incrementalLoad,
  paginate,
  debounce,
  throttle,
  lazyLoad,
  virtualizeList,
  smartSearch,
  MemoryCache,
  memoryAwareFilter,
} from './dataOptimization';

/**
 * Hook for loading data progressively
 * 
 * @param data Full dataset to load
 * @param chunkSize Items per chunk (default: 50)
 * @param delayMs Delay between chunks (default: 2)
 * @returns { displayedItems, progress, isLoading, complete }
 * 
 * Usage:
 * const { displayedItems, progress } = useIncrementalLoad(allProducts, 100, 5);
 * return (
 *   <>
 *     <ProgressBar value={progress} />
 *     {displayedItems.map(p => <Product key={p.id} {...p} />)}
 *   </>
 * );
 */
export const useIncrementalLoad = <T,>(
  data: T[],
  chunkSize = 50,
  delayMs = 2
) => {
  const [displayedItems, setDisplayedItems] = useState<T[]>([]);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(data.length > 0);
  const abortRef = useRef(false);

  useEffect(() => {
    if (data.length === 0) {
      setDisplayedItems([]);
      setProgress(100);
      setIsLoading(false);
      return;
    }

    abortRef.current = false;
    setDisplayedItems([]);
    setProgress(0);
    setIsLoading(true);

    incrementalLoad(
      data,
      (chunk, prog) => {
        if (!abortRef.current) {
          setDisplayedItems((prev) => [...prev, ...chunk]);
          setProgress(prog);
        }
      },
      chunkSize,
      delayMs
    ).then(() => {
      if (!abortRef.current) {
        setIsLoading(false);
        setProgress(100);
      }
    });

    return () => {
      abortRef.current = true;
    };
  }, [data, chunkSize, delayMs]);

  return {
    displayedItems,
    progress,
    isLoading,
    complete: progress === 100,
  };
};

/**
 * Hook for paginated data management
 * 
 * @param items Full array
 * @param initialPageSize Items per page (default: 20)
 * @returns Pagination state and controls
 * 
 * Usage:
 * const pagination = usePaginated(orders, 25);
 * return (
 *   <>
 *     {pagination.items.map(o => <Order {...o} />)}
 *     <button onClick={pagination.nextPage}>Next</button>
 *     <span>{pagination.currentPage} / {pagination.totalPages}</span>
 *   </>
 * );
 */
export const usePaginated = <T,>(items: T[], initialPageSize = 20) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const paginationData = paginate(items, currentPage, pageSize);

  return {
    items: paginationData.items,
    currentPage: paginationData.currentPage,
    totalPages: paginationData.totalPages,
    totalItems: paginationData.totalItems,
    hasNext: paginationData.hasNext,
    hasPrev: paginationData.hasPrev,
    pageSize,

    nextPage: () => setCurrentPage((p) => p + 1),
    prevPage: () => setCurrentPage((p) => Math.max(1, p - 1)),
    goToPage: (page: number) => setCurrentPage(Math.max(1, page)),
    setPageSize: (size: number) => {
      setPageSize(Math.max(1, size));
      setCurrentPage(1);
    },
  };
};

/**
 * Hook for lazy loading images
 * 
 * @param src Image source
 * @param placeholder Placeholder image
 * @param options IntersectionObserver options
 * @returns { ref, actualSrc, isLoaded }
 * 
 * Usage:
 * const { ref, actualSrc } = useLazyImage(imageUrl, placeholderUrl);
 * return <img ref={ref} src={actualSrc} />;
 */
export const useLazyImage = (
  src: string,
  placeholder = '',
  options?: IntersectionObserverInit
) => {
  const [actualSrc, setActualSrc] = useState(placeholder || src);
  const [isLoaded, setIsLoaded] = useState(!placeholder);
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const unobserve = lazyLoad(
      ref.current,
      () => {
        setActualSrc(src);
        setIsLoaded(true);
      },
      options
    );

    return unobserve;
  }, [src, placeholder, options]);

  return { ref, actualSrc, isLoaded };
};

/**
 * Hook for debounced state value (e.g., search input)
 * 
 * @param value Initial value
 * @param delayMs Debounce delay
 * @returns [displayValue, debouncedValue]
 * 
 * Usage:
 * const [searchInput, debouncedSearch] = useDebouncedValue('', 300);
 * 
 * return (
 *   <>
 *     <input onChange={e => setSearchInput(e.target.value)} />
 *     {debouncedSearch && <Results search={debouncedSearch} />}
 *   </>
 * );
 */
export const useDebouncedValue = <T,>(
  value: T,
  delayMs = 300
): [T, T] => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => clearTimeout(handler);
  }, [value, delayMs]);

  return [value, debouncedValue];
};

/**
 * Hook for throttled callback execution
 * 
 * @param callback Function to throttle
 * @param limitMs Throttle limit in ms
 * @returns Throttled function
 * 
 * Usage:
 * const throttledScroll = useThrottledCallback(() => {
 *   updateVirtualList();
 * }, 100);
 * 
 * useEffect(() => {
 *   window.addEventListener('scroll', throttledScroll);
 *   return () => window.removeEventListener('scroll', throttledScroll);
 * }, [throttledScroll]);
 */
export const useThrottledCallback = <T extends (...args: any[]) => any>(
  callback: T,
  limitMs = 100
): ((...args: Parameters<T>) => void) => {
  const throttledRef = useRef(throttle(callback, limitMs));

  useEffect(() => {
    throttledRef.current = throttle(callback, limitMs);
  }, [callback, limitMs]);

  return useCallback((...args: Parameters<T>) => {
    throttledRef.current(...args);
  }, []);
};

/**
 * Hook for virtual scrolling of large lists
 * 
 * @param items Full array
 * @param containerHeight Height of visible area
 * @param itemHeight Height of each item
 * @param overscan Items to render outside viewport (default: 5)
 * @returns { visibleItems, containerRef, offsetY, totalHeight, scrollTop }
 * 
 * Usage:
 * const { visibleItems, containerRef, offsetY, totalHeight } = useVirtualScroll(
 *   products,
 *   600,
 *   50
 * );
 * 
 * return (
 *   <div ref={containerRef} onScroll={...} style={{ height: 600, overflow: 'auto' }}>
 *     <div style={{ height: totalHeight }}>
 *       <div style={{ transform: `translateY(${offsetY}px)` }}>
 *         {visibleItems.map(item => <ListItem key={item.id} {...item} />)}
 *       </div>
 *     </div>
 *   </div>
 * );
 */
export const useVirtualScroll = <T,>(
  items: T[],
  containerHeight: number,
  itemHeight: number,
  overscan = 5
) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const virtualData = virtualizeList(
    items,
    containerHeight,
    itemHeight,
    scrollTop,
    overscan
  );

  const handleScroll = useCallback(
    throttle((e: Event) => {
      const target = e.target as HTMLDivElement;
      setScrollTop(target.scrollTop);
    }, 16), // ~60fps
    []
  );

  return {
    visibleItems: virtualData.visibleItems,
    containerRef,
    offsetY: virtualData.offsetY,
    totalHeight: virtualData.totalHeight,
    scrollTop,
    onScroll: handleScroll,
  };
};

/**
 * Hook for memory-efficient search with caching
 * 
 * @param items Full array
 * @param searchFields Fields to search in
 * @param cacheMs Cache duration in ms (default: 5 min)
 * @returns { search, results, clearCache, isSearching }
 * 
 * Usage:
 * const search = useMemorySafeSearch(customers, ['name', 'email']);
 * 
 * return (
 *   <>
 *     <input onChange={e => search.search(e.target.value)} />
 *     {search.results.map(c => <Customer {...c} />)}
 *   </>
 * );
 */
export const useMemorySafeSearch = <T extends Record<string, any>>(
  items: T[],
  searchFields: (keyof T)[],
  cacheMs = 5 * 60 * 1000
) => {
  const [results, setResults] = useState<T[]>(items);
  const [isSearching, setIsSearching] = useState(false);
  const cacheRef = useRef(new MemoryCache<string, T[]>(cacheMs));

  const search = useCallback(
    debounce((term: string) => {
      setIsSearching(true);

      const cached = cacheRef.current.get(term);
      if (cached) {
        setResults(cached);
        setIsSearching(false);
        return;
      }

      memoryAwareFilter(
        items,
        (item) =>
          !term ||
          searchFields.some((field) =>
            String(item[field] || '')
              .toLowerCase()
              .includes(term.toLowerCase())
          ),
        100
      ).then((filtered) => {
        cacheRef.current.set(term, filtered);
        setResults(filtered);
        setIsSearching(false);
      });
    }, 300),
    [items, searchFields]
  );

  return {
    search,
    results,
    isSearching,
    clearCache: () => cacheRef.current.clear(),
  };
};

/**
 * Hook for loading state with timeout fallback
 * Prevents infinite loading states
 * 
 * @param isLoading Loading state
 * @param timeoutMs Timeout in ms (default: 30s)
 * @returns { isLoading, hasTimedOut, reset }
 * 
 * Usage:
 * const loading = useSafeLoading(isFetching, 30000);
 * if (loading.hasTimedOut) return <ErrorMessage />;
 */
export const useSafeLoading = (
  isLoading: boolean,
  timeoutMs = 30000
) => {
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (isLoading) {
      setHasTimedOut(false);
      timeoutRef.current = setTimeout(() => {
        setHasTimedOut(true);
      }, timeoutMs);
    } else {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setHasTimedOut(false);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isLoading, timeoutMs]);

  return {
    isLoading,
    hasTimedOut,
    reset: () => {
      setHasTimedOut(false);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
  };
};
