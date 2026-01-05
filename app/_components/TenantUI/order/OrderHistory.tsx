'use client';

import Card from '@_components/ui/Card';
import Badge, { type BadgeProps } from '@_components/ui/Badge';

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  tracking?: string;
}

interface OrderHistoryProps {
  orders?: Order[];
  showStatus?: boolean;
  showTracking?: boolean;
}

/**
 * Order History Component
 *
 * Displays user's order history in a table format.
 * Includes order status and tracking information.
 * Uses DaisyUI semantic colors and existing UI components.
 *
 * TIER: Standard
 * CATEGORY: Order
 */
export default function OrderHistory({
  orders = [],
  showStatus = true,
  showTracking = true,
}: OrderHistoryProps) {
  // Map order status to Badge variant/tone for DaisyUI semantic colors
  const getStatusBadgeProps = (status: Order['status']): Pick<BadgeProps, 'variant' | 'tone'> => {
    const statusMap: Record<Order['status'], Pick<BadgeProps, 'variant' | 'tone'>> = {
      pending: { variant: 'warning', tone: 'subtle' },
      processing: { variant: 'info', tone: 'subtle' },
      shipped: { variant: 'primary', tone: 'solid' },
      delivered: { variant: 'success', tone: 'solid' },
      cancelled: { variant: 'error', tone: 'solid' },
    };
    return statusMap[status];
  };

  if (orders.length === 0) {
    return (
      <Card variant="elevated">
        <div className="flex min-h-[200px] items-center justify-center p-6">
          <p className="text-base-content/60">No orders found</p>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="elevated">
      <header className="border-b border-base-300 p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-base-content sm:text-xl">Order History</h2>
      </header>

      {/* Mobile: Card layout, Desktop: Table layout */}
      {/* Mobile view (< sm) */}
      <div className="block sm:hidden">
        <div className="divide-y divide-base-200">
          {orders.map((order) => (
            <div key={order.id} className="space-y-2 p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium text-base-content">{order.orderNumber}</span>
                {showStatus && (
                  <Badge {...getStatusBadgeProps(order.status)} size="sm">
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-base-content/60">
                  {new Date(order.date).toLocaleDateString()}
                </span>
                <span className="font-semibold text-base-content">
                  ${order.total.toFixed(2)}
                </span>
              </div>
              {showTracking && order.tracking && (
                <p className="text-xs text-base-content/50">
                  Tracking: {order.tracking}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Desktop view (sm+) */}
      <div className="hidden overflow-x-auto sm:block">
        <table className="table w-full">
          <thead>
            <tr className="border-b border-base-300">
              <th className="bg-base-200/50 text-base-content/70">Order #</th>
              <th className="bg-base-200/50 text-base-content/70">Date</th>
              {showStatus && <th className="bg-base-200/50 text-base-content/70">Status</th>}
              <th className="bg-base-200/50 text-right text-base-content/70">Total</th>
              {showTracking && <th className="bg-base-200/50 text-base-content/70">Tracking</th>}
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-base-200/30">
                <td className="font-medium text-base-content">{order.orderNumber}</td>
                <td className="text-base-content/70">
                  {new Date(order.date).toLocaleDateString()}
                </td>
                {showStatus && (
                  <td>
                    <Badge {...getStatusBadgeProps(order.status)} size="sm">
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </td>
                )}
                <td className="text-right font-semibold text-base-content">
                  ${order.total.toFixed(2)}
                </td>
                {showTracking && (
                  <td className="text-sm text-base-content/60">
                    {order.tracking || '-'}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
