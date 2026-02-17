# Analytics Dashboard PRD

## 1. Overview

- **Feature**: Business Intelligence Analytics Dashboard
- **Priority**: P3 (Advanced - After core features)
- **Status**: Not Started
- **Dependencies**: Dashboard (P0), Orders (P1), Quotes (P0)
- **Estimated Effort**: 14-18 hours

## 2. Business Context

**From `business_flow.md`:**

Analytics provide business insights:

- Revenue tracking and trends
- Quote conversion rates
- Sales rep performance metrics
- Customer behavior analysis
- Inventory/vendor performance (future)

**Business Value:**

- Data-driven decision making
- Identify top performers
- Spot bottlenecks in quote/order flow
- Track business growth

---

## 3. Role-Based Requirements

### Customer View

**Can:**

- View own spending history
- See own order trends
- Download own reports

**Cannot:**

- See company-wide or system analytics
- See other customer data

---

### Sales Rep View

**Can:**

- View personal performance metrics
- See conversion rates (own quotes)
- See revenue generated (own orders)
- Compare to team average (anonymized)

**Cannot:**

- See individual teammate stats
- See company-wide revenue details
- Export sensitive data

---

### Sales Manager View

**Can:**

- View team performance metrics
- See individual rep performance
- See revenue by rep, customer, time period
- View quote pipeline analysis
- Export team reports

**Cannot:**

- See admin-only system metrics
- Modify metrics/data

---

### Admin View

**Can:**

- Full analytics access
- System-wide metrics
- User activity analytics
- Performance benchmarks
- Export all reports
- Configure analytics settings

---

## 4. User Stories

### Epic 1: Sales Rep Analytics

**US-ANA-001**: As a Sales Rep, I want to see my conversion rate so I can track my effectiveness.

- **Priority**: P1
- **Acceptance Criteria**:
    - [ ] Given I have 20 quotes with 10 converted, when viewing analytics, then shows "50% conversion"
    - [ ] Given I view trend, when looking at chart, then I see monthly conversion rate
    - [ ] Given team avg is 45%, when viewing, then I see "5% above average"

---

### Epic 2: Manager Analytics

**US-ANA-002**: As a Sales Manager, I want to see team performance so I can identify coaching opportunities.

- **Priority**: P0
- **Acceptance Criteria**:
    - [ ] Given 5 reps on team, when viewing, then I see each rep's metrics
    - [ ] Given Rep A has 30% conversion, when comparing, then they're flagged as below average
    - [ ] Given I select date range, when filtering, then metrics recalculate

**US-ANA-003**: As a Sales Manager, I want to see revenue trends so I can forecast.

- **Priority**: P1
- **Acceptance Criteria**:
    - [ ] Given last 12 months data, when viewing chart, then I see monthly revenue
    - [ ] Given this month is $50K, last month was $45K, then shows "+11% growth"

---

### Epic 3: Admin Analytics

**US-ANA-004**: As an Admin, I want to see system-wide metrics so I can monitor business health.

- **Priority**: P1
- **Acceptance Criteria**:
    - [ ] Given 100 users, 500 orders, when viewing, then dashboard shows totals
    - [ ] Given API response times, when monitoring, then I see performance charts
    - [ ] Given I want weekly report, when scheduling, then report emails automatically

---

## 5. Technical Architecture

### 5.1 Backend

#### DTOs

**File**: `server/Classes/Others/AnalyticsDTOs.cs`

