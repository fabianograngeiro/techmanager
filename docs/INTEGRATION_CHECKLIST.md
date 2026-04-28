/**
 * INTEGRATION CHECKLIST - Apply Data Optimization to App.tsx Components
 * 
 * Use this checklist to systematically update each component.
 * Copy the patterns here directly into your code.
 */

// ============================================================================
// COMPONENT 1: ExchangesAndReturnsView (Returns Module)
// ============================================================================

/*
LOCATION: App.tsx around line 9559+
CURRENT ISSUE: Renders all returnTickets without pagination
IMPACT: Medium (affects return operations view)
TIME: 15 minutes
*/

// STEP 1: Add import at top of App.tsx
// import { OptimizedTable } from '@/components/OptimizedDataComponents';

// STEP 2: Find ExchangesAndReturnsView component (search for "ExchangesAndReturnsView")

// STEP 3: Replace the returnTickets table rendering

// BEFORE ❌
/*
{/* Return tickets table */}
<div className="mt-6 rounded-lg border">
  <table className="w-full text-xs">
    <thead className="bg-gray-100">
      <tr>
        <th className="px-3 py-2 text-left font-semibold">ID</th>
        <th className="px-3 py-2 text-left font-semibold">Type</th>
        <th className="px-3 py-2 text-left font-semibold">Amount</th>
        <th className="px-3 py-2 text-left font-semibold">Status</th>
      </tr>
    </thead>
    <tbody>
      {filteredReturnTickets.map((ticket) => (
        <tr key={ticket.id} className="border-b hover:bg-gray-50">
          <td className="px-3 py-2">{ticket.id}</td>
          <td className="px-3 py-2">
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              ticket.type === 'Devolução' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
            }`}>
              {ticket.type}
            </span>
          </td>
          <td className="px-3 py-2">{formatCurrency(ticket.refundAmount)}</td>
          <td className="px-3 py-2">{ticket.fiscalEntryNoteStatus || 'Pendente'}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
*/

// AFTER ✅
/*
<OptimizedTable
  data={filteredReturnTickets}
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
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          v === 'Devolução' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
        }`}>
          {v}
        </span>
      ),
      width: '120px',
    },
    {
      key: 'refundAmount',
      label: 'Amount',
      render: (v) => formatCurrency(v),
      width: '120px',
    },
    {
      key: 'fiscalEntryNoteStatus',
      label: 'Status',
      render: (v) => v || 'Pendente',
      width: '100px',
    },
  ]}
  rowKey={(ticket) => ticket.id}
  pageSize={15}
  emptyMessage="No return tickets found"
/>
*/

// ============================================================================
// COMPONENT 2: Finance/Transactions View
// ============================================================================

/*
LOCATION: App.tsx (search for "Finance" or transaction rendering)
CURRENT ISSUE: Renders all financeTransactions without pagination
IMPACT: High (large dataset, heavily used)
TIME: 20 minutes
*/

// BEFORE ❌
/*
<table className="w-full text-sm">
  <thead className="sticky top-0 bg-gray-100">
    <tr>
      <th className="px-4 py-2 text-left">Date</th>
      <th className="px-4 py-2 text-left">Description</th>
      <th className="px-4 py-2 text-right">Type</th>
      <th className="px-4 py-2 text-right">Amount</th>
      <th className="px-4 py-2">Status</th>
    </tr>
  </thead>
  <tbody>
    {financeTransactions.map((tx) => (
      <tr key={tx.id} className="border-b hover:bg-gray-50">
        <td className="px-4 py-2">{formatDate(tx.date)}</td>
        <td className="px-4 py-2">{tx.description}</td>
        <td className="px-4 py-2 text-right">
          <span className={tx.type === 'IN' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
            {tx.type}
          </span>
        </td>
        <td className="px-4 py-2 text-right">{formatCurrency(tx.amount)}</td>
        <td className="px-4 py-2 text-center">{tx.status}</td>
      </tr>
    ))}
  </tbody>
</table>
*/

