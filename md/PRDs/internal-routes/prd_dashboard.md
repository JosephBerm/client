# Dashboard PRD

## 1. Overview

- **Feature**: Unified Dashboard for All Roles
- **Priority**: P0 (Critical - First feature after authentication)
- **Status**: Not Started
- **Dependencies**: RBAC System (Complete), User Authentication (Complete)
- **Estimated Effort**: 8-10 hours

## 2. Business Context

**From `business_flow.md`**:
Every user needs a central hub to see relevant information based on their role:
- **Customers**: Track their quotes and orders
- **Sales Reps**: See assigned quotes/orders, workload, performance
- **Fulfillment**: See orders to process, shipping tasks
- **Sales Managers**: Team overview, performance, bottlenecks
- **Admins**: System-wide metrics, issues requiring attention

**Business Value**:
- Reduces time to find relevant information
- Improves response times (sales reps see urgent quotes immediately)
- Increases visibility (managers see team performance)
- Enhances user experience (personalized dashboard per role)

## 3. Role-Based Requirements

### Customer View

**Can**:
- View own quote count (pending, approved, expired)
- View own order count (processing, shipped, delivered)
- See recent orders (last 5)
- See recent quotes (last 5)
- Quick action: Submit new quote request
- Quick action: Track order

**Cannot**:
- See other customers' data
- See sales rep information
- See system-wide metrics

**Dashboard Layout**:
```
[Welcome, John Doe]

[Stats Row]
┌─────────┬─────────┬─────────┐
│ Quotes  │ Orders  │ Total   │
│    3    │    7    │  Spent  │
│ Pending │ Active  │ $12,450 │
└─────────┴─────────┴─────────┘

[Quick Actions]
[Submit Quote] [Track Order]

[Recent Orders]
Table: Order #, Date, Status, Total

[Recent Quotes]
Table: Quote #, Date, Status, Products
```

---

### Sales Rep View

**Can**:
- View assigned quote count (by status: unread, read, approved)
- View assigned order count (by status: pending payment, processing, shipped)
- See today's tasks (quotes requiring action, orders pending fulfillment)
- See workload distribution (how many quotes vs team average)
- See personal performance metrics (conversion rate, avg turnaround time)
- Quick action: View next unread quote
- Quick action: Process payment

**Cannot**:
- See other sales reps' assigned quotes/orders
- See team-wide metrics (only own performance)
- Reassign quotes

**Dashboard Layout**:
```
[Welcome, Sales Rep Name]

[Stats Row]
┌─────────┬─────────┬─────────┬─────────┐
│ Unread  │ Orders  │ Conv.   │ Avg     │
│ Quotes  │ Pending │ Rate    │ Time    │
│    5    │    3    │  52%    │  24hrs  │
└─────────┴─────────┴─────────┴─────────┘

[Today's Tasks] 🚨
- 5 unread quotes (oldest: 18 hours ago)
- 3 orders awaiting payment confirmation
- 2 quotes expiring in 3 days

[Quick Actions]
[Next Quote] [Confirm Payment] [View Orders]

[Recent Activity]
Table: Action, Quote/Order, Time

[Performance This Month]
Chart: Quotes processed, Conversion rate trend
```

---

### Fulfillment Coordinator View

**Can**:
- View orders ready for fulfillment (payment confirmed, not shipped)
- View orders in transit (tracking numbers added)
- See pending tasks (add tracking, verify delivery)
- See fulfillment metrics (on-time rate, avg processing time)
- Quick action: Add tracking number
- Quick action: Mark as shipped

**Cannot**:
- See quotes (not part of their workflow)
- See other fulfillment coordinators' tasks (if multiple)
- Process payments or approve quotes

**Dashboard Layout**:
```
[Welcome, Fulfillment Name]

[Stats Row]
┌─────────┬─────────┬─────────┬─────────┐
│ Ready   │ In      │ On-Time │ Avg     │
│ to Ship │ Transit │ Rate    │ Time    │
│    7    │   12    │  96%    │  1.2d   │
└─────────┴─────────┴─────────┴─────────┘

[Urgent Tasks] 🚨
- 7 orders ready to ship (oldest: 2 days)
- 3 orders missing tracking numbers
- 1 order delivery exception

[Quick Actions]
[Ship Next] [Add Tracking] [View All]

[Recent Shipments]
Table: Order #, Customer, Shipped Date, Status
```

---

### Sales Manager View

**Can**:
- View team-wide quote/order metrics
- See sales rep workload distribution
- See team performance (conversion rates, turnaround times)
- Identify bottlenecks (aging quotes, over-assigned reps)
- See today's team tasks
- Quick action: Reassign quotes
- Quick action: View team performance report

**Cannot**:
- See system-wide admin metrics (user management, etc.)
- Create/edit products
- Manage user roles

**Dashboard Layout**:
```
[Welcome, Manager Name] - Team Dashboard

[Team Stats]
┌─────────┬─────────┬─────────┬─────────┐
│ Active  │ Team    │ Team    │ Revenue │
│ Quotes  │ Conv.   │ Avg     │ This Mo │
│   23    │  54%    │  18hrs  │ $125K   │
└─────────┴─────────┴─────────┴─────────┘

[Team Workload]
┌────────────┬────────┬────────┬────────┐
│ Sales Rep  │ Quotes │ Orders │ Status │
│ John D.    │   8    │   5    │   ✅   │
│ Jane S.    │   12   │   7    │   ⚠️   │
│ Mike R.    │   3    │   2    │   ✅   │
└────────────┴────────┴────────┴────────┘

[Alerts] 🚨
- 5 quotes unassigned
- 3 quotes aging >48 hours
- Jane S. workload 40% above average

[Quick Actions]
[Assign Quotes] [Team Report] [View Aging]

[Team Performance Trend]
Chart: Weekly conversion rate, Avg turnaround time
```

---

### Admin View

**Can**:
- View all system metrics
- See user activity (registrations, logins)
- See product/vendor metrics
- See financial overview
- See system health (errors, performance)
- Quick action: Manage users
- Quick action: Manage products
- Quick action: View reports

**Cannot**:
Nothing - full access

**Dashboard Layout**:
```
[Welcome, Admin] - System Overview

[System Stats]
┌─────────┬─────────┬─────────┬─────────┐
│ Active  │ Total   │ Total   │ System  │
│ Users   │ Quotes  │ Orders  │ Health  │
│   127   │   456   │   892   │   98%   │
└─────────┴─────────┴─────────┴─────────┘

[Revenue Overview]
┌────────────┬────────┬────────┬────────┐
│ Period     │ Orders │ Revenue│ Growth │
│ Today      │   12   │ $8,450 │  +5%   │
│ This Week  │   67   │ $52K   │  +12%  │
│ This Month │  234   │ $187K  │  +18%  │
└────────────┴────────┴────────┴────────┘

[System Alerts] 🚨
- 3 failed payment attempts today
- 2 users locked out (password attempts)
- Database backup: 2 hours ago

[Quick Actions]
[Manage Users] [Manage Products] [View Logs]

[User Activity]
Chart: Daily active users, New registrations

[System Performance]
Chart: API response times, Error rate
```

---

## 4. User Stories

### Epic 1: Customer Dashboard