```csharp
public class SalesRepPerformance
{
    public string SalesRepId { get; set; } = string.Empty;
    public string SalesRepName { get; set; } = string.Empty;
    public int TotalQuotes { get; set; }
    public int ConvertedQuotes { get; set; }
    public double ConversionRate { get; set; }
    public decimal TotalRevenue { get; set; }
    public double AvgTurnaroundHours { get; set; }
    public int ActiveCustomers { get; set; }
}

public class RevenueData
{
    public DateTime Date { get; set; }
    public decimal Revenue { get; set; }
    public int OrderCount { get; set; }
}

public class QuotePipelineData
{
    public int Unread { get; set; }
    public int Read { get; set; }
    public int Approved { get; set; }
    public int Converted { get; set; }
    public int Rejected { get; set; }
    public int Expired { get; set; }
}

public class AnalyticsSummary
{
    // Overview
    public decimal TotalRevenue { get; set; }
    public decimal RevenueGrowthPercent { get; set; }
    public int TotalOrders { get; set; }
    public int TotalQuotes { get; set; }
    public double OverallConversionRate { get; set; }

    // Trends
    public List<RevenueData> RevenueByMonth { get; set; } = new();
    public List<RevenueData> RevenueByWeek { get; set; } = new();

    // Pipeline
    public QuotePipelineData QuotePipeline { get; set; } = new();

    // Top performers (manager/admin only)
    public List<SalesRepPerformance>? TopPerformers { get; set; }

    // Comparison
    public double? TeamAvgConversionRate { get; set; }
    public decimal? TeamAvgRevenue { get; set; }
}
```

#### Service

**File**: `server/Services/AnalyticsService.cs`

```csharp
public interface IAnalyticsService
{
    Task<AnalyticsSummary> GetSummary(string userId, AccountRole role, DateRange? dateRange);
    Task<List<SalesRepPerformance>> GetTeamPerformance(string managerId, DateRange? dateRange);
    Task<SalesRepPerformance> GetSalesRepPerformance(string salesRepId, DateRange? dateRange);
    Task<List<RevenueData>> GetRevenueTimeline(DateRange dateRange, string granularity);
}

public class AnalyticsService : IAnalyticsService
{
    private readonly Context _database;

    public async Task<AnalyticsSummary> GetSummary(string userId, AccountRole role, DateRange? dateRange)
    {
        dateRange ??= new DateRange
        {
            Start = DateTime.UtcNow.AddMonths(-12),
            End = DateTime.UtcNow
        };

        var summary = new AnalyticsSummary();

        // Base queries filtered by role
        IQueryable<Quote> quotesQuery = _database.Quotes.Where(q => !q.isArchived);
        IQueryable<Order> ordersQuery = _database.Orders.Where(o => !o.isArchived);

        if (role == AccountRole.SalesRep)
        {
            quotesQuery = quotesQuery.Where(q => q.AssignedSalesRepId == userId);
            ordersQuery = ordersQuery.Where(o => o.AssignedSalesRepId == userId);
        }
        else if (role == AccountRole.Customer)
        {
            var customerId = await GetCustomerIdForUser(userId);
            quotesQuery = quotesQuery.Where(q => q.CustomerId == customerId);
            ordersQuery = ordersQuery.Where(o => o.CustomerId == customerId);
        }
        // SalesManager and Admin see all

        // Apply date range
        quotesQuery = quotesQuery.Where(q => q.CreatedAt >= dateRange.Start && q.CreatedAt <= dateRange.End);
        ordersQuery = ordersQuery.Where(o => o.CreatedAt >= dateRange.Start && o.CreatedAt <= dateRange.End);

        // Calculate metrics
        var quotes = await quotesQuery.ToListAsync();
        var orders = await ordersQuery.ToListAsync();

        summary.TotalQuotes = quotes.Count;
        summary.TotalOrders = orders.Count;
        summary.TotalRevenue = orders.Sum(o => o.Total);
        summary.OverallConversionRate = quotes.Count > 0
            ? Math.Round((double)quotes.Count(q => q.Status == QuoteStatus.Converted) / quotes.Count * 100, 2)
            : 0;

        // Calculate growth (compare to previous period)
        var previousStart = dateRange.Start.AddDays(-(dateRange.End - dateRange.Start).TotalDays);
        var previousRevenue = await _database.Orders
            .Where(o => o.CreatedAt >= previousStart && o.CreatedAt < dateRange.Start)
            .SumAsync(o => o.Total);

        summary.RevenueGrowthPercent = previousRevenue > 0
            ? Math.Round((double)(summary.TotalRevenue - previousRevenue) / (double)previousRevenue * 100, 2)
            : 0;

        // Revenue by month
        summary.RevenueByMonth = orders
            .GroupBy(o => new { o.CreatedAt.Year, o.CreatedAt.Month })
            .Select(g => new RevenueData
            {
                Date = new DateTime(g.Key.Year, g.Key.Month, 1),
                Revenue = g.Sum(o => o.Total),
                OrderCount = g.Count()
            })
            .OrderBy(r => r.Date)
            .ToList();

        // Quote pipeline
        summary.QuotePipeline = new QuotePipelineData
        {
            Unread = quotes.Count(q => q.Status == QuoteStatus.Unread),
            Read = quotes.Count(q => q.Status == QuoteStatus.Read),
            Approved = quotes.Count(q => q.Status == QuoteStatus.Approved),
            Converted = quotes.Count(q => q.Status == QuoteStatus.Converted),
            Rejected = quotes.Count(q => q.Status == QuoteStatus.Rejected),
            Expired = quotes.Count(q => q.Status == QuoteStatus.Expired),
        };

        // Team comparison (for SalesRep)
        if (role == AccountRole.SalesRep)
        {
            var teamStats = await GetTeamAverages(dateRange);
            summary.TeamAvgConversionRate = teamStats.AvgConversionRate;
            summary.TeamAvgRevenue = teamStats.AvgRevenue;
        }

        // Top performers (for Manager/Admin)
        if (role >= AccountRole.SalesManager)
        {
            summary.TopPerformers = await GetTopPerformers(dateRange, 5);
        }

        return summary;
    }
}
```