// AFTER ✅
/*
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
      key: 'description',
      label: 'Description',
      render: (v) => v,
    },
    {
      key: 'type',
      label: 'Type',
      render: (v) => (
        <span className={v === 'IN' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
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
      render: (v) => v,
      width: '100px',
    },
  ]}
  rowKey={(tx) => tx.id}
  pageSize={25}
  emptyMessage="No transactions found"
/>
*/

// ============================================================================
// COMPONENT 3: Sales History View
// ============================================================================

/*
LOCATION: App.tsx (search for "salesHistory" or "Sales" view)
CURRENT ISSUE: Renders entire salesHistory array
IMPACT: Critical (largest dataset)
TIME: 25 minutes
*/

// BEFORE ❌
/*
<div className="space-y-2 max-h-96 overflow-y-auto">
  {salesHistory.map((sale) => (
    <div key={sale.id} className="p-3 border rounded hover:bg-blue-50 cursor-pointer" onClick={() => setSelectedSale(sale)}>
      <div className="flex justify-between items-start">
        <div>
          <p className="font-semibold">Sale #{sale.id}</p>
          <p className="text-sm text-gray-600">{sale.customerName} - {formatDate(sale.date)}</p>
          <p className="text-sm text-gray-500">{sale.items?.length || 0} items</p>
        </div>
        <p className="font-semibold">{formatCurrency(sale.totalAmount)}</p>
      </div>
    </div>
  ))}
</div>
*/

// AFTER ✅
/*
<OptimizedTable
  data={salesHistory}
  columns={[
    {
      key: 'id',
      label: 'Sale ID',
      render: (v) => `#${v}`,
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
      width: '70px',
    },
    {
      key: 'totalAmount',
      label: 'Total',
      render: (v) => formatCurrency(v),
      width: '110px',
    },
  ]}
  rowKey={(sale) => sale.id}
  pageSize={25}
  onRowClick={(sale) => setSelectedSale(sale)}
  emptyMessage="No sales found"
/>
*/

// ============================================================================
// COMPONENT 4: Service Orders (OS) List
// ============================================================================

/*
LOCATION: App.tsx (search for "allOrders" or "ServiceOrder" view)
CURRENT ISSUE: Renders all Service Orders without pagination
IMPACT: Critical (large array, complex rendering)
TIME: 30 minutes
*/

// BEFORE ❌
/*
<div className="space-y-2 max-h-96 overflow-y-auto">
  {allOrders.map((order) => (
    <div key={order.id} className="p-3 border rounded hover:bg-gray-100 cursor-pointer"
         onClick={() => handleSelectOrder(order)}>
      <div className="flex justify-between">
        <div>
          <p className="font-semibold">OS #{order.id}</p>
          <p className="text-sm text-gray-600">{order.customer}</p>
        </div>
        <div className="text-right">
          <p className={`text-sm font-semibold ${order.status === 'Concluída' ? 'text-green-600' : 'text-yellow-600'}`}>
            {order.status}
          </p>
          <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
        </div>
      </div>
    </div>
  ))}
</div>
*/

// AFTER ✅ - Using OptimizedList for better performance with 1000+ orders
/*
import { OptimizedList } from '@/components/OptimizedDataComponents';

<OptimizedList
  data={allOrders}
  itemHeight={80}
  containerHeight={400}
  renderItem={(order) => (
    <div
      className="p-3 border-b hover:bg-gray-50 cursor-pointer transition"
      onClick={() => handleSelectOrder(order)}
    >
      <div className="flex justify-between">
        <div>
          <p className="font-semibold">OS #{order.id}</p>
          <p className="text-sm text-gray-600">{order.customer}</p>
        </div>
        <div className="text-right">
          <p className={`text-sm font-semibold ${order.status === 'Concluída' ? 'text-green-600' : 'text-yellow-600'}`}>
            {order.status}
          </p>
          <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
        </div>
      </div>
    </div>
  )}
  keyExtractor={(o) => o.id}
  overscan={3}
  emptyMessage="No orders found"
/>
*/

