/**
 * Data Optimization & Memory Management Utilities
 * 
 * This module provides efficient data loading strategies:
 * - Chunked loading to prevent RAM overload
 * - Pagination for large datasets
 * - Lazy loading for components
 * - Request debounce/throttle
 * - Virtual scrolling helpers
 */

/**
 * Splits large array into smaller chunks for progressive loading
 * @param array Full dataset
 * @param chunkSize Size of each chunk (default: 50)
 * @returns Array of chunks
 * 
 * Usage: const chunks = chunkArray(allOrders, 50); // Load 50 at a time
 */
export const chunkArray = <T,>(array: T[], chunkSize = 50): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
};

/**
 * Loads data progressively, yielding control to browser between chunks
 * Prevents "script running too long" warnings and RAM bloat
 * 
 * @param array Full dataset
 * @param callback Function called with each chunk and progress
 * @param chunkSize Size of each chunk (default: 50)
 * @param delayMs Delay between chunks in ms (default: 0, use 1-5 for UI responsiveness)
 * 
 * Usage:
 * await incrementalLoad(allProducts, (chunk, progress) => {
 *   console.log(`Loaded ${progress}%`);
 *   addToUI(chunk);
 * }, 100, 2);
 */
export const incrementalLoad = async <T,>(
  array: T[],
  callback: (chunk: T[], progress: number) => void,
  chunkSize = 50,
  delayMs = 0
): Promise<void> => {
  const chunks = chunkArray(array, chunkSize);
  const total = chunks.length;

  for (let i = 0; i < total; i++) {
    const chunk = chunks[i];
    const progress = Math.round(((i + 1) / total) * 100);

    callback(chunk, progress);

    // Yield to browser if delay specified
    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
};

/**
 * Pagination helper for managing large lists
 * 
 * @param items Full array
 * @param page Current page (1-based)
 * @param pageSize Items per page
 * @returns { items: paginated items, totalPages, hasNext, hasPrev }
 */
export const paginate = <T,>(
  items: T[],
  page: number,
  pageSize: number
) => {
  const totalPages = Math.ceil(items.length / pageSize);
  const safePage = Math.max(1, Math.min(page, totalPages || 1));
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  return {
    items: items.slice(startIndex, endIndex),
    totalPages,
    currentPage: safePage,
    hasNext: safePage < totalPages,
    hasPrev: safePage > 1,
    totalItems: items.length,
  };
};

/**
 * Debounce function to reduce repeated calls (e.g., search, filter)
 * 
 * @param func Function to debounce
 * @param waitMs Wait time in milliseconds
 * @returns Debounced function
 * 
 * Usage:
 * const debouncedSearch = debounce((term: string) => {
 *   searchProducts(term);
 * }, 300);
 * 
 * // Call many times, only executes after 300ms of inactivity
 * input.addEventListener('input', e => debouncedSearch(e.target.value));
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  waitMs: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = null;
    }, waitMs);
  };
};

/**
 * Throttle function to limit execution frequency (e.g., scroll, resize)
 * 
 * @param func Function to throttle
 * @param limitMs Maximum execution frequency in milliseconds
 * @returns Throttled function
 * 
 * Usage:
 * const throttledScroll = throttle(() => {
 *   updateVirtualList();
 * }, 100);
 * 
 * window.addEventListener('scroll', throttledScroll);
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limitMs: number
): ((...args: Parameters<T>) => void) => {
  let lastRun = 0;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastRun >= limitMs) {
      func(...args);
      lastRun = now;
    }
  };
};

/**
 * Intersection Observer helper for lazy loading elements
 * Call when element enters viewport
 * 
 * @param element DOM element to observe
 * @param callback Called when element becomes visible
 * @param options IntersectionObserver options (default: { threshold: 0.1 })
 * @returns Unobserve function
 * 
 * Usage:
 * useEffect(() => {
 *   const unobserve = lazyLoad(imageRef.current, () => {
 *     imageRef.current.src = imagePath;
 *   });
 *   return unobserve;
 * }, []);
 */
export const lazyLoad = (
  element: Element | null,
  callback: () => void,
  options?: IntersectionObserverInit
): (() => void) => {
  if (!element || typeof IntersectionObserver === 'undefined') {
    callback();
    return () => {};
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          callback();
          observer.unobserve(element);
        }
      });
    },
    { threshold: 0.1, ...options }
  );

  observer.observe(element);

  return () => observer.disconnect();
};