#### Controller

**File**: `server/Controllers/AnalyticsController.cs`

```csharp
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AnalyticsController : BaseController
{
    private readonly IAnalyticsService _analyticsService;
    private readonly IAccountService _accountService;

    [HttpGet("summary")]
    public async Task<IResponse<AnalyticsSummary>> GetSummary(
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate)
    {
        var user = await _accountService.GetById();

        DateRange? dateRange = null;
        if (startDate.HasValue && endDate.HasValue)
        {
            dateRange = new DateRange { Start = startDate.Value, End = endDate.Value };
        }

        var summary = await _analyticsService.GetSummary(user.Id.ToString(), user.Role, dateRange);
        return Ok<AnalyticsSummary>("summary_retrieved", summary);
    }

    [HttpGet("team")]
    [Authorize(Policy = "SalesManagerOrAbove")]
    public async Task<IResponse<List<SalesRepPerformance>>> GetTeamPerformance(
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate)
    {
        var user = await _accountService.GetById();

        DateRange? dateRange = null;
        if (startDate.HasValue && endDate.HasValue)
        {
            dateRange = new DateRange { Start = startDate.Value, End = endDate.Value };
        }

        var team = await _analyticsService.GetTeamPerformance(user.Id.ToString(), dateRange);
        return Ok<List<SalesRepPerformance>>("team_retrieved", team);
    }

    [HttpGet("revenue")]
    [Authorize(Policy = "SalesManagerOrAbove")]
    public async Task<IResponse<List<RevenueData>>> GetRevenueTimeline(
        [FromQuery] DateTime startDate,
        [FromQuery] DateTime endDate,
        [FromQuery] string granularity = "month") // day, week, month
    {
        var dateRange = new DateRange { Start = startDate, End = endDate };
        var data = await _analyticsService.GetRevenueTimeline(dateRange, granularity);
        return Ok<List<RevenueData>>("revenue_retrieved", data);
    }
}
```

---

### 5.2 Frontend

#### API Integration

