# Reduced Motion Best Practices Guide

## 🎯 Quick Reference for Developers

This guide provides quick decision-making criteria for implementing animations that respect reduced motion preferences.

---

## 📋 Decision Tree: Should I Add This Animation?

```
┌─ Is this animation functional (loading, feedback, state change)?
│  YES → REDUCE speed, DON'T remove
│  │      Examples: Loading spinners, status indicators, form feedback
│  │      Action: Slow down 1.5-2x in reduced motion mode
│  │
│  NO ↓
│
├─ Does this animation aid comprehension or navigation?
│  YES → SIMPLIFY, make faster
│  │      Examples: Modals opening, tooltips, dropdowns
│  │      Action: Reduce to 0.15-0.2s fade
│  │
│  NO ↓
│
├─ Does this animation provide user feedback for interactions?
│  YES → REDUCE to minimum
│  │      Examples: Button hover, focus states
│  │      Action: Quick transitions (0.15s or less)
│  │
│  NO ↓
│
└─ It's decorative or attention-getting
   → REMOVE completely
      Examples: Pulse effects, bouncing, parallax, background animations
      Action: animation: none; or display: none;
```

---

## 🏗️ Implementation Patterns

### Pattern 1: CSS-Only Functional Animation

**Use Case**: Loading spinners, status pulses, skeleton loaders

```css
/* Component styles */
.loading-spinner {
	animation: spin 1s linear infinite;
}

/* Reduced motion override */
@media (prefers-reduced-motion: reduce),
[data-reduced-motion="true"] {
	.loading-spinner {
		animation-duration: 1.5s; /* Slower but still functional */
	}
}
```

**✅ DO**: Slow down but keep functional
**❌ DON'T**: Remove completely (breaks loading feedback)

---

### Pattern 2: Component-Level Animation Control

**Use Case**: Carousels, complex animations needing specific handling

```tsx
'use client'

import { useEffect, useState } from 'react'

export function Carousel() {
	const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
	
	useEffect(() => {
		// Check both system preference and user override
		const checkReducedMotion = () => {
			const userOverride = document.documentElement.getAttribute('data-reduced-motion')
			if (userOverride === 'true') return true
			return window.matchMedia('(prefers-reduced-motion: reduce)').matches
		}
		
		setPrefersReducedMotion(checkReducedMotion())
		
		// Listen for changes
		const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
		const observer = new MutationObserver(() => {
			setPrefersReducedMotion(checkReducedMotion())
		})
		
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['data-reduced-motion'],
		})
		
		mediaQuery.addEventListener('change', () => {
			setPrefersReducedMotion(checkReducedMotion())
		})
		
		return () => {
			observer.disconnect()
			mediaQuery.removeEventListener('change', checkReducedMotion)
		}
	}, [])
	
	return (
		<div 
			className="carousel"
			style={{
				animationDuration: prefersReducedMotion ? '60s' : '30s'
			}}
		>
			{/* Carousel content */}
		</div>
	)
}
```

**✅ DO**: Double animation duration for carousels
**❌ DON'T**: Stop carousel completely (breaks functionality)

---

### Pattern 3: Decorative Animation Removal

**Use Case**: Attention-getting effects, background animations

```css
/* Component styles */
.decorative-pulse {
	animation: pulse 2s ease-in-out infinite;
}

.attention-ping {
	animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
}

/* Reduced motion override - REMOVE completely */
@media (prefers-reduced-motion: reduce),
[data-reduced-motion="true"] {
	.decorative-pulse,
	.attention-ping {
		animation: none; /* Remove completely */
	}
}
```

**✅ DO**: Remove decorative animations completely
**❌ DON'T**: Just slow them down (still triggers vestibular issues)

---

### Pattern 4: Scroll-Based Animation Disable

**Use Case**: Scroll reveal animations, parallax effects

```tsx
'use client'

import { useEffect, useRef, useState } from 'react'

export function useScrollReveal() {
	const [hasAnimated, setHasAnimated] = useState(false)
	const prefersReducedMotion = useRef(false)
	
	useEffect(() => {
		// Check reduced motion preference
		const checkReducedMotion = () => {
			const userOverride = document.documentElement.getAttribute('data-reduced-motion')
			if (userOverride === 'true') return true
			return window.matchMedia('(prefers-reduced-motion: reduce)').matches
		}
		
		prefersReducedMotion.current = checkReducedMotion()
		
		// If reduced motion is enabled, show content immediately
		if (prefersReducedMotion.current) {
			setHasAnimated(true)
		}
	}, [])
	
	return hasAnimated
}
```

**✅ DO**: Show content instantly without scroll-based triggers
**❌ DON'T**: Keep scroll-based animations (highly problematic for vestibular disorders)

---

### Pattern 5: Modal/Popup Simplified Entry

**Use Case**: Modals, tooltips, dropdowns

