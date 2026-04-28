/**
 * Optimized Components for Rendering Large Datasets
 * 
 * - OptimizedTable: Paginated table with lazy loading
 * - OptimizedList: Virtual scrolling list
 * - OptimizedGrid: Chunked loading grid
 * - LazyLoadWrapper: Generic lazy load container
 */

import React, {
  ReactNode,
  useCallback,
  useMemo,
  useRef,
  useEffect,
  useState,
} from 'react';
import {
  usePaginated,
  useIncrementalLoad,
  useVirtualScroll,
  useThrottledCallback,
} from './useDataOptimization';
import { Button } from '@/components/ui/button';

// ============================================================================
// OPTIMIZED TABLE COMPONENT
// ============================================================================

interface OptimizedTableProps<T> {
  data: T[];
  columns: {
    key: string;
    label: string;
    render: (value: any, item: T) => ReactNode;
    width?: string;
  }[];
  rowKey: (item: T) => string | number;
  pageSize?: number;
  onLoadMore?: () => void;
  isLoading?: boolean;
  className?: string;
  emptyMessage?: string;
}

/**
 * Paginated table for large datasets
 * 
 * Usage:
 * <OptimizedTable
 *   data={salesHistory}
 *   columns={[
 *     { key: 'id', label: 'ID', render: (v) => v },
 *     { key: 'total', label: 'Total', render: (v) => formatCurrency(v) },
 *   ]}
 *   rowKey={(s) => s.id}
 *   pageSize={25}
 * />
 */
export const OptimizedTable = React.memo(<T extends Record<string, any>>({
  data,
  columns,
  rowKey,
  pageSize = 20,
  onLoadMore,
  isLoading = false,
  className = '',
  emptyMessage = 'No data to display',
}: OptimizedTableProps<T>) => {
  const pagination = usePaginated(data, pageSize);

  return (
    <div className={`border rounded-lg overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 border-b">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left font-medium text-gray-700"
                  style={{ width: col.width }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pagination.items.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              pagination.items.map((item) => (
                <tr
                  key={rowKey(item)}
                  className="border-b hover:bg-gray-50 transition-colors"
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3">
                      {col.render(item[col.key], item)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t">
          <div className="text-sm text-gray-600">
            Page {pagination.currentPage} of {pagination.totalPages} (
            {pagination.totalItems} items)
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={!pagination.hasPrev || isLoading}
              onClick={pagination.prevPage}
            >
              Previous
            </Button>

            {/* Page input */}
            <input
              type="number"
              min="1"
              max={pagination.totalPages}
              value={pagination.currentPage}
              onChange={(e) =>
                pagination.goToPage(parseInt(e.target.value) || 1)
              }
              className="w-16 px-2 py-1 border rounded text-center text-sm"
              disabled={isLoading}
            />

            <Button
              size="sm"
              variant="outline"
              disabled={!pagination.hasNext || isLoading}
              onClick={pagination.nextPage}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
});

OptimizedTable.displayName = 'OptimizedTable';

// ============================================================================
// OPTIMIZED LIST COMPONENT (VIRTUAL SCROLLING)
// ============================================================================

interface OptimizedListProps<T> {
  data: T[];
  itemHeight: number;
  containerHeight?: number;
  renderItem: (item: T, index: number) => ReactNode;
  keyExtractor: (item: T) => string | number;
  overscan?: number;
  className?: string;
  emptyMessage?: string;
}

/**
 * Virtual scrolling list for 1000+ items
 * Only renders visible items, dramatically reduces DOM nodes
 * 
 * Usage:
 * <OptimizedList
 *   data={allProducts}
 *   itemHeight={50}
 *   containerHeight={600}
 *   renderItem={(p) => <ProductRow {...p} />}
 *   keyExtractor={(p) => p.id}
 * />
 */
export const OptimizedList = React.memo(<T,>({
  data,
  itemHeight,
  containerHeight = 600,
  renderItem,
  keyExtractor,
  overscan = 5,
  className = '',
  emptyMessage = 'No items',
}: OptimizedListProps<T>) => {
  const {
    visibleItems,
    containerRef,
    offsetY,
    totalHeight,
    onScroll,
  } = useVirtualScroll(data, containerHeight, itemHeight, overscan);

  const startIndex = useMemo(() => {
    return Math.floor(offsetY / itemHeight);
  }, [offsetY, itemHeight]);

  return (
    <div
      className={className}
      style={{
        height: containerHeight,
        overflow: 'auto',
        border: '1px solid #e5e7eb',
        borderRadius: '0.5rem',
      }}
      ref={containerRef}
      onScroll={(e) => onScroll(e as any)}
    >
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500">
          {emptyMessage}
        </div>
      ) : (
        <div style={{ height: totalHeight, position: 'relative' }}>
          <div style={{ transform: `translateY(${offsetY}px)` }}>
            {visibleItems.map((item, idx) => (
              <div key={keyExtractor(item)} style={{ height: itemHeight }}>
                {renderItem(item, startIndex + idx)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

OptimizedList.displayName = 'OptimizedList';

// ============================================================================
// OPTIMIZED GRID COMPONENT (CHUNKED LOADING)
// ============================================================================

interface OptimizedGridProps<T> {
  data: T[];
  columns?: number;
  renderItem: (item: T) => ReactNode;
  keyExtractor: (item: T) => string | number;
  gap?: string;
  className?: string;
  emptyMessage?: string;
}

/**
 * Grid with incremental loading
 * Loads items progressively to prevent RAM overload
 * 
 * Usage:
 * <OptimizedGrid
 *   data={allProducts}
 *   columns={3}
 *   gap="1rem"
 *   renderItem={(p) => <ProductCard {...p} />}
 *   keyExtractor={(p) => p.id}
 * />
 */
export const OptimizedGrid = React.memo(<T,>({
  data,
  columns = 3,
  renderItem,
  keyExtractor,
  gap = '1rem',
  className = '',
  emptyMessage = 'No items',
}: OptimizedGridProps<T>) => {
  const { displayedItems, progress, isLoading } = useIncrementalLoad(data, 50, 2);

  return (
    <div className={className}>
      {/* Progress bar during loading */}
      {isLoading && displayedItems.length < data.length && (
        <div className="mb-4 bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-blue-500 h-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {data.length === 0 ? (
        <div className="text-center py-8 text-gray-500">{emptyMessage}</div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(auto-fill, minmax(calc((100% - ${gap} * ${columns - 1}) / ${columns}), 1fr))`,
            gap,
          }}
        >
          {displayedItems.map((item) => (
            <div key={keyExtractor(item)}>{renderItem(item)}</div>
          ))}
        </div>
      )}

      {isLoading && displayedItems.length > 0 && (
        <div className="text-center py-4 text-gray-500 text-sm">
          Loading {Math.round(progress)}%...
        </div>
      )}
    </div>
  );
});