**US-001**: As a Customer, I want to see my quote summary so that I know the status of my requests.
- **Priority**: P0
- **Acceptance Criteria**:
  - [ ] Given I'm logged in as customer, when I visit dashboard, then I see count of my quotes by status
  - [ ] Given I have 3 pending quotes, when dashboard loads, then stats card shows "3 Pending Quotes"
  - [ ] Given I click quote stat, when navigating, then I see filtered quotes list

**US-002**: As a Customer, I want to see my recent orders so that I can track deliveries.
- **Priority**: P0
- **Acceptance Criteria**:
  - [ ] Given I have orders, when dashboard loads, then I see last 5 orders
  - [ ] Given I click order row, when navigating, then I see order detail page
  - [ ] Given order is shipped, when viewing, then I see tracking number link

**US-003**: As a Customer, I want quick action buttons so that I can perform common tasks quickly.
- **Priority**: P1
- **Acceptance Criteria**:
  - [ ] Given dashboard loaded, when I see quick actions, then "Submit Quote" button is visible
  - [ ] Given I click "Submit Quote", when navigating, then I'm on store page with cart open
  - [ ] Given I have active order, when I click "Track Order", then I see tracking page

---

### Epic 2: Sales Rep Dashboard

**US-004**: As a Sales Rep, I want to see my assigned quotes count so that I know my workload.
- **Priority**: P0
- **Acceptance Criteria**:
  - [ ] Given I'm assigned 5 unread quotes, when dashboard loads, then stat shows "5 Unread Quotes"
  - [ ] Given I mark quote as read, when refreshing, then unread count decreases by 1
  - [ ] Given I have no quotes, when dashboard loads, then stat shows "0" with encouragement message

**US-005**: As a Sales Rep, I want to see urgent tasks so that I prioritize work effectively.
- **Priority**: P0
- **Acceptance Criteria**:
  - [ ] Given quotes older than 24hrs, when dashboard loads, then they appear in "Urgent Tasks"
  - [ ] Given payment pending >3 days, when dashboard loads, then it's flagged as urgent
  - [ ] Given quotes expiring soon, when dashboard loads, then warning is displayed

**US-006**: As a Sales Rep, I want to see my performance metrics so that I track my effectiveness.
- **Priority**: P1
- **Acceptance Criteria**:
  - [ ] Given I've processed 10 quotes with 5 converted, when viewing metrics, then conversion rate shows "50%"
  - [ ] Given my avg turnaround is 18 hours, when viewing metrics, then it's displayed
  - [ ] Given team average is 24 hours, when viewing, then I see I'm above average

---

### Epic 3: Sales Manager Dashboard

**US-007**: As a Sales Manager, I want to see team workload distribution so that I balance assignments.
- **Priority**: P0
- **Acceptance Criteria**:
  - [ ] Given team has 3 sales reps, when dashboard loads, then I see quote count per rep
  - [ ] Given one rep has 40% more quotes, when viewing, then they're flagged as overloaded
  - [ ] Given unassigned quotes exist, when dashboard loads, then alert is displayed

**US-008**: As a Sales Manager, I want to see aging quotes so that I prevent lost sales.
- **Priority**: P0
- **Acceptance Criteria**:
  - [ ] Given quotes >48 hours old, when dashboard loads, then they're in alerts section
  - [ ] Given I click aging alert, when navigating, then I see filtered quotes list
  - [ ] Given I can reassign, when clicking reassign, then assignment modal opens

---

## 5. Technical Architecture

### 5.1 Backend

#### Database Changes
**Migration**: `20241220_AddDashboardStatsIndexes.cs`
```csharp
// Add indexes for performance
protected override void Up(MigrationBuilder migrationBuilder)
{
    // Index for customer dashboard queries
    migrationBuilder.CreateIndex(
        name: "IX_Quotes_CustomerId_Status",
        table: "quotes",
        columns: new[] { "customer_id", "status" });
    
    migrationBuilder.CreateIndex(
        name: "IX_Orders_CustomerId_Status",
        table: "orders",
        columns: new[] { "customer_id", "status" });
    
    // Index for sales rep dashboard queries
    migrationBuilder.CreateIndex(
        name: "IX_Quotes_AssignedSalesRepId_Status",
        table: "quotes",
        columns: new[] { "assigned_sales_rep_id", "status" });
    
    migrationBuilder.CreateIndex(
        name: "IX_Orders_AssignedSalesRepId_Status",
        table: "orders",
        columns: new[] { "assigned_sales_rep_id", "status" });
    
    // Index for date-based queries (aging quotes)
    migrationBuilder.CreateIndex(
        name: "IX_Quotes_CreatedAt",
        table: "quotes",
        column: "created_at");
}
```

#### DTOs
**File**: `server/Classes/Others/DashboardDTOs.cs`
```csharp
public class DashboardStatsResponse
{
    // Customer stats
    public int? PendingQuotes { get; set; }
    public int? ApprovedQuotes { get; set; }
    public int? ActiveOrders { get; set; }
    public decimal? TotalSpent { get; set; }
    
    // Sales Rep stats
    public int? UnreadQuotes { get; set; }
    public int? OrdersPendingPayment { get; set; }
    public double? ConversionRate { get; set; }
    public double? AvgTurnaroundHours { get; set; }
    
    // Fulfillment stats
    public int? OrdersReadyToShip { get; set; }
    public int? OrdersInTransit { get; set; }
    public double? OnTimeRate { get; set; }
    
    // Manager stats
    public int? TeamActiveQuotes { get; set; }
    public double? TeamConversionRate { get; set; }
    public decimal? MonthlyRevenue { get; set; }
    public List<SalesRepWorkload>? TeamWorkload { get; set; }
    
    // Admin stats
    public int? TotalActiveUsers { get; set; }
    public int? TotalQuotes { get; set; }
    public int? TotalOrders { get; set; }
    public double? SystemHealth { get; set; }
}

public class SalesRepWorkload
{
    public int? SalesRepId { get; set; }  // int? matches Account.Id
    public string SalesRepName { get; set; } = string.Empty;
    public int ActiveQuotes { get; set; }
    public int ActiveOrders { get; set; }
    public bool IsOverloaded { get; set; }
}

public class DashboardTask
{
    public Guid? QuoteId { get; set; }     // Guid? for quotes
    public int? OrderId { get; set; }      // int? for orders
    public string Type { get; set; } = string.Empty; // "quote", "order", "payment"
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public bool IsUrgent { get; set; }
    public string ActionUrl { get; set; } = string.Empty;
}

public class RecentItem
{
    public Guid? QuoteId { get; set; }     // Guid? when type = "quote"
    public int? OrderId { get; set; }      // int? when type = "order"
    public string Type { get; set; } = string.Empty; // "quote", "order"
    public string Number { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public string Status { get; set; } = string.Empty;
    public decimal? Amount { get; set; }
}
```

