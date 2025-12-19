# Future Improvements & Technical Debt

> **Purpose**: This document tracks planned improvements, refactoring opportunities, and technical debt items for the MedSource Pro codebase. It serves as a roadmap for maintaining code quality, consistency, and following industry best practices.

> **Last Updated**: 2025-12-12  
> **Maintained By**: Development Team  
> **Status**: Active

---

## 📋 Table of Contents

- [Document Conventions](#document-conventions)
- [Priority Levels](#priority-levels)
- [Reusable Utilities & Hooks Integration](#reusable-utilities--hooks-integration)
- [Component Refactoring](#component-refactoring)
- [Performance Optimizations](#performance-optimizations)
- [Accessibility Enhancements](#accessibility-enhancements)
- [Architecture Improvements](#architecture-improvements)
- [MCP DevTools - Backend-Dependent Enhancements](#mcp-devtools---backend-dependent-enhancements)
- [Update Instructions](#update-instructions)

---

## Document Conventions

### Entry Format

Each improvement entry follows this structure:

```markdown
### [Component/Feature Name] - [Brief Description]

**Priority**: [P0/P1/P2/P3]  
**Category**: [Category Name]  
**Status**: [Not Started | In Progress | Blocked | Completed]  
**Estimated Effort**: [XS | S | M | L | XL]  
**Dependencies**: [List any dependencies]

**Description**:  
[Detailed description of the improvement]

**Current Implementation**:  
[What exists now]

**Proposed Solution**:  
[What should be changed]

**Benefits**:  
[Why this improvement matters]

**Implementation Notes**:  
[Specific technical details, code examples, considerations]

**Related Files**:  
- `path/to/file1.tsx`
- `path/to/file2.ts`

**References**:  
[Links to related issues, PRs, or documentation]
```

### Status Definitions

- **Not Started**: Not yet begun
- **In Progress**: Currently being worked on
- **Blocked**: Waiting on dependencies or decisions
- **Completed**: Finished and merged
- **Deferred**: Postponed to a later date

### Priority Levels

- **P0**: Critical - Security, data loss, or major bugs
- **P1**: High - Significant UX/performance impact
- **P2**: Medium - Quality of life improvements
- **P3**: Low - Nice to have, polish

### Effort Estimates

- **XS**: < 1 hour
- **S**: 1-4 hours
- **M**: 4-8 hours
- **L**: 1-2 days
- **XL**: > 2 days

---

## Reusable Utilities & Hooks Integration

This section tracks opportunities to integrate newly created reusable utilities and hooks into existing components for consistency and DRY principles.

---

### Carousel Component - Keyboard Navigation Hook Integration

**Priority**: P2  
**Category**: Reusable Hooks Integration  
**Status**: Not Started  
**Estimated Effort**: S  
**Dependencies**: `useKeyboardNavigation` hook (completed)

**Description**:  
Refactor the Carousel component to use the `useKeyboardNavigation` hook instead of inline keyboard event handling. This will ensure consistent keyboard navigation behavior across all components and reduce code duplication.

**Current Implementation**:  
The Carousel component (`app/_components/ui/Carousel/Carousel.tsx`) has inline keyboard navigation logic for arrow keys (lines 189-193). This duplicates the pattern that's now available in `useKeyboardNavigation`.

**Proposed Solution**:  
1. Import `useKeyboardNavigation` from `@_shared/hooks`
2. Replace inline keyboard handling with the hook
3. Configure hook with carousel slides as items
4. Map arrow keys to `scrollPrev`/`scrollNext` functions

**Benefits**:  
- Consistent keyboard navigation across components
- Reduced code duplication (DRY)
- Easier maintenance (single source of truth)
- Better testability

**Implementation Notes**:  
```tsx
// Example integration
const { handleKeyDown } = useKeyboardNavigation({
  items: slides,
  getItemId: (slide) => slide.id,
  onSelect: (slide, index) => {
    emblaApi?.scrollTo(index)
  },
  preventDefault: true,
  wrapAround: true,
})
```

**Related Files**:  
- `app/_components/ui/Carousel/Carousel.tsx`
- `app/_shared/hooks/useKeyboardNavigation.ts`

**References**:  
- See `ScrollIntoViewComponent.tsx` for reference implementation

---

### Accordion Component - Keyboard Navigation Hook Integration

**Priority**: P2  
**Category**: Reusable Hooks Integration  
**Status**: Not Started  
**Estimated Effort**: M  
**Dependencies**: `useKeyboardNavigation` hook (completed)

**Description**:  
Refactor the Accordion component to use the `useKeyboardNavigation` hook for consistency. The Accordion already has keyboard navigation (ArrowUp/ArrowDown, Home/End), but using the shared hook will ensure consistent behavior and easier maintenance.

**Current Implementation**:  
The Accordion component (`app/_components/ui/Accordion.tsx`) has keyboard navigation in `AccordionTrigger` (lines 487-501) with custom logic for ArrowUp/ArrowDown, Home, and End keys.

**Proposed Solution**:  
1. Evaluate if `useKeyboardNavigation` can replace the current implementation
2. Consider that Accordion uses `focusNext`/`focusPrevious` from `useAccordion` hook
3. May need to adapt the hook or create a wrapper that integrates with `useAccordion`
4. Ensure accessibility (ARIA) is maintained

**Benefits**:  
- Consistent keyboard navigation patterns
- Easier to maintain and test
- Better alignment with codebase standards

**Implementation Notes**:  
- The Accordion has a more complex navigation model (focus management via `useAccordion`)
- May need to create a specialized version or adapter
- Ensure `focusNext`/`focusPrevious` from `useAccordion` are still called correctly

**Related Files**:  
- `app/_components/ui/Accordion.tsx`
- `app/_shared/hooks/useAccordion.ts`
- `app/_shared/hooks/useKeyboardNavigation.ts`

**References**:  
- Current Accordion keyboard implementation (lines 487-501)

---

### SettingsModal - Element Refs Hook Integration

**Priority**: P2  
**Category**: Reusable Hooks Integration  
**Status**: Not Started  
**Estimated Effort**: XS  
**Dependencies**: `useElementRefs` hook (completed)

**Description**:  
Replace manual Map-based ref management in SettingsModal with the `useElementRefs` hook for cleaner, more maintainable code.

**Current Implementation**:  
SettingsModal (`app/_components/settings/SettingsModal.tsx`) uses manual ref management:
```tsx
const sectionButtonRefs = useRef<Map<string, HTMLButtonElement>>(new Map())
```

**Proposed Solution**:  
1. Replace with `useElementRefs<HTMLButtonElement>()`
2. Use `getRef()` for ref callbacks
3. Use `getElement()` when needed for focus management
4. Remove manual Map management code

**Benefits**:  
- Cleaner code
- Consistent ref management pattern
- Automatic cleanup
- Better type safety

**Implementation Notes**:  
```tsx
// Before
const sectionButtonRefs = useRef<Map<string, HTMLButtonElement>>(new Map())

// After
const { getRef: getSectionButtonRef, getElement: getSectionButton } = useElementRefs<HTMLButtonElement>()
```

**Related Files**:  
- `app/_components/settings/SettingsModal.tsx`
- `app/_shared/hooks/useElementRefs.ts`

**References**:  
- See `ScrollIntoViewComponent.tsx` for reference implementation

---

### ImageGallery / ImageLightbox - Keyboard Navigation Hook Integration

**Priority**: P2  
**Category**: Reusable Hooks Integration  
**Status**: Not Started  
**Estimated Effort**: S  
**Dependencies**: `useKeyboardNavigation` hook (completed)

**Description**:  
Refactor ImageGallery and ImageLightbox components to use `useKeyboardNavigation` for arrow key navigation between images. This will provide consistent keyboard behavior and reduce code duplication.

**Current Implementation**:  
Both components have inline keyboard handling:
- `ImageGallery.tsx` (lines 269-272): ArrowLeft/ArrowRight for navigation
- `ImageLightbox.tsx` (lines 212-215): ArrowLeft/ArrowRight for navigation

**Proposed Solution**:  
1. Import `useKeyboardNavigation` hook
2. Configure with image items
3. Map arrow keys to next/previous image functions
4. Maintain existing functionality (zoom, close, etc.)

**Benefits**:  
- Consistent keyboard navigation
- Reduced code duplication
- Easier to maintain
- Better accessibility

**Implementation Notes**:  
```tsx
const { handleKeyDown } = useKeyboardNavigation({
  items: images,
  getItemId: (img) => img.id,
  onSelect: (image, index) => {
    setCurrentIndex(index)
  },
  preventDefault: true,
  wrapAround: true,
})
```

**Related Files**:  
- `app/_components/store/ImageGallery.tsx`
- `app/_components/ui/ImageLightbox.tsx`
- `app/_shared/hooks/useKeyboardNavigation.ts`

**References**:  
- Current implementations in ImageGallery and ImageLightbox

---

### Scroll-to-Section Features - Scroll Utilities Integration

**Priority**: P2  
**Category**: Reusable Utilities Integration  
**Status**: Not Started  
**Estimated Effort**: S  
**Dependencies**: `scrollUtils` (completed)

**Description**:  
Audit the codebase for any scroll-to-section or anchor link functionality and refactor to use `scrollUtils` for consistency. This includes any components that scroll to elements, calculate offsets, or read CSS variables for scroll positioning.

**Current Implementation**:  
- `ScrollIntoViewComponent` already uses `scrollUtils` (completed)
- Other components may have inline scroll logic

**Proposed Solution**:  
1. Search codebase for `scrollTo`, `scrollIntoView`, `getBoundingClientRect` usage
2. Identify components with scroll logic
3. Refactor to use `scrollUtils` functions:
   - `scrollToElement()` for scrolling
   - `getCSSVariable()` for reading CSS variables
   - `calculateScrollOffset()` for offset calculations
   - `prefersReducedMotion()` for motion preferences

**Benefits**:  
- Consistent scroll behavior
- Single source of truth
- Better maintainability
- Reduced code duplication

**Implementation Notes**:  
Search patterns:
- `window.scrollTo`
- `element.scrollIntoView`
- `getComputedStyle.*getPropertyValue`
- `--nav-height` or other CSS variable reads

**Related Files**:  
- Any component with scroll-to-section functionality
- `app/_shared/utils/scrollUtils.ts`

**References**:  
- See `ScrollIntoViewComponent.tsx` for reference implementation

---

## Component Refactoring

This section tracks component-level refactoring opportunities for better architecture, maintainability, and consistency.

---

### OptimizedImage / ProductImage - Next.js 15 Async Client Component Error Fix

**Priority**: P1  
**Category**: Component Refactoring / Bug Fix  
**Status**: ✅ COMPLETED  
**Estimated Effort**: M  
**Dependencies**: Next.js 15 compatibility research, potential Next.js Image API changes

**Description**:  
Fix the "An unknown Component is an async Client Component" error that occurs when using `OptimizedImage` (which wraps Next.js `Image` component) within Client Components rendered in lists. This error prevents the use of optimized image loading in product grids and other list-based components.

---

## ✅ RESOLUTION (Completed December 7, 2025)

### Root Cause Identified

The error was **NOT** in the Next.js Image component or OptimizedImage. The root cause was in `ImagePlaceholder.tsx`:

```tsx
// BUG: Line 132 had an erroneous `async` keyword
const getIcon = async () => {  // ❌ This returned a Promise, not a ReactNode!
    if (variant === 'icon' && icon) {
        return icon
    }
    // ...
}

// When used in JSX:
{getIcon()}  // ❌ React saw a Promise and detected "async" behavior
```

The `async` keyword made `getIcon()` return a **Promise** instead of a **ReactNode**. When this Promise was rendered in JSX, React/Next.js 15 interpreted it as an async Client Component and threw the error.

### Fix Applied

**File:** `app/_components/images/ImagePlaceholder.tsx`

```tsx
// BEFORE (Bug)
const getIcon = async () => { ... }

// AFTER (Fixed)  
const getIcon = (): React.ReactNode => { ... }
```

### Full Implementation Restored

With the root cause fixed, the following components now work correctly together:

1. **`ImagePlaceholder`** - Fixed synchronous `getIcon()` function
2. **`OptimizedImage`** - Uses Next.js `Image` with `fill` prop (no changes needed)
3. **`ProductImage`** - Wrapper for product images (no changes needed)
4. **`ProductCard`** - Now uses `ProductImage` instead of native `<img>` workaround
5. **`StoreProductGrid`** - Now uses `ScrollRevealCard` wrapper for animations
6. **`ScrollRevealCard`** - Provides elegant scroll-reveal animations

### Benefits Restored

- ✅ Next.js Image optimization (automatic WebP/AVIF, responsive images)
- ✅ Lazy loading with blur placeholder
- ✅ Image preloading on hover
- ✅ Error recovery with retry logic
- ✅ Performance analytics tracking
- ✅ Elegant scroll-reveal animations
- ✅ Improved Core Web Vitals (LCP, CLS)

### Key Learnings

1. **Async functions in JSX**: Never use `async` keyword on functions called directly in JSX
2. **Next.js 15 strictness**: Next.js 15 has stricter detection of async patterns in Client Components
3. **Debug methodology**: When facing "async Client Component" errors, search for `async` keywords in all components in the render tree

### Testing Verification

- [x] `Image` component with `fill` prop works in Client Component lists
- [x] `ProductCard` renders correctly with `ProductImage`
- [x] `ScrollRevealCard` animations work correctly
- [x] No console errors or warnings
- [x] Image optimization (WebP, responsive sizing) is working

**Completion Date**: December 7, 2025

---

## Original Issue Documentation (for reference)

**Original Error**:
```
Uncaught Error: An unknown Component is an async Client Component. 
Only Server Components can be async at the moment. 
This error is often caused by accidentally adding `'use client'` to a module 
that was originally written for the server.
```

**Original Workaround** (now removed):  
`ProductCard` used a native `<img>` tag instead of `ProductImage`/`OptimizedImage`. This workaround has been removed and the full implementation restored.

**Related Files**:  
- `app/_components/images/ImagePlaceholder.tsx` ← ROOT CAUSE FIXED HERE
- `app/_components/images/OptimizedImage.tsx` (no changes needed)
- `app/_components/store/ProductImage.tsx` (no changes needed)
- `app/_components/store/ProductCard.tsx` (restored ProductImage usage)
- `app/_components/store/StoreProductGrid.tsx` (restored ScrollRevealCard)
- `app/store/page.tsx` (no changes needed)

---

### SafeHtmlContent - Security Hardening & FAANG-Level Enhancements

**Priority**: P0  
**Category**: Component Refactoring / Security  
**Status**: Not Started  
**Estimated Effort**: M  
**Dependencies**: `isomorphic-dompurify` package installation

**Description**:  
Enhance the `SafeHtmlContent` component with client-side HTML sanitization, error boundaries, performance optimizations, and accessibility features to meet FAANG-level security and quality standards. The current implementation lacks critical security layers and needs hardening before production use.

**Current Implementation**:  
The `SafeHtmlContent` component (`app/_components/ui/SafeHtmlContent.tsx`) currently:
- Renders HTML content via `dangerouslySetInnerHTML` without client-side sanitization
- Relies entirely on backend trust for security
- Has basic fallback handling for empty content
- No error boundaries for malformed HTML
- No performance optimizations (lazy loading, length limits)
- No accessibility features (ARIA attributes, WCAG compliance)
- No content validation before rendering

**Proposed Solution**:  

**Phase 1: Critical Security (IMMEDIATE - P0)**
1. Install `isomorphic-dompurify` for SSR/CSR compatibility
2. Add client-side sanitization with strict configuration
3. Implement error boundaries for graceful failure handling
4. Add comprehensive security tests (XSS prevention, content validation)
5. Verify backend sanitization is working correctly

**Phase 2: Enhanced Features (HIGH PRIORITY - P1)**
1. Add Content Security Policy (CSP) verification
2. Implement performance optimizations (content length limits, lazy loading)
3. Add error recovery mechanisms
4. Enhance logging and monitoring

**Phase 3: Advanced Features (MEDIUM PRIORITY - P2)**
1. Add accessibility features (ARIA attributes, WCAG AA compliance)
2. Implement content structure validation
3. Add allowlists for tags/attributes
4. Performance monitoring and analytics

**Phase 4: Enterprise Features (LOW PRIORITY - P3)**
1. Advanced sanitization rules per content type
2. Caching and SSR optimization
3. CDN integration for static content
4. Enhanced developer experience

**Benefits**:  
- **Security**: Defense-in-depth with client-side sanitization prevents XSS attacks
- **Reliability**: Error boundaries prevent component crashes from malformed HTML
- **Performance**: Optimizations ensure fast rendering even with large content
- **Accessibility**: WCAG AA compliance improves user experience for all users
- **Maintainability**: Centralized security logic easier to audit and update
- **FAANG-Level**: Meets industry best practices for HTML content rendering

**Implementation Notes**:  

**Required Dependency**:
```json
{
  "dependencies": {
    "isomorphic-dompurify": "^2.9.0"
  }
}
```

**Enhanced Component Structure**:
```tsx
interface SafeHtmlContentProps extends Omit<HTMLAttributes<HTMLDivElement>, 'content'> {
  content: string | null | undefined
  fallback?: string
  renderAsHtml?: boolean
  
  // NEW: Security options
  sanitize?: boolean // Default: true
  allowedTags?: string[] // Custom allowlist
  allowedAttributes?: string[] // Custom attribute allowlist
  
  // NEW: Performance options
  lazyLoad?: boolean // Lazy load large content
  maxLength?: number // Truncate very long content
  
  // NEW: Accessibility
  ariaLabel?: string
  role?: string
  
  // NEW: Error handling
  onError?: (error: Error) => void
}
```

**Sanitization Configuration** (FAANG Pattern):
```tsx
const config: DOMPurify.Config = {
  ALLOWED_TAGS: allowedTags || [
    'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'a', 'blockquote', 'code', 'pre', 'img'
  ],
  ALLOWED_ATTR: allowedAttributes || [
    'href', 'src', 'alt', 'title', 'class', 'id'
  ],
  ALLOW_DATA_ATTR: false, // Security: No data attributes
  KEEP_CONTENT: true, // Keep text content even if tags are removed
  RETURN_DOM: false, // Return string, not DOM
  SANITIZE_DOM: true, // Additional DOM sanitization
}
```

**Error Boundary Wrapper**:
```tsx
// Wrap SafeHtmlContent in error boundary
<ErrorBoundary
  fallback={<div>Content could not be rendered</div>}
  onError={(error) => logger.error('HTML rendering failed', { error })}
>
  <SafeHtmlContent content={product.description} />
</ErrorBoundary>
```

**Security Test Examples**:
```tsx
describe('SafeHtmlContent Security', () => {
  it('should sanitize script tags', () => {
    const malicious = '<script>alert("XSS")</script><p>Safe content</p>'
    const result = render(<SafeHtmlContent content={malicious} />)
    expect(result.container.innerHTML).not.toContain('<script>')
    expect(result.container.innerHTML).toContain('Safe content')
  })
  
  it('should sanitize event handlers', () => {
    const malicious = '<img src="x" onerror="alert(1)">'
    const result = render(<SafeHtmlContent content={malicious} />)
    expect(result.container.innerHTML).not.toContain('onerror')
  })
  
  it('should sanitize javascript: URLs', () => {
    const malicious = '<a href="javascript:alert(1)">Click</a>'
    const result = render(<SafeHtmlContent content={malicious} />)
    expect(result.container.innerHTML).not.toContain('javascript:')
  })
})
```

**Performance Optimization**:
```tsx
// Memoize sanitized content to avoid re-sanitization
const sanitizedContent = useMemo(() => {
  if (!content || !renderAsHtml || !sanitize) return content
  return DOMPurify.sanitize(content, config)
}, [content, renderAsHtml, sanitize, config])

// Apply length limit
const finalContent = maxLength && sanitizedContent.length > maxLength
  ? `${sanitizedContent.substring(0, maxLength)}...`
  : sanitizedContent
```

**Accessibility Enhancements**:
```tsx
<div
  className={className}
  role={role || 'article'} // Default semantic role
  aria-label={ariaLabel}
  aria-live="polite" // For dynamic content
  // ... rest of props
>
```

**Comparison to FAANG Standards**:
- **Meta/Facebook**: Uses DOMPurify + CSP + server-side sanitization
- **Google**: Uses isomorphic-dompurify + strict CSP + content validation
- **Netflix**: Multi-layer sanitization + performance optimization
- **Amazon**: DOMPurify + CSP + accessibility compliance

**Current FAANG-Level Score**: 6/10
- Architecture: 8/10 ✅
- Security: 3/10 ❌ (Critical gap - no client-side sanitization)
- Performance: 5/10 ⚠️
- Accessibility: 4/10 ⚠️
- Documentation: 8/10 ✅

**Target Score After Implementation**: 9/10

**Related Files**:  
- `app/_components/ui/SafeHtmlContent.tsx` (current implementation)
- `app/store/product/[id]/page.tsx` (primary usage)
- `app/_classes/Product.ts` (content source)
- `SAFEHTML_CONTENT_ANALYSIS.md` (detailed analysis document)

**References**:  
- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [DOMPurify Documentation](https://github.com/cure53/DOMPurify)
- [isomorphic-dompurify](https://github.com/kkomelin/isomorphic-dompurify)
- [W3C Content Security Policy](https://www.w3.org/TR/CSP3/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- See `SAFEHTML_CONTENT_ANALYSIS.md` for complete FAANG-level analysis

**Completion Date**: TBD

---

### LiveChatBubble - Real-Time Chat Service Integration

**Priority**: P2  
**Category**: Feature Enhancement  
**Status**: Not Started  
**Estimated Effort**: L  
**Dependencies**: Third-party chat service selection (Intercom, Drift, Crisp, or custom)

**Description**:  
Integrate a real-time live chat service into the LiveChatBubble component to enable instant customer communication. The UI scaffold is already in place with a "Coming Soon" placeholder - this enhancement will connect it to an actual chat backend.

**Current Implementation**:  
The `LiveChatBubble` component (`app/_components/ui/LiveChatBubble.tsx`) is a fully functional UI component with:
- Fixed position bubble in bottom-right corner
- "Coming Soon" tooltip on click
- Unread message badge support (UI ready)
- Smooth animations and transitions
- Mobile-first responsive design
- Full accessibility (WCAG 2.1 AA)
- Performance optimized

Currently displayed in the ContactUs section as an alternative to form-based contact methods.

**Proposed Solution**:  

**Option 1: Third-Party Service (Recommended)**
1. **Intercom** (https://www.intercom.com)
   - Pros: Enterprise-ready, rich features, great analytics
   - Cons: Higher cost, potential data privacy concerns
   - Integration: Script tag + React wrapper

2. **Drift** (https://www.drift.com)
   - Pros: Sales-focused, good for B2B, conversation routing
   - Cons: Premium pricing
   - Integration: Script tag + React wrapper

3. **Crisp** (https://crisp.chat)
   - Pros: Affordable, good features, easy integration
   - Cons: Less enterprise-focused
   - Integration: Script tag + React wrapper

4. **Tawk.to** (https://www.tawk.to)
   - Pros: Free tier, easy setup
   - Cons: Less polished UI
   - Integration: Script tag + React wrapper

**Option 2: Custom Solution**
1. Build WebSocket-based chat with Socket.io
2. Create backend chat service with message persistence
3. Implement operator dashboard
4. Add typing indicators, file uploads, etc.

**Recommended Approach**: Start with Crisp or Tawk.to for MVP, upgrade to Intercom/Drift when scaling.

**Implementation Steps**:
1. Choose and sign up for chat service
2. Create `useLiveChat` hook to manage chat state
3. Update `LiveChatBubble` to connect to chat service
4. Add chat window component (expandable from bubble)
5. Implement unread message badge with real data
6. Add operator status (online/offline)
7. Set up chat routing rules
8. Configure business hours integration
9. Add analytics tracking for chat interactions
10. Test across devices and browsers

**Benefits**:  
- Real-time customer support
- Reduced response times
- Better customer engagement
- Lead capture during browsing
- Proactive outreach capabilities
- Analytics on customer questions
- Integration with CRM/support tools

**Implementation Notes**:  

**Example: Intercom Integration**
```tsx
// hooks/useLiveChat.ts
import { useEffect } from 'react'

export function useLiveChat() {
  useEffect(() => {
    // Load Intercom
    window.Intercom('boot', {
      app_id: process.env.NEXT_PUBLIC_INTERCOM_APP_ID,
      // user data
    })

    return () => {
      window.Intercom('shutdown')
    }
  }, [])

  const openChat = () => {
    window.Intercom('show')
  }

  const getUnreadCount = () => {
    return window.Intercom('getUnreadCount')
  }

  return { openChat, getUnreadCount }
}
```

**Example: LiveChatBubble Update**
```tsx
// Update LiveChatBubble.tsx
import { useLiveChat } from '@_shared/hooks/useLiveChat'

export default function LiveChatBubble({ ... }: LiveChatBubbleProps) {
  const { openChat, getUnreadCount } = useLiveChat()
  const unreadCount = getUnreadCount()

  const handleClick = () => {
    openChat()
    // Track analytics
    trackEvent('live_chat_opened', { ... })
  }

  // ... rest of component
}
```

**Analytics Events to Add**:
- `live_chat_opened` - When user opens chat
- `live_chat_message_sent` - When user sends message
- `live_chat_closed` - When user closes chat
- `live_chat_operator_joined` - When operator joins conversation

**Configuration Considerations**:
- Business hours visibility (hide/show based on availability)
- Welcome message customization
- Proactive message triggers (time on page, exit intent)
- Mobile vs desktop experience
- Chat history persistence
- Multi-language support
- GDPR compliance (data handling, consent)

**Testing Checklist**:
- [ ] Chat opens correctly on all devices
- [ ] Unread badge updates in real-time
- [ ] Messages sent and received successfully
- [ ] Typing indicators work
- [ ] File uploads work (if supported)
- [ ] Chat persists across page navigation
- [ ] Accessibility with screen readers
- [ ] Performance impact minimal
- [ ] Analytics events fire correctly
- [ ] Works with ad blockers (fallback)

**Related Files**:  
- `app/_components/ui/LiveChatBubble.tsx` (current UI)
- `app/_components/landing/ContactUs.tsx` (integration point)
- `app/_shared/utils/analytics.ts` (event tracking)
- `app/_shared/hooks/useLiveChat.ts` (future hook)

**References**:  
- Intercom React Integration: https://developers.intercom.com/installing-intercom/docs/intercom-for-web
- Drift React Integration: https://devdocs.drift.com/docs/react-drift
- Crisp React Integration: https://docs.crisp.chat/guides/chatbox-sdks/web-sdk/dollar-crisp/
- Industry Best Practices: https://www.intercom.com/blog/live-chat-best-practices/

**Completion Date**: TBD

---

## Performance Optimizations

This section tracks performance improvement opportunities.

---

## Accessibility Enhancements

This section tracks accessibility improvements and WCAG compliance enhancements.

---

## Architecture Improvements

This section tracks larger architectural changes and improvements.

---

### Account Status Management - Unified DTO Pattern Consideration

**Priority**: P3  
**Category**: Architecture Improvement / API Design  
**Status**: Not Started  
**Estimated Effort**: S  
**Dependencies**: None (optional refactoring)

**Description**:  
Consider consolidating account status change endpoints into a single endpoint using a unified DTO pattern. Currently, each status change operation (suspend, activate, unlock, archive, restore, force-password-change) has its own dedicated endpoint. While this approach is explicit and RESTful, a unified DTO approach could simplify the API surface and provide more flexibility.

**Current Implementation**:  
Account status management uses separate endpoints:
- `PUT /account/{id}/suspend` - Takes `SuspendAccountRequest` DTO with `Reason` field
- `PUT /account/{id}/activate` - No request body
- `PUT /account/{id}/unlock` - No request body
- `PUT /account/{id}/archive` - No request body
- `PUT /account/{id}/restore` - No request body
- `PUT /account/{id}/force-password-change` - No request body

Each endpoint has separate authorization checks, validation, and routes to corresponding `AccountService` methods.

**Proposed Solution**:  
Consolidate into a single endpoint with a unified DTO:

```csharp
// Unified DTO
public class ChangeAccountStatusRequest
{
    public AccountStatus Status { get; set; }
    public string? Reason { get; set; } // Optional, for suspend operations
}

// Single endpoint
[HttpPut("/account/{id}/status")]
public async Task<IResponse<bool>> ChangeAccountStatus(
    int id, 
    [FromBody] ChangeAccountStatusRequest request)
{
    // Route to appropriate service method based on request.Status
    // Handle optional reason for suspend
}
```

**Benefits**:  
- **Simpler API surface**: One endpoint instead of six
- **More flexible**: Easier to add new status types without new endpoints
- **Consistent pattern**: All status changes use the same contract
- **Frontend simplification**: Single API call pattern for all status changes

**Trade-offs & Considerations**:  
- **Less RESTful**: Status is a property, not a resource, so separate endpoints are more RESTful
- **Less explicit**: Separate endpoints make operations clearer in API documentation
- **Current pattern is consistent**: Similar to `/account/{id}/role` endpoint pattern
- **Matches existing patterns**: `ProvidersController` uses separate suspend/activate endpoints

**Recommendation**:  
The current implementation is **appropriate** for the following reasons:
1. Follows existing codebase patterns (see `ProvidersController.SuspendProvider`)
2. More explicit and self-documenting (each operation is clear)
3. Aligns with REST principles (each operation is a distinct action)
4. Easier to apply different validation/permission rules per operation
5. Matches the pattern used for role changes (`/account/{id}/role`)

**When to Consider Refactoring**:  
- If adding many more status types in the future (currently 6 statuses)
- If status change logic becomes more complex and needs shared validation
- If API surface reduction becomes a priority
- If frontend requests consolidation

**Implementation Notes**:  
If refactoring:
- Maintain backward compatibility with deprecated endpoints (mark as `[Obsolete]`)
- Add comprehensive validation in the unified endpoint
- Document status-to-method routing clearly
- Consider using a strategy pattern for status-specific logic
- Ensure frontend migration is straightforward

**Current Approach Score**: 8/10 ✅
- Follows existing patterns: 9/10
- RESTfulness: 9/10
- Maintainability: 8/10
- API clarity: 9/10
- Flexibility: 7/10

**Related Files**:  
- `server/Controllers/AccountController.cs` (status management endpoints)
- `server/Controllers/ProvidersController.cs` (similar pattern reference)
- `server/Services/DB/AccountService.cs` (status management methods)

**References**:  
- REST API Design: Resource vs Action endpoints
- See `ProvidersController` for similar multi-endpoint pattern

**Completion Date**: TBD (low priority, optional improvement)

---

## MCP DevTools - Backend-Dependent Enhancements

This section documents powerful MCP DevTools features that require Next.js server-side (backend) changes. These enhancements would transform the DevTools from a debugging interface into a comprehensive Developer Command Center.

> **Note**: These features require modifications to `pages/api/mcp.ts` (or equivalent MCP server route) and potentially new API routes. The frontend components in `McpChatInterface.tsx` are already architected to support these extensions.

---

### MCP DevTools - Custom Tool Registration System

**Priority**: P2  
**Category**: Architecture Enhancement / Developer Experience  
**Status**: Not Started  
**Estimated Effort**: XL  
**Dependencies**: MCP server route modifications, tool registry storage, validation middleware

**Description**:  
Enable developers to register custom MCP tools at runtime without modifying server code. This would allow teams to create project-specific debugging tools, custom data fetchers, and workflow automation scripts that integrate seamlessly into the DevTools interface.

**Current Implementation**:  
The MCP server (`pages/api/mcp.ts`) has a fixed set of tools defined at compile time. Developers cannot add new tools without modifying server code and redeploying.

**Proposed Solution**:  

**Phase 1: Tool Definition API**
1. Create `POST /api/mcp/tools` endpoint for registering custom tools
2. Define tool schema specification (name, description, inputSchema, handler)
3. Store tool definitions in-memory or persist to database/file
4. Validate tool schemas against JSON Schema draft-07

**Phase 2: Secure Execution Environment**
1. Implement sandboxed execution for custom tool handlers
2. Add rate limiting and timeout controls
3. Create permission system (read-only vs. write access)
4. Log all custom tool executions for audit

**Phase 3: Frontend Integration**
1. Add "Register Tool" UI in DevTools preferences
2. Create tool definition wizard with schema builder
3. Support importing tools from JSON/YAML files
4. Enable tool sharing via export/import

**Benefits**:  
- Project-specific debugging without core code changes
- Team customization of developer workflows
- Rapid prototyping of debugging utilities
- Reduced development friction for specialized tools
- Plugin ecosystem potential

**Implementation Notes**:  

**Tool Definition Schema**:
```typescript
interface CustomToolDefinition {
  name: string // Unique tool identifier
  description: string // Human-readable description
  inputSchema: JSONSchema // JSON Schema for parameters
  handler: string // JavaScript code (sandboxed execution)
  permissions: ('read' | 'write' | 'network' | 'fs')[]
  timeout: number // Max execution time in ms
  createdBy: string // Developer identifier
  createdAt: Date
}
```

**Example Registration API**:
```typescript
// POST /api/mcp/tools
export async function POST(req: Request) {
  const tool = await req.json() as CustomToolDefinition
  
  // Validate schema
  if (!validateToolSchema(tool)) {
    return Response.json({ error: 'Invalid tool schema' }, { status: 400 })
  }
  
  // Sandbox validation (ensure handler is safe)
  const { safe, issues } = await validateHandler(tool.handler)
  if (!safe) {
    return Response.json({ error: 'Handler validation failed', issues }, { status: 400 })
  }
  
  // Register tool
  await toolRegistry.register(tool)
  
  return Response.json({ success: true, toolId: tool.name })
}
```

**Sandboxed Execution** (using VM2 or isolated-vm):
```typescript
import { VM } from 'vm2'

async function executeCustomTool(tool: CustomToolDefinition, args: unknown) {
  const vm = new VM({
    timeout: tool.timeout,
    sandbox: {
      args,
      console: createSafeConsole(),
      fetch: tool.permissions.includes('network') ? safeFetch : undefined,
      // Limited API surface
    }
  })
  
  return vm.run(tool.handler)
}
```

**Security Considerations**:
- Never execute arbitrary code outside sandbox
- Implement code signing for trusted tools
- Rate limit tool executions per user/session
- Audit log all custom tool invocations
- Implement tool approval workflow for teams

**Related Files**:  
- `pages/api/mcp.ts` (current MCP server)
- `app/_components/ui/McpChatInterface.tsx` (frontend)
- `app/_shared/hooks/useMcpChat.ts` (communication hook)

**References**:  
- [Model Context Protocol Specification](https://modelcontextprotocol.io/)
- [VM2 Sandbox Library](https://github.com/patriksimek/vm2)
- [JSON Schema Specification](https://json-schema.org/)

---

### MCP DevTools - AI-Assisted Debugging Integration

**Priority**: P2  
**Category**: Feature Enhancement / AI Integration  
**Status**: Not Started  
**Estimated Effort**: XL  
**Dependencies**: AI provider API keys (OpenAI, Anthropic, or local LLM), backend API routes, token budget management

**Description**:  
Integrate AI language models into the DevTools to provide intelligent error analysis, code suggestions, and automated debugging workflows. The AI would analyze error stacks, component state, and codebase context to suggest fixes.

**Current Implementation**:  
The DevTools displays errors and logs but requires manual interpretation. Developers must copy error messages to external AI tools for analysis.

**Proposed Solution**:  

**Phase 1: Error Analysis**
1. Create `/api/mcp/ai/analyze-error` endpoint
2. Integrate with OpenAI/Anthropic API
3. Send error context (stack trace, component tree, recent logs)
4. Return structured analysis with suggested fixes

**Phase 2: Code Suggestions**
1. Add "Explain" button to error cards
2. Generate code snippets for common fixes
3. Provide diff previews for suggested changes
4. Support one-click apply (with git safety)

**Phase 3: Proactive Debugging**
1. Analyze patterns across multiple errors
2. Detect anti-patterns in component structure
3. Suggest performance optimizations
4. Identify potential memory leaks

**Benefits**:  
- Faster debugging with AI-generated insights
- Learning opportunity for junior developers
- Consistent error resolution patterns
- Reduced time-to-fix for complex issues
- Context-aware suggestions (knows your codebase)

**Implementation Notes**:  

**AI Analysis Endpoint**:
```typescript
// POST /api/mcp/ai/analyze-error
export async function POST(req: Request) {
  const { error, stackTrace, componentTree, recentLogs } = await req.json()
  
  const prompt = buildErrorAnalysisPrompt({
    error,
    stackTrace,
    componentTree,
    recentLogs,
    projectContext: await getProjectContext()
  })
  
  const analysis = await openai.chat.completions.create({
    model: 'gpt-4-turbo',
    messages: [
      { role: 'system', content: DEBUGGER_SYSTEM_PROMPT },
      { role: 'user', content: prompt }
    ],
    response_format: { type: 'json_object' }
  })
  
  return Response.json(JSON.parse(analysis.choices[0].message.content))
}
```

**Analysis Response Schema**:
```typescript
interface AIErrorAnalysis {
  summary: string // One-line explanation
  rootCause: string // Likely cause
  explanation: string // Detailed technical explanation
  suggestions: {
    description: string
    code?: string // Code fix if applicable
    file?: string // File to modify
    confidence: 'high' | 'medium' | 'low'
  }[]
  relatedDocs: string[] // Links to relevant documentation
  preventionTips: string[] // How to avoid in future
}
```

**Frontend Integration** (McpChatInterface.tsx):
```tsx
function ErrorCard({ error }: { error: McpError }) {
  const [analysis, setAnalysis] = useState<AIErrorAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  
  const analyzeWithAI = async () => {
    setLoading(true)
    const result = await fetch('/api/mcp/ai/analyze-error', {
      method: 'POST',
      body: JSON.stringify({ error, stackTrace: error.stack })
    }).then(r => r.json())
    setAnalysis(result)
    setLoading(false)
  }
  
  return (
    <div className="error-card">
      {/* Error display */}
      <Button onClick={analyzeWithAI} disabled={loading}>
        {loading ? <Spinner /> : <Sparkles />} Analyze with AI
      </Button>
      {analysis && <AIAnalysisPanel analysis={analysis} />}
    </div>
  )
}
```

**Cost Management**:
- Implement token budget per session/day
- Cache common error analyses
- Use smaller models for initial triage
- Escalate to GPT-4 only for complex issues

**Privacy Considerations**:
- Strip sensitive data before sending to AI
- Option to use local LLMs (Ollama, LM Studio)
- Audit log all AI queries
- Clear data retention policies

**Related Files**:  
- `pages/api/mcp.ts` (MCP server)
- `app/_components/ui/McpChatInterface.tsx` (frontend)
- New: `pages/api/mcp/ai/analyze-error.ts`
- New: `app/_lib/ai/debugger-prompts.ts`

**References**:  
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Anthropic Claude API](https://docs.anthropic.com/)
- [Ollama Local LLM](https://ollama.ai/)

---

### MCP DevTools - Real-Time Log Streaming

**Priority**: P1  
**Category**: Feature Enhancement / Developer Experience  
**Status**: Not Started  
**Estimated Effort**: L  
**Dependencies**: WebSocket server setup, log aggregation service, backend infrastructure

**Description**:  
Implement real-time log streaming from the Next.js server directly into the DevTools interface. Instead of showing static log file paths, stream live logs with filtering, search, and highlighting capabilities.

**Current Implementation**:  
The `get_logs` tool returns the log file path. Developers must manually tail the file in a separate terminal window.

**Proposed Solution**:  

**Phase 1: WebSocket Infrastructure**
1. Create WebSocket endpoint at `/api/mcp/logs/stream`
2. Implement log file watching (chokidar/fs.watch)
3. Parse and structure log entries
4. Stream to connected clients

**Phase 2: Log Aggregation**
1. Aggregate logs from multiple sources (server, client errors, API)
2. Normalize log formats
3. Add log level classification
4. Implement log rotation and buffer limits

**Phase 3: Frontend Viewer**
1. Create `LogStreamViewer` component
2. Implement virtual scrolling for performance
3. Add filtering by level, source, time
4. Support regex search
5. Syntax highlighting for JSON payloads

**Benefits**:  
- Single-pane debugging experience
- Real-time visibility into server behavior
- No context-switching to terminal
- Advanced filtering and search
- Log correlation across requests

**Implementation Notes**:  

**WebSocket Server** (using ws or Socket.io):
```typescript
// pages/api/mcp/logs/stream.ts
import { WebSocketServer } from 'ws'
import { watch } from 'chokidar'

const wss = new WebSocketServer({ noServer: true })
const logPath = '.next/dev/logs/next-development.log'

// Watch log file for changes
const watcher = watch(logPath, { persistent: true })

watcher.on('change', async () => {
  const newLines = await getNewLogLines(logPath)
  const parsedLogs = newLines.map(parseLogLine)
  
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'logs', data: parsedLogs }))
    }
  })
})

function parseLogLine(line: string): LogEntry {
  // Parse timestamp, level, message, metadata
  const match = line.match(/\[(\d{4}-\d{2}-\d{2}T[\d:.]+Z)\]\s+(\w+):\s+(.+)/)
  if (match) {
    return {
      timestamp: new Date(match[1]),
      level: match[2] as LogLevel,
      message: match[3],
      raw: line
    }
  }
  return { timestamp: new Date(), level: 'info', message: line, raw: line }
}
```

**Log Entry Schema**:
```typescript
interface LogEntry {
  id: string // Unique identifier
  timestamp: Date
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal'
  message: string
  source: 'server' | 'client' | 'api' | 'middleware'
  metadata?: Record<string, unknown>
  requestId?: string // For request correlation
  raw: string // Original log line
}
```

**Frontend Component** (McpChatInterface.tsx):
```tsx
function LogStreamViewer() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [filter, setFilter] = useState<LogFilter>({ levels: ['warn', 'error'] })
  const wsRef = useRef<WebSocket | null>(null)
  
  useEffect(() => {
    wsRef.current = new WebSocket('ws://localhost:3000/api/mcp/logs/stream')
    
    wsRef.current.onmessage = (event) => {
      const { data } = JSON.parse(event.data)
      setLogs(prev => [...prev, ...data].slice(-1000)) // Keep last 1000
    }
    
    return () => wsRef.current?.close()
  }, [])
  
  const filteredLogs = useMemo(() => 
    logs.filter(log => filter.levels.includes(log.level)),
    [logs, filter]
  )
  
  return (
    <div className="log-viewer">
      <LogFilterBar filter={filter} onChange={setFilter} />
      <VirtualizedLogList logs={filteredLogs} />
    </div>
  )
}
```

**Performance Considerations**:
- Use virtual scrolling for large log volumes
- Implement log buffer limits (configurable)
- Throttle WebSocket messages during high volume
- Support pause/resume streaming
- Efficient log line parsing (avoid regex on hot path)

**Related Files**:  
- `pages/api/mcp.ts` (existing MCP server)
- `app/_components/ui/McpChatInterface.tsx` (frontend)
- New: `pages/api/mcp/logs/stream.ts`
- New: `app/_components/ui/LogStreamViewer.tsx`

**References**:  
- [ws WebSocket Library](https://github.com/websockets/ws)
- [chokidar File Watcher](https://github.com/paulmillr/chokidar)
- [react-window Virtual Scrolling](https://react-window.vercel.app/)

---

### MCP DevTools - Database Query Explorer

**Priority**: P2  
**Category**: Feature Enhancement / Data Debugging  
**Status**: Not Started  
**Estimated Effort**: XL  
**Dependencies**: Database connection pooling, query sanitization, access control layer

**Description**:  
Add direct database exploration and query execution capabilities to the DevTools. Safely query development databases, inspect table schemas, and debug data issues without leaving the DevTools interface.

**Current Implementation**:  
No database access through MCP. Developers must use external tools (pgAdmin, DBeaver, CLI) to inspect databases.

**Proposed Solution**:  

**Phase 1: Read-Only Explorer**
1. Create `get_db_schema` tool to list tables/collections
2. Create `query_db` tool for SELECT queries only
3. Implement query sanitization and validation
4. Add result pagination

**Phase 2: Safe Write Operations (Dev Only)**
1. Enable INSERT/UPDATE/DELETE in development mode
2. Require confirmation for destructive operations
3. Implement automatic transaction rollback option
4. Add query history with undo

**Phase 3: Visual Query Builder**
1. Schema-aware autocomplete
2. Visual table relationship explorer
3. Query result export (CSV, JSON)
4. Saved queries library

**Benefits**:  
- Unified debugging environment
- Faster data issue investigation
- No context-switching to external tools
- Query history and reuse
- Team-shared query library

**Implementation Notes**:  

**Security Architecture** (CRITICAL):
```typescript
// NEVER expose in production
if (process.env.NODE_ENV !== 'development') {
  throw new Error('Database tools only available in development')
}

// Query whitelist approach
const ALLOWED_OPERATIONS = ['SELECT', 'DESCRIBE', 'SHOW', 'EXPLAIN']

function validateQuery(sql: string): { valid: boolean; reason?: string } {
  const normalized = sql.trim().toUpperCase()
  const operation = normalized.split(/\s+/)[0]
  
  if (!ALLOWED_OPERATIONS.includes(operation)) {
    return { valid: false, reason: `Operation '${operation}' not allowed` }
  }
  
  // Check for SQL injection patterns
  if (containsInjectionPatterns(sql)) {
    return { valid: false, reason: 'Query contains suspicious patterns' }
  }
  
  return { valid: true }
}
```

**Query Tool Implementation**:
```typescript
// MCP tool handler
async function handleQueryDb(args: { query: string; limit?: number }) {
  const validation = validateQuery(args.query)
  if (!validation.valid) {
    return { error: validation.reason }
  }
  
  const limit = Math.min(args.limit || 100, 1000) // Max 1000 rows
  const queryWithLimit = `${args.query} LIMIT ${limit}`
  
  try {
    const result = await db.query(queryWithLimit)
    return {
      rows: result.rows,
      rowCount: result.rowCount,
      fields: result.fields.map(f => ({ name: f.name, type: f.dataTypeID })),
      executionTime: result.executionTime
    }
  } catch (error) {
    return { error: error.message }
  }
}
```

**Frontend Query Interface**:
```tsx
function DatabaseExplorer() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<QueryResult | null>(null)
  
  return (
    <div className="db-explorer">
      <SchemaTreeView onSelectTable={(t) => setQuery(`SELECT * FROM ${t}`)} />
      <QueryEditor 
        value={query} 
        onChange={setQuery}
        schema={schema} // For autocomplete
      />
      <Button onClick={() => executeQuery(query)}>
        Run Query (Dev Only)
      </Button>
      {results && <ResultTable data={results} />}
    </div>
  )
}
```

**Access Control Layers**:
1. Environment check (dev only)
2. Query validation (whitelist operations)
3. Result limits (max rows)
4. Audit logging (all queries logged)
5. Connection isolation (separate pool)

**Related Files**:  
- `pages/api/mcp.ts` (MCP server)
- `app/_components/ui/McpChatInterface.tsx` (frontend)
- New: `app/_lib/db/query-validator.ts`
- New: `app/_components/ui/DatabaseExplorer.tsx`

**References**:  
- [OWASP SQL Injection Prevention](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)
- [pg (node-postgres)](https://node-postgres.com/)
- [Monaco Editor for SQL](https://microsoft.github.io/monaco-editor/)

---

### MCP DevTools - Performance Profiling Tools

**Priority**: P2  
**Category**: Performance / Developer Experience  
**Status**: Not Started  
**Estimated Effort**: L  
**Dependencies**: Performance monitoring middleware, data collection API, visualization libraries

**Description**:  
Integrate real-time performance profiling into the DevTools, including request timing breakdowns, component render analysis, memory usage monitoring, and flame graph visualization.

**Current Implementation**:  
Basic metadata shows execution time for tool calls. No comprehensive performance profiling.

**Proposed Solution**:  

**Phase 1: Request Profiling**
1. Create middleware to capture request timing
2. Measure DNS, TCP, TLS, TTFB, download phases
3. Track server-side render time
4. Display waterfall charts

**Phase 2: Component Analysis**
1. Integrate React DevTools Profiler API
2. Capture component render times
3. Identify unnecessary re-renders
4. Suggest optimization opportunities

**Phase 3: Memory & Bundle Analysis**
1. Monitor heap usage over time
2. Detect memory leak patterns
3. Analyze bundle size per route
4. Visualize code splitting effectiveness

**Benefits**:  
- Identify performance bottlenecks quickly
- Data-driven optimization decisions
- Monitor performance regression
- Single-pane performance debugging

**Implementation Notes**:  

**Performance Middleware**:
```typescript
// middleware/performance.ts
import { NextResponse } from 'next/server'

export function middleware(request: Request) {
  const start = performance.now()
  
  const response = NextResponse.next()
  
  const duration = performance.now() - start
  response.headers.set('Server-Timing', `total;dur=${duration}`)
  
  // Log to performance collector
  performanceCollector.record({
    path: request.url,
    method: request.method,
    duration,
    timestamp: Date.now()
  })
  
  return response
}
```

**MCP Performance Tool**:
```typescript
async function handleGetPerformanceMetrics(args: { 
  type: 'requests' | 'components' | 'memory'
  timeRange?: number // Last N minutes
}) {
  switch (args.type) {
    case 'requests':
      return performanceCollector.getRequestMetrics(args.timeRange)
    case 'components':
      return componentProfiler.getMetrics()
    case 'memory':
      return {
        heapUsed: process.memoryUsage().heapUsed,
        heapTotal: process.memoryUsage().heapTotal,
        external: process.memoryUsage().external,
        arrayBuffers: process.memoryUsage().arrayBuffers
      }
  }
}
```

**Related Files**:  
- `pages/api/mcp.ts` (MCP server)
- `app/_components/ui/McpChatInterface.tsx` (frontend)
- New: `middleware/performance.ts`
- New: `app/_lib/performance/collector.ts`

**References**:  
- [Server-Timing Header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Server-Timing)
- [React Profiler API](https://reactjs.org/docs/profiler.html)
- [d3-flame-graph](https://github.com/nicedoc/d3-flame-graph)

---

### MCP DevTools - Git Integration Tools

**Priority**: P3  
**Category**: Developer Experience / Workflow  
**Status**: Not Started  
**Estimated Effort**: M  
**Dependencies**: Git CLI access, safe command execution, file system access

**Description**:  
Add Git operations directly in the DevTools for common debugging workflows: view recent commits, check file history, create debug branches, and stash changes—all without leaving the interface.

**Current Implementation**:  
No Git integration. Developers use separate terminal or Git GUI.

**Proposed Solution**:  

1. Create `git_status` tool for working directory status
2. Create `git_log` tool for commit history
3. Create `git_diff` tool for viewing changes
4. Create `git_blame` tool for file history
5. Add safe branch/stash operations (with confirmation)

**Benefits**:  
- Correlate bugs with recent commits
- Quick file history lookup
- Streamlined debugging workflow
- No context-switching

**Implementation Notes**:  

```typescript
async function handleGitStatus() {
  const { stdout } = await execAsync('git status --porcelain')
  return parseGitStatus(stdout)
}

async function handleGitLog(args: { limit?: number; file?: string }) {
  const limit = args.limit || 10
  const fileArg = args.file ? `-- ${args.file}` : ''
  const { stdout } = await execAsync(
    `git log --oneline -n ${limit} ${fileArg}`
  )
  return parseGitLog(stdout)
}

async function handleGitBlame(args: { file: string; lines?: string }) {
  const lineArg = args.lines ? `-L ${args.lines}` : ''
  const { stdout } = await execAsync(
    `git blame ${lineArg} ${args.file}`
  )
  return parseGitBlame(stdout)
}
```

**Related Files**:  
- `pages/api/mcp.ts` (MCP server)
- `app/_components/ui/McpChatInterface.tsx` (frontend)

**References**:  
- [Git Porcelain Commands](https://git-scm.com/book/en/v2/Appendix-B:-Embedding-Git-in-your-Applications-Libgit2)

---

### MCP DevTools - Environment Variable Manager

**Priority**: P2  
**Category**: Developer Experience / Security  
**Status**: Not Started  
**Estimated Effort**: M  
**Dependencies**: Secure env var storage, encryption at rest, access logging

**Description**:  
Securely view and manage environment variables through the DevTools. Display masked values with reveal-on-demand, compare environments, and validate required variables.

**Current Implementation**:  
Environment variables can only be viewed via terminal or `.env` files. No visibility in DevTools.

**Proposed Solution**:  

1. Create `get_env_vars` tool (dev mode only, values masked)
2. Create `validate_env` tool to check required vars
3. Create `compare_env` tool to diff local vs. example
4. Add secure reveal mechanism with audit logging

**Benefits**:  
- Quick debugging of env-related issues
- Validate env setup without exposing secrets
- Compare environments safely
- Audit trail for env access

**Implementation Notes**:  

```typescript
// SECURITY: Never expose actual values in tool responses
async function handleGetEnvVars(args: { prefix?: string }) {
  const vars = Object.keys(process.env)
    .filter(key => !args.prefix || key.startsWith(args.prefix))
    .map(key => ({
      name: key,
      isSet: !!process.env[key],
      length: process.env[key]?.length || 0,
      // Never include actual value!
    }))
  
  return { variables: vars, count: vars.length }
}

async function handleValidateEnv() {
  const required = getRequiredEnvVars() // From config
  const missing = required.filter(key => !process.env[key])
  const present = required.filter(key => !!process.env[key])
  
  return {
    valid: missing.length === 0,
    missing,
    present,
    totalRequired: required.length
  }
}
```

**Related Files**:  
- `pages/api/mcp.ts` (MCP server)
- `app/_components/ui/McpChatInterface.tsx` (frontend)

**References**:  
- [dotenv-vault](https://www.dotenv.org/docs/security/vault)
- [OWASP Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)

---

### MCP DevTools - API Testing Suite

**Priority**: P3  
**Category**: Feature Enhancement / Testing  
**Status**: Not Started  
**Estimated Effort**: L  
**Dependencies**: HTTP client library, request/response storage, test assertions

**Description**:  
Built-in API testing capabilities similar to Postman/Insomnia, allowing developers to test API endpoints directly from the DevTools with request history, saved collections, and assertion support.

**Current Implementation**:  
No API testing. Developers use external tools (Postman, curl, Thunder Client).

**Proposed Solution**:  

1. Create `test_api` tool for making HTTP requests
2. Add request builder UI with method, headers, body
3. Implement response viewer with syntax highlighting
4. Add request history with replay
5. Support saved request collections
6. Add basic assertions (status code, response body)

**Benefits**:  
- Test APIs without leaving editor
- Request history tied to debugging session
- Share API collections with team
- Quick endpoint verification

**Implementation Notes**:  

```typescript
async function handleTestApi(args: {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  url: string
  headers?: Record<string, string>
  body?: unknown
  timeout?: number
}) {
  const start = performance.now()
  
  try {
    const response = await fetch(args.url, {
      method: args.method,
      headers: args.headers,
      body: args.body ? JSON.stringify(args.body) : undefined,
      signal: AbortSignal.timeout(args.timeout || 30000)
    })
    
    const duration = performance.now() - start
    const body = await response.text()
    
    return {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers),
      body: tryParseJson(body),
      duration,
      size: body.length
    }
  } catch (error) {
    return { error: error.message }
  }
}
```

**Related Files**:  
- `pages/api/mcp.ts` (MCP server)
- `app/_components/ui/McpChatInterface.tsx` (frontend)
- New: `app/_components/ui/ApiTestBuilder.tsx`

**References**:  
- [Postman Collection Format](https://learning.postman.com/collection-format/)
- [OpenAPI Specification](https://swagger.io/specification/)

---

### MCP DevTools - Team Collaboration Features

**Priority**: P3  
**Category**: Collaboration / Developer Experience  
**Status**: Not Started  
**Estimated Effort**: XL  
**Dependencies**: Backend storage (database), user authentication, real-time sync (WebSocket)

**Description**:  
Enable team collaboration features in DevTools: shared configurations, team-wide snippets, debugging session annotations, and real-time shared debugging sessions.

**Current Implementation**:  
All DevTools state is local (localStorage). No sharing capabilities.

**Proposed Solution**:  

**Phase 1: Shared Configurations**
1. Backend storage for team configs (workflows, favorites)
2. Import/export team configurations
3. Config versioning and history

**Phase 2: Shared Snippets & Queries**
1. Team snippet library
2. Categorization and tagging
3. Usage analytics

**Phase 3: Real-Time Collaboration**
1. Shared debugging sessions
2. Live cursor presence
3. Session chat/annotations
4. Screen sharing integration

**Benefits**:  
- Onboarding efficiency (share team workflows)
- Knowledge sharing (common debug patterns)
- Pair debugging remotely
- Consistent team tooling

**Implementation Notes**:  

```typescript
// Team config sync
interface TeamConfig {
  id: string
  teamId: string
  name: string
  type: 'workflow' | 'snippet' | 'query' | 'preset'
  content: unknown
  createdBy: string
  updatedAt: Date
  tags: string[]
}

// API endpoints
// GET /api/mcp/team/configs - List team configs
// POST /api/mcp/team/configs - Create config
// PUT /api/mcp/team/configs/:id - Update config
// DELETE /api/mcp/team/configs/:id - Delete config

// Real-time sync with Y.js or similar
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'

const ydoc = new Y.Doc()
const provider = new WebsocketProvider(
  'wss://your-server.com',
  'debug-session-123',
  ydoc
)
```

**Related Files**:  
- `pages/api/mcp.ts` (MCP server)
- `app/_components/ui/McpChatInterface.tsx` (frontend)
- New: `pages/api/mcp/team/*` (team API routes)
- New: Database schema for team configs

**References**:  
- [Y.js CRDT Library](https://yjs.dev/)
- [Liveblocks Collaboration](https://liveblocks.io/)
- [Firebase Realtime Database](https://firebase.google.com/docs/database)

---

## Update Instructions

### How to Add New Entries

When adding a new improvement entry to this document:

1. **Choose the appropriate section** based on the improvement type:
   - Reusable Utilities & Hooks Integration
   - Component Refactoring
   - Performance Optimizations
   - Accessibility Enhancements
   - Architecture Improvements

2. **Follow the entry format** exactly as defined in [Document Conventions](#document-conventions):
   ```markdown
   ### [Component/Feature Name] - [Brief Description]

   **Priority**: [P0/P1/P2/P3]  
   **Category**: [Category Name]  
   **Status**: [Not Started | In Progress | Blocked | Completed]  
   **Estimated Effort**: [XS | S | M | L | XL]  
   **Dependencies**: [List any dependencies]

   **Description**:  
   [Detailed description]

   **Current Implementation**:  
   [What exists now]

   **Proposed Solution**:  
   [What should be changed]

   **Benefits**:  
   [Why this matters]

   **Implementation Notes**:  
   [Technical details, code examples]

   **Related Files**:  
   - `path/to/file1.tsx`
   - `path/to/file2.ts`

   **References**:  
   [Links, PRs, issues]
   ```

3. **Maintain chronological order** within each section (newest entries at the top)

4. **Update the "Last Updated" date** at the top of the document

5. **Update Table of Contents** if adding a new section

6. **Use consistent formatting**:
   - Use `###` for entry titles
   - Use `**Bold**` for field labels
   - Use code blocks with language tags for code examples
   - Use bullet points for lists
   - Use relative paths for file references

7. **Status updates**: When working on an entry:
   - Change status to "In Progress"
   - Update when blocked or completed
   - Add completion date when marking as "Completed"

8. **Cross-references**: When an entry relates to another:
   - Add a "See also" note
   - Link to related entries using markdown links

### Formatting Rules

- **File paths**: Always use relative paths from project root
- **Code blocks**: Always specify language (tsx, ts, md, etc.)
- **Priority**: Use P0-P3 scale
- **Effort**: Use XS-XL scale
- **Status**: Use exact status values from definitions
- **Dates**: Use YYYY-MM-DD format

### Maintenance Guidelines

- Review and update this document monthly
- Remove completed entries after 3 months (archive if needed)
- Update priorities based on project needs
- Keep entries concise but informative
- Add implementation notes as work progresses

---

## Changelog

### 2025-12-12
- Added comprehensive MCP DevTools - Backend-Dependent Enhancements section
- Documented 9 major future enhancements requiring server-side changes:
  - Custom Tool Registration System (plugin ecosystem)
  - AI-Assisted Debugging Integration (GPT-4/Claude analysis)
  - Real-Time Log Streaming (WebSocket-based live logs)
  - Database Query Explorer (safe SQL execution in dev)
  - Performance Profiling Tools (flame graphs, request timing)
  - Git Integration Tools (status, log, blame, diff)
  - Environment Variable Manager (secure env debugging)
  - API Testing Suite (Postman-like in-DevTools)
  - Team Collaboration Features (shared configs, real-time pairing)
- Each enhancement includes implementation notes, security considerations, and code examples

### 2025-11-28
- Added OptimizedImage/ProductImage Next.js 15 async Client Component error fix
- Documented current workaround (native img tag) and proposed solutions
- Added investigation steps and testing checklist for Next.js 15 compatibility

### 2025-01-16
- Added SafeHtmlContent security hardening and FAANG-level enhancements
- Documented 4-phase upgrade roadmap (Critical Security → Enhanced Features → Advanced Features → Enterprise Features)
- Added comprehensive security, performance, and accessibility improvements
- Included FAANG company comparison and industry standards alignment
- Added detailed implementation notes with code examples and test cases

### 2025-01-15
- Added LiveChatBubble real-time chat service integration plan
- Documented third-party service options and custom solution approach
- Added implementation steps, analytics events, and testing checklist

### 2025-01-XX
- Initial document creation
- Added reusable utilities & hooks integration opportunities
- Documented update instructions and conventions

---

## Notes

- This document is a living document and should be updated regularly
- All entries should be actionable and specific
- When an entry is completed, update status and add completion notes
- Deferred items should be moved to a separate "Deferred" section if not planned for near future