```tsx
export function Modal({ isOpen, children }) {
	return (
		<div
			className={`modal ${isOpen ? 'modal-open' : ''}`}
			style={{
				// CSS handles reduced motion via global rules:
				// transition-duration: 0.15s in reduced motion mode
			}}
		>
			{children}
		</div>
	)
}
```

```css
.modal {
	opacity: 0;
	transform: scale(0.95);
	transition: all 0.3s ease-out;
}

.modal-open {
	opacity: 1;
	transform: scale(1);
}

/* Reduced motion: Fast but visible */
@media (prefers-reduced-motion: reduce),
[data-reduced-motion="true"] {
	.modal {
		transition-duration: 0.15s;
		/* Fast enough to feel immediate, slow enough to see */
	}
}
```

**✅ DO**: Reduce to quick fade (0.15-0.2s)
**❌ DON'T**: Remove transitions completely (jarring instant appearance)

---

## 📊 Animation Speed Guidelines

| Animation Type | Normal | Reduced Motion | Rationale |
|----------------|--------|----------------|-----------|
| **Loading Spinner** | 1s | 1.5s | Functional feedback - slow down |
| **Status Pulse** | 2s | 3s | Indicates live status - slow down |
| **Carousel Auto-Scroll** | 30s | 60s (2x) | Functional navigation - slow down |
| **Button Hover** | 0.2s | 0.15s | Interaction feedback - quick |
| **Modal Open** | 0.3s | 0.15s | Context change - fast fade |
| **Form Transitions** | 0.25s | 0.15s | Interaction feedback - quick |
| **Skeleton Shimmer Wave** | 2s | None | Decorative - remove wave |
| **Skeleton Pulse** | 2s | 3s | Loading indicator - slow down |
| **Scroll Reveals** | 0.6s | Instant | Decorative - show immediately |
| **Ping/Bounce** | N/A | None | Attention-getting - remove |
| **Parallax** | N/A | None | Vestibular trigger - remove |

---

## 🚫 Common Mistakes to Avoid

### Mistake 1: Removing ALL animations

```css
/* ❌ BAD: Removes functional feedback */
@media (prefers-reduced-motion: reduce) {
	* {
		animation: none !important;
		transition: none !important;
	}
}
```

**Why it's bad**: Users lose loading indicators, hover feedback, and state changes.

**✅ FIX**: Use targeted removal + speed reduction:

```css
@media (prefers-reduced-motion: reduce) {
	/* Global: Reduce speed */
	* {
		animation-duration: 0.3s;
		transition-duration: 0.15s;
	}
	
	/* Decorative: Remove */
	.animate-ping,
	.animate-bounce,
	.parallax {
		animation: none;
	}
	
	/* Functional: Slow down */
	.animate-spin {
		animation-duration: 1.5s;
	}
}
```

---

### Mistake 2: Only checking system preference

```tsx
// ❌ BAD: Ignores user override
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
```

**Why it's bad**: Users who explicitly toggle the setting in your app are ignored.

**✅ FIX**: Check both system preference AND user override:

```tsx
const checkReducedMotion = () => {
	// Check user override FIRST
	const userOverride = document.documentElement.getAttribute('data-reduced-motion')
	if (userOverride === 'true') return true
	
	// Fall back to system preference
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
```

---

### Mistake 3: Using !important everywhere

```css
/* ❌ BAD: Prevents component-level overrides */
@media (prefers-reduced-motion: reduce) {
	* {
		animation-duration: 0.01ms !important;
	}
}
```

**Why it's bad**: Breaks components like carousels that need specific reduced motion handling.

**✅ FIX**: Use `:not()` exclusions:

```css
@media (prefers-reduced-motion: reduce) {
	*:not(.carousel-banner-animated) {
		animation-duration: 0.3s; /* No !important */
	}
}
```

---

### Mistake 4: Forgetting about transitions

```css
/* ❌ BAD: Only handles animations, not transitions */
@media (prefers-reduced-motion: reduce) {
	* {
		animation: none;
	}
	/* Forgot transition-duration! */
}
```

**Why it's bad**: Hover effects, transforms, and opacity changes still move too fast.

**✅ FIX**: Handle both animations AND transitions:

```css
@media (prefers-reduced-motion: reduce) {
	* {
		animation-duration: 0.3s;
		transition-duration: 0.15s; /* Don't forget this! */
	}
}
```

---

### Mistake 5: Stopping carousels completely

```css
/* ❌ BAD: Carousel stops moving */
@media (prefers-reduced-motion: reduce) {
	.carousel {
		animation-play-state: paused;
	}
}
```

**Why it's bad**: Users with reduced motion still want to see content, just slower.

**✅ FIX**: Slow down significantly instead:

```css
@media (prefers-reduced-motion: reduce) {
	.carousel {
		animation-duration: 60s; /* 2x slower, still functional */
	}
}
```

---

## 🎨 Tailwind Class Handling

### Built-in Tailwind Animations