#### Service Methods
**File**: `server/Services/DB/DashboardService.cs` (NEW)
```csharp
public interface IDashboardService
{
    Task<DashboardStatsResponse> GetStats(int? userId, AccountRole role);
    Task<List<DashboardTask>> GetTasks(int? userId, AccountRole role);
    Task<List<RecentItem>> GetRecentItems(int? userId, AccountRole role, int count = 5);
}

public class DashboardService : IDashboardService
{
    private readonly Context _database;
    private readonly IQuoteService _quoteService;
    private readonly IOrderService _orderService;
    private readonly IAccountService _accountService;
    
    public DashboardService(
        Context database,
        IQuoteService quoteService,
        IOrderService orderService,
        IAccountService accountService)
    {
        _database = database;
        _quoteService = quoteService;
        _orderService = orderService;
        _accountService = accountService;
    }
    
    public async Task<DashboardStatsResponse> GetStats(int? userId, AccountRole role)
    {
        return role switch
        {
            AccountRole.Customer => await GetCustomerStats(userId),
            AccountRole.SalesRep => await GetSalesRepStats(userId),
            AccountRole.FulfillmentCoordinator => await GetFulfillmentStats(userId),
            AccountRole.SalesManager => await GetManagerStats(userId),
            AccountRole.Admin => await GetAdminStats(),
            _ => new DashboardStatsResponse()
        };
    }
    
    private async Task<DashboardStatsResponse> GetCustomerStats(int? userId)
    {
        var quotes = await _database.Quotes
            .Where(q => q.CustomerId == userId)  // CustomerId is int?
            .GroupBy(q => q.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToListAsync();
        
        var orders = await _database.Orders
            .Where(o => o.CustomerId == userId)
            .ToListAsync();
        
        var totalSpent = orders.Sum(o => o.Total);
        
        return new DashboardStatsResponse
        {
            PendingQuotes = quotes.FirstOrDefault(q => q.Status == QuoteStatus.Unread)?.Count ?? 0,
            ApprovedQuotes = quotes.FirstOrDefault(q => q.Status == QuoteStatus.Approved)?.Count ?? 0,
            ActiveOrders = orders.Count(o => o.Status != OrderStatus.Delivered && o.Status != OrderStatus.Cancelled),
            TotalSpent = totalSpent
        };
    }
    
    private async Task<DashboardStatsResponse> GetSalesRepStats(int? userId)
    {
        // Note: AssignedSalesRepId is stored as string in DB but references Account.Id (int)
        var userIdStr = userId?.ToString();
        
        var assignedQuotes = await _database.Quotes
            .Where(q => q.AssignedSalesRepId == userIdStr)
            .ToListAsync();
        
        var assignedOrders = await _database.Orders
            .Where(o => o.AssignedSalesRepId == userIdStr)
            .ToListAsync();
        
        // Calculate conversion rate (quotes converted to orders)
        var totalQuotes = assignedQuotes.Count;
        var convertedQuotes = assignedQuotes.Count(q => q.Status == QuoteStatus.Converted);
        var conversionRate = totalQuotes > 0 ? (double)convertedQuotes / totalQuotes * 100 : 0;
        
        // Calculate avg turnaround time (quote created -> approved)
        var approvedQuotes = assignedQuotes.Where(q => q.Status == QuoteStatus.Approved || q.Status == QuoteStatus.Converted);
        var avgTurnaround = approvedQuotes.Any() 
            ? approvedQuotes.Average(q => (q.UpdatedAt - q.CreatedAt).TotalHours)
            : 0;
        
        return new DashboardStatsResponse
        {
            UnreadQuotes = assignedQuotes.Count(q => q.Status == QuoteStatus.Unread),
            OrdersPendingPayment = assignedOrders.Count(o => o.Status == OrderStatus.Placed),
            ConversionRate = Math.Round(conversionRate, 2),
            AvgTurnaroundHours = Math.Round(avgTurnaround, 1)
        };
    }
    
    private async Task<DashboardStatsResponse> GetManagerStats(int? userId)
    {
        // Get all sales reps in manager's team
        var teamReps = await _database.Accounts
            .Where(a => a.Role == AccountRole.SalesRep)
            .ToListAsync();
        
        // AssignedSalesRepId is stored as string, convert for comparison
        var teamRepIds = teamReps.Select(r => r.Id?.ToString()).ToList();
        
        var teamQuotes = await _database.Quotes
            .Where(q => teamRepIds.Contains(q.AssignedSalesRepId))
            .ToListAsync();
        
        var teamOrders = await _database.Orders
            .Where(o => teamRepIds.Contains(o.AssignedSalesRepId))
            .ToListAsync();
        
        // Team workload
        var workload = teamReps.Select(rep => new SalesRepWorkload
        {
            SalesRepId = rep.Id,  // Keep as int?
            SalesRepName = rep.FirstName + " " + rep.LastName,
            ActiveQuotes = teamQuotes.Count(q => q.AssignedSalesRepId == rep.Id?.ToString() && q.Status != QuoteStatus.Converted),
            ActiveOrders = teamOrders.Count(o => o.AssignedSalesRepId == rep.Id?.ToString() && o.Status != OrderStatus.Delivered),
            IsOverloaded = false // TODO: Calculate based on team average
        }).ToList();
        
        // Calculate team average and flag overloaded reps
        var avgQuotes = workload.Average(w => w.ActiveQuotes);
        foreach (var rep in workload)
        {
            rep.IsOverloaded = rep.ActiveQuotes > avgQuotes * 1.4; // 40% above average
        }
        
        var monthlyRevenue = teamOrders
            .Where(o => o.CreatedAt >= DateTime.UtcNow.AddMonths(-1))
            .Sum(o => o.Total);
        
        return new DashboardStatsResponse
        {
            TeamActiveQuotes = teamQuotes.Count(q => q.Status != QuoteStatus.Converted),
            TeamConversionRate = teamQuotes.Count > 0 
                ? Math.Round((double)teamQuotes.Count(q => q.Status == QuoteStatus.Converted) / teamQuotes.Count * 100, 2)
                : 0,
            MonthlyRevenue = monthlyRevenue,
            TeamWorkload = workload
        };
    }
    
    private async Task<DashboardStatsResponse> GetAdminStats()
    {
        var activeUsers = await _database.Accounts.CountAsync(a => a.Role != AccountRole.Admin);
        var totalQuotes = await _database.Quotes.CountAsync();
        var totalOrders = await _database.Orders.CountAsync();
        
        // System health: Simple calculation (can be enhanced)
        var systemHealth = 98.5; // TODO: Calculate from error logs, API response times
        
        return new DashboardStatsResponse
        {
            TotalActiveUsers = activeUsers,
            TotalQuotes = totalQuotes,
            TotalOrders = totalOrders,
            SystemHealth = systemHealth
        };
    }
    
    public async Task<List<DashboardTask>> GetTasks(string userId, AccountRole role)
    {
        var tasks = new List<DashboardTask>();
        
        if (role == AccountRole.SalesRep)
        {
            // Unread quotes
            var unreadQuotes = await _database.Quotes
                .Where(q => q.AssignedSalesRepId == userId && q.Status == QuoteStatus.Unread)
                .OrderBy(q => q.CreatedAt)
                .Take(10)
                .ToListAsync();
            
            tasks.AddRange(unreadQuotes.Select(q => new DashboardTask
            {
                Id = q.Id.ToString(),
                Type = "quote",
                Title = $"New quote from {q.CustomerName}",
                Description = $"{q.Products.Count} products requested",
                CreatedAt = q.CreatedAt,
                IsUrgent = (DateTime.UtcNow - q.CreatedAt).TotalHours > 24,
                ActionUrl = $"/quotes/{q.Id}"
            }));
            
            // Orders pending payment
            var pendingPayment = await _database.Orders
                .Where(o => o.AssignedSalesRepId == userId && o.Status == OrderStatus.Placed)
                .OrderBy(o => o.CreatedAt)
                .Take(5)
                .ToListAsync();
            
            tasks.AddRange(pendingPayment.Select(o => new DashboardTask
            {
                Id = o.Id.ToString(),
                Type = "payment",
                Title = $"Confirm payment for Order #{o.Number}",
                Description = $"${o.Total} - Pending {(DateTime.UtcNow - o.CreatedAt).TotalDays:F0} days",
                CreatedAt = o.CreatedAt,
                IsUrgent = (DateTime.UtcNow - o.CreatedAt).TotalDays > 3,
                ActionUrl = $"/orders/{o.Id}"
            }));
        }
        
        return tasks.OrderByDescending(t => t.IsUrgent).ThenBy(t => t.CreatedAt).ToList();
    }
    
    public async Task<List<RecentItem>> GetRecentItems(string userId, AccountRole role, int count = 5)
    {
        var items = new List<RecentItem>();
        
        if (role == AccountRole.Customer)
        {
            var recentOrders = await _database.Orders
                .Where(o => o.CustomerId == userId)
                .OrderByDescending(o => o.CreatedAt)
                .Take(count)
                .ToListAsync();
            
            items.AddRange(recentOrders.Select(o => new RecentItem
            {
                Id = o.Id.ToString(),
                Type = "order",
                Number = o.Number,
                Date = o.CreatedAt,
                Status = o.Status.ToString(),
                Amount = o.Total
            }));
            
            var recentQuotes = await _database.Quotes
                .Where(q => q.CustomerId == userId)
                .OrderByDescending(q => q.CreatedAt)
                .Take(count)
                .ToListAsync();
            
            items.AddRange(recentQuotes.Select(q => new RecentItem
            {
                Id = q.Id.ToString(),
                Type = "quote",
                Number = q.Id.ToString().Substring(0, 8),
                Date = q.CreatedAt,
                Status = q.Status.ToString(),
                Amount = null
            }));
        }
        
        return items.OrderByDescending(i => i.Date).Take(count).ToList();
    }
}
```

