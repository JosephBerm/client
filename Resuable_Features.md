## Update Instructions for a new feature

- Identify what changed: list new/modified/removed files for the feature (components, hooks, services, classes, utils, routes).
- For each new or newly reusable file:
  - Add it to the “Reusable Features Index” under the correct category with its exact path.
  - Add a brief description entry in “Descriptions” with an anchor (use `#### path {#desc-some-anchor}`).
  - If it requires an NPM package not already listed, add the package to “NPM Dependencies” and mark the item in the index with “(NPM: package)”. Do not include versions here; versions live in `package.json`.
- For each modified file that impacts reusability:
  - Update its description to reflect new props, behaviors, or contracts.
  - If its category changed or it was moved, update the path in the index and the anchor location.
- For each removed or no-longer-reusable file:
  - Remove it from the index and its description entry. If still relevant historically, add a one-line note under the closest category: “Removed in <feature-name>.”
- Check cross-feature references:
  - Ensure any mentioned types, hooks, or services exist and are linked correctly.
  - Prefer referring to public `index.ts` barrels where appropriate.
- Validate anchors and formatting:
  - Each index link must have a corresponding `####` description entry with a matching anchor id.
  - Keep descriptions concise (1–2 lines). Longer rationale belongs in code comments, not here.
- Run a quick pass over `package.json` to ensure dependencies reflect any newly referenced packages.
- Keep this file alphabetical within each sub-list where practical; otherwise maintain logical grouping.
- Save changes and skim “App Routes (Template)” to see if new routes should be referenced as template-ready.

## Update Instructions for FULL systematic runs

- Review all folders and files under the `client` workspace; capture EVERYTHING that is reasonably reusable (components, hooks, services, classes, utils, layouts, configs, scripts, routes).
- When logic requires an NPM package, annotate the item with a dependency note (NPM).
- Keep items grouped by domain (core, shared, features, UI, forms, navigation, images, etc.). Preserve file paths exactly.
- Provide a clean, skimmable index (acts like a table of contents) with anchor links to brief descriptions below.
- Prefer concise descriptions; add anchors like `[Name](#desc-name)` in the index and define `### Name` entries in the descriptions section.
- If new files are added/removed/renamed, update both the index and the descriptions.
- Keep the dependency list (NPM) current by reading `package.json`; add new packages referenced by reusable logic.
- Aim to preserve as much as possible; leave nothing out.


## NPM Dependencies (referenced by reusable logic)

These are required by one or more items below. Note: versions from `package.json` (update when upgrading).

- next (15.x) — App Router, middleware, server/client components
- react, react-dom (19.x) — UI framework
- typescript (5.x) — Type system
- zod — schema validation (forms, validation utils)
- @hookform/resolvers — integrates zod with react-hook-form
- react-hook-form — forms state/validation
- zustand — lightweight state management (stores)
- axios — HTTP client (shared http service)
- date-fns — date utilities
- lodash — utilities
- classnames — CSS class composition
- lucide-react — icons
- react-toastify — toasts/notifications
- framer-motion — animations
- embla-carousel-react — carousel
- sharp — image processing (build-time or server-side)
- cookies-next — cookie utilities

Dev/Styling:
- tailwindcss, @tailwindcss/postcss, postcss, autoprefixer — styling pipeline
- daisyui — Tailwind components
- eslint, eslint-config-next — linting


## Reusable Features Index

Below is a categorized list of reusable items. Each item links to a brief description. Anchors are provided in the Descriptions section.