// ============================================================================
// COMPONENT 5: Products Estoque (Inventory) View
// ============================================================================

/*
LOCATION: App.tsx → EstoqueView (search for "allProducts")
CURRENT ISSUE: Renders entire product catalog without chunking
IMPACT: Critical (10000+ items possible)
TIME: 30 minutes
*/

// BEFORE ❌
/*
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {allProducts
    .filter(p => !filter || p.category === filter)
    .map((product) => (
      <div key={product.id} className="border rounded p-4 hover:shadow-md transition">
        <h3 className="font-semibold">{product.name}</h3>
        <p className="text-sm text-gray-600">{product.category}</p>
        <div className="mt-2 flex justify-between">
          <span className="font-semibold">{formatCurrency(product.price)}</span>
          <span className={product.quantity > 0 ? 'text-green-600' : 'text-red-600'}>
            {product.quantity} un.
          </span>
        </div>
        <button className="mt-3 w-full px-2 py-1 bg-blue-500 text-white rounded text-sm">
          Edit
        </button>
      </div>
    ))}
</div>
*/

// AFTER ✅ - Using OptimizedGrid with chunked loading
/*
import { OptimizedGrid } from '@/components/OptimizedDataComponents';
import { useMemorySafeSearch } from '@/lib/useDataOptimization';

// In component state:
const search = useMemorySafeSearch(allProducts, ['name', 'category']);

// In JSX:
<div className="space-y-4">
  <input
    type="text"
    onChange={(e) => search.search(e.target.value)}
    placeholder="Search products..."
    className="w-full px-3 py-2 border rounded"
  />

  <OptimizedGrid
    data={search.results}
    columns={3}
    gap="1rem"
    renderItem={(product) => (
      <div className="border rounded p-4 hover:shadow-md transition">
        <h3 className="font-semibold">{product.name}</h3>
        <p className="text-sm text-gray-600">{product.category}</p>
        <div className="mt-2 flex justify-between">
          <span className="font-semibold">{formatCurrency(product.price)}</span>
          <span className={product.quantity > 0 ? 'text-green-600' : 'text-red-600'}>
            {product.quantity} un.
          </span>
        </div>
        <button 
          onClick={() => handleEditProduct(product)}
          className="mt-3 w-full px-2 py-1 bg-blue-500 text-white rounded text-sm"
        >
          Edit
        </button>
      </div>
    )}
    keyExtractor={(p) => p.id}
    emptyMessage="No products found"
  />
</div>
*/

// ============================================================================
// COMPONENT 6: Search/Filter Implementation
// ============================================================================

/*
LOCATION: Anywhere search is implemented (search boxes, filters)
CURRENT ISSUE: Direct .filter() on every keystroke
IMPACT: High (affects all data views)
TIME: 15 minutes
*/

// BEFORE ❌
/*
const [searchTerm, setSearchTerm] = useState('');

const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
  const term = e.target.value;
  setSearchTerm(term);
  // ❌ Problem: .filter() runs immediately on every keystroke
  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(term.toLowerCase()) ||
    c.email.toLowerCase().includes(term.toLowerCase())
  );
  setResults(filtered);
};

return (
  <>
    <input onChange={handleSearch} placeholder="Search..." />
    {results.map(r => <CustomerRow {...r} />)}
  </>
);
*/

// AFTER ✅
/*
import { useMemorySafeSearch } from '@/lib/useDataOptimization';

const search = useMemorySafeSearch(customers, ['name', 'email', 'phone']);

return (
  <>
    <input 
      onChange={(e) => search.search(e.target.value)}
      placeholder="Search..."
      disabled={search.isSearching}
    />
    {search.isSearching && <p className="text-sm text-gray-500">Searching...</p>}
    {search.results.map(r => <CustomerRow {...r} />)}
  </>
);
*/

// ============================================================================
// STEP-BY-STEP MIGRATION TEMPLATE
// ============================================================================