#### Controller Endpoints
**File**: `server/Controllers/DashboardController.cs` (NEW)
```csharp
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : BaseController
{
    private readonly IDashboardService _dashboardService;
    private readonly IAccountService _accountService;
    
    public DashboardController(
        IDashboardService dashboardService,
        IAccountService accountService)
    {
        _dashboardService = dashboardService;
        _accountService = accountService;
    }
    
    [HttpGet("stats")]
    public async Task<IResponse<DashboardStatsResponse>> GetStats()
    {
        try
        {
            var user = await _accountService.GetById();
            var stats = await _dashboardService.GetStats(user.Id.ToString(), user.Role);
            
            return Ok("stats_retrieved", stats);
        }
        catch (Exception ex)
        {
            return UnexpectedError<DashboardStatsResponse>($"Failed to get stats: {ex.Message}");
        }
    }
    
    [HttpGet("tasks")]
    public async Task<IResponse<List<DashboardTask>>> GetTasks()
    {
        try
        {
            var user = await _accountService.GetById();
            var tasks = await _dashboardService.GetTasks(user.Id.ToString(), user.Role);
            
            return Ok("tasks_retrieved", tasks);
        }
        catch (Exception ex)
        {
            return UnexpectedError<List<DashboardTask>>($"Failed to get tasks: {ex.Message}");
        }
    }
    
    [HttpGet("recent")]
    public async Task<IResponse<List<RecentItem>>> GetRecentItems([FromQuery] int count = 5)
    {
        try
        {
            var user = await _accountService.GetById();
            var items = await _dashboardService.GetRecentItems(user.Id.ToString(), user.Role, count);
            
            return Ok("recent_items_retrieved", items);
        }
        catch (Exception ex)
        {
            return UnexpectedError<List<RecentItem>>($"Failed to get recent items: {ex.Message}");
        }
    }
}
```

---

### 5.2 Frontend

#### API Integration
**File**: `client/app/_shared/services/api.ts`
```typescript
// Add to API object
export const API = {
  // ... existing methods
  
  Dashboard: {
    getStats: async <T>() => 
      HttpService.get<T>('/dashboard/stats'),
    
    getTasks: async <T>() => 
      HttpService.get<T>('/dashboard/tasks'),
    
    getRecentItems: async <T>(count: number = 5) => 
      HttpService.get<T>(`/dashboard/recent?count=${count}`),
  },
}
```

#### Types
**File**: `client/app/_types/dashboard.types.ts` (NEW)
```typescript
export interface DashboardStats {
  // Customer
  pendingQuotes?: number
  approvedQuotes?: number
  activeOrders?: number
  totalSpent?: number
  
  // Sales Rep
  unreadQuotes?: number
  ordersPendingPayment?: number
  conversionRate?: number
  avgTurnaroundHours?: number
  
  // Fulfillment
  ordersReadyToShip?: number
  ordersInTransit?: number
  onTimeRate?: number
  
  // Manager
  teamActiveQuotes?: number
  teamConversionRate?: number
  monthlyRevenue?: number
  teamWorkload?: SalesRepWorkload[]
  
  // Admin
  totalActiveUsers?: number
  totalQuotes?: number
  totalOrders?: number
  systemHealth?: number
}

export interface SalesRepWorkload {
  salesRepId: number | null   // int? from backend Account.Id
  salesRepName: string
  activeQuotes: number
  activeOrders: number
  isOverloaded: boolean
}

export interface DashboardTask {
  quoteId: string | null      // Guid? serialized as string
  orderId: number | null      // int? from backend Order.Id
  type: 'quote' | 'order' | 'payment'
  title: string
  description: string
  createdAt: string
  isUrgent: boolean
  actionUrl: string
}

export interface RecentItem {
  quoteId: string | null      // Guid? serialized as string when type="quote"
  orderId: number | null      // int? when type="order"
  type: 'quote' | 'order'
  number: string
  date: string
  status: string
  amount?: number
}
```

#### Custom Hooks
**Location**: `client/app/app/dashboard/_components/hooks/`

**useDashboardStats.ts**
```typescript
import { useState, useEffect, useCallback } from 'react'
import { useFormSubmit } from '@_shared/hooks/useFormSubmit'
import { API } from '@_shared/services/api'
import type { DashboardStats } from '@_types/dashboard.types'

export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  
  const { submit: fetchStats, isSubmitting: isLoading, error } = useFormSubmit(
    async () => API.Dashboard.getStats<DashboardStats>(),
    {
      componentName: 'Dashboard',
      actionName: 'fetchStats',
      onSuccess: (data) => setStats(data),
    }
  )
  
  useEffect(() => {
    fetchStats()
  }, [])
  
  const refetch = useCallback(() => {
    fetchStats()
  }, [fetchStats])
  
  return { stats, isLoading, error, refetch }
}
```