OptimizedGrid.displayName = 'OptimizedGrid';

// ============================================================================
// LAZY LOAD WRAPPER (INTERSECTION OBSERVER)
// ============================================================================

interface LazyLoadWrapperProps {
  children: ReactNode;
  onVisible: () => void | Promise<void>;
  threshold?: number;
  className?: string;
  loadingFallback?: ReactNode;
}

/**
 * Lazy load children when they become visible
 * Useful for loading modals, detailed views, etc. on-demand
 * 
 * Usage:
 * <LazyLoadWrapper onVisible={() => fetchOrderDetails()}>
 *   <OrderDetailedView />
 * </LazyLoadWrapper>
 */
export const LazyLoadWrapper = React.memo(({
  children,
  onVisible,
  threshold = 0.1,
  className = '',
  loadingFallback = null,
}: LazyLoadWrapperProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || hasBeenVisible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasBeenVisible) {
          setIsVisible(true);
          setHasBeenVisible(true);
          onVisible();
        }
      },
      { threshold }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [hasBeenVisible, threshold, onVisible]);

  return (
    <div ref={containerRef} className={className}>
      {!hasBeenVisible ? loadingFallback : children}
    </div>
  );
});

LazyLoadWrapper.displayName = 'LazyLoadWrapper';

// ============================================================================
// INFINITE SCROLL WRAPPER
// ============================================================================

interface InfiniteScrollProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => ReactNode;
  keyExtractor: (item: T) => string | number;
  itemHeight: number;
  containerHeight?: number;
  loadMore?: () => Promise<void>;
  hasMore?: boolean;
  isLoading?: boolean;
  className?: string;
  emptyMessage?: string;
}

/**
 * Infinite scroll list with "load more" button
 * Combines pagination with lazy loading
 * 
 * Usage:
 * <InfiniteScroll
 *   data={orders}
 *   renderItem={(o) => <OrderRow {...o} />}
 *   keyExtractor={(o) => o.id}
 *   itemHeight={60}
 *   loadMore={() => fetchMoreOrders()}
 *   hasMore={hasMoreOrders}
 * />
 */
export const InfiniteScroll = React.memo(<T,>({
  data,
  renderItem,
  keyExtractor,
  itemHeight,
  containerHeight = 600,
  loadMore,
  hasMore = true,
  isLoading = false,
  className = '',
  emptyMessage = 'No items',
}: InfiniteScrollProps<T>) => {
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    if (!loadMoreRef.current || !hasMore || isLoadingMore || !loadMore) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsLoadingMore(true);
        loadMore().finally(() => setIsLoadingMore(false));
      }
    });

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, loadMore]);

  return (
    <div className={className}>
      <div
        style={{
          height: containerHeight,
          overflow: 'auto',
          border: '1px solid #e5e7eb',
        }}
      >
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            {emptyMessage}
          </div>
        ) : (
          data.map((item, idx) => (
            <div key={keyExtractor(item)} style={{ height: itemHeight }}>
              {renderItem(item, idx)}
            </div>
          ))
        )}

        {/* Load more trigger */}
        {hasMore && (
          <div
            ref={loadMoreRef}
            className="p-4 text-center text-sm text-gray-500"
          >
            {isLoadingMore ? 'Loading...' : 'Scroll to load more'}
          </div>
        )}
      </div>
    </div>
  );
});

InfiniteScroll.displayName = 'InfiniteScroll';
