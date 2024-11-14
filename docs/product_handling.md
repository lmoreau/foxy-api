# Product Handling in Quote Line Items

## Overview
This document explains how product data must be handled differently when creating new quote line items versus updating existing ones in Dataverse/Dynamics CRM.

## Key Differences

### NEW (Creating Line Items)
When creating a new line item, we must:

1. Send the product ID using Dataverse's OData binding format:
```typescript
const lineItemData = {
  _foxy_product_value: selectedProduct.productid,  // This specific field name is required
  // other fields...
};
```

2. Get the correct product ID from our products array:
```typescript
const selectedProduct = products.find(p => p.name === row.foxy_Product?.name);
if (!selectedProduct?.productid) {
  message.error('Missing required product information');
  return;
}
```

### EDIT (Updating Line Items)
When updating an existing line item:

1. Must remove the product object before sending update:
```typescript
const { foxy_Product, ...rowWithoutProduct } = row;

const updatedItem = {
  id: item.foxy_foxyquoterequestlineitemid,
  ...rowWithoutProduct,
  // other fields...
};
```

2. Including product data in update will cause error:
```typescript
// This will fail with "Deep update of navigation properties not allowed"
const updatedItem = {
  id: itemId,
  ...row  // row contains foxy_Product - causes error
};
```

## Working Example
From useQuoteLineItems.ts:

```typescript
// NEW item creation
if (isNewItem) {
  const lineItemData = {
    _foxy_foxyquoterequestlocation_value: locationId,
    _foxy_product_value: selectedProduct.productid,  // Correct product binding
    // other fields...
  };
  const createdItem = await createQuoteLineItem(lineItemData);
}

// EDIT item update
else {
  const { foxy_Product, ...rowWithoutProduct } = row;  // Remove product data
  const updatedItem = {
    id: item.foxy_foxyquoterequestlineitemid,
    ...rowWithoutProduct,
    // other fields...
  };
  await updateQuoteLineItem(updatedItem);
}
```

## Common Errors

1. "Deep update of navigation properties not allowed"
   - Cause: Included product data in update
   - Fix: Remove foxy_Product before update

2. "Missing required product information"
   - Cause: Product ID not found for creation
   - Fix: Ensure product selection maps to valid product ID

## Why This Matters
- NEW requires explicit product binding via _foxy_product_value
- EDIT must exclude product data entirely
- Getting this wrong breaks either creation or updates
- These requirements come from Dataverse's entity relationship handling

## Testing
Always test both operations when modifying product handling:
1. NEW: Add line item, verify product relationship created
2. EDIT: Modify existing item, verify update succeeds without product errors