**useDashboardTasks.ts**
```typescript
import { useState, useEffect, useCallback } from 'react'
import { useFormSubmit } from '@_shared/hooks/useFormSubmit'
import { API } from '@_shared/services/api'
import type { DashboardTask } from '@_types/dashboard.types'

export const useDashboardTasks = () => {
  const [tasks, setTasks] = useState<DashboardTask[]>([])
  
  const { submit: fetchTasks, isSubmitting: isLoading, error } = useFormSubmit(
    async () => API.Dashboard.getTasks<DashboardTask[]>(),
    {
      componentName: 'Dashboard',
      actionName: 'fetchTasks',
      onSuccess: (data) => setTasks(data),
    }
  )
  
  useEffect(() => {
    fetchTasks()
  }, [])
  
  const refetch = useCallback(() => {
    fetchTasks()
  }, [fetchTasks])
  
  const urgentTasks = tasks.filter(t => t.isUrgent)
  const regularTasks = tasks.filter(t => !t.isUrgent)
  
  return { tasks, urgentTasks, regularTasks, isLoading, error, refetch }
}
```

**useRecentItems.ts**
```typescript
import { useState, useEffect, useCallback } from 'react'
import { useFormSubmit } from '@_shared/hooks/useFormSubmit'
import { API } from '@_shared/services/api'
import type { RecentItem } from '@_types/dashboard.types'

export const useRecentItems = (count: number = 5) => {
  const [items, setItems] = useState<RecentItem[]>([])
  
  const { submit: fetchItems, isSubmitting: isLoading, error } = useFormSubmit(
    async () => API.Dashboard.getRecentItems<RecentItem[]>(count),
    {
      componentName: 'Dashboard',
      actionName: 'fetchRecentItems',
      onSuccess: (data) => setItems(data),
    }
  )
  
  useEffect(() => {
    fetchItems()
  }, [count])
  
  const refetch = useCallback(() => {
    fetchItems()
  }, [fetchItems])
  
  const recentOrders = items.filter(i => i.type === 'order')
  const recentQuotes = items.filter(i => i.type === 'quote')
  
  return { items, recentOrders, recentQuotes, isLoading, error, refetch }
}
```

**index.ts** (Barrel Export)
```typescript
export { useDashboardStats } from './useDashboardStats'
export { useDashboardTasks } from './useDashboardTasks'
export { useRecentItems } from './useRecentItems'
```

#### Components
**Location**: `client/app/app/dashboard/_components/`

**StatsCard.tsx**
```tsx
'use client'

import { Card } from '@_components/ui'
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: {
    value: number
    label: string
    isPositive: boolean
  }
  onClick?: () => void
}

export const StatsCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon,
  trend,
  onClick 
}: StatsCardProps) => {
  return (
    <Card 
      className="p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-400">{subtitle}</p>
          )}
          {trend && (
            <p className={`text-xs ${trend.isPositive ? 'text-success' : 'text-error'}`}>
              {trend.isPositive ? '↑' : '↓'} {trend.value}% {trend.label}
            </p>
          )}
        </div>
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
    </Card>
  )
}
```

**TaskList.tsx**
```tsx
'use client'

import { Card } from '@_components/ui'
import { AlertCircle, CheckCircle, Clock } from 'lucide-react'
import type { DashboardTask } from '@_types/dashboard.types'
import Link from 'next/link'

interface TaskListProps {
  tasks: DashboardTask[]
  title: string
  showUrgent?: boolean
}

export const TaskList = ({ tasks, title, showUrgent = true }: TaskListProps) => {
  if (tasks.length === 0) {
    return (
      <Card className="p-4">
        <h3 className="font-semibold mb-2">{title}</h3>
        <div className="flex items-center justify-center py-8 text-gray-400">
          <CheckCircle className="w-5 h-5 mr-2" />
          <span>All caught up!</span>
        </div>
      </Card>
    )
  }
  
  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-4">{title}</h3>
      <ul className="space-y-3">
        {tasks.map((task) => (
          <li key={task.id}>
            <Link 
              href={task.actionUrl}
              className="flex items-start p-2 rounded-lg hover:bg-base-200 transition-colors"
            >
              {task.isUrgent && showUrgent ? (
                <AlertCircle className="w-5 h-5 text-error mr-3 mt-0.5 flex-shrink-0" />
              ) : (
                <Clock className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{task.title}</p>
                <p className="text-sm text-gray-500 truncate">{task.description}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  )
}
```

**QuickActions.tsx**
```tsx
'use client'

import { Button } from '@_components/ui'
import { PermissionGuard } from '@_components/common/guards/PermissionGuard'
import { Resources, Actions } from '@_shared/rbac/constants'
import { useRouter } from 'next/navigation'

interface QuickAction {
  label: string
  href: string
  resource?: string
  action?: string
}

interface QuickActionsProps {
  actions: QuickAction[]
}

export const QuickActions = ({ actions }: QuickActionsProps) => {
  const router = useRouter()
  
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action, index) => {
        const button = (
          <Button 
            key={index}
            variant="outline" 
            size="sm"
            onClick={() => router.push(action.href)}
          >
            {action.label}
          </Button>
        )
        
        if (action.resource && action.action) {
          return (
            <PermissionGuard 
              key={index}
              resource={action.resource} 
              action={action.action}
            >
              {button}
            </PermissionGuard>
          )
        }
        
        return button
      })}
    </div>
  )
}
```

**RecentItemsTable.tsx**
```tsx
'use client'

import { Card } from '@_components/ui'
import type { RecentItem } from '@_types/dashboard.types'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

interface RecentItemsTableProps {
  items: RecentItem[]
  title: string
  type: 'order' | 'quote'
}

export const RecentItemsTable = ({ items, title, type }: RecentItemsTableProps) => {
  if (items.length === 0) {
    return (
      <Card className="p-4">
        <h3 className="font-semibold mb-2">{title}</h3>
        <p className="text-gray-400 text-center py-4">No recent {type}s</p>
      </Card>
    )
  }
  
  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-4">{title}</h3>
      <div className="overflow-x-auto">
        <table className="table table-sm">
          <thead>
            <tr>
              <th>{type === 'order' ? 'Order #' : 'Quote #'}</th>
              <th>Date</th>
              <th>Status</th>
              {type === 'order' && <th>Amount</th>}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="hover">
                <td>
                  <Link 
                    href={`/${type}s/${item.id}`}
                    className="link link-primary"
                  >
                    {item.number}
                  </Link>
                </td>
                <td className="text-gray-500">
                  {formatDistanceToNow(new Date(item.date), { addSuffix: true })}
                </td>
                <td>
                  <span className={`badge badge-sm ${getStatusBadgeClass(item.status)}`}>
                    {item.status}
                  </span>
                </td>
                {type === 'order' && (
                  <td>${item.amount?.toFixed(2) ?? '-'}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function getStatusBadgeClass(status: string): string {
  const statusMap: Record<string, string> = {
    'Unread': 'badge-warning',
    'Read': 'badge-info',
    'Approved': 'badge-success',
    'Rejected': 'badge-error',
    'Pending': 'badge-warning',
    'Processing': 'badge-info',
    'Shipped': 'badge-primary',
    'Delivered': 'badge-success',
  }
  return statusMap[status] ?? 'badge-ghost'
}
```

