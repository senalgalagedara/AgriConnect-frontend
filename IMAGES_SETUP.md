# Product Images Setup Guide

## Current Status ✅

All product images are properly set up and available in the `public/images/products/` directory.

## Image Files Available

The following image files exist in `/public/images/products/`:

1. ✅ apple.jfif
2. ✅ banana.jfif
3. ✅ beans.jfif
4. ✅ cabbage.jfif
5. ✅ carrot.jfif
6. ✅ eggplant.jfif
7. ✅ guava.jfif
8. ✅ lime.jfif
9. ✅ mango.jfif
10. ✅ onion.jfif
11. ✅ orange.jfif
12. ✅ papaya.jfif
13. ✅ pineapple.jfif
14. ✅ potato.jfif
15. ✅ pumpkin.jfif
16. ✅ spinach.jfif
17. ✅ tomato.jfif
18. ✅ watermelon.jfif

## Database Update Required

Run the SQL script to update all product image paths in the database:

```bash
# Execute the SQL file in your PostgreSQL database
psql -U your_username -d your_database -f sql/update_product_images.sql
```

Or copy the SQL commands from `sql/update_product_images.sql` and run them in your database client.

## Product to Image Mapping

| Product ID | Product Name | Image Path |
|------------|--------------|------------|
| 1 | Eggplant | `/images/products/eggplant.jfif` |
| 2 | Tomato | `/images/products/tomato.jfif` |
| 3 | Carrot | `/images/products/carrot.jfif` |
| 4 | Cabbage | `/images/products/cabbage.jfif` |
| 5 | Mango | `/images/products/mango.jfif` |
| 6 | Banana | `/images/products/banana.jfif` |
| 7 | Papaya | `/images/products/papaya.jfif` |
| 8 | Pumpkin | `/images/products/pumpkin.jfif` |
| 9 | Onion | `/images/products/onion.jfif` |
| 10 | Potato | `/images/products/potato.jfif` |
| 11 | Beans | `/images/products/beans.jfif` |
| 12 | Apple | `/images/products/apple.jfif` |
| 13 | Orange | `/images/products/orange.jfif` |
| 14 | Guava | `/images/products/guava.jfif` |
| 15 | Lime | `/images/products/lime.jfif` |
| 16 | Pineapple | `/images/products/pineapple.jfif` |
| 17 | Watermelon | `/images/products/watermelon.jfif` |
| 18 | Spinach | `/images/products/spinach.jfif` |
| 27 | Papaya | `/images/products/papaya.jfif` |

## How Images Are Loaded in Frontend

### Priority Order:
1. **`image_path`** - Primary field from database (e.g., `/images/products/tomato.jfif`)
2. **`image_url`** - Legacy field for backward compatibility
3. **Fallback** - Constructed from product name slug (e.g., `/images/products/tomato.jfif`)

### Implementation:

**Home Page (`src/app/home/page.tsx`):**
```typescript
const getProductImage = (product: Product): string | undefined => {
  return product.image_path || product.image_url;
};
```

**Product Detail Page (`src/app/product/[id]/page.tsx`):**
```typescript
function getBestImage(p: ProductDetail): string {
  // Priority: image_path > image_url > fallback by name
  if (p.image_path && p.image_path.trim() !== '') return p.image_path;
  if (p.image_url && p.image_url.trim() !== '') return p.image_url;
  
  const slug = slugify(p.product_name || '');
  return `/images/products/${slug}.jfif`;
}
```

## Adding New Product Images

To add images for new products:

1. **Add the image file:**
   - Place the image in `/public/images/products/`
   - Name it using lowercase product name (e.g., `tomato.jfif`)
   - Supported formats: `.jfif`, `.jpg`, `.jpeg`, `.png`, `.webp`

2. **Update the database:**
   ```sql
   UPDATE products 
   SET image_path = '/images/products/productname.jfif' 
   WHERE product_id = X;
   ```

3. **Verify the image loads:**
   - Navigate to `http://localhost:3000/images/products/productname.jfif`
   - Check the product page to see if the image displays correctly

## Next.js Image Optimization

If you want to use Next.js Image component for optimization:

```tsx
import Image from 'next/image';

<Image
  src={imagePath}
  alt={productName}
  width={400}
  height={400}
  priority={false}
/>
```

Note: You may need to configure `next.config.ts` to allow image domains if loading from external sources.

## Troubleshooting

### Image not showing:
1. Check if file exists in `/public/images/products/`
2. Verify the `image_path` in database matches the actual filename
3. Check browser console for 404 errors
4. Ensure filename is lowercase and matches exactly

### Wrong image displaying:
1. Clear browser cache
2. Restart Next.js dev server
3. Verify database has correct `image_path` value

### Performance issues:
1. Consider converting images to WebP format for better compression
2. Use Next.js Image component for automatic optimization
3. Implement lazy loading for images below the fold
