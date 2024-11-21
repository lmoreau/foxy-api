
# Table Design Standards for Foxy Ledger

## Overview

This guide outlines the styling standards and configurations for Ant Design tables in the Foxy Ledger app. These standards ensure visual consistency and optimal user experience across all pages.

## Key Principles

1. **Consistency First**: All tables should look and behave identically in terms of spacing, row heights, and interaction patterns.
2. **Use Built-in Features**: Leverage Ant Design's built-in props before adding custom CSS.
3. **Shared Styling**: Use shared CSS files for common styles rather than component-specific CSS.
4. **Performance**: Enable virtual scrolling for large datasets and ensure proper column width handling.

## Implementation Guide

### 1. Basic Setup

```tsx
import { Table } from 'antd';
import './table.css';  // Shared table styles

return (
  <div style={{ padding: '20px' }}>
    <h2>Page Title</h2>
    <div style={{ color: '#666', fontSize: '14px', marginTop: '-8px', marginBottom: '16px' }}>
      Displaying {data.length} {data.length === 1 ? 'item' : 'items'}
    </div>
    <div className="rounded-table">
      <Table {...props} />
    </div>
  </div>
);
```

### 2. Essential Table Props

```tsx
<Table
  columns={columns}
  dataSource={data}
  loading={loading}
  rowKey="uniqueId"
  scroll={{ x: true }}
  size="small"  // Mandatory: Ensures row height consistency
  pagination={{
    pageSize: 50,
    showSizeChanger: true,
    showTotal: (total) => `Total ${total} items`,
  }}
  locale={{
    emptyText: <Empty description="No records found" />
  }}
/>
```

### 3. Column Configuration

```tsx
const columns = [
  {
    title: 'Column Name',
    dataIndex: 'fieldName',
    key: 'fieldName',
    ellipsis: true,  // Prevents text wrapping
    sorter: (a, b) => (a.fieldName || '').localeCompare(b.fieldName || ''),
    width: '15%',  // Use percentages for responsive layouts
  }
];
```

### 4. Common Formatters

```tsx
// Currency formatter
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);
};

// Date formatter
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Percentage formatter
const formatPercentage = (value: number) => {
  return `${(value * 100).toFixed(1)}%`;
};
```

## Common Pitfalls to Avoid

1. **Don't Create Component-Specific CSS Files**
   - Use shared `table.css` for table styles.
   - Use inline styles for minor component-specific adjustments.

2. **Don't Skip Essential Props**
   - **Mandatory**: Always set `size="small"` for all tables.
   - Always set `ellipsis: true` for text columns.
   - Always include proper pagination configuration.

3. **Don't Reinvent Patterns**
   - Check existing components like `ResidualCheck.tsx` for established patterns.
   - Reuse existing formatters and utilities.

## Performance Considerations

1. **Virtual Scrolling**
   - Enable `scroll={{ x: true }}` for horizontal scrolling.
   - Consider adding `scroll={{ y: 500 }}` for vertical virtualization with large datasets.

2. **Sorting and Filtering**
   - Implement server-side sorting/filtering for large datasets.
   - Use memoization for complex client-side operations.

## Accessibility

1. **Text Contrast**
   - Use standard text colors (e.g., `#666` for subheaders).
   - Maintain sufficient contrast ratios for readability.

2. **Interactive Elements**
   - Ensure proper focus states.
   - Maintain adequate clickable area sizes for accessibility.

## Example Components

Reference these components for implementation examples:
- `ResidualCheck.tsx`: Complex filtering and sorting
- `IncomingWirelinePayments.tsx`: Basic table with formatting

## Testing Checklist

Before deploying a new table component:

1. **Visual Consistency**
   - [ ] Matches padding and spacing of existing tables.
   - [ ] Uses correct header styles.
   - [ ] Has consistent row heights.

2. **Functionality**
   - [ ] Sorting works correctly.
   - [ ] Pagination shows correct totals.
   - [ ] Empty states display properly.

3. **Performance**
   - [ ] Large datasets scroll smoothly.
   - [ ] No layout shifts during loading.

## Future Considerations

1. Consider extracting common table configurations into a shared hook or higher-order component.
2. Evaluate implementing a table wrapper component for consistent styling.
3. Consider adding global formatter utilities to reduce code duplication.

Remember: The goal is consistency and maintainability. When in doubt, check existing implementations and follow established patterns.