**TeamWorkloadTable.tsx** (Sales Manager only)
```tsx
'use client'

import { Card } from '@_components/ui'
import { PermissionGuard } from '@_components/common/guards/PermissionGuard'
import { Resources, Actions } from '@_shared/rbac/constants'
import type { SalesRepWorkload } from '@_types/dashboard.types'
import { AlertTriangle, CheckCircle } from 'lucide-react'

interface TeamWorkloadTableProps {
  workload: SalesRepWorkload[]
}

export const TeamWorkloadTable = ({ workload }: TeamWorkloadTableProps) => {
  return (
    <PermissionGuard resource={Resources.Users} action={Actions.ViewTeam}>
      <Card className="p-4">
        <h3 className="font-semibold mb-4">Team Workload</h3>
        <div className="overflow-x-auto">
          <table className="table table-sm">
            <thead>
              <tr>
                <th>Sales Rep</th>
                <th>Quotes</th>
                <th>Orders</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {workload.map((rep) => (
                <tr key={rep.salesRepId} className="hover">
                  <td>{rep.salesRepName}</td>
                  <td>{rep.activeQuotes}</td>
                  <td>{rep.activeOrders}</td>
                  <td>
                    {rep.isOverloaded ? (
                      <span className="flex items-center text-warning">
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        Overloaded
                      </span>
                    ) : (
                      <span className="flex items-center text-success">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        OK
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </PermissionGuard>
  )
}
```

**index.ts** (Barrel Export)
```typescript
export { StatsCard } from './StatsCard'
export { TaskList } from './TaskList'
export { QuickActions } from './QuickActions'
export { RecentItemsTable } from './RecentItemsTable'
export { TeamWorkloadTable } from './TeamWorkloadTable'
export * from './hooks'
```

#### Page Implementation
**File**: `client/app/app/dashboard/page.tsx`
```tsx
'use client'

import { 
  StatsCard, 
  TaskList, 
  QuickActions, 
  RecentItemsTable,
  TeamWorkloadTable,
  useDashboardStats,
  useDashboardTasks,
  useRecentItems
} from './_components'
import { useAuth } from '@_shared/hooks'
import { PermissionGuard } from '@_components/common/guards/PermissionGuard'
import { Resources, Actions } from '@_shared/rbac/constants'
import { 
  FileText, 
  Package, 
  DollarSign, 
  Users,
  BarChart,
  Activity
} from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuth()
  const { stats, isLoading: statsLoading } = useDashboardStats()
  const { urgentTasks, regularTasks, isLoading: tasksLoading } = useDashboardTasks()
  const { recentOrders, recentQuotes, isLoading: itemsLoading } = useRecentItems()
  
  const isLoading = statsLoading || tasksLoading || itemsLoading
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Welcome Header */}
      <h1 className="text-2xl font-bold">
        Welcome, {user?.firstName ?? 'User'}
      </h1>
      
      {/* Stats Row - Role-based */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Customer Stats */}
        <PermissionGuard resource={Resources.Quotes} action={Actions.ViewOwn}>
          <StatsCard
            title="Pending Quotes"
            value={stats?.pendingQuotes ?? 0}
            subtitle="Awaiting response"
            icon={FileText}
          />
        </PermissionGuard>
        
        <PermissionGuard resource={Resources.Orders} action={Actions.ViewOwn}>
          <StatsCard
            title="Active Orders"
            value={stats?.activeOrders ?? 0}
            subtitle="In progress"
            icon={Package}
          />
        </PermissionGuard>
        
        {/* Sales Rep Stats */}
        <PermissionGuard resource={Resources.Quotes} action={Actions.ViewAssigned}>
          <StatsCard
            title="Unread Quotes"
            value={stats?.unreadQuotes ?? 0}
            subtitle="Need attention"
            icon={FileText}
          />
        </PermissionGuard>
        
        <PermissionGuard resource={Resources.Quotes} action={Actions.ViewAssigned}>
          <StatsCard
            title="Conversion Rate"
            value={`${stats?.conversionRate ?? 0}%`}
            subtitle="This month"
            icon={BarChart}
          />
        </PermissionGuard>
        
        {/* Manager Stats */}
        <PermissionGuard resource={Resources.Users} action={Actions.ViewTeam}>
          <StatsCard
            title="Team Active Quotes"
            value={stats?.teamActiveQuotes ?? 0}
            subtitle="All reps"
            icon={Users}
          />
        </PermissionGuard>
        
        <PermissionGuard resource={Resources.Users} action={Actions.ViewTeam}>
          <StatsCard
            title="Monthly Revenue"
            value={`$${(stats?.monthlyRevenue ?? 0).toLocaleString()}`}
            subtitle="This month"
            icon={DollarSign}
          />
        </PermissionGuard>
        
        {/* Admin Stats */}
        <PermissionGuard resource={Resources.System} action={Actions.ViewAll}>
          <StatsCard
            title="Active Users"
            value={stats?.totalActiveUsers ?? 0}
            subtitle="All roles"
            icon={Users}
          />
        </PermissionGuard>
        
        <PermissionGuard resource={Resources.System} action={Actions.ViewAll}>
          <StatsCard
            title="System Health"
            value={`${stats?.systemHealth ?? 0}%`}
            subtitle="Uptime"
            icon={Activity}
          />
        </PermissionGuard>
      </div>
      
      {/* Tasks & Quick Actions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Tasks */}
        <div className="lg:col-span-2">
          <TaskList 
            tasks={[...urgentTasks, ...regularTasks]} 
            title="Today's Tasks"
          />
        </div>
        
        {/* Quick Actions */}
        <div className="space-y-4">
          {/* Customer Actions */}
          <PermissionGuard resource={Resources.Quotes} action={Actions.Create}>
            <QuickActions actions={[
              { label: 'Submit Quote', href: '/store' },
              { label: 'Track Order', href: '/orders' },
            ]} />
          </PermissionGuard>
          
          {/* Sales Rep Actions */}
          <PermissionGuard resource={Resources.Quotes} action={Actions.ViewAssigned}>
            <QuickActions actions={[
              { label: 'Next Quote', href: '/quotes?status=unread' },
              { label: 'Confirm Payment', href: '/orders?status=placed' },
              { label: 'View Orders', href: '/orders' },
            ]} />
          </PermissionGuard>
          
          {/* Manager Actions */}
          <PermissionGuard resource={Resources.Users} action={Actions.ViewTeam}>
            <QuickActions actions={[
              { label: 'Assign Quotes', href: '/quotes?unassigned=true' },
              { label: 'Team Report', href: '/reports/team' },
            ]} />
          </PermissionGuard>
          
          {/* Admin Actions */}
          <PermissionGuard resource={Resources.System} action={Actions.ViewAll}>
            <QuickActions actions={[
              { label: 'Manage Users', href: '/admin/users' },
              { label: 'Manage Products', href: '/products' },
              { label: 'View Logs', href: '/admin/logs' },
            ]} />
          </PermissionGuard>
        </div>
      </div>
      
      {/* Team Workload (Manager+) */}
      {stats?.teamWorkload && (
        <TeamWorkloadTable workload={stats.teamWorkload} />
      )}
      
      {/* Recent Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RecentItemsTable 
          items={recentOrders} 
          title="Recent Orders" 
          type="order"
        />
        <RecentItemsTable 
          items={recentQuotes} 
          title="Recent Quotes" 
          type="quote"
        />
      </div>
    </div>
  )
}
```