/**
 * Virtual scrolling calculator: determines which items should be rendered
 * Dramatically reduces DOM nodes for long lists (1000+ items)
 * 
 * @param items Full array of items
 * @param containerHeight Height of visible container in pixels
 * @param itemHeight Height of each item in pixels
 * @param scrollTop Current scroll position
 * @param overscan Number of items to render outside viewport (default: 5)
 * @returns { visibleItems, startIndex, endIndex, offsetY }
 * 
 * Usage:
 * const { visibleItems, offsetY } = virtualizeList(
 *   allProducts,
 *   400,
 *   40,
 *   scrollTop,
 *   10
 * );
 */
export const virtualizeList = <T,>(
  items: T[],
  containerHeight: number,
  itemHeight: number,
  scrollTop: number,
  overscan = 5
) => {
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = items.slice(startIndex, endIndex);
  const offsetY = startIndex * itemHeight;

  return {
    visibleItems,
    startIndex,
    endIndex,
    offsetY,
    totalHeight: items.length * itemHeight,
  };
};

/**
 * Filter and search with debounce to prevent performance lag
 * 
 * @param items Full array
 * @param searchTerm Search term
 * @param searchFields Fields to search in (e.g., ['name', 'email'])
 * @returns Filtered results
 * 
 * Usage:
 * const results = smartSearch(customers, 'john', ['name', 'email', 'phone']);
 */
export const smartSearch = <T extends Record<string, any>>(
  items: T[],
  searchTerm: string,
  searchFields: (keyof T)[]
): T[] => {
  if (!searchTerm.trim()) return items;

  const normalized = searchTerm.toLowerCase().trim();
  return items.filter((item) =>
    searchFields.some(
      (field) =>
        String(item[field] || '')
          .toLowerCase()
          .includes(normalized)
    )
  );
};

/**
 * Batch processing: executes work in small batches with breaks
 * Prevents blocking the main thread
 * 
 * @param items Items to process
 * @param processor Function that processes each item
 * @param batchSize Items per batch (default: 50)
 * @param delayMs Delay between batches in ms (default: 1)
 * @returns Promise that resolves when all batches complete
 * 
 * Usage:
 * await batchProcess(orders, (order) => {
 *   order.processed = true;
 * }, 100, 2);
 */
export const batchProcess = async <T,>(
  items: T[],
  processor: (item: T, index: number) => void,
  batchSize = 50,
  delayMs = 1
): Promise<void> => {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    batch.forEach((item, idx) => {
      processor(item, i + idx);
    });

    if (delayMs > 0 && i + batchSize < items.length) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
};

/**
 * Memory-aware data filter: processes large arrays in chunks
 * 
 * @param items Full array
 * @param predicate Filter function
 * @param chunkSize Items per chunk (default: 100)
 * @returns Filtered array
 * 
 * Usage:
 * const activeOrders = await memoryAwareFilter(
 *   allOrders,
 *   (o) => o.status !== 'Cancelada',
 *   200
 * );
 */
export const memoryAwareFilter = async <T,>(
  items: T[],
  predicate: (item: T) => boolean,
  chunkSize = 100
): Promise<T[]> => {
  const result: T[] = [];

  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    const filtered = chunk.filter(predicate);
    result.push(...filtered);

    // Yield to browser
    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  return result;
};

/**
 * Creates a memory cache with TTL (time to live)
 * Useful for caching API responses, search results, etc.
 * 
 * Usage:
 * const cache = new MemoryCache<string, any>(5 * 60 * 1000); // 5 min TTL
 * cache.set('products-search-phone', results);
 * const cached = cache.get('products-search-phone'); // or null if expired
 */
export class MemoryCache<K, V> {
  private cache = new Map<K, { value: V; expiresAt: number }>();

  constructor(private ttlMs: number = 5 * 60 * 1000) {} // Default 5 min

  set(key: K, value: V): void {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + this.ttlMs,
    });
  }

  get(key: K): V | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  has(key: K): boolean {
    return this.get(key) !== null;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  // Auto-cleanup expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

/**
 * Worker pool for parallel data processing
 * Useful for heavy computations (sorting large lists, aggregations, etc.)
 */
export class DataProcessorPool {
  private taskQueue: Array<() => Promise<void>> = [];
  private isProcessing = false;

  async addTask<T>(task: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.taskQueue.push(async () => {
        try {
          const result = await task();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      this.process();
    });
  }

  private async process(): Promise<void> {
    if (this.isProcessing || this.taskQueue.length === 0) return;

    this.isProcessing = true;

    while (this.taskQueue.length > 0) {
      const task = this.taskQueue.shift();
      if (task) {
        await task();
        // Yield to browser between tasks
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }

    this.isProcessing = false;
  }

  getQueueSize(): number {
    return this.taskQueue.length;
  }
}
