/**
 * REFACTORING EXAMPLES - How to Apply Data Optimization to App.tsx
 * 
 * This file shows exact patterns for replacing large array renders
 * with optimized components. Copy these patterns into App.tsx.
 */

// ============================================================================
// EXAMPLE 1: SALES TABLE VIEW (BEFORE → AFTER)
// ============================================================================

// ❌ BEFORE - Renders all 1000+ sales at once
export function SalesViewBefore({ salesHistory }: { salesHistory: Sales[] }) {
  return (
    <div className="flex-1 overflow-auto">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-gray-100">
          <tr>
            <th className="px-4 py-2">ID</th>
            <th className="px-4 py-2">Customer</th>
            <th className="px-4 py-2">Date</th>
            <th className="px-4 py-2">Items</th>
            <th className="px-4 py-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {/* ❌ Problem: Renders ALL rows, even if only 20 are visible */}
          {salesHistory.map((sale) => (
            <tr key={sale.id}>
              <td className="px-4 py-2">{sale.id}</td>
              <td className="px-4 py-2">{sale.customerName}</td>
              <td className="px-4 py-2">{formatDate(sale.date)}</td>
              <td className="px-4 py-2">{sale.items?.length || 0}</td>
              <td className="px-4 py-2">{formatCurrency(sale.totalAmount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ✅ AFTER - Uses OptimizedTable with pagination
import { OptimizedTable } from '@/components/OptimizedDataComponents';
import { formatDate, formatCurrency } from '@/lib/utils';

export function SalesViewAfter({ salesHistory }: { salesHistory: Sales[] }) {
  return (
    <OptimizedTable
      data={salesHistory}
      columns={[
        {
          key: 'id',
          label: 'ID',
          render: (v) => v,
          width: '80px',
        },
        {
          key: 'customerName',
          label: 'Customer',
          render: (v) => v,
        },
        {
          key: 'date',
          label: 'Date',
          render: (v) => formatDate(v),
          width: '120px',
        },
        {
          key: 'items',
          label: 'Items',
          render: (v: any[]) => v?.length || 0,
          width: '80px',
        },
        {
          key: 'totalAmount',
          label: 'Total',
          render: (v) => formatCurrency(v),
          width: '120px',
        },
      ]}
      rowKey={(sale) => sale.id}
      pageSize={25}
      emptyMessage="No sales found"
    />
  );
}

// ============================================================================
// EXAMPLE 2: PRODUCTS GRID (BEFORE → AFTER)
// ============================================================================

// ❌ BEFORE - Renders entire product grid at once
export function EstoqueViewBefore({ allProducts }: { allProducts: Product[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* ❌ Problem: If 5000 products, renders 5000 cards immediately */}
      {allProducts.map((product) => (
        <div key={product.id} className="border rounded p-4">
          <h3>{product.name}</h3>
          <p className="text-sm text-gray-600">{product.category}</p>
          <p className="font-semibold mt-2">{formatCurrency(product.price)}</p>
          <p className="text-sm">Stock: {product.quantity}</p>
        </div>
      ))}
    </div>
  );
}

// ✅ AFTER - Uses OptimizedGrid with chunked loading
import { OptimizedGrid } from '@/components/OptimizedDataComponents';

export function EstoqueViewAfter({ allProducts }: { allProducts: Product[] }) {
  return (
    <OptimizedGrid
      data={allProducts}
      columns={3}
      gap="1rem"
      renderItem={(product) => (
        <div className="border rounded p-4 hover:shadow-md transition">
          <h3 className="font-semibold">{product.name}</h3>
          <p className="text-sm text-gray-600">{product.category}</p>
          <p className="font-semibold mt-2">{formatCurrency(product.price)}</p>
          <p className="text-sm">Stock: {product.quantity}</p>
          <button className="mt-3 w-full px-2 py-1 bg-blue-500 text-white rounded text-sm">
            Edit
          </button>
        </div>
      )}
      keyExtractor={(p) => p.id}
      emptyMessage="No products in stock"
    />
  );
}

// ============================================================================
// EXAMPLE 3: ORDERS LIST (BEFORE → AFTER)
// ============================================================================

// ❌ BEFORE - Renders all orders without virtualization
export function OrdersViewBefore({ allOrders }: { allOrders: ServiceOrder[] }) {
  return (
    <div style={{ height: '600px', overflowY: 'auto', border: '1px solid #ccc' }}>
      {/* ❌ Problem: DOM has 1000+ div nodes, sluggish scrolling */}
      {allOrders.map((order, idx) => (
        <div key={order.id} className="p-4 border-b flex justify-between">
          <div>
            <p className="font-semibold">Order #{order.id}</p>
            <p className="text-sm text-gray-600">{order.customer}</p>
          </div>
          <div className="text-right">
            <p className="font-semibold">{formatCurrency(order.totalAmount)}</p>
            <p className="text-sm text-gray-600">{order.status}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ✅ AFTER - Uses OptimizedList with virtual scrolling
import { OptimizedList } from '@/components/OptimizedDataComponents';

export function OrdersViewAfter({ allOrders }: { allOrders: ServiceOrder[] }) {
  return (
    <OptimizedList
      data={allOrders}
      itemHeight={80}
      containerHeight={600}
      renderItem={(order) => (
        <div className="p-4 border-b flex justify-between hover:bg-gray-50">
          <div>
            <p className="font-semibold">Order #{order.id}</p>
            <p className="text-sm text-gray-600">{order.customer}</p>
          </div>
          <div className="text-right">
            <p className="font-semibold">{formatCurrency(order.totalAmount)}</p>
            <p className="text-sm text-gray-600">{order.status}</p>
          </div>
        </div>
      )}
      keyExtractor={(o) => o.id}
      overscan={5}
      emptyMessage="No orders"
    />
  );
}

// ============================================================================
// EXAMPLE 4: SEARCH WITH FILTERING (BEFORE → AFTER)
// ============================================================================

// ❌ BEFORE - Filters entire array on every keystroke
export function CustomerSearchBefore() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Customer[]>([]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    // ❌ Problem: Runs .filter() on 5000 items for every keystroke
    const filtered = customers.filter(
      (c) =>
        c.name.toLowerCase().includes(term.toLowerCase()) ||
        c.email.toLowerCase().includes(term.toLowerCase())
    );
    setResults(filtered);
  };

  return (
    <>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search customers..."
      />
      <div>
        {results.map((customer) => (
          <div key={customer.id}>{customer.name}</div>
        ))}
      </div>
    </>
  );
}

// ✅ AFTER - Uses debounced search with caching
import { useMemorySafeSearch } from '@/lib/useDataOptimization';

export function CustomerSearchAfter({ customers }: { customers: Customer[] }) {
  const search = useMemorySafeSearch(
    customers,
    ['name', 'email', 'phone'],
    5 * 60 * 1000 // Cache 5 minutes
  );

  return (
    <>
      <input
        type="text"
        onChange={(e) => search.search(e.target.value)}
        placeholder="Search customers..."
        disabled={search.isSearching}
      />
      {search.isSearching && <p className="text-sm text-gray-500">Searching...</p>}
      <div className="mt-4">
        {search.results.map((customer) => (
          <div key={customer.id} className="p-2 border-b">
            <p className="font-semibold">{customer.name}</p>
            <p className="text-sm text-gray-600">{customer.email}</p>
          </div>
        ))}
      </div>
    </>
  );
}

// ============================================================================
// EXAMPLE 5: FINANCE TRANSACTIONS TABLE (BEFORE → AFTER)
// ============================================================================

// ❌ BEFORE - Renders all transactions
export function FinanceViewBefore({
  financeTransactions,
}: {
  financeTransactions: Transaction[];
}) {
  return (
    <table className="w-full">
      <thead>
        <tr>
          <th>Date</th>
          <th>Type</th>
          <th>Amount</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {/* ❌ Problem: Full list, no pagination */}
        {financeTransactions.map((tx) => (
          <tr key={tx.id}>
            <td>{formatDate(tx.date)}</td>
            <td>{tx.type}</td>
            <td>{formatCurrency(tx.amount)}</td>
            <td>{tx.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ✅ AFTER - Paginated table
export function FinanceViewAfter({
  financeTransactions,
}: {
  financeTransactions: Transaction[];
}) {
  return (
    <OptimizedTable
      data={financeTransactions}
      columns={[
        {
          key: 'date',
          label: 'Date',
          render: (v) => formatDate(v),
          width: '120px',
        },
        {
          key: 'type',
          label: 'Type',
          render: (v) => (
            <span className={v === 'IN' ? 'text-green-600' : 'text-red-600'}>
              {v}
            </span>
          ),
          width: '80px',
        },
        {
          key: 'amount',
          label: 'Amount',
          render: (v) => formatCurrency(v),
          width: '120px',
        },
        {
          key: 'status',
          label: 'Status',
          render: (v) => (
            <span
              className={
                v === 'Concluída'
                  ? 'text-green-600'
                  : v === 'Pendente'
                  ? 'text-yellow-600'
                  : 'text-red-600'
              }
            >
              {v}
            </span>
          ),
          width: '100px',
        },
      ]}
      rowKey={(tx) => tx.id}
      pageSize={20}
    />
  );
}

// ============================================================================
// EXAMPLE 6: RETURN TICKETS TABLE (BEFORE → AFTER)
// ============================================================================

// ❌ BEFORE - ExchangesAndReturnsView renders all tickets
export function ExchangesAndReturnsViewBefore({
  returnTickets,
}: {
  returnTickets: ReturnTicket[];
}) {
  return (
    <div className="mt-4">
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th>ID</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {/* ❌ Problem: No pagination, renders all at once */}
          {returnTickets.map((ticket) => (
            <tr key={ticket.id}>
              <td>{ticket.id}</td>
              <td>{ticket.type}</td>
              <td>{formatCurrency(ticket.refundAmount)}</td>
              <td>{formatDate(ticket.createdAt)}</td>
              <td>{ticket.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ✅ AFTER - Paginated returns table
export function ExchangesAndReturnsViewAfter({
  returnTickets,
}: {
  returnTickets: ReturnTicket[];
}) {
  return (
    <OptimizedTable
      data={returnTickets}
      columns={[
        {
          key: 'id',
          label: 'Ticket ID',
          render: (v) => v,
          width: '100px',
        },
        {
          key: 'type',
          label: 'Type',
          render: (v) => (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
              {v}
            </span>
          ),
          width: '100px',
        },
        {
          key: 'refundAmount',
          label: 'Refund',
          render: (v) => formatCurrency(v),
          width: '100px',
        },
        {
          key: 'createdAt',
          label: 'Date',
          render: (v) => formatDate(v),
          width: '120px',
        },
        {
          key: 'status',
          label: 'Status',
          render: (v) => (
            <span
              className={
                v === 'Concluído'
                  ? 'text-green-600'
                  : v === 'Pendente'
                  ? 'text-yellow-600'
                  : 'text-gray-600'
              }
            >
              {v}
            </span>
          ),
          width: '100px',
        },
      ]}
      rowKey={(t) => t.id}
      pageSize={15}
    />
  );
}

// ============================================================================
// EXAMPLE 7: INITIAL APP LOAD WITH PROGRESS
// ============================================================================

// ❌ BEFORE - App loads everything at once
export function AppLoadBefore() {
  const [salesHistory] = useState<Sales[]>([]);
  // ... many more useState calls

  // Everything renders immediately, UI freeze for 2-3 seconds
  return <div>App content with ALL data loaded at once</div>;
}

// ✅ AFTER - Progressive loading with UI feedback
import { useIncrementalLoad } from '@/lib/useDataOptimization';

export function AppLoadAfter({
  initialData,
}: {
  initialData: {
    salesHistory: Sales[];
    allOrders: ServiceOrder[];
    allProducts: Product[];
  };
}) {
  // Show progress while loading
  const sales = useIncrementalLoad(initialData.salesHistory, 100, 5);
  const orders = useIncrementalLoad(initialData.allOrders, 100, 5);
  const products = useIncrementalLoad(initialData.allProducts, 100, 5);

  const overallProgress =
    Math.round((sales.progress + orders.progress + products.progress) / 3);

  return (
    <div>
      {/* Show progress to user */}
      {overallProgress < 100 && (
        <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200">
          <div
            className="h-full bg-blue-500 transition-all"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      )}

      {/* Render as data becomes available */}
      {sales.displayedItems.length > 0 && (
        <SalesViewAfter salesHistory={sales.displayedItems} />
      )}
      {orders.displayedItems.length > 0 && (
        <OrdersViewAfter allOrders={orders.displayedItems} />
      )}
      {products.displayedItems.length > 0 && (
        <EstoqueViewAfter allProducts={products.displayedItems} />
      )}
    </div>
  );
}

// ============================================================================
// MIGRATION STEPS FOR APP.TSX
// ============================================================================

/*
STEP-BY-STEP MIGRATION GUIDE:

1. INSTALL DEPENDENCIES (already done)
   - dataOptimization.ts ✓
   - useDataOptimization.ts ✓
   - OptimizedDataComponents.tsx ✓

2. UPDATE IMPORTS IN APP.TSX
   Add at top of App.tsx:
   
   import {
     OptimizedTable,
     OptimizedList,
     OptimizedGrid,
     InfiniteScroll,
   } from '@/components/OptimizedDataComponents';
   import { useIncrementalLoad, useMemorySafeSearch } from '@/lib/useDataOptimization';

3. FIND RENDERING METHODS
   Search App.tsx for:
   - {salesHistory.map(...)} → Line ~?
   - {allOrders.map(...)} → Line ~?
   - {allProducts.map(...)} → Line ~?
   - {financeTransactions.map(...)} → Line ~?
   - {returnTickets.map(...)} → Line ~?

4. REPLACE LARGE RENDERS
   Priority order (impacts most):
   a) salesHistory → OptimizedTable (save: ~80% memory)
   b) allOrders → OptimizedList (save: ~85% memory)
   c) allProducts → OptimizedGrid (save: ~90% memory)
   d) financeTransactions → OptimizedTable (save: ~80% memory)
   e) returnTickets → OptimizedTable (save: ~70% memory)

5. TEST THOROUGHLY
   - Check: App loads without errors
   - Check: Tables/lists render correctly
   - Check: Pagination/scrolling works
   - Check: Search still functions
   - Check: Memory usage drops significantly
   - Stress test with 10,000+ items in each array

6. MEASURE IMPACT
   Before: Open DevTools → Performance → Record page load
   After: Do same, compare metrics:
     - Reduced DOM nodes (target: < 200)
     - Faster interaction (target: < 100ms)
     - Lower memory (target: < 100MB for UI)

7. GIT COMMIT
   git add src/App.tsx
   git commit -m "perf: apply data optimization to reduce RAM usage"

ESTIMATED TIME: 2-4 hours for full migration
*/