---

## 6. Implementation Timeline

### Phase 1: Backend Foundation (Day 1-2)
- [ ] Create database migration for indexes
- [ ] Create `DashboardDTOs.cs` with all DTOs
- [ ] Implement `IDashboardService` interface
- [ ] Implement `DashboardService` methods
- [ ] Register service in DI container (`Program.cs`)
- [ ] Create `DashboardController` with endpoints
- [ ] Test endpoints with Postman/curl

### Phase 2: Frontend Foundation (Day 3)
- [ ] Create `dashboard.types.ts` in `_types/`
- [ ] Add `Dashboard` methods to `api.ts`
- [ ] Create custom hooks folder and files
- [ ] Implement `useDashboardStats`
- [ ] Implement `useDashboardTasks`
- [ ] Implement `useRecentItems`
- [ ] Create barrel export `index.ts`

### Phase 3: Components (Day 4-5)
- [ ] Create `StatsCard` component
- [ ] Create `TaskList` component
- [ ] Create `QuickActions` component
- [ ] Create `RecentItemsTable` component
- [ ] Create `TeamWorkloadTable` component
- [ ] Create component barrel export
- [ ] Add RBAC guards to all role-specific UI

### Phase 4: Page & Integration (Day 6)
- [ ] Create `dashboard/page.tsx`
- [ ] Wire up all hooks and components
- [ ] Test all role views (Customer, Sales Rep, Manager, Admin)
- [ ] Add loading states and error handling
- [ ] Add responsive design tweaks

### Phase 5: Testing (Day 7-8)
- [ ] Unit tests for all components
- [ ] Unit tests for all hooks
- [ ] RBAC tests for all permission guards
- [ ] Integration tests for full dashboard flow
- [ ] Verify all acceptance criteria

---

## 7. Testing Requirements

### Unit Tests

#### Component Tests
**File**: `client/app/app/dashboard/_components/__tests__/StatsCard.test.tsx`
```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StatsCard } from '../StatsCard'
import { FileText } from 'lucide-react'
import { vi, describe, it, expect } from 'vitest'

describe('StatsCard', () => {
  it('should render title and value', () => {
    render(
      <StatsCard 
        title="Test Title" 
        value={42} 
        icon={FileText} 
      />
    )
    
    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
  })
  
  it('should render subtitle when provided', () => {
    render(
      <StatsCard 
        title="Test" 
        value={0} 
        subtitle="Subtitle text"
        icon={FileText} 
      />
    )
    
    expect(screen.getByText('Subtitle text')).toBeInTheDocument()
  })
  
  it('should call onClick when clicked', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    
    render(
      <StatsCard 
        title="Clickable" 
        value={0} 
        icon={FileText}
        onClick={handleClick}
      />
    )
    
    await user.click(screen.getByText('Clickable'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
  
  it('should display positive trend correctly', () => {
    render(
      <StatsCard 
        title="Test" 
        value={100} 
        icon={FileText}
        trend={{ value: 15, label: 'vs last month', isPositive: true }}
      />
    )
    
    expect(screen.getByText(/↑ 15%/)).toBeInTheDocument()
    expect(screen.getByText(/vs last month/)).toBeInTheDocument()
  })
})
```

#### Hook Tests
**File**: `client/app/app/dashboard/_components/hooks/__tests__/useDashboardStats.test.ts`
```typescript
import { renderHook, waitFor } from '@testing-library/react'
import { useDashboardStats } from '../useDashboardStats'
import { API } from '@_shared/services/api'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { renderWithProviders } from '@/test-utils'

vi.mock('@_shared/services/api', () => ({
  API: {
    Dashboard: {
      getStats: vi.fn(),
    },
  },
}))

describe('useDashboardStats', () => {
  const mockStats = {
    pendingQuotes: 5,
    activeOrders: 3,
    unreadQuotes: 2,
  }
  
  beforeEach(() => {
    vi.clearAllMocks()
  })
  
  it('should fetch stats on mount', async () => {
    vi.mocked(API.Dashboard.getStats).mockResolvedValue({ data: mockStats })
    
    const { result } = renderHook(() => useDashboardStats(), {
      wrapper: ({ children }) => renderWithProviders(children),
    })
    
    expect(result.current.isLoading).toBe(true)
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    
    expect(result.current.stats).toEqual(mockStats)
    expect(API.Dashboard.getStats).toHaveBeenCalledTimes(1)
  })
  
  it('should handle errors gracefully', async () => {
    const error = new Error('Failed to fetch')
    vi.mocked(API.Dashboard.getStats).mockRejectedValue(error)
    
    const { result } = renderHook(() => useDashboardStats(), {
      wrapper: ({ children }) => renderWithProviders(children),
    })
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    
    expect(result.current.stats).toBeNull()
    expect(result.current.error).toBeDefined()
  })
  
  it('should refetch when refetch is called', async () => {
    vi.mocked(API.Dashboard.getStats).mockResolvedValue({ data: mockStats })
    
    const { result } = renderHook(() => useDashboardStats(), {
      wrapper: ({ children }) => renderWithProviders(children),
    })
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    
    result.current.refetch()
    
    await waitFor(() => {
      expect(API.Dashboard.getStats).toHaveBeenCalledTimes(2)
    })
  })
})
```