| Class | Purpose | Reduced Motion Action |
|-------|---------|----------------------|
| `animate-spin` | Loading spinner | Slow to 1.5s |
| `animate-pulse` | Loading/status | Slow to 3s |
| `animate-ping` | Attention-getting | **Remove completely** |
| `animate-bounce` | Attention-getting | **Remove completely** |

### Custom Animations

| Class | Purpose | Reduced Motion Action |
|-------|---------|----------------------|
| `animate-elegant-reveal` | Scroll reveal | Simple fade (0.2s) |
| `animate-shake` | Error feedback | **Remove completely** |
| `animate-scale-in` | Entrance | **Remove completely** |
| `animate-slide-up` | Entrance | **Remove completely** |
| `animate-pulse-smooth` | Decorative | **Remove completely** |

---

## ✅ Checklist for New Animations

Before adding any new animation, ask yourself:

- [ ] **Is this animation functional?**
  - Loading indicator → Yes, keep but slow down
  - Decorative flourish → No, remove in reduced motion
  
- [ ] **Does it aid user comprehension?**
  - Modal opening (shows context change) → Yes, quick fade
  - Background parallax → No, remove
  
- [ ] **Could it trigger vestibular issues?**
  - Ping/bounce/parallax/zoom → Yes, remove completely
  - Subtle fade/quick transitions → No, safe
  
- [ ] **Did I test with reduced motion enabled?**
  - [ ] System preference (OS settings)
  - [ ] User override (app settings toggle)
  - [ ] Both simultaneously
  
- [ ] **Is the fallback still usable?**
  - Users should never lose functionality
  - Instant appearance is better than broken animations
  
- [ ] **Did I avoid using `!important` unnecessarily?**
  - Allow component-level overrides
  - Use `:not()` exclusions instead

---

## 🧪 Testing Checklist

### Manual Testing:

1. **Enable System Reduced Motion**:
   - Windows: Settings → Accessibility → Visual effects → Animation effects
   - macOS: System Preferences → Accessibility → Display → Reduce motion
   - Linux: Varies by desktop environment

2. **Test App Toggle**:
   - Open Settings Modal
   - Toggle "Reduce Motion" setting
   - Verify `data-reduced-motion="true"` on `<html>`

3. **Visual Verification**:
   - [ ] Carousel slows down (doesn't stop)
   - [ ] Loading spinners still spin (slower)
   - [ ] Status dots still pulse (slower)
   - [ ] Decorative animations removed
   - [ ] Scroll reveals show instantly
   - [ ] Modals open quickly (not jarring)
   - [ ] Button hovers feel responsive
   - [ ] Ping/bounce effects gone

### Automated Testing (Future):

```typescript
describe('Reduced Motion', () => {
	it('respects system preference', () => {
		// Mock prefers-reduced-motion: reduce
		window.matchMedia = jest.fn().mockImplementation(query => ({
			matches: query === '(prefers-reduced-motion: reduce)',
			media: query,
			addEventListener: jest.fn(),
			removeEventListener: jest.fn(),
		}))
		
		// Test that data-reduced-motion is set
		expect(document.documentElement.getAttribute('data-reduced-motion')).toBe('true')
	})
	
	it('respects user override', () => {
		// Simulate user toggling setting
		userSettingsStore.getState().setPrefersReducedMotion(true)
		
		// Verify attribute
		expect(document.documentElement.getAttribute('data-reduced-motion')).toBe('true')
	})
})
```

---

## 📚 Resources

### WCAG Guidelines:
- [WCAG 2.1 SC 2.3.3 - Animation from Interactions](https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions) (Level AAA)
- [WCAG 2.2.2 - Pause, Stop, Hide](https://www.w3.org/WAI/WCAG21/Understanding/pause-stop-hide) (Level A)

### Industry Examples:
- [Apple Accessibility - Reduce Motion](https://www.apple.com/accessibility/)
- [Google Material Design - Motion](https://material.io/design/motion/understanding-motion.html)
- [Microsoft Fluent Design - Motion](https://www.microsoft.com/design/fluent/)

### Technical References:
- [MDN: prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)
- [A11y Project: Reduced Motion](https://www.a11yproject.com/posts/understanding-vestibular-disorders/)
- [WebAIM: Motion Guidelines](https://webaim.org/articles/seizure/)

### Medical Background:
- [Vestibular Disorders Association](https://vestibular.org/)
- Understanding why reduced motion matters for accessibility

---

## 🎯 Summary: The 3 Golden Rules

1. **FUNCTIONAL animations** → **REDUCE** (slow down but keep)
   - Loading spinners, status indicators, carousels

2. **INTERACTION feedback** → **SIMPLIFY** (quick transitions)
   - Hover states, modals, dropdowns

3. **DECORATIVE animations** → **REMOVE** (disable completely)
   - Ping, bounce, parallax, background effects

---

*Last Updated: Post-comprehensive audit*
*Compliance: WCAG 2.1 AA + Industry best practices*

