/**
 * Page Object Models - Index
 *
 * Re-exports all Page Objects for convenient importing.
 *
 * @example
 * import { LoginPage, StorePage, CartPage } from '../pages'
 */

// Core Pages
export { BasePage } from './BasePage'
export { LoginPage } from './LoginPage'
export { StorePage } from './StorePage'
export { CartPage } from './CartPage'
export { CheckoutPage } from './CheckoutPage'
export type { ShippingAddress, BillingInfo } from './CheckoutPage'
export { OrdersPage } from './OrdersPage'
export { DashboardPage } from './DashboardPage'

// Role-Specific Pages
export { FulfillmentQueuePage } from './FulfillmentQueuePage'
export { QuotesPage } from './QuotesPage'
export { CustomersPage } from './CustomersPage'
export { ApprovalQueuePage } from './ApprovalQueuePage'
export { UsersPage } from './UsersPage'
export { TenantsPage } from './TenantsPage'
export { InventoryPage } from './InventoryPage'
export { PricingPage } from './PricingPage'
export { AnalyticsPage } from './AnalyticsPage'