### RBAC Tests
**File**: `client/app/app/dashboard/__tests__/Dashboard.rbac.test.tsx`
```typescript
import { render, screen } from '@testing-library/react'
import DashboardPage from '../page'
import { createMockUserWithRole } from '@/test-utils/rbacTestBuilders'
import { renderWithProviders } from '@/test-utils'
import { vi, describe, it, expect, beforeEach } from 'vitest'

// Mock hooks
vi.mock('../_components/hooks', () => ({
  useDashboardStats: () => ({
    stats: {
      pendingQuotes: 5,
      activeOrders: 3,
      unreadQuotes: 2,
      teamActiveQuotes: 10,
      totalActiveUsers: 100,
    },
    isLoading: false,
  }),
  useDashboardTasks: () => ({
    urgentTasks: [],
    regularTasks: [],
    isLoading: false,
  }),
  useRecentItems: () => ({
    recentOrders: [],
    recentQuotes: [],
    isLoading: false,
  }),
}))

describe('Dashboard RBAC', () => {
  it('should show customer-only stats to customers', () => {
    const mockUser = createMockUserWithRole('Customer')
    
    renderWithProviders(<DashboardPage />, { user: mockUser })
    
    // Customer should see their stats
    expect(screen.getByText('Pending Quotes')).toBeInTheDocument()
    expect(screen.getByText('Active Orders')).toBeInTheDocument()
    
    // Customer should NOT see sales rep stats
    expect(screen.queryByText('Unread Quotes')).not.toBeInTheDocument()
    expect(screen.queryByText('Team Active Quotes')).not.toBeInTheDocument()
  })
  
  it('should show sales rep stats to sales reps', () => {
    const mockUser = createMockUserWithRole('SalesRep')
    
    renderWithProviders(<DashboardPage />, { user: mockUser })
    
    // Sales rep should see their stats
    expect(screen.getByText('Unread Quotes')).toBeInTheDocument()
    expect(screen.getByText('Conversion Rate')).toBeInTheDocument()
    
    // Sales rep should NOT see team stats
    expect(screen.queryByText('Team Active Quotes')).not.toBeInTheDocument()
    expect(screen.queryByText('Active Users')).not.toBeInTheDocument()
  })
  
  it('should show team stats to sales managers', () => {
    const mockUser = createMockUserWithRole('SalesManager')
    
    renderWithProviders(<DashboardPage />, { user: mockUser })
    
    // Manager should see team stats
    expect(screen.getByText('Team Active Quotes')).toBeInTheDocument()
    expect(screen.getByText('Monthly Revenue')).toBeInTheDocument()
    
    // Manager should NOT see admin stats
    expect(screen.queryByText('Active Users')).not.toBeInTheDocument()
    expect(screen.queryByText('System Health')).not.toBeInTheDocument()
  })
  
  it('should show all stats to admins', () => {
    const mockUser = createMockUserWithRole('Admin')
    
    renderWithProviders(<DashboardPage />, { user: mockUser })
    
    // Admin should see everything
    expect(screen.getByText('Active Users')).toBeInTheDocument()
    expect(screen.getByText('System Health')).toBeInTheDocument()
  })
  
  it('should hide quick actions based on role', () => {
    const mockCustomer = createMockUserWithRole('Customer')
    
    renderWithProviders(<DashboardPage />, { user: mockCustomer })
    
    // Customer should see "Submit Quote"
    expect(screen.getByText('Submit Quote')).toBeInTheDocument()
    
    // Customer should NOT see "Assign Quotes"
    expect(screen.queryByText('Assign Quotes')).not.toBeInTheDocument()
  })
})
```

### Integration Tests
**File**: `client/app/app/dashboard/__tests__/Dashboard.integration.test.tsx`
```typescript
import { render, screen, waitFor } from '@testing-library/react'
import DashboardPage from '../page'
import { API } from '@_shared/services/api'
import { createMockUserWithRole } from '@/test-utils/rbacTestBuilders'
import { renderWithProviders } from '@/test-utils'
import { vi, describe, it, expect, beforeEach } from 'vitest'

vi.mock('@_shared/services/api', () => ({
  API: {
    Dashboard: {
      getStats: vi.fn(),
      getTasks: vi.fn(),
      getRecentItems: vi.fn(),
    },
  },
}))

describe('Dashboard Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  
  it('should load dashboard for customer', async () => {
    const mockUser = createMockUserWithRole('Customer')
    
    vi.mocked(API.Dashboard.getStats).mockResolvedValue({
      data: { pendingQuotes: 3, activeOrders: 2, totalSpent: 1500 },
    })
    vi.mocked(API.Dashboard.getTasks).mockResolvedValue({ data: [] })
    vi.mocked(API.Dashboard.getRecentItems).mockResolvedValue({
      data: [
        { id: '1', type: 'order', number: 'ORD-001', date: '2024-01-01', status: 'Processing', amount: 500 },
      ],
    })
    
    renderWithProviders(<DashboardPage />, { user: mockUser })
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    })
    
    // Verify customer sees their data
    expect(screen.getByText('3')).toBeInTheDocument() // Pending quotes
    expect(screen.getByText('ORD-001')).toBeInTheDocument() // Recent order
  })
  
  it('should show loading state initially', () => {
    const mockUser = createMockUserWithRole('Customer')
    
    // Make API calls hang
    vi.mocked(API.Dashboard.getStats).mockImplementation(
      () => new Promise(() => {})
    )
    vi.mocked(API.Dashboard.getTasks).mockImplementation(
      () => new Promise(() => {})
    )
    vi.mocked(API.Dashboard.getRecentItems).mockImplementation(
      () => new Promise(() => {})
    )
    
    renderWithProviders(<DashboardPage />, { user: mockUser })
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })
  
  it('should display urgent tasks prominently', async () => {
    const mockUser = createMockUserWithRole('SalesRep')
    
    vi.mocked(API.Dashboard.getStats).mockResolvedValue({
      data: { unreadQuotes: 5, ordersPendingPayment: 2 },
    })
    vi.mocked(API.Dashboard.getTasks).mockResolvedValue({
      data: [
        { 
          id: '1', 
          type: 'quote', 
          title: 'Urgent Quote', 
          description: 'Older than 24h',
          isUrgent: true,
          actionUrl: '/quotes/1',
          createdAt: '2024-01-01'
        },
      ],
    })
    vi.mocked(API.Dashboard.getRecentItems).mockResolvedValue({ data: [] })
    
    renderWithProviders(<DashboardPage />, { user: mockUser })
    
    await waitFor(() => {
      expect(screen.getByText('Urgent Quote')).toBeInTheDocument()
    })
    
    // Verify urgent styling (has error icon)
    expect(screen.getByText('Older than 24h')).toBeInTheDocument()
  })
})
```

---

## 8. Success Criteria

- [ ] All 3 API endpoints working (`/stats`, `/tasks`, `/recent`)
- [ ] Dashboard loads in < 2s
- [ ] Customer sees only their stats
- [ ] Sales Rep sees assigned quotes/orders stats
- [ ] Fulfillment sees shipping-related stats
- [ ] Sales Manager sees team workload and performance
- [ ] Admin sees system-wide metrics
- [ ] All RBAC guards working correctly
- [ ] 95%+ test coverage for components
- [ ] 100% test coverage for RBAC guards
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Barrel exports implemented
- [ ] Responsive design (mobile-friendly)

---

## 9. File Structure Summary

### New Files
```
server/
├── Classes/Others/DashboardDTOs.cs
├── Services/DB/DashboardService.cs
├── Controllers/DashboardController.cs
└── Migrations/20241220_AddDashboardStatsIndexes.cs

client/
├── app/
│   ├── _types/dashboard.types.ts
│   └── app/dashboard/
│       ├── _components/
│       │   ├── hooks/
│       │   │   ├── useDashboardStats.ts
│       │   │   ├── useDashboardTasks.ts
│       │   │   ├── useRecentItems.ts
│       │   │   └── index.ts
│       │   ├── __tests__/
│       │   │   ├── StatsCard.test.tsx
│       │   │   └── ... (other component tests)
│       │   ├── StatsCard.tsx
│       │   ├── TaskList.tsx
│       │   ├── QuickActions.tsx
│       │   ├── RecentItemsTable.tsx
│       │   ├── TeamWorkloadTable.tsx
│       │   └── index.ts
│       ├── __tests__/
│       │   ├── Dashboard.rbac.test.tsx
│       │   └── Dashboard.integration.test.tsx
│       └── page.tsx
```

### Modified Files
```
server/
└── Program.cs  // Register IDashboardService

client/
└── app/_shared/services/api.ts  // Add Dashboard methods
```

---

**Document Version**: 2.0 (Complete)  
**Last Updated**: December 2024  
**Status**: Ready for Implementation