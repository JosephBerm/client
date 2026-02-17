# Phase 0: Discovery & Benchmarking - COMPLETE ✓

**Date**: January 22, 2026
**Status**: COMPLETE

---

## Chart Inventory

| Component | Location | Type | Library | Data Volume |
|-----------|----------|------|---------|-------------|
| RevenueChart | `client/app/app/analytics/_components/RevenueChart.tsx` | Bar Chart | **None (CSS)** | ~12-52 points (weekly/monthly) |
| ConversionFunnel | `client/app/app/analytics/_components/ConversionFunnel.tsx` | Funnel | **None (CSS)** | 6 static stages |
| PersonalVsTeamCard | `client/app/app/analytics/_components/PersonalVsTeamCard.tsx` | Comparison | **None (CSS)** | 2 metrics |
| AnalyticsKPICard | `client/app/app/analytics/_components/AnalyticsKPICard.tsx` | KPI Card | **None (CSS)** | Single value |
| TeamLeaderboardDataGrid | `client/app/app/analytics/_components/TeamLeaderboardDataGrid.tsx` | Data Grid | TanStack Table | ~10-100 rows |

---

## Data Volume Profile

### P50/P95/P99 Dataset Sizes

| Chart Surface | P50 | P95 | P99 | Max Expected |
|---------------|-----|-----|-----|--------------|
| Revenue Timeline (Daily) | 30 points | 90 points | 365 points | 365 points |
| Revenue Timeline (Weekly) | 12 points | 26 points | 52 points | 52 points |
| Revenue Timeline (Monthly) | 6 points | 12 points | 24 points | 24 points |
| Quote Pipeline | 6 stages | 6 stages | 6 stages | 6 stages |
| Team Leaderboard | 5 reps | 20 reps | 50 reps | 100 reps |
| Comparison Metrics | 2 values | 2 values | 2 values | 2 values |

### Assessment
- **All current charts operate well below 1,000 data points**
- **SVG rendering (visx) is appropriate for all current use cases**
- **Canvas/WebGL (ECharts) NOT needed for current requirements**
- **Future consideration**: If real-time streaming or 10K+ point charts are needed, ECharts can be added later

---

## Performance Budget

| Chart Type | Target TTI | Target Render Time | Memory Budget |
|------------|-----------|-------------------|---------------|
| Area/Line/Bar Chart | < 200ms | < 100ms | < 10MB |
| Funnel Chart | < 150ms | < 50ms | < 5MB |
| SparkLine | < 50ms | < 20ms | < 2MB |
| KPI Card | < 50ms | < 20ms | < 1MB |
| Complex (Waterfall/Combo) | < 300ms | < 150ms | < 15MB |

---

## Accessibility Checklist (WCAG 2.1 AA)

- [ ] Keyboard navigation for all interactive elements
- [ ] ARIA labels for chart regions
- [ ] Screen reader announcements for data values
- [ ] Color contrast ratio >= 4.5:1 for text
- [ ] Non-color indicators (patterns/labels) for colorblind users
- [ ] Focus indicators on interactive elements
- [ ] `prefers-reduced-motion` support for animations
- [ ] Data table fallback for each chart

---

## Charts Requiring Canvas/WebGL vs SVG

| Renderer | Charts |
|----------|--------|
| **SVG (visx)** | All current charts - Area, Bar, Line, Funnel, Donut, Waterfall, Combo, SparkLine |
| **Canvas/WebGL (ECharts)** | None currently required; reserve for future 10K+ point scenarios |

---

## Data Fetching Patterns (Existing)

All hooks use `useFetchWithCache` (SWR pattern):
- **Stale Time**: 5 minutes
- **Cache Time**: 30 minutes
- **Retry**: 3 attempts
- **Revalidation**: On focus, manual, or cache invalidation

Hooks:
- `useAnalyticsSummary.ts` - Core analytics for all roles
- `useTeamPerformance.ts` - Sales rep performance data
- `useRevenueTimeline.ts` - Revenue with granularity options

---

## Real-Time Update Requirements

| Chart | Real-Time Needed | Update Frequency |
|-------|-----------------|------------------|
| Revenue Trends | No | On-demand/refresh |
| Quote Pipeline | No | On-demand/refresh |
| Team Leaderboard | No | On-demand/refresh |
| KPI Cards | No | On-demand/refresh |

**Conclusion**: No WebSocket streaming required for current charts. SWR cache invalidation is sufficient.

---

## Existing Stack Compatibility

| Technology | Version | Chart Integration |
|------------|---------|-------------------|
| Next.js | 16.1.1 | visx works with App Router |
| React | 19.2.3 | visx is React-native |
| Tailwind CSS | 4.1.0 | Style charts with utilities |
| TanStack Query | 5.90.16 | Use for chart data fetching |
| Framer Motion | 12.23.24 | Enhance chart animations |
| date-fns | 3.6.0 | Time axis formatting |
| Zod | 3.23.8 | Validate chart data schemas |
| DaisyUI | 5.3.7 | Theme tokens integration |

---

## Phase 0 Sign-Off

- [x] Chart inventory complete
- [x] Data volume profile documented
- [x] Performance budgets defined
- [x] Accessibility checklist created
- [x] SVG vs Canvas decision made (SVG for all)
- [x] Real-time requirements assessed (none needed)
- [x] Stack compatibility verified

**Ready to proceed to Phase 1: Foundation**