/*
MIGRATION TEMPLATE FOR ANY LARGE RENDER:

1. IDENTIFY THE COMPONENT
   - Find where large .map() is happening
   - Count approximate items (if > 100, needs optimization)
   - Determine if it's a table, list, or grid

2. CHOOSE OPTIMIZATION TYPE
   - Table with many rows? → OptimizedTable
   - Long scrollable list? → OptimizedList
   - Grid/gallery? → OptimizedGrid
   - With search? → useMemorySafeSearch

3. COPY RELEVANT IMPORTS
   import { OptimizedTable, OptimizedList, OptimizedGrid } from '@/components/OptimizedDataComponents';
   import { useMemorySafeSearch } from '@/lib/useDataOptimization';

4. FIND THE RENDERING CODE
   - Search for component name or .map() call
   - Copy full render block (including all classes, styles)

5. REPLACE WITH OPTIMIZED VERSION
   - Use pattern from this file
   - Adapt columns/renderItem to match your data
   - Keep existing CSS classes where possible

6. TEST
   npm run dev
   - Check UI renders correctly
   - Scroll/paginate works
   - Search/filter works (if applicable)
   - No console errors

7. COMMIT
   git add src/App.tsx
   git commit -m "perf: optimize [component name] rendering"

8. VERIFY MEMORY
   DevTools → Memory → Compare before/after
   Target: 50-60% memory reduction
*/

// ============================================================================
// COMMON ADAPTATION PATTERNS
// ============================================================================

/*
PATTERN 1: Table with Status Badge
render: (v) => (
  <span className={`px-2 py-1 rounded text-xs font-medium ${
    v === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
  }`}>
    {v}
  </span>
)

PATTERN 2: Formatted Currency
render: (v) => formatCurrency(v)

PATTERN 3: Formatted Date
render: (v) => formatDate(v)

PATTERN 4: Multiple Fields Display
render: (v, item) => (
  <>
    <p className="font-semibold">{item.name}</p>
    <p className="text-sm text-gray-600">{item.category}</p>
  </>
)

PATTERN 5: Action Buttons
render: (v, item) => (
  <button onClick={() => handleEdit(item)} className="px-2 py-1 bg-blue-500 text-white rounded">
    Edit
  </button>
)

PATTERN 6: Conditional Rendering
render: (v) => v > 0 ? <span className="text-green-600">{v}</span> : <span className="text-red-600">{v}</span>
*/

// ============================================================================
// GIT WORKFLOW FOR MIGRATION
// ============================================================================

/*
Step 1: Create feature branch
git checkout -b optimize/data-rendering

Step 2: Apply optimizations to one component at a time
- Edit App.tsx
- Test thoroughly
- Commit with descriptive message

git add src/App.tsx
git commit -m "perf: optimize salesHistory table rendering with pagination"

Step 3: After all components are done
git log --oneline
# Should see multiple optimize/* commits

Step 4: Merge to main
git checkout main
git merge optimize/data-rendering
git push origin main

Step 5: Tag release
git tag -a v1.1.0 -m "Data optimization improvements"
git push origin v1.1.0
*/

// ============================================================================
// VALIDATION CHECKLIST
// ============================================================================

/*
BEFORE COMMITTING EACH CHANGE:

For OptimizedTable:
☐ Columns array correctly maps to data fields
☐ rowKey function is unique for each row
☐ pageSize is reasonable (15-50)
☐ Column width values sum to ~100% or are reasonable
☐ Empty message is relevant

For OptimizedList:
☐ itemHeight matches actual rendered height
☐ containerHeight is set appropriately
☐ renderItem function handles all data fields
☐ keyExtractor returns unique value
☐ Overscan is 3-5

For OptimizedGrid:
☐ columns value matches design (usually 2-4)
☐ gap is consistent with other UI
☐ renderItem renders complete item
☐ keyExtractor is unique
☐ Responsive layout works on mobile

General:
☐ No console errors
☐ No TypeScript errors
☐ Component renders all data correctly
☐ Pagination/scrolling/search works
☐ Tested with large dataset (1000+ items)
☐ Memory usage is 50-60% less than before
☐ No visual regression
*/

export {}; // Make this a module
