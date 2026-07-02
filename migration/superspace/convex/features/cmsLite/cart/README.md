# Cart Feature Documentation

## Overview
The cart feature provides shopping cart functionality with support for multiple workspaces and product types.

## Tables

### `carts`
Stores active shopping carts per user and workspace.
```typescript
{
  userId: string;        // User who owns the cart
  workspaceId: string;  // Workspace context
  status: string;       // active, checkout, completed, abandoned
  itemCount: number;    // Total items in cart
  subtotal: number;     // Cart subtotal (before tax/shipping)
  currency: string;     // Currency for the cart (USD, EUR, etc)
  couponCode?: string;  // Optional coupon code
  discountAmount?: number; // Optional discount amount
  lastActivityAt: number; // Last activity timestamp
  createdBy?: string;   // User who created the cart
  updatedBy?: string;   // User who last updated the cart
}
```

### `cartItems`
Stores individual items in shopping carts.
```typescript
{
  cartId: Id<"carts">;  // Reference to parent cart
  productId: string;    // The product/item being added
  productType: string;  // product, service, subscription, etc.
  name: string;        // Item name
  description?: string; // Optional description
  quantity: number;    // Quantity ordered
  unitPrice: number;   // Price per unit
  currency: string;    // Currency for this item
  options?: Array<{    // Optional customization/variants
    name: string;
    value: string;
    priceModifier?: number;
  }>;
  createdBy?: string;  // User who added the item
  updatedBy?: string;  // User who last updated the item
}
```

## Public APIs

### Queries
- `getCurrentCart`: Get user's active cart in a workspace
- `getCartItems`: Get items in a specific cart
- `listAbandonedCarts`: List abandoned carts (admin only)

### Mutations
- `addItem`: Add an item to the cart
- `updateItemQuantity`: Update quantity of an item
- `clearCart`: Remove all items from a cart

## Usage Examples

### Adding an Item to Cart
```typescript
import { api } from "./_generated/api";

// Add product to cart
const { cartId, itemId } = await ctx.runMutation(api.cart.mutations.addItem, {
  workspaceId: "workspace123",
  productId: "prod123",
  productType: "product",
  name: "Sample Product",
  quantity: 1,
  unitPrice: 29.99,
  currency: "USD"
});
```

### Updating Item Quantity
```typescript
import { api } from "./_generated/api";

// Update quantity (0 to remove)
await ctx.runMutation(api.cart.mutations.updateItemQuantity, {
  itemId: "item123",
  quantity: 2
});
```

## Migration Notes
1. Cart data structure simplified from SQL to document model
2. Added workspace context for multi-tenant support
3. Built-in support for different product types
4. Added abandoned cart tracking

## Migration Status
- [x] Schema migrated
- [x] Queries ported
- [x] Mutations ported
- [x] Docs updated

## Pending Tasks
- [ ] Add support for tax calculations
- [ ] Implement checkout flow
- [ ] Add webhook support for cart events
- [ ] Implement cart recovery emails

