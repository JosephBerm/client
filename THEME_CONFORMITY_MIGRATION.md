# Theme Conformity Migration - Complete Report

## Status: IN PROGRESS

### Completed ✅
1. **globals.css** - Removed all custom medsource-classic CSS and brand color variables
2. **tailwind.config.ts** - Removed custom brand color definitions
3. **Button.tsx** - Updated to use DaisyUI btn classes
4. **Badge.tsx** - Updated to use DaisyUI badge classes
5. **Card.tsx** - Updated to use DaisyUI card and base-* colors
6. **DataTable.tsx** - Updated to use DaisyUI table, loading, base-* colors
7. **FormCheckbox.tsx** - Updated to use checkbox-primary
8. **FormSelect.tsx** - Updated chevron to use text-primary
9. **FAQ.tsx** - Updated to use DaisyUI collapse component
10. **ContactUs.tsx** - Updated to use bg-primary and btn classes

### In Progress 🔄
11. **Landing Components** - Products, ProductsCarousel, SalesPitch, Intro

### Color Mapping Used

| Old Brand Color | New DaisyUI Class |
|----------------|------------------|
| `brand-1` (lightest green) | `primary` with opacity or `primary-content` |
| `brand-2` (light green) | `success` or `primary` |
| `brand-3` (medium green) | `primary` or `primary-focus` |
| `brand-4` (dark green) | `primary` |
| `brand-5` (darkest green) | `primary-focus` |
| `teal` | `accent` |
| `--soft-brand-color` (light bg) | `bg-base-200` or `bg-primary/10` |
| Text colors | `text-base-content` or `text-primary` |
| Borders | `border-base-300` or `border-primary` |

### DaisyUI Components Used
- `btn` (button variants: primary, secondary, accent, ghost, outline, error, success)
- `badge` (badge variants with same options)
- `card` (with bg-base-100, bg-base-200)
- `table` (with table-zebra)
- `collapse` (collapse-plus for FAQ)
- `checkbox` (checkbox-primary)
- `select` (select-bordered)
- `loading` (loading-spinner)

### Remaining Files to Update
- app/_components/landing/Products.tsx
- app/_components/landing/ProductsCarousel.tsx
- app/_components/landing/SalesPitch.tsx
- app/_components/landing/Intro.tsx
- Any navigation components
- Any other components with custom colors

