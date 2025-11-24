# Future Improvements & Technical Debt

> **Purpose**: This document tracks planned improvements, refactoring opportunities, and technical debt items for the MedSource Pro codebase. It serves as a roadmap for maintaining code quality, consistency, and following industry best practices.

> **Last Updated**: 2025-01-16  
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