```typescript
// ADD to API object:

Analytics: {
  getSummary: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    return HttpService.get<AnalyticsSummary>(`/analytics/summary?${params}`)
  },

  getTeamPerformance: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    return HttpService.get<SalesRepPerformance[]>(`/analytics/team?${params}`)
  },

  getRevenue: async (startDate: string, endDate: string, granularity: string = 'month') =>
    HttpService.get<RevenueData[]>(
      `/analytics/revenue?startDate=${startDate}&endDate=${endDate}&granularity=${granularity}`
    ),
},
```

#### Components

**Location**: `client/app/app/analytics/_components/`

1. **RevenueChart.tsx** - Line chart for revenue trends
2. **ConversionFunnel.tsx** - Quote pipeline visualization
3. **TeamLeaderboard.tsx** - Top performers table
4. **MetricCard.tsx** - KPI card (reuse from dashboard)
5. **DateRangePicker.tsx** - Date range selector

---

## 6. Implementation Plan

### Phase 1: Backend (Days 1-3)

- [ ] Create AnalyticsDTOs
- [ ] Implement AnalyticsService
- [ ] Create AnalyticsController
- [ ] Add role-based data filtering

### Phase 2: Frontend (Days 4-6)

- [ ] Add API methods
- [ ] Create chart components
- [ ] Build analytics page
- [ ] Add date range filtering

### Phase 3: Testing (Days 7)

- [ ] Unit tests
- [ ] RBAC tests
- [ ] Performance tests (large datasets)

---

## 7. Tenant Timezone & Zero-Fill Bucket Behavior

### 7.1 Tenant Timezone Grouping

Revenue data is grouped using the **tenant's configured timezone** (IANA format, e.g., "America/New_York"). This ensures:

- Order timestamps are converted from UTC to tenant timezone before grouping
- Bucket boundaries align with the tenant's local business day/week/month
- Reports reflect the tenant's actual business calendar

**Configuration:**

- Timezone is stored on the `Tenant` entity (`Timezone` property)
- Defaults to "UTC" if not set
- Accessible via `ITenantContext.TimeZoneInfo`

### 7.2 Zero-Fill Bucket Behavior

All revenue timeline queries return **continuous buckets** for the requested date range, even if no orders exist in a period:

| Granularity | Bucket Definition                | Zero-Fill Behavior           |
| ----------- | -------------------------------- | ---------------------------- |
| `day`       | Single calendar day in tenant TZ | All days in range returned   |
| `week`      | Monday-Sunday (ISO 8601)         | All weeks in range returned  |
| `month`     | First day of month               | All months in range returned |

**Example Response (monthly, sparse data):**

```json
[
	{ "date": "2025-01-01", "revenue": 0, "orderCount": 0 },
	{ "date": "2025-02-01", "revenue": 0, "orderCount": 0 },
	{ "date": "2025-03-01", "revenue": 15000, "orderCount": 3 },
	{ "date": "2025-04-01", "revenue": 0, "orderCount": 0 }
	// ... continues for all months in range
]
```

### 7.3 Performance Guardrails

Maximum bucket limits prevent excessive payloads:

| Granularity | Max Buckets | Approx. Range |
| ----------- | ----------- | ------------- |
| `day`       | 400         | ~13 months    |
| `week`      | 104         | ~2 years      |
| `month`     | 36          | ~3 years      |

Requests exceeding these limits return a `400 Bad Request` with error message.

### 7.4 Implications for Charts & BI

1. **Chart Rendering**: Zero-filled data ensures charts always render a continuous line/area, even with sparse order data
2. **Trend Analysis**: Zero periods are visible, showing business seasonality
3. **BI Exports**: Downstream systems receive consistent, gap-free time series data
4. **Multi-Tenant Comparisons**: Tenants in different timezones see data aligned to their local business calendar

---

## 8. Success Criteria

- [ ] Sales reps see personal metrics
- [ ] Sales managers see team performance
- [ ] Revenue charts display correctly
- [ ] Date range filtering works
- [ ] RBAC enforced (role-appropriate data)
- [ ] Tests passing (95%+ coverage)
- [ ] Tenant timezone grouping works correctly
- [ ] Zero-fill buckets render continuous charts
