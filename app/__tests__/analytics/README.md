# Analytics Dashboard Tests

## MAANG-Level Test Coverage

This test suite provides comprehensive, enterprise-grade testing for the Analytics Dashboard feature as specified in `client/md/PRDs/prd_analytics.md`.

## Test Structure

```
__tests__/analytics/
├── README.md                           # This file
├── analytics-rbac.test.tsx             # 🔴 CRITICAL - RBAC security tests
├── analytics-business-logic.test.ts    # Business logic & calculations
├── hooks/
│   ├── useAnalyticsSummary.test.ts     # Summary data hook tests
│   ├── useTeamPerformance.test.ts      # Team performance hook tests
│   └── useRevenueTimeline.test.ts      # Revenue timeline hook tests
└── components/
    └── AnalyticsViews.test.tsx         # View component tests
```

## Test Categories

### 1. 🔴 RBAC Security Tests (`analytics-rbac.test.tsx`)

**Priority: CRITICAL**

Tests role-based access control per PRD Section 3:

| Role | Can Access | Cannot Access |
|------|------------|---------------|
| Customer | Own spending, Own orders | Company-wide analytics, Other customers |
| SalesRep | Personal metrics, Team average (anonymized) | Individual teammate stats, Company-wide revenue |
| SalesManager | Team performance, Individual rep metrics, Export | Modify data, Admin settings |
| Admin | Full access, System-wide metrics | N/A |

**Test Cases:**
- Customer cannot see company-wide analytics
- SalesRep cannot see individual teammate stats
- SalesManager can export team reports
- Admin has full access
- Unauthenticated users denied all access
- Role escalation prevention
- Permission hierarchy enforcement

### 2. Business Logic Tests (`analytics-business-logic.test.ts`)

Tests all calculations and business rules:

**Conversion Rate Calculations:**
- Standard: `converted / total * 100`
- Edge cases: 0 quotes, 100% conversion, 0% conversion
- Division by zero handling
- Precision (2 decimal places)

**Revenue Growth Calculations:**
- Period-over-period: `(current - previous) / previous * 100`
- Negative growth (decline)
- Zero previous period (first period)
- Large growth percentages

**Quote Pipeline:**
- Status distribution totals
- Funnel conversion rates at each stage
- Empty pipeline handling

**Averages:**
- Average Order Value (AOV)
- Team average conversion rate
- Weighted average turnaround time

**Date Ranges:**
- Preset calculations (7d, 30d, 90d, 6m, 12m, YTD)
- Custom range validation
- Boundary conditions (month, year, leap year)

### 3. Hook Tests

#### `useAnalyticsSummary.test.ts`

Tests data fetching and state management:

- Initial state validation
- Auto-fetch behavior
- Time range filtering (all presets)
- Error handling (network, API, malformed data)
- Loading states
- Caching and invalidation
- Edge cases (empty data, large numbers, negative growth)

#### `useTeamPerformance.test.ts`

Tests team performance data:

- Data fetching with date range
- All rep metrics validation
- Below-average performer detection
- Sorting and ranking
- Edge cases (empty team, single member, large teams)

#### `useRevenueTimeline.test.ts`

Tests revenue time series:

- Granularity options (day, week, month)
- Growth/decline pattern detection
- Date sorting
- Edge cases (empty range, single point, multi-year)

### 4. Component Tests (`AnalyticsViews.test.tsx`)

Tests role-specific view components:

**CustomerAnalytics:**
- Shows customer-specific metrics
- Hides company-wide data
- Hides team performance

**SalesRepAnalytics:**
- Shows personal metrics
- Shows team comparison (anonymized)
- Hides individual teammate names
- Above/below average indication

**ManagerAnalytics:**
- Shows all team members
- Shows individual rep metrics
- Shows revenue charts
- Shows company-wide totals

**State Components:**
- AnalyticsLoadingState
- AnalyticsEmptyState
- AnalyticsErrorState with retry

## PRD User Story Coverage

| User Story | Test File | Test Cases |
|------------|-----------|------------|
| US-ANA-001: Conversion Rate | `useAnalyticsSummary.test.ts` | 50% conversion for 10/20, Team comparison |
| US-ANA-002: Team Performance | `useTeamPerformance.test.ts` | 5 reps metrics, Below average flagging |
| US-ANA-003: Revenue Trends | `useRevenueTimeline.test.ts` | 12 months display, +11% growth calculation |
| US-ANA-004: System Metrics | `analytics-rbac.test.tsx` | Admin access tests |

## Test Data Builders

Located in `test-utils/analyticsTestBuilders.ts`:

```typescript
// Analytics Summary
new AnalyticsSummaryBuilder()
  .forManagerRole()
  .withTopPerformers(team)
  .build()

// Team Performance
new TeamPerformanceBuilder()
  .withTypicalTeam()
  .build()

// Revenue Series
new RevenueSeriesBuilder()
  .withGrowthPattern(12, 30000, 0.1)
  .build()

// Quote Pipeline
new QuotePipelineBuilder()
  .withAllConverted(100)
  .build()
```

### Edge Case Presets

- `withEmptyData()` - Empty/new system
- `withNegativeGrowth()` - Declining business
- `withLargeNumbers()` - Stress testing
- `withZeroQuotes()` - Division by zero
- `asTopPerformer()` / `asPoorPerformer()` - Rep performance extremes

## Running Tests

```bash
# Run all analytics tests
npm test -- __tests__/analytics

# Run specific test file
npm test -- analytics-rbac.test.tsx

# Run with coverage
npm test -- __tests__/analytics --coverage

# Run in watch mode
npm test -- __tests__/analytics --watch
```

## Coverage Goals

Per PRD Section 7 Success Criteria:
- **Target: 95%+ code coverage**
- All RBAC rules tested
- All calculations verified
- All edge cases covered

## Key Testing Principles

1. **Tests Based on PRD, Not Implementation**
   - Tests define expected behavior from requirements
   - Implementation must satisfy tests, not vice versa

2. **Defensive Programming**
   - All edge cases tested (zero, null, negative, large numbers)
   - Error handling verified
   - Graceful degradation confirmed

3. **Security First**
   - RBAC tests are highest priority
   - All role combinations tested
   - Escalation prevention verified

4. **Real-World Scenarios**
   - Business flow tested end-to-end
   - Date range filtering verified
   - Performance with large datasets

## Maintenance

When updating analytics features:

1. Update test builders first (add new fields/presets)
2. Add new test cases for new functionality
3. Ensure all existing tests still pass
4. Update this README with new coverage

## Related Files

- PRD: `client/md/PRDs/prd_analytics.md`
- Implementation: `client/app/app/analytics/`
- Test Builders: `test-utils/analyticsTestBuilders.ts`
- RBAC: `client/app/_shared/hooks/usePermissions.ts`