- Core
  - [_core/index.ts](#desc-core-index)
  - [_core/logger/index.ts](#desc-core-logger-index)
  - [_core/logger/factory.ts](#desc-logger-factory) (NPM: `lodash` optional, Node types)
  - [_core/logger/logger.ts](#desc-logger) (NPM: none specific)
  - [_core/logger/transports.ts](#desc-logger-transports)
  - [_core/logger/types.ts](#desc-logger-types)
  - [_core/logger/utils.ts](#desc-logger-utils)
  - [_core/validation/index.ts](#desc-validation-index) (NPM: `zod`)
  - [_core/validation/validation-schemas.ts](#desc-validation-schemas) (NPM: `zod`)

- Shared (Cross-cutting)
  - [_shared/index.ts](#desc-shared-index)
  - Services
    - [_shared/services/index.ts](#desc-shared-services-index)
    - [_shared/services/api.ts](#desc-shared-api) (NPM: `axios`)
    - [_shared/services/httpService.ts](#desc-shared-http) (NPM: `axios`, `cookies-next`)
     - [_shared/services/notification.service.ts](#desc-notification-service) (NPM: `react-toastify`)
  - Hooks
    - [_shared/hooks](#desc-shared-hooks) (all hooks in folder; NPM usage varies: `zod`, `react-hook-form` in some)
    - [_shared/hooks/useScrollReveal.ts](#desc-use-scroll-reveal)
    - [_shared/hooks/useSharedIntersectionObserver.ts](#desc-use-shared-intersection-observer)
    - [_shared/hooks/useGridColumns.ts](#desc-use-grid-columns)
  - Utils
    - [_shared/utils](#desc-shared-utils)

- Types
  - [_types/navigation.ts](#desc-types-navigation)
  - [_types/settings.ts](#desc-types-settings)

- Domain Classes / Models
  - All under [`app/_classes`](#desc-classes-root):
    - Base: `Guid.ts`, `PagedResult.ts`, `GenericSearchFilter.ts`, `CustomerSummary.ts`
    - Common: `Address.ts`, `Name.ts`
    - Enums: `Enums.ts`, `SharedEnums.ts`
    - Helpers (FAANG Pattern): [`OrderStatusHelper.ts`](#desc-order-status-helper), [`ThemeHelper.ts`](#desc-theme-helper), [`NotificationTypeHelper.ts`](#desc-notification-type-helper), [`AccountRoleHelper.ts`](#desc-account-role-helper), [`QuoteStatusHelper.ts`](#desc-quote-status-helper), [`TypeOfBusinessHelper.ts`](#desc-type-of-business-helper)
    - Entities: `Company.ts`, `User.ts`, `Product.ts`, `ProductsCategory.ts`, `Provider.ts`, `Order.ts`, `Quote.ts`, `ContactRequest.ts`, `Notification.ts`, `UploadedFile.ts`, `Home.ts`, `HtmlImage.ts`, `About.ts`
    - Requests/Filters: `RequestClasses.ts`, `FinanceSearchFilter.ts`, `FinanceNumbers.ts`, `LoginCredentials.ts`, `PagedData.ts`, `CarouselTypes.ts`

- Features: Auth
  - [_features/auth/index.ts](#desc-auth-index)
  - Services
    - [_features/auth/services/AuthService.ts](#desc-auth-service) (NPM: `axios`, `cookies-next` via http, `zustand` usage by stores)
  - Stores
    - [_features/auth/stores/useAuthStore.ts](#desc-auth-store) (NPM: `zustand`)
  - Hooks (if present under features/auth/hooks)
    - [_features/auth/hooks](#desc-auth-hooks) (NPM: may use `react-hook-form`, `zod`)
  - Components
    - [_components/auth/LoginModal.tsx](#desc-login-modal)
    - [_components/auth/index.ts](#desc-auth-components-index)

- Features: Settings
  - [_features/settings/index.ts](#desc-settings-index)
  - Services
    - [_features/settings/services/BasePreferenceService.ts](#desc-base-preference-service) — FAANG-level base class
    - [_features/settings/services/ThemeService.ts](#desc-theme-service)
    - [_features/settings/services/ReducedMotionService.ts](#desc-reduced-motion-service)
    - [_features/settings/services/UserSettingsService.ts](#desc-user-settings-service)
    - [_features/settings/services/SettingsService.ts](#desc-settings-service)
  - Stores
    - [_features/settings/stores/useUserSettingsStore.ts](#desc-user-settings-store) (NPM: `zustand`)
  - Components
    - [_components/settings/AppearanceSetting.tsx](#desc-appearance-setting)
    - [_components/settings/ReducedMotionSetting.tsx](#desc-reduced-motion-setting)
    - [_components/settings/SettingRow.tsx](#desc-setting-row)
    - [_components/settings/SettingsModal.tsx](#desc-settings-modal)

- Features: Navigation
  - [_features/navigation/index.ts](#desc-navigation-index)
  - Services
    - [_features/navigation/services/*](#desc-navigation-services)
  - Components
    - [_components/navigation/Navbar.tsx](#desc-navbar)
    - [_components/navigation/NavigationLayout.tsx](#desc-navigation-layout)
    - [_components/navigation/NavigationIcon.tsx](#desc-navigation-icon)
    - [_components/navigation/Sidebar.tsx](#desc-sidebar)

- Features: Images
  - [_features/images/index.ts](#desc-images-index)
  - Services
    - [_features/images/services/ImageService.ts](#desc-image-service)
    - [_features/images/services/CDNService.ts](#desc-cdn-service)
    - [_features/images/services/ImageCacheService.ts](#desc-image-cache-service)
    - [_features/images/services/ImagePreloadService.ts](#desc-image-preload-service)
  - Hooks
    - [_features/images/hooks/useImage.ts](#desc-use-image)
    - [_features/images/hooks/useImageAnalytics.ts](#desc-use-image-analytics)
    - plus others in folder
  - Components
    - [_features/images/components/OptimizedImage.tsx](#desc-feat-optimized-image)
  - UI
    - [_components/ui/OptimizedImage.tsx](#desc-ui-optimized-image)
    - [_components/ui/ImageLoadingState.tsx](#desc-image-loading-state)
    - [_components/ui/ImagePlaceholder.tsx](#desc-image-placeholder)
    - [_components/ui/ImageLightbox.tsx](#desc-image-lightbox)
  - Public SW
    - [public/service-worker.js](#desc-sw)
    - [public/sw-image-cache.js](#desc-sw-image-cache)
    - [public/manifest.json](#desc-manifest)

- Features: Products/Store
  - [_features/store/index.ts](#desc-store-index)
  - Services/Utils
    - [_features/store/utils/requestCache.ts](#desc-request-cache)
    - `_features/products/services/*`, `_features/products/utils/*` (if used)
  - Hooks
    - [_features/store/hooks/useProductsState.ts](#desc-use-products-state)
  - Components
    - [_components/store/ProductCard.tsx](#desc-product-card)
    - [_components/store/ProductCardSkeleton.tsx](#desc-product-card-skeleton)
    - [_components/store/ProductCard.constants.ts](#desc-product-card-consts)
    - [_components/store/ProductImage.tsx](#desc-product-image)
    - [_components/store/ImageGallery.tsx](#desc-image-gallery)
    - [_components/store/ProductImageGallery.tsx](#desc-product-image-gallery)
    - [_components/store/PaginationControls.tsx](#desc-pagination-controls)
    - [_components/store/ProductsToolbar.tsx](#desc-products-toolbar)
    - [_components/store/UnifiedStoreToolbar.tsx](#desc-unified-store-toolbar)
    - [_components/store/ScrollRevealCard.tsx](#desc-scroll-reveal-card)
    - [_components/store/AddToCartButton.tsx](#desc-add-to-cart-button)
  - Pages
    - `app/store/page.tsx`, `app/store/product/[id]/page.tsx` (template-ready routes)

- Features: Cart
  - [_features/cart/index.ts](#desc-cart-index)
  - Stores
    - [_features/cart/stores/useCartStore.ts](#desc-cart-store) (NPM: `zustand`)
  - Components
    - [_components/cart/CartItem.tsx](#desc-cart-item)
    - [_components/cart/index.ts](#desc-cart-components-index)
  - Pages
    - `app/cart/page.tsx` (template-ready cart page)

- Forms
  - Components
    - [_components/forms/ProductForm.tsx](#desc-product-form)
    - [_components/forms/UpdateAccountForm.tsx](#desc-update-account-form)
    - [_components/forms/UpdateCustomerForm.tsx](#desc-update-customer-form)
    - [_components/forms/UpdateProviderForm.tsx](#desc-update-provider-form)
    - [_components/forms/FormInput.tsx](#desc-form-input)
    - [_components/forms/FormSelect.tsx](#desc-form-select)
    - [_components/forms/FormCheckbox.tsx](#desc-form-checkbox)
    - [_components/forms/FormTextArea.tsx](#desc-form-textarea)
    - [_components/forms/ChangePasswordForm.tsx](#desc-change-password-form)
    - [_components/forms/fieldStyles.ts](#desc-form-field-styles)
  - Hooks
    - [_shared/hooks/useZodForm.ts](#desc-use-zod-form) (NPM: `zod`, `@hookform/resolvers`, `react-hook-form`)
    - [_shared/hooks/useFormSubmit.ts](#desc-use-form-submit) (NPM: `react-hook-form`)
    - Other supporting hooks as needed

- Tables
  - [_components/tables/index.ts](#desc-tables-index) (NPM: `@tanstack/react-table`)
  - [_components/tables/DataTable.tsx](#desc-data-table) (NPM: `@tanstack/react-table`)
  - [_components/tables/ServerDataTable.tsx](#desc-server-data-table) (NPM: `@tanstack/react-table`)
  - [_components/tables/AccountOrdersTable.tsx](#desc-account-orders-table)
  - [_components/tables/AccountQuotesTable.tsx](#desc-account-quotes-table)

- Landing / Marketing Components
  - [_components/landing/Intro.tsx](#desc-landing-intro)
  - [_components/landing/SalesPitch.tsx](#desc-sales-pitch)
  - [_components/landing/Products.tsx](#desc-landing-products)
  - [_components/landing/ProductsCarousel.tsx](#desc-landing-products-carousel) (NPM: `embla-carousel-react`)
  - [_components/landing/ProductCategoriesCarousel.tsx](#desc-landing-categories-carousel) (NPM: `embla-carousel-react`)
  - [_components/landing/FAQ.tsx](#desc-landing-faq)
  - [_components/landing/ContactUs.tsx](#desc-contact-us)
  - [_components/landing/ScrollIntoViewComponent.tsx](#desc-scroll-into-view) (NPM: `framer-motion` optional; uses IntersectionObserver APIs)
  - [_components/landing/HeroSection.tsx](#desc-hero-section) (NPM: `framer-motion`)
  - [_components/landing/StatsBanner.tsx](#desc-stats-banner) (NPM: `framer-motion`)
  - [_components/landing/FeatureSection.tsx](#desc-feature-section) (NPM: `framer-motion`)
  - [_components/landing/CTASection.tsx](#desc-cta-section) (NPM: `framer-motion`)

- UI Components (Generic)
  - [_components/ui/Accordion.tsx](#desc-accordion)
  - [_components/ui/Badge.tsx](#desc-badge)
  - [_components/ui/Button.tsx](#desc-button)
  - [_components/ui/Card.tsx](#desc-card)
  - [_components/ui/CategoryFilter.tsx](#desc-category-filter)
  - [_components/ui/Input.tsx](#desc-input)
  - [_components/ui/Modal.tsx](#desc-modal)
  - [_components/ui/Pill.tsx](#desc-pill)
  - [_components/ui/QuantitySelector.tsx](#desc-quantity-selector)
  - [_components/ui/Select.tsx](#desc-select)
  - [_components/ui/StatusDot.tsx](#desc-status-dot)
  - [_components/ui/ContactIcons.tsx](#desc-contact-icons)
  - [_components/ui/ContactMethodCard.tsx](#desc-contact-method-card)
  - [_components/ui/LiveChatBubble.tsx](#desc-live-chat-bubble)
  - Carousel (UI)
    - [_components/ui/Carousel/index.ts](#desc-carousel-index)
    - [_components/ui/Carousel/Carousel.tsx](#desc-carousel)
    - [_components/ui/Carousel/CarouselSlide.tsx](#desc-carousel-slide)
    - [_components/ui/Carousel/CarouselControls.tsx](#desc-carousel-controls)
    - [_components/ui/Carousel/CarouselDots.tsx](#desc-carousel-dots)
    - [_components/ui/Carousel/types.ts](#desc-carousel-types)
  - Animations
    - [_components/common/animations/index.ts](#desc-animations-index)
    - [_components/common/animations/config.ts](#desc-animation-config) (NPM: `framer-motion`)
    - [_components/common/animations/types.ts](#desc-animation-types) (NPM: `framer-motion`)
    - [_components/common/animations/Reveal.tsx](#desc-reveal) (NPM: `framer-motion`)
    - [_components/common/animations/Stagger.tsx](#desc-stagger) (NPM: `framer-motion`)
  - Form Field Styles
    - [_components/ui/formFieldStyles.ts](#desc-ui-form-field-styles)

- Layouts / Common
  - [_components/layouts/PageContainer.tsx](#desc-page-container)
  - [_components/layouts/PageLayout.tsx](#desc-page-layout)
  - [_components/layouts/ClientPageLayout.tsx](#desc-client-page-layout)
  - [_components/common/ServiceWorkerRegistration.tsx](#desc-sw-registration)
  - [_components/common/ToastProvider.tsx](#desc-toast-provider) (NPM: `react-toastify`)
  - [_components/common/LoadingSpinner.tsx](#desc-loading-spinner)
  - [_components/common/EmptyState.tsx](#desc-empty-state)
  - [_components/common/OrderStatusBadge.tsx](#desc-order-status-badge)
  - [_components/common/RoleBadge.tsx](#desc-role-badge)
  - [_components/common/UserSettingsInitializer.tsx](#desc-user-settings-initializer)
  - [_components/common/AuthInitializer.tsx](#desc-auth-initializer)
  - [_components/common/ImageServiceInitializer.tsx](#desc-image-service-initializer)

- Data & Analytics
  - [_shared/utils/analytics.ts](#desc-analytics-utils)
  - [_shared/hooks/useSectionMetrics.ts](#desc-use-section-metrics)
  - [_shared/hooks/useScrollProgress.ts](#desc-use-scroll-progress)
  - [_shared/utils/scrollUtils.ts](#desc-scroll-utils)
  - [_shared/utils/businessHours.ts](#desc-business-hours)

- General Hooks (reusable)
  - [_shared/hooks/useDebounce.ts](#desc-use-debounce)
  - [_shared/hooks/useScrollSpy.ts](#desc-use-scroll-spy)
  - [_shared/hooks/useElementRefs.ts](#desc-use-element-refs)
  - [_shared/hooks/useKeyboardNavigation.ts](#desc-use-keyboard-navigation)
  - [_shared/hooks/useAdvancedLazyLoad.ts](#desc-use-advanced-lazy-load)
  - [_shared/hooks/useServerTable.ts](#desc-use-server-table)

- Lib / Helpers / Scripts
  - [_lib/index.ts](#desc-lib-index)
  - [_lib/formatters/*](#desc-lib-formatters)
  - [_helpers/icon-mapping.ts](#desc-icon-mapping)
  - [_scripts/theme-init.ts](#desc-theme-init)
  - [_scripts/theme-init-inline.ts](#desc-theme-init-inline)

- App Routes (template-ready)
  - App-level
    - `app/layout.tsx`, `app/globals.css`, `app/middleware.ts`
    - `app/page.tsx` (home), `app/about-us/page.tsx`, `app/contact/page.tsx`, `app/login/page.tsx`, `app/signup/page.tsx` (+ `loading.tsx`), `app/cart/page.tsx`
  - MedSource App (admin/client area templates)
    - `app/app/layout.tsx`, `app/app/page.tsx`
    - Sections with `[id]` routes for `orders`, `quotes`, `customers`, `providers`, `accounts`, `notifications`, `store`, `profile`, `analytics`


## Descriptions

### Core

#### _core/index.ts {#desc-core-index}
Re-exports and aggregates core utilities for simpler imports across the app.

#### _core/logger/index.ts {#desc-core-logger-index}
Entry point for logger utilities, re-exports factory, logger, transports, types, and helpers.

#### _core/logger/factory.ts {#desc-logger-factory}
Creates configured loggers with pluggable transports; supports environment-based levels and formatting.

#### _core/logger/logger.ts {#desc-logger}
Lightweight logger with levels, message formatting, and standardized output interface.

#### _core/logger/transports.ts {#desc-logger-transports}
Composable transports (console, memory, network) used by the logger factory.

#### _core/logger/types.ts {#desc-logger-types}
Type contracts for logger, levels, and transport interfaces.

#### _core/logger/utils.ts {#desc-logger-utils}
Shared helpers for formatting, error normalization, and safe serialization.

#### _core/validation/index.ts {#desc-validation-index}
Validation entry point; re-exports zod schemas and validation helpers.

#### _core/validation/validation-schemas.ts {#desc-validation-schemas}
Zod schemas for common domain models and form payloads.


### Shared

#### _shared/index.ts {#desc-shared-index}
Umbrella index re-exporting hooks, utils, and services.

#### _shared/services/index.ts {#desc-shared-services-index}
Exports shared services; central import location for HTTP and API helpers.

#### _shared/services/api.ts {#desc-shared-api}
Axios instance and API helpers with baseURL, interceptors, error handling.

#### _shared/services/httpService.ts {#desc-shared-http}
Thin HTTP abstraction over Axios, with auth/cookie integration and response normalization.

#### _shared/services/notification.service.ts {#desc-notification-service}
FAANG-level unified notification service integrating toast notifications with structured logging. Inspired by Amazon CloudWatch + SNS, Google Cloud Logging + Snackbar, Meta's notification center, and Netflix's telemetry-driven approach. Features: single API for user notifications + developer logging, automatic context enrichment (correlation IDs, component, action), user interaction tracking (dismissed, clicked), DRY elimination across 20+ files (39 toast calls unified), accessibility support (reduced motion), type-safe with comprehensive TypeScript definitions, ready for metrics/analytics integration. Eliminates duplication by providing convenience methods (success/error/info/warning) that auto-log with appropriate levels and display themed toasts. Uses internal toastConfig.ts for centralized configuration. Singleton pattern ensures consistent notification queue. Includes dismiss/dismissAll methods for programmatic control.

#### _shared/hooks {#desc-shared-hooks}
Cross-cutting hooks: debouncing, lazy-load, server-table helpers, scroll/section analytics, zod form helpers.

#### _shared/utils {#desc-shared-utils}
General utilities: analytics, business hours, scrolling, indexing utilities. Note: toastConfig.ts is an internal implementation detail of notification.service.ts and should not be imported directly by consumers.


### Types

#### _types/navigation.ts {#desc-types-navigation}
Route, menu, and navigation-related type definitions.

#### _types/settings.ts {#desc-types-settings}
User settings, theme, and preference types.


### Domain Classes / Models

#### app/_classes (root) {#desc-classes-root}
Domain models and DTOs (entities, enums, filters, requests). Keep these as the canonical shared model contracts.

#### app/_classes/About.ts {#desc-about-class}
Static content management class for About page. Centralizes hero section, statistics, features, and CTA content. Provides type-safe interfaces for all content sections. Enables easy content updates without touching JSX. Follows same pattern as Home.ts for consistency.

#### app/_classes/Helpers/OrderStatusHelper.ts {#desc-order-status-helper}
FAANG-level enum helper for OrderStatus following Google/Netflix/Stripe exhaustive metadata pattern. Features: 550+ lines, complete lifecycle management, display names, badge variants (success/error/warning/info), descriptions, sort orders, categories (pending/active/completed/cancelled), workflow validation (allowed transitions), terminal state checks. Pattern: Record<OrderStatus, OrderStatusMetadata> ensures TypeScript enforces completeness. Methods: getDisplay(), getVariant(), getDescription(), getMetadata(), getCategory(), isTerminal(), getAllowedTransitions(), canTransition(), getStatusesByCategory(), getActiveStatuses(), getPendingStatuses(), getCompletedStatuses(), isValid(), sort(), getNextStatus(). Replaces: EnumsTranslations.OrderStatusName/OrderStatusVariants, scattered hardcoded status logic. Used by: OrderStatusBadge, order tables, order detail pages, status filters, workflow engines. Benefits: zero magic strings, single source of truth, type-safe workflow validation, self-documenting.

#### app/_classes/Helpers/ThemeHelper.ts {#desc-theme-helper}
FAANG-level theme metadata system following EnumHelper pattern. Centralizes all theme properties in exhaustive metadata map. Features: type-safe theme queries (isDarkTheme, getDarkThemes), display name mapping, toast theme conversion, category filtering. Pattern: Record<Theme, ThemeMetadata> ensures TypeScript enforces completeness - adding new theme to enum requires metadata entry. Benefits: single source of truth for theme properties, eliminates hardcoded theme arrays across codebase, scalable to 100+ themes, self-documenting with descriptions. Methods: toList, isDarkTheme(), getToastTheme(), getDisplayName(), getThemesByCategory(), isValidTheme(). Replaces scattered theme logic in ToastProvider, AppearanceSetting, and globals.css. Used by: ToastProvider (dynamic theme switching), AppearanceSetting (theme selector dropdown). Extensible: easy to add properties like primaryColor, contrast, fontScale.

#### app/_classes/Helpers/NotificationTypeHelper.ts {#desc-notification-type-helper}
FAANG-level enum helper for NotificationType (Info/Warning/Error). Features: display names, badge variants, descriptions, priority levels (1-3), icon names, ARIA roles for accessibility. Pattern: Record<NotificationType, NotificationTypeMetadata>. Methods: getDisplay(), getVariant(), getDescription(), getMetadata(), getPriority(), getIconName(), getAriaRole(), sortByPriority(), getByPriority(), getHighPriority(), isHighPriority(), isValid(). Used by: notification components, toast service, alert components, priority sorting/filtering. Benefits: zero hardcoded notification strings, type-safe priority checks, accessibility metadata centralized, extensible for future notification types.

#### app/_classes/Helpers/AccountRoleHelper.ts {#desc-account-role-helper}
FAANG-level enum helper for AccountRole (Customer/Admin) with RBAC utilities. Features: display names, short labels, badge variants, descriptions, permission levels. Pattern: Record<AccountRole, AccountRoleMetadata>. Methods: getDisplay(), getShortLabel(), getVariant(), getDescription(), getMetadata(), getLevel(), isAdmin(), isCustomer(), hasHigherPermissionsThan(), hasPermissionLevel(), sortByLevel(), isValid(). Used by: RoleBadge, navigation filtering, route protection, permission checks, role management UI. Benefits: centralized RBAC logic, type-safe permission comparisons, zero magic role strings, self-documenting permission hierarchy, extensible for future roles.

#### app/_classes/Helpers/QuoteStatusHelper.ts {#desc-quote-status-helper}
FAANG-level enum helper for QuoteStatus (Unread/Read). Features: display names, badge variants (warning/info), descriptions, icon names, attention flags. Pattern: Record<QuoteStatus, QuoteStatusMetadata>. Methods: getDisplay(), getVariant(), getDescription(), getMetadata(), getIconName(), needsReview(), getStatusesNeedingAttention(), isValid(). Used by: quote tables, quote detail pages, staff notification systems, unread quote filters. Benefits: zero hardcoded quote status strings, type-safe attention checks, consistent UI variants, easy to extend for future statuses (Approved/Rejected/Expired).

#### app/_classes/Helpers/TypeOfBusinessHelper.ts {#desc-type-of-business-helper}
FAANG-level enum helper for TypeOfBusiness (Dentist/SurgeryCenter/Hospital/Veterinarian/Restaurant/Construction/Other). Features: display names, descriptions, icon names, industry categories (medical/hospitality/construction/other), example businesses. Pattern: Record<TypeOfBusiness, TypeOfBusinessMetadata>. Methods: getDisplay(), getDescription(), getMetadata(), getIconName(), getCategory(), getExamples(), getByCategory(), getMedicalTypes(), isMedical(), isValid(). Used by: customer forms, business type dropdowns, industry filtering, customer segmentation. Benefits: zero hardcoded business type strings, category-based filtering, helpful examples for UI, extensible for new business types, industry-specific logic centralized.


### Features: Auth

#### _features/auth/index.ts {#desc-auth-index}
Exports public auth feature surface (services, stores, hooks).

#### _features/auth/services/AuthService.ts {#desc-auth-service}
Authentication flows (login, logout, token refresh), integrates HTTP and cookie storage.

#### _features/auth/stores/useAuthStore.ts {#desc-auth-store}
Zustand store for auth state (user, tokens, roles), hydration and persistence behavior.

#### _features/auth/hooks {#desc-auth-hooks}
Auth-related hooks (guards, role checks, form helpers) if present.

#### _components/auth/LoginModal.tsx {#desc-login-modal}
ChatGPT-style login modal with social authentication options (Google, Apple, Microsoft, Phone) and email/password login. Mobile-first responsive design.

#### _components/auth/index.ts {#desc-auth-components-index}
Barrel export for auth UI components.


### Features: Settings

#### _features/settings/index.ts {#desc-settings-index}
Exports settings feature API (services, stores, components).

#### _features/settings/services/BasePreferenceService.ts {#desc-base-preference-service}
FAANG-level base class for managing preferences with system detection, localStorage persistence, and DOM application. Template Method pattern eliminates code duplication across preference services. Generic type-safe implementation supports any preference type (Theme, boolean, etc.).

#### _features/settings/services/ThemeService.ts {#desc-theme-service}
Theme preference management extending BasePreferenceService. Detects system color scheme, persists theme choice, applies via data-theme attribute. Refactored to eliminate 80+ lines of duplication.

#### _features/settings/services/ReducedMotionService.ts {#desc-reduced-motion-service}
Reduced motion preference management extending BasePreferenceService. Detects prefers-reduced-motion media query, persists user override, applies via data-reduced-motion attribute. Used by CSS and hooks to disable animations.

#### _features/settings/services/UserSettingsService.ts {#desc-user-settings-service}
Unified storage service for all user settings with versioning and validation. Single localStorage key with schema version for migrations. Type-safe interfaces for theme, preferences, and custom settings.

#### _features/settings/stores/useUserSettingsStore.ts {#desc-user-settings-store}
Zustand store managing theme, reduced motion, and UI preferences. Uses MutationObserver for DOM sync. Initializes via UserSettingsInitializer. Domain slices: Theme state, ReducedMotionState, PreferencesState.

#### _components/settings/AppearanceSetting.tsx {#desc-appearance-setting}
Theme selector dropdown component for Settings Modal. Uses Select UI component with theme enum options. Mobile-first responsive layout with proper spacing.

#### _components/settings/ReducedMotionSetting.tsx {#desc-reduced-motion-setting}
Reduced motion toggle component for Settings Modal. DaisyUI toggle switch with accessibility labels. Respects system preference by default with user override capability.

**Documentation**: See `docs/REDUCED_MOTION_BEST_PRACTICES.md` for implementation guidelines.

#### _components/settings/SettingRow.tsx {#desc-setting-row}
Flexible settings row renderer supporting select, toggle, button, and custom types. Type-safe discriminated union pattern. Consistent mobile-first layout across setting types.

#### _components/settings/SettingsModal.tsx {#desc-settings-modal}
Two-pane settings modal with sidebar navigation and content area. Section-based organization with keyboard navigation. Focus management and ARIA support for accessibility.


### Features: Navigation

#### _features/navigation/index.ts {#desc-navigation-index}
Exports navigation feature API.

#### _features/navigation/services/* {#desc-navigation-services}
Route helpers, breadcrumbs, path builders, redirection helpers.

#### _components/navigation/Navbar.tsx {#desc-navbar}
Top navigation bar; configurable menu and actions.

#### _components/navigation/NavigationLayout.tsx {#desc-navigation-layout}
Layout wrapper that wires navigation context and shells main content.

#### _components/navigation/NavigationIcon.tsx {#desc-navigation-icon}
Icon component mapped to navigation items (uses `lucide-react`).

#### _components/navigation/Sidebar.tsx {#desc-sidebar}
Sidebar navigation with active state and keyboard navigation.


### Features: Images

#### _features/images/index.ts {#desc-images-index}
Exports image handlers, hooks, and components.

#### _features/images/services/ImageService.ts {#desc-image-service}
Image URL building, resizing params, fallbacks, and cloud/CDN integration.

#### _features/images/services/CDNService.ts {#desc-cdn-service}
CDN-specific helpers; cache keys, signatures.

#### _features/images/services/ImageCacheService.ts {#desc-image-cache-service}
In-memory/browser cache strategies for images.

#### _features/images/services/ImagePreloadService.ts {#desc-image-preload-service}
Preloading pipeline and observer-based prefetching.

#### _features/images/hooks/useImage.ts {#desc-use-image}
Core hook to resolve, fetch, and cache image sources and states.

#### _features/images/hooks/useImageAnalytics.ts {#desc-use-image-analytics}
Hook to collect image loading and interaction metrics.

#### _features/images/components/OptimizedImage.tsx {#desc-feat-optimized-image}
Feature-level optimized image with defaults and analytics integration.

#### _components/ui/OptimizedImage.tsx {#desc-ui-optimized-image}
UI-level wrapper around Next/Image or custom renderer with loading states.

#### _components/ui/ImageLoadingState.tsx {#desc-image-loading-state}
Consistent skeleton/blur-up state for images.

#### _components/ui/ImagePlaceholder.tsx {#desc-image-placeholder}
Fallback placeholder rendering.

#### _components/ui/ImageLightbox.tsx {#desc-image-lightbox}
Lightbox modal for zoomed image viewing.

#### public/service-worker.js {#desc-sw}
Service worker registration scripts for offline and caching.

#### public/sw-image-cache.js {#desc-sw-image-cache}
Custom image cache strategy for SW; consider stale-while-revalidate.

#### public/manifest.json {#desc-manifest}
PWA manifest for icons and app metadata.


### Features: Products/Store

#### _features/store/index.ts {#desc-store-index}
Exports store feature surface (hooks, utils).

#### _features/store/utils/requestCache.ts {#desc-request-cache}
Request caching helper keyed by params; cancel/dedupe in-flight fetches.

#### _features/store/hooks/useProductsState.ts {#desc-use-products-state}
State management and filters for products listing; pagination helpers.

#### _components/store/ProductCard.tsx {#desc-product-card}
Product card display: image, price, badges; responsive variants.

#### _components/store/ProductCardSkeleton.tsx {#desc-product-card-skeleton}
Skeleton version of product card for loading states.

#### _components/store/ProductCard.constants.ts {#desc-product-card-consts}
Constants used by product cards (badge thresholds, labels).

#### _components/store/ProductImage.tsx {#desc-product-image}
Simplified product image with fallback behavior.

#### _components/store/ImageGallery.tsx {#desc-image-gallery}
Generic gallery; keyboard navigation and swipe gestures.

#### _components/store/ProductImageGallery.tsx {#desc-product-image-gallery}
Gallery tailored for product detail pages.

#### _components/store/PaginationControls.tsx {#desc-pagination-controls}
Pagination UI with controlled callbacks, accessibility-friendly.

#### _components/store/ProductsToolbar.tsx {#desc-products-toolbar}
Toolbar for search/filter/sort controls on products page.

#### _components/store/UnifiedStoreToolbar.tsx {#desc-unified-store-toolbar}
Compact toolbar variant for store-wide controls.

#### _components/store/ScrollRevealCard.tsx {#desc-scroll-reveal-card}
FAANG-level wrapper component for scroll-triggered reveal animations. Features overlapping cascade pattern (Apple/Stripe), spring-like easing, optimized stagger timing (80ms base), and shared IntersectionObserver. First 10 items animate on mount with row-aware delays; remaining items trigger on scroll. Includes `useGridColumns` hook integration for responsive column calculation.

#### _components/store/AddToCartButton.tsx {#desc-add-to-cart-button}
Add to cart button component with integrated quantity selector. Features: editable quantity input with increment/decrement controls, optimistic UI updates, structured logging, mobile-first responsive design, accessibility-first with ARIA labels, loading states. Uses QuantitySelector for consistent UI across the application. Integrates with useCartStore for state management.


### Features: Cart

#### _features/cart/index.ts {#desc-cart-index}
Exports cart feature API (stores, types).

#### _features/cart/stores/useCartStore.ts {#desc-cart-store}
Zustand store for shopping cart state with localStorage persistence. Separated from user settings store following Single Responsibility Principle. Features: add/remove/update cart items, quantity management, automatic persistence, clear cart functionality, type-safe cart operations. Cart data persists across browser sessions. Used for transient shopping data.

#### _components/cart/CartItem.tsx {#desc-cart-item}
FAANG-level cart item component inspired by Amazon's elegant cart design. Beautiful, scalable presentation component for individual cart items. Features: clean scannable layout (image left, details center, actions right), product metadata display (SKU, manufacturer), quantity selector (read-only styled as input), remove action, product name link to detail page, mobile-first responsive layout (stacked on mobile, horizontal on tablet+), touch-friendly controls (min 44px tap targets), smooth transitions with reduced motion support, full accessibility (ARIA labels, keyboard navigation), structured logging for all interactions, memoized callbacks for optimal performance, theme-aware (DaisyUI), compact mode option. Pure presentation component with callbacks for actions. Reusable across cart, saved items, order review. Eliminates 45+ lines of inline markup per usage.

#### _components/cart/index.ts {#desc-cart-components-index}
Barrel export for cart UI components and types.


### Forms

#### _components/forms/ProductForm.tsx {#desc-product-form}
Product create/update form: fields, validation via zod + RHF.

#### _components/forms/UpdateAccountForm.tsx {#desc-update-account-form}
Account edit form with server submit integration.

#### _components/forms/UpdateCustomerForm.tsx {#desc-update-customer-form}
Customer edit form with validation and submit UX patterns.

#### _components/forms/UpdateProviderForm.tsx {#desc-update-provider-form}
Provider edit form; consistent field + error rendering.

#### _components/forms/FormInput.tsx {#desc-form-input}
RHF-friendly input wrapper with label, error, and help text.

#### _components/forms/FormSelect.tsx {#desc-form-select}
Controlled select integrated with RHF, keyboard accessible.

#### _components/forms/FormCheckbox.tsx {#desc-form-checkbox}
Checkbox with form control and consistent styling.

#### _components/forms/FormTextArea.tsx {#desc-form-textarea}
Textarea component with character count and validation states.

#### _components/forms/ChangePasswordForm.tsx {#desc-change-password-form}
Secure password change flow with strength checks and validation.

#### _components/forms/fieldStyles.ts {#desc-form-field-styles}
Shared style tokens for form fields (Tailwind classes).

#### _shared/hooks/useZodForm.ts {#desc-use-zod-form}
RHF + zod integration hook for streamlined schema-based forms.

#### _shared/hooks/useFormSubmit.ts {#desc-use-form-submit}
Standardized submit handler with loading/error/success patterns. Eliminates boilerplate with automatic loading state management, error handling, and success notifications via notificationService. Includes componentName and actionName options for structured logging context. Reduces form code by ~70% through consistent patterns.


### Tables

#### _components/tables/index.ts {#desc-tables-index}
Barrel export for table components, utilities, constants, and types. Re-exports DataTable, ServerDataTable, all table utilities (sanitizeString, calculateTotalItems, etc.), constants (DEFAULT_PAGE_SIZE_OPTIONS, TABLE_ERROR_MESSAGES), types (PaginationButtonConfig, TableFeatureToggles), and TanStack Table types. Single import source following FAANG-level code organization.

#### _components/tables/DataTable.tsx {#desc-data-table}
Modern, powerful, and elegant data table built on TanStack Table v8. Features: client-side and server-side pagination, sorting, and filtering; mobile-first responsive design; WCAG AA accessibility compliance; structured logging; feature toggles (enableSorting, enableFiltering, enablePagination, enablePageSize) for granular control. Supports both client-side and server-side modes with manual control flags. Uses centralized utilities, constants, and types for maximum DRY compliance.

#### _components/tables/ServerDataTable.tsx {#desc-server-data-table}
Server-driven table adapter with remote pagination, sorting, and filtering. Automatically handles server-side data fetching via endpoint or custom fetch function. Integrates with useServerTable hook for state management. Supports all DataTable feature toggles (enableSorting, enableFiltering, enablePagination, enablePageSize) for flexible UI control.

#### _components/tables/tableConstants.ts {#desc-table-constants}
Centralized constants for table components following FAANG-level best practices. Single source of truth for page size options (DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 30, 40, 50]), default page size (10), min/max page sizes, default empty messages, error messages, and component names. Eliminates magic values and ensures consistency across all table implementations.

#### _components/tables/tableUtils.ts {#desc-table-utils}
Reusable utility functions for table operations. Pure functions implementing defensive programming and type safety: sanitizeString (XSS prevention), isPositiveNumber, isValidPageSize (bounds checking), calculateTotalItems (smart total calculation for client/server modes), calculateLastPageIndex (edge case handling), calculatePaginationRange (display range for "Showing X-Y of Z"), isValidArray, normalizeArray. All utilities are fully typed and tested for robustness.

#### _components/tables/tableTypes.ts {#desc-table-types}
Shared type definitions for table components promoting type safety and reusability. Includes PaginationButtonConfig (button rendering), TableFeatureToggles (feature enable/disable), TableManualModes (server-side control), ServerPaginationMeta (backend pagination metadata), and PaginationRange (display calculations). Centralized types prevent duplication and ensure consistency following FAANG-level DRY principles.

#### _components/tables/AccountOrdersTable.tsx {#desc-account-orders-table}
Prebuilt table for account orders; column presets and formatting.

#### _components/tables/AccountQuotesTable.tsx {#desc-account-quotes-table}
Prebuilt table for account quotes; column presets and formatting.


### Landing / Marketing

#### _components/landing/Intro.tsx {#desc-landing-intro}
Hero/intro block with CTA and responsive layout.

#### _components/landing/SalesPitch.tsx {#desc-sales-pitch}
Value proposition section with iconography and motion.

#### _components/landing/Products.tsx {#desc-landing-products}
Marketing grid for featured products.

#### _components/landing/ProductsCarousel.tsx {#desc-landing-products-carousel}
Carousel for featured products using Embla.

#### _components/landing/ProductCategoriesCarousel.tsx {#desc-landing-categories-carousel}
Category carousel using Embla.

#### _components/landing/FAQ.tsx {#desc-landing-faq}
FAQ accordion section.

#### _components/landing/ContactUs.tsx {#desc-contact-us}
Contact section with methods and form hook-in points.

#### _components/landing/ScrollIntoViewComponent.tsx {#desc-scroll-into-view}
Viewport-aware reveal animations and auto-scroll behavior.

#### _components/landing/HeroSection.tsx {#desc-hero-section}
Reusable hero section with background image, gradient overlay, and animated content. Features: full-viewport background, staggered content animations, optional scroll indicator, mobile-first responsive design, accessibility-first with semantic HTML and ARIA labels, reduced motion support. Uses shared animation system for consistent timing.

#### _components/landing/StatsBanner.tsx {#desc-stats-banner}
Statistics/trust banner component for displaying key metrics. Features: responsive grid layout (2 columns mobile, 4 columns desktop), staggered entrance animations, mobile-first design, accessibility-first with semantic HTML and ARIA labels, reduced motion support via shared animation system. Supports neutral and base variants.

#### _components/landing/FeatureSection.tsx {#desc-feature-section}
Feature showcase component with alternating image/text layout. Features: alternating left/right layout for image and text, icon support with color variants, hover effects on images, mobile-first responsive design, accessibility-first with semantic HTML and ARIA labels, reduced motion support via shared animation system. Optimized image loading with priority for first feature.

#### _components/landing/CTASection.tsx {#desc-cta-section}
Call-to-action section component with multiple variants. Features: pattern, solid, and gradient variants, responsive layout, animated content reveal, mobile-first design, accessibility-first with semantic HTML and ARIA labels, theme-aware text colors. Uses shared animation system for consistent timing.


### UI Components (Generic)

#### _components/ui/Accordion.tsx {#desc-accordion}
Accessible accordion with keyboard support.

#### _components/ui/Badge.tsx {#desc-badge}
Small status/label indicator.

#### _components/ui/Button.tsx {#desc-button}
Variant-driven button with disabled/loading states.

#### _components/ui/Card.tsx {#desc-card}
Panel container with header/body/footer slots.

#### _components/ui/CategoryFilter.tsx {#desc-category-filter}
Category chips with selection management.

#### _components/ui/Input.tsx {#desc-input}
Text input with variants and validation states.

#### _components/ui/Modal.tsx {#desc-modal}
Accessible modal (focus lock, escape, aria).

#### _components/ui/Pill.tsx {#desc-pill}
Rounded label/tag UI.

#### _components/ui/QuantitySelector.tsx {#desc-quantity-selector}
FAANG-level reusable quantity selector component with dual modes (editable/read-only). Features: increment/decrement with icons or text, min/max validation and clamping, customizable sizes (xs/sm/md), button variants (ghost/outline), mobile-first responsive design (min 44px tap targets), full accessibility (ARIA labels, keyboard navigation, screen reader support), reduced motion support, theme-aware (DaisyUI), disabled state handling, memoized callbacks for performance. Eliminates duplication between AddToCartButton and cart page. Used in product cards (editable) and cart page (read-only).

#### _components/ui/Select.tsx {#desc-select}
Select input with consistent styling.

#### _components/ui/StatusDot.tsx {#desc-status-dot}
Small colored status indicator dot (online/offline/etc.).

#### _components/ui/ContactIcons.tsx {#desc-contact-icons}
Icon set for contact methods (NPM: `lucide-react`).

#### _components/ui/ContactMethodCard.tsx {#desc-contact-method-card}
Card rendering a contact method with action.

#### _components/ui/LiveChatBubble.tsx {#desc-live-chat-bubble}
Floating live chat CTA component with presence indicator.

#### _components/ui/Carousel/* {#desc-carousel-index}
Embla or custom carousel primitives (slides, controls, dots, types).

#### _components/ui/Carousel/Carousel.tsx {#desc-carousel}
Carousel controller: initializes carousel, provides navigation.

#### _components/ui/Carousel/CarouselSlide.tsx {#desc-carousel-slide}
Single slide wrapper with lazy rendering.

#### _components/ui/Carousel/CarouselControls.tsx {#desc-carousel-controls}
Prev/next controls with disabled/loop logic.

#### _components/ui/Carousel/CarouselDots.tsx {#desc-carousel-dots}
Pagination dots, clickable and ARIA-labeled.

#### _components/ui/Carousel/types.ts {#desc-carousel-types}
Shared types for carousel props and state.

#### _components/common/animations/index.ts {#desc-animations-index}
Barrel export for animation components and utilities.

#### _components/common/animations/config.ts {#desc-animation-config}
Centralized animation configuration constants. Single source of truth for animation timing, delays, distances, and presets. Includes: ANIMATION_DURATION (quick, standard, slow, long), ANIMATION_DELAY (none, quick, standard, long, veryLong), STAGGER_DELAY (fast, standard, slow, hero), ANIMATION_DISTANCE (sm, md, lg, feature), and ANIMATION_PRESETS for common use cases.

#### _components/common/animations/types.ts {#desc-animation-types}
Shared types and utilities for animations. FAANG-level DRY implementation with centralized variant logic, easing presets (smooth, easeOut, aboutHero), reduced motion detection, and type-safe animation configuration. Eliminates duplication between Reveal and Stagger components. Includes getAnimationVariants utility function.

#### _components/common/animations/Reveal.tsx {#desc-reveal}
FAANG-level scroll-triggered reveal animation with full accessibility support. Features: Intersection Observer for performance, multiple variants (fade/slide/scale/blur), respects prefers-reduced-motion (system + user override), useMemo optimization, type-safe with no casting, GPU-accelerated transforms, will-change hints, custom easing support. WCAG 2.1 AAA compliant.

#### _components/common/animations/Stagger.tsx {#desc-stagger}
FAANG-level staggered entrance animation container following Apple/Stripe patterns. Features: Coordinated child animations with configurable delay, Intersection Observer, respects prefers-reduced-motion, DRY with shared variant logic, instant reveal for accessibility. Works with `StaggerItem` for elegant cascading reveals. StaggerItem supports custom duration and easing props for fine-grained control.

#### _components/ui/formFieldStyles.ts {#desc-ui-form-field-styles}
Style tokens for UI form fields (Tailwind classes).


### Layouts / Common

#### _components/layouts/PageContainer.tsx {#desc-page-container}
Page-level spacing and container constraints.

#### _components/layouts/PageLayout.tsx {#desc-page-layout}
Generic layout wrapper for content pages.

#### _components/layouts/ClientPageLayout.tsx {#desc-client-page-layout}
Client-rendering layout with providers and initializers.

#### _components/common/ServiceWorkerRegistration.tsx {#desc-sw-registration}
Registers the SW and handles updates.

#### _components/common/ToastProvider.tsx {#desc-toast-provider}
Theme-aware toast container component that automatically adapts react-toastify theme to current app theme. Client component that reads from useUserSettingsStore and uses ThemeHelper.getToastTheme() to determine if toasts should use 'light' or 'dark' theme. Re-renders only when theme changes (optimized selector). Features: automatic theme switching (dark/luxury/sunset → dark toasts, light/winter/corporate → light toasts), structured logging for theme changes (development only), respects reduced motion (delegated to notificationService), zero configuration for consumers. Pattern: Provider component wrapping ToastContainer with dynamic props. Replaces hardcoded theme="light" with reactive theme selection. Used in: app/layout.tsx (root level, single instance). Benefits: toasts feel native to current theme, perfect contrast in all themes, seamless theme transitions, FAANG-level UX.

#### _components/common/LoadingSpinner.tsx {#desc-loading-spinner}
Spinner component with size/variant props.

#### _components/common/EmptyState.tsx {#desc-empty-state}
Inline empty-state pattern (icon, text, action).

#### _components/common/OrderStatusBadge.tsx {#desc-order-status-badge}
Badge for order statuses based on enums.

#### _components/common/RoleBadge.tsx {#desc-role-badge}
Badge for user roles/permissions.

#### _components/common/UserSettingsInitializer.tsx {#desc-user-settings-initializer}
Bootstraps settings store on app mount/hydration.

#### _components/common/AuthInitializer.tsx {#desc-auth-initializer}
Bootstraps auth store/session on app mount.

#### _components/common/ImageServiceInitializer.tsx {#desc-image-service-initializer}
Ensures image services/hooks are wired before UI mounts.


### Data & Analytics

#### _shared/utils/analytics.ts {#desc-analytics-utils}
Thin wrapper to funnel analytics events; plug provider later.

#### _shared/hooks/useSectionMetrics.ts {#desc-use-section-metrics}
Collect section view/interaction metrics with thresholds.

#### _shared/hooks/useScrollProgress.ts {#desc-use-scroll-progress}
Reusable hook for calculating scroll progress (0-100%) with pixel-perfect scrollbar synchronization.

#### _shared/hooks/useScrollReveal.ts {#desc-use-scroll-reveal}
FAANG-optimized hook for scroll-triggered reveal animations. Uses shared IntersectionObserver pattern, requestAnimationFrame for smooth timing, and ref-based state management to prevent callback recreation. Supports staggered animations (default: 50ms), respects prefers-reduced-motion, and auto-unobserves after animation. Optimized for 100+ elements with minimal performance impact.

#### _shared/hooks/useGridColumns.ts {#desc-use-grid-columns}
Performance-optimized hook that returns responsive grid column count (1/2/3) based on viewport. Reduces media query listeners by consolidating column calculation logic. Returns: 1 (mobile <768px), 2 (tablet 768-1279px), 3 (desktop ≥1280px). SSR-safe with mobile-first defaults.

#### _shared/hooks/useSharedIntersectionObserver.ts {#desc-use-shared-intersection-observer}
Shared IntersectionObserver manager for efficient scroll detection across multiple elements. Industry best practice for 50+ elements.

#### _shared/utils/scrollUtils.ts {#desc-scroll-utils}
Helpers for smooth scrolling and element focus.

#### _shared/utils/businessHours.ts {#desc-business-hours}
Business hours calculation helpers for UI state.


### General Hooks

#### _shared/hooks/useDebounce.ts {#desc-use-debounce}
Debounce a changing value with cleanup.

#### _shared/hooks/useScrollSpy.ts {#desc-use-scroll-spy}
Observe which section is in view for navigation highlights.

#### _shared/hooks/useElementRefs.ts {#desc-use-element-refs}
Manage multiple refs as a keyed collection.

#### _shared/hooks/useKeyboardNavigation.ts {#desc-use-keyboard-navigation}
Keyboard navigation helpers for lists/grids.

#### _shared/hooks/useAdvancedLazyLoad.ts {#desc-use-advanced-lazy-load}
IntersectionObserver-based lazy loading for any element.

#### _shared/hooks/useServerTable.ts {#desc-use-server-table}
Server-backed table state helpers (pagination/sort/filter).


### Lib / Helpers / Scripts

#### _lib/index.ts {#desc-lib-index}
Re-exports library helpers (formatters, validators, browser utils).

#### _lib/formatters/* {#desc-lib-formatters}
Formatters for currency, dates, enums; built on `date-fns`.

#### _lib/dates/* {#desc-lib-dates}
Centralized date utilities module built on `date-fns`. Provides type-safe date parsing, formatting, serialization, manipulation, and validation across the application. Replaces manual date operations with consistent, immutable utilities following FAANG-level best practices. All date operations should use these utilities instead of native Date methods.

#### _helpers/icon-mapping.ts {#desc-icon-mapping}
Map domain/icon names to `lucide-react` icons.

#### _scripts/theme-init.ts {#desc-theme-init}
Client script to initialize theme on first paint.

#### _scripts/theme-init-inline.ts {#desc-theme-init-inline}
Inline-safe theme initializer for critical rendering path.


### App Routes (Template)

These provide a ready-made site shell; adjust content and keep structure.


---

If the “Church of God” project shares similar services/hooks/components, map them into these categories to maximize reuse. For any new reusable item, add it to the index and provide a brief description with an anchor entry.


