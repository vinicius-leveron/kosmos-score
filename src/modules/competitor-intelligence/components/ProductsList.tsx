/**
 * ProductsList - Displays discovered products for a competitor
 */

import { ExternalLink, Package, RefreshCw } from 'lucide-react';
import { Badge } from '@/design-system/primitives/badge';
import { PRODUCT_TYPE_LABELS } from '../lib/channelConfig';
import type { CompetitorProduct, ProductType } from '../lib/competitorTypes';

interface ProductsListProps {
  products: CompetitorProduct[];
}

export function ProductsList({ products }: ProductsListProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Package className="h-8 w-8 mx-auto mb-2 opacity-50" aria-hidden="true" />
        <p className="text-sm">Nenhum produto descoberto</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {products.map((product) => (
        <div
          key={product.id}
          className="flex items-center justify-between p-3 rounded-md border bg-card hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{product.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                {product.product_type && (
                  <Badge variant="outline" className="text-xs">
                    {PRODUCT_TYPE_LABELS[product.product_type as ProductType] ?? product.product_type}
                  </Badge>
                )}
                {product.is_recurring && (
                  <span className="text-xs text-muted-foreground inline-flex items-center gap-0.5">
                    <RefreshCw className="h-2.5 w-2.5" aria-hidden="true" />
                    Recorrente
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            {product.price != null && (
              <span className="text-sm font-semibold">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: product.currency,
                }).format(product.price)}
              </span>
            )}
            {product.url && (
              <a
                href={product.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground"
                aria-label={`Ver produto ${product.name}`}
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
