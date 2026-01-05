'use client';

import Card from '@_components/ui/Card';
import Button from '@_components/ui/Button';
import Badge from '@_components/ui/Badge';
import Image from 'next/image';

interface ProductCardProps {
  id?: string;
  name?: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  sku?: string;
  inStock?: boolean;
  showPrice?: boolean;
  showStock?: boolean;
  onAddToCart?: (id: string) => void;
}

/**
 * Product Card Component
 *
 * Displays product information in a card format.
 * Uses DaisyUI semantic colors (base-content, primary, error).
 *
 * TIER: Trial (available to all tiers)
 * CATEGORY: Product
 */
export default function ProductCard({
  id = '',
  name = 'Product Name',
  description = 'Product description goes here',
  price = 0,
  imageUrl = '/placeholder-product.jpg',
  sku = '',
  inStock = true,
  showPrice = true,
  showStock = true,
  onAddToCart,
}: ProductCardProps) {
  const handleAddToCart = () => {
    if (onAddToCart && id) {
      onAddToCart(id);
    }
  };

  return (
    <Card
      variant="elevated"
      hover
      className="group"
    >
      {/* Product Image */}
      <figure className="relative aspect-square overflow-hidden bg-base-200">
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover transition-transform group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {showStock && !inStock && (
          <Badge variant="error" className="absolute right-2 top-2">
            Out of Stock
          </Badge>
        )}
      </figure>

      {/* Product Info */}
      <div className="space-y-2 p-4">
        {sku && (
          <p className="text-xs text-base-content/60">SKU: {sku}</p>
        )}
        <h3 className="line-clamp-1 font-semibold text-base-content">{name}</h3>
        <p className="line-clamp-2 text-sm text-base-content/70">
          {description}
        </p>
      </div>

      {/* Price and Action */}
      <div className="flex items-center justify-between p-4 pt-0">
        {showPrice && (
          <p className="text-lg font-bold text-primary">
            ${price.toFixed(2)}
          </p>
        )}
        <Button
          variant="primary"
          size="sm"
          onClick={handleAddToCart}
          disabled={!inStock}
          className="ml-auto"
        >
          {inStock ? 'Add to Cart' : 'Unavailable'}
        </Button>
      </div>
    </Card>
  );
}
