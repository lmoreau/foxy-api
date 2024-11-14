# Product Handling in Quote Line Items

## Overview
This document explains the critical differences between creating and updating quote line items in the Dataverse/Dynamics integration, specifically regarding product handling. Getting this wrong will break either the NEW or EDIT functionality.

## Core Concepts

### Product References in Dataverse
- Products are separate entities in Dataverse
- Line items reference products through relationships
- These relationships must be handled differently for creation vs updates

## Create vs Update Operations

### Creating New Line Items (NEW)
When creating a new line item, we must:

1. Use OData binding syntax to establish the product relationship:
   ```typescript
   const lineItemData = {
     _foxy_product_value: selectedProduct.productid,  // Required OData binding
     // other fields...
   };
   ```

2. Include the full location binding:
   ```typescript
   const lineItemData = {
     _foxy_foxyquoterequestlocation_value: locationId,  // Required location binding
     _foxy_product_value: selectedProduct.productid,
     // other fields...
   };
   ```

3. Handle product selection properly:
   ```typescript
   // Get product ID from the products array using selected name
   const selectedProduct = products.find(p => p.name === row.foxy_Product?.name);
   if (!selectedProduct?.productid) {
     message.error('Missing required product information');
     return;
   }
   ```

### Updating Existing Line Items (EDIT)
When updating, we must:

1. Remove the product object before sending the update:
   ```typescript
   // Must remove foxy_Product to avoid deep update error
   const { foxy_Product, ...rowWithoutProduct } = row;
   
   const updatedItem = {
     id: item.foxy_foxyquoterequestlineitemid,
     ...rowWithoutProduct,
     // other fields...
   };
   ```

2. Never include product relationship data in updates:
   - Cannot modify product relationship through direct update
   - Must use separate operations if product relationship needs to change
   - Including product data will cause "Deep update" errors

## Common Errors & Solutions

### "Deep update of navigation properties not allowed"
- **Cause**: Included product data in update operation
- **Solution**: Remove foxy_Product from update payload
- **Example Fix**:
  ```typescript
  // WRONG
  const updateData = { ...row };  // Contains foxy_Product
  
  // CORRECT
  const { foxy_Product, ...updateData } = row;  // Removes foxy_Product
  ```

### "Missing required product information"
- **Cause**: Product selection/ID not properly handled in creation
- **Solution**: Ensure product ID is available before create
- **Example Fix**:
  ```typescript
  // WRONG
  const productId = row.foxy_Product?.productid;  // May not exist
  
  // CORRECT
  const selectedProduct = products.find(p => p.name === row.foxy_Product?.name);
  if (!selectedProduct?.productid) {
    message.error('Missing required product information');
    return;
  }
  ```

## Implementation Details

### Required Fields for Creation
</file>