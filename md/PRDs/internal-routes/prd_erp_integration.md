# ERP Integration Framework PRD

## 1. Overview

-   **Feature**: ERP Integration Framework (QuickBooks Online, NetSuite, Integration Foundation)
-   **Priority**: P1 (Business Plan Phase 1 - Month 6-12)
-   **Status**: Not Started
-   **Dependencies**:
    -   Pricing Engine (P0) - should be complete before ERP
    -   Payment Processing (Complete)
    -   Inventory Management (Complete)
    -   RBAC System (Complete)
-   **Estimated Effort**: 200-280 hours total
    -   Integration Foundation: 40-60 hours
    -   QuickBooks Integration: 80-120 hours
    -   NetSuite Integration: 80-100 hours
-   **Business Plan Reference**: Section 6.4 ("QuickBooks Month 6-8", "NetSuite Month 9-12"), Appendix A

---

## 2. Business Context

**From Business Plan Section 6.4 (ERP Strategy):**

> "Phase 1: QuickBooks Online sync - Month 6-8 - SMB distributors ($5-50M revenue)"
> "Phase 2: NetSuite connector - Month 9-12 - Mid-market distributors ($50-200M)"

**From ERP & Pricing Research Document:**

ERP integration is critical because B2B commerce fails when:

-   Data doesn't reconcile (items, customers, price rules)
-   Orders don't sync reliably
-   Retries create duplicates (double-orders, double-invoices)

**The "Integration Ladder" Approach:**

| Level                | ERP Capability         | Target Customer             |
| -------------------- | ---------------------- | --------------------------- |
| Level 1 (NOW) ✅     | CSV/JSON Import/Export | Customers who re-key orders |
| Level 2 (Month 6-8)  | QuickBooks Full Sync   | SMB distributors ($5-50M)   |
| Level 3 (Month 9-12) | NetSuite Connector     | Mid-market ($50-200M)       |
| Level 4 (Year 2+)    | EDI + Dynamics 365     | Enterprise                  |

**Why This Architecture:**

1. **Reliability First**: Transactional outbox ensures no data loss during sync
2. **Idempotency**: Prevent duplicate records from retries
3. **Multi-Tenant**: Each tenant connects their own ERP account
4. **Canonical Model**: Single internal representation, multiple ERP adapters

---

## 2.1 MAANG-Level Design Principles (Guardrails)

These constraints are **mandatory** to ensure integrations are reliable at scale without over-engineering.

### Delivery Semantics (Reality of Integrations)

-   Outgoing integration writes are **at-least-once** (retries happen).
-   Therefore, every “write” must be **idempotent** and every “incoming event” must be **deduped**.
-   Data consistency is **eventual**, not strongly consistent across systems.

### Determinism + Safety

-   A sync operation must be deterministic: same internal entity state + same external state → same request.
-   Never “guess” external IDs. Use mappings or create them deterministically.
-   Never delete or overwrite external records automatically in v1 (too risky).

### Concurrency Control (Prevent Dupes + Thundering Herd)

-   Only **one active sync worker per tenant/provider** at a time (distributed locking).
-   Bulk sync must be chunked and paced to respect rate limits.

### Performance (Keep the Core App Fast)

-   Sync work is **asynchronous** (Hangfire), never on request/response critical paths.
-   Admin pages query logs with **pagination + indexes**. No unbounded scans.
-   Request/response payloads are stored **only on failure** or in a tenant-scoped diagnostic mode.

### Security (Multi-Tenant + OAuth)

-   OAuth state must be validated server-side (CSRF protection).
-   Webhook processing must verify signatures and bind events to the correct tenant via stored connection identifiers (e.g., QBO `realmId`).
-   Secrets and tokens are encrypted at rest and never logged.

### Explicit Non-Goals (Avoid Over-Engineering)

-   EDI (850/855/856/810) is out of scope for v1 (Year 2+).
-   “Universal connector SDK” is out of scope for v1. We keep a small shared foundation + provider-specific services.

---

## 3. Role-Based Requirements

### Customer View

**Can:**

-   See sync status indicators on orders ("Synced to QuickBooks" badge)
-   View payment status as reflected from ERP

**Cannot:**

-   See ERP connection settings
-   Trigger manual syncs
-   View sync logs

---

### Sales Rep View

**Can:**

-   See order sync status
-   View customer sync status
-   See if customer exists in connected ERP

**Cannot:**

-   Configure ERP connections
-   Trigger bulk syncs
-   View connection credentials

---

### Sales Manager View

**Can:**

-   View sync status dashboard
-   See sync error summaries
-   View recent sync logs (read-only)
-   Request manual sync retry

**Cannot:**

-   Configure ERP connections
-   Disconnect integrations

---

### Admin View

**Can:**

-   Full integration management:
    -   Connect/disconnect QuickBooks
    -   Connect/disconnect NetSuite
    -   View all sync logs
    -   Retry failed syncs
    -   Configure sync settings (auto-sync on/off, sync frequency)
    -   View entity mappings
-   Access integration dashboard
-   Export sync audit reports

**UI Elements:**

-   Integration Settings page
-   Connection status cards per ERP
-   Sync log viewer with filters
-   Entity mapping table
-   Bulk sync controls

---

## 4. User Stories

### Epic 1: Integration Foundation

**US-ERP-001**: As a system, I want to reliably emit integration events via transactional outbox so no data is lost during ERP sync.

-   **Priority**: P0
-   **Acceptance Criteria**:
    -   [ ] Given an order is created, when saved, then an outbox event is created in the same transaction
    -   [ ] Given outbox processor runs, when event is processed, then it's marked completed with timestamp
    -   [ ] Given sync fails, when retrying, then exponential backoff is applied (2^n minutes)
    -   [ ] Given max retries exceeded, when checking, then event is marked "Abandoned" and alert is logged

**US-ERP-002**: As a system, I want idempotent sync operations so retries don't create duplicates.

-   **Priority**: P0
-   **Acceptance Criteria**:
    -   [ ] Given an order sync with idempotency key "order-123", when synced twice, then only one invoice exists in ERP
    -   [ ] Given a duplicate webhook arrives, when processing, then it's detected and skipped
    -   [ ] Given entity mapping exists, when syncing, then system uses existing ERP ID instead of creating new

---

### Epic 2: QuickBooks Online Integration

**US-ERP-003**: As an Admin, I want to connect my QuickBooks account via OAuth so Prometheus can sync data.

-   **Priority**: P0
-   **Acceptance Criteria**:
    -   [ ] Given I click "Connect to QuickBooks", when redirected, then I see Intuit login
    -   [ ] Given I authorize access, when callback completes, then connection shows as "Connected"
    -   [ ] Given connection established, when viewing, then I see company name and last sync time
    -   [ ] Given I click "Disconnect", when confirmed, then all tokens are deleted and status shows "Not Connected"

**US-ERP-004**: As a system, I want to sync customers to QuickBooks so invoices can be created.

-   **Priority**: P0
-   **Acceptance Criteria**:
    -   [ ] Given a customer doesn't exist in QBO, when syncing, then customer is created with mapped fields
    -   [ ] Given a customer exists in QBO, when syncing, then mapping is created without duplicate
    -   [ ] Given customer updates in Prometheus, when syncing, then QBO customer is updated
    -   [ ] Given QBO customer updates via webhook, when received, then Prometheus is updated

**US-ERP-005**: As a system, I want to create invoices in QuickBooks from orders so accounting is automated.

-   **Priority**: P0
-   **Acceptance Criteria**:
    -   [ ] Given an order is marked "Paid", when auto-sync runs, then QBO invoice is created
    -   [ ] Given order has line items, when invoice created, then all items appear with correct prices
    -   [ ] Given order has shipping, when invoice created, then shipping line is included
    -   [ ] Given invoice already exists (idempotency), when syncing again, then no duplicate is created

**US-ERP-006**: As a system, I want to receive payment notifications from QuickBooks so order status is updated.

-   **Priority**: P0
-   **Acceptance Criteria**:
    -   [ ] Given payment recorded in QBO, when webhook fires, then Prometheus receives notification
    -   [ ] Given payment webhook received, when processing, then order payment status is updated
    -   [ ] Given webhook signature is invalid, when received, then request is rejected (401)

---

### Epic 3: NetSuite Integration

**US-ERP-007**: As an Admin, I want to connect NetSuite via OAuth so mid-market customers can sync data.

-   **Priority**: P1
-   **Acceptance Criteria**:
    -   [ ] Given I configure NetSuite credentials, when validated, then connection shows as "Connected"
    -   [ ] Given connection established, when viewing, then I see account ID and last sync time
    -   [ ] Given invalid credentials, when connecting, then clear error message is shown

**US-ERP-008**: As a system, I want to sync customers and invoices to NetSuite for mid-market distributors.

-   **Priority**: P1
-   **Acceptance Criteria**:
    -   [ ] Given customer doesn't exist in NetSuite, when syncing, then customer is created
    -   [ ] Given order is ready for sync, when processing, then SalesOrder is created in NetSuite
    -   [ ] Given SuiteQL query, when fetching data, then results are correctly parsed
    -   [ ] Given rate limit hit, when retrying, then exponential backoff is applied

---

### Epic 4: Sync Management

**US-ERP-009**: As an Admin, I want to view sync logs so I can troubleshoot integration issues.

-   **Priority**: P0
-   **Acceptance Criteria**:
    -   [ ] Given sync operations occur, when viewing logs, then I see: entity type, direction, status, timestamp
    -   [ ] Given failed sync, when viewing details, then I see error message and retry count
    -   [ ] Given I filter by "Failed", when applied, then only failed syncs are shown
    -   [ ] Given I click "Retry", when processing, then sync is re-queued

**US-ERP-010**: As an Admin, I want to configure sync settings so I can control integration behavior.

-   **Priority**: P1
-   **Acceptance Criteria**:
    -   [ ] Given auto-sync is enabled, when order is paid, then sync is queued automatically
    -   [ ] Given auto-sync is disabled, when order is paid, then no sync occurs
    -   [ ] Given I trigger manual sync, when processing, then selected entities are synced
    -   [ ] Given bulk sync, when running, then progress indicator shows completion %

---

## 5. Technical Architecture

### 5.1 Backend - Integration Foundation

#### Core Entities

**Migration**: `YYYYMMDDHHMMSS_AddIntegrationFramework.cs`

**File**: `server/Entities/Integration/IntegrationOutbox.cs`

```csharp
[Table("IntegrationOutbox")]
public class IntegrationOutbox : ITenantEntity
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [Column("tenant_id")]
    public Guid TenantId { get; set; }

    [Required, MaxLength(100)]
    [Column("event_type")]
    public string EventType { get; set; } = string.Empty;  // "OrderCreated", "CustomerUpdated"

    [Required, MaxLength(100)]
    [Column("entity_type")]
    public string EntityType { get; set; } = string.Empty;  // "Order", "Customer", "Product"

    [Required, MaxLength(100)]
    [Column("entity_id")]
    public string EntityId { get; set; } = string.Empty;

    [Required]
    [Column("payload")]
    public string Payload { get; set; } = string.Empty;  // JSON serialized event data

    [MaxLength(200)]
    [Column("idempotency_key")]
    public string? IdempotencyKey { get; set; }

    [Column("status")]
    public OutboxStatus Status { get; set; } = OutboxStatus.Pending;

    [MaxLength(50)]
    [Column("target_system")]
    public string? TargetSystem { get; set; }  // "QuickBooks", "NetSuite", null = all

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("processed_at")]
    public DateTime? ProcessedAt { get; set; }

    [Column("scheduled_for")]
    public DateTime? ScheduledFor { get; set; }  // For delayed/retry processing

    [Column("retry_count")]
    public int RetryCount { get; set; } = 0;

    [Column("max_retries")]
    public int MaxRetries { get; set; } = 5;

    [MaxLength(2000)]
    [Column("last_error")]
    public string? LastError { get; set; }

    [Column("correlation_id")]
    public Guid? CorrelationId { get; set; }  // For tracking related events
}

public enum OutboxStatus
{
    Pending = 1,
    Processing = 2,
    Completed = 10,
    Failed = 20,
    Abandoned = 30  // Max retries exceeded
}
```

**File**: `server/Entities/Integration/IntegrationConnection.cs`

```csharp
[Table("IntegrationConnections")]
public class IntegrationConnection : ITenantEntity
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [Column("tenant_id")]
    public Guid TenantId { get; set; }

    [Required, MaxLength(50)]
    [Column("provider")]
    public string Provider { get; set; } = string.Empty;  // "QuickBooks", "NetSuite"

    [MaxLength(100)]
    [Column("external_company_id")]
    public string? ExternalCompanyId { get; set; }  // RealmId for QBO, AccountId for NetSuite

    [MaxLength(200)]
    [Column("company_name")]
    public string? CompanyName { get; set; }

    // Encrypted OAuth tokens
    [Column("access_token_encrypted")]
    public string? AccessTokenEncrypted { get; set; }

    [Column("refresh_token_encrypted")]
    public string? RefreshTokenEncrypted { get; set; }

    [Column("access_token_expires_at")]
    public DateTime? AccessTokenExpiresAt { get; set; }

    [Column("refresh_token_expires_at")]
    public DateTime? RefreshTokenExpiresAt { get; set; }

    // Connection status
    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    [Column("last_sync_at")]
    public DateTime? LastSyncAt { get; set; }

    [MaxLength(500)]
    [Column("last_sync_error")]
    public string? LastSyncError { get; set; }

    // Settings
    [Column("auto_sync_enabled")]
    public bool AutoSyncEnabled { get; set; } = true;

    [Column("sync_customers")]
    public bool SyncCustomers { get; set; } = true;

    [Column("sync_invoices")]
    public bool SyncInvoices { get; set; } = true;

    [Column("sync_payments")]
    public bool SyncPayments { get; set; } = true;

    // Audit
    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("modified_at")]
    public DateTime? ModifiedAt { get; set; }

    [Column("connected_by")]
    public string? ConnectedBy { get; set; }
}
```

**File**: `server/Entities/Integration/IntegrationEntityMapping.cs`

```csharp
[Table("IntegrationEntityMappings")]
public class IntegrationEntityMapping : ITenantEntity
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [Column("tenant_id")]
    public Guid TenantId { get; set; }

    [Required, MaxLength(50)]
    [Column("provider")]
    public string Provider { get; set; } = string.Empty;

    [Required, MaxLength(50)]
    [Column("entity_type")]
    public string EntityType { get; set; } = string.Empty;  // "Customer", "Product", "Order"

    [Required, MaxLength(100)]
    [Column("prometheus_id")]
    public string PrometheusId { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    [Column("external_id")]
    public string ExternalId { get; set; } = string.Empty;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("last_sync_at")]
    public DateTime? LastSyncAt { get; set; }

    [MaxLength(100)]
    [Column("sync_token")]
    public string? SyncToken { get; set; }  // For optimistic concurrency in QBO
}
```

**File**: `server/Entities/Integration/IntegrationSyncLog.cs`

```csharp
[Table("IntegrationSyncLogs")]
public class IntegrationSyncLog : ITenantEntity
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [Column("tenant_id")]
    public Guid TenantId { get; set; }

    [Required, MaxLength(50)]
    [Column("provider")]
    public string Provider { get; set; } = string.Empty;

    [Required, MaxLength(50)]
    [Column("entity_type")]
    public string EntityType { get; set; } = string.Empty;

    [MaxLength(100)]
    [Column("entity_id")]
    public string? EntityId { get; set; }

    [MaxLength(100)]
    [Column("external_id")]
    public string? ExternalId { get; set; }

    [Column("direction")]
    public SyncDirection Direction { get; set; }

    [Column("status")]
    public SyncStatus Status { get; set; }

    [MaxLength(2000)]
    [Column("error_message")]
    public string? ErrorMessage { get; set; }

    [Column("request_payload")]
    public string? RequestPayload { get; set; }

    [Column("response_payload")]
    public string? ResponsePayload { get; set; }

    [Column("started_at")]
    public DateTime StartedAt { get; set; } = DateTime.UtcNow;

    [Column("completed_at")]
    public DateTime? CompletedAt { get; set; }

    [Column("retry_count")]
    public int RetryCount { get; set; } = 0;

    [Column("correlation_id")]
    public Guid? CorrelationId { get; set; }
}

public enum SyncDirection
{
    ToExternal = 1,
    FromExternal = 2
}

public enum SyncStatus
{
    Pending = 1,
    InProgress = 2,
    Completed = 10,
    Failed = 20,
    Skipped = 30
}
```

---

#### Inbox + Checkpointing (Required for Reliability at Scale)

Outbox handles reliable **outgoing** work. We also need two more primitives:

-   **Inbox**: dedupe + replay safety for **incoming** webhooks/events.
-   **Checkpoint**: store incremental sync cursors (CDC/watermarks) to avoid full table scans and API overuse.

**File**: `server/Entities/Integration/IntegrationInbox.cs`

```csharp
[Table("IntegrationInbox")]
public sealed class IntegrationInbox : ITenantEntity
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [Column("tenant_id")]
    public Guid TenantId { get; set; }

    [Required, MaxLength(50)]
    [Column("provider")]
    public string Provider { get; set; } = string.Empty; // "QuickBooks", "NetSuite"

    [Required, MaxLength(200)]
    [Column("external_event_id")]
    public string ExternalEventId { get; set; } = string.Empty; // e.g., webhook event ID OR deterministic hash

    [MaxLength(100)]
    [Column("external_company_id")]
    public string? ExternalCompanyId { get; set; } // e.g., QBO realmId (routing)

    [Column("received_at")]
    public DateTime ReceivedAt { get; set; } = DateTime.UtcNow;

    [Column("processed_at")]
    public DateTime? ProcessedAt { get; set; }

    [Column("status")]
    public SyncStatus Status { get; set; } = SyncStatus.Pending;

    [MaxLength(2000)]
    [Column("last_error")]
    public string? LastError { get; set; }
}
```

**File**: `server/Entities/Integration/IntegrationSyncCheckpoint.cs`

```csharp
[Table("IntegrationSyncCheckpoints")]
public sealed class IntegrationSyncCheckpoint : ITenantEntity
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [Column("tenant_id")]
    public Guid TenantId { get; set; }

    [Required, MaxLength(50)]
    [Column("provider")]
    public string Provider { get; set; } = string.Empty;

    [Required, MaxLength(50)]
    [Column("entity_type")]
    public string EntityType { get; set; } = string.Empty; // "Customer", "Invoice", "Payment", "Product"

    // Watermark/cursor is provider-specific (CDC token, modifiedSince timestamp, etc.)
    [MaxLength(500)]
    [Column("cursor")]
    public string? Cursor { get; set; }

    [Column("last_success_at")]
    public DateTime? LastSuccessAt { get; set; }

    [MaxLength(500)]
    [Column("last_error")]
    public string? LastError { get; set; }

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
```

**Required indexes (pseudo-code):**

-   `IntegrationConnections`: unique `(tenant_id, provider)`; unique `(provider, external_company_id)` for webhook routing safety.
-   `IntegrationEntityMappings`: unique `(tenant_id, provider, entity_type, prometheus_id)`; unique `(tenant_id, provider, entity_type, external_id)`.
-   `IntegrationOutbox`: index `(tenant_id, status, scheduled_for)`; unique `(tenant_id, idempotency_key)` where non-null.
-   `IntegrationInbox`: unique `(tenant_id, provider, external_event_id)`.
-   `IntegrationSyncCheckpoints`: unique `(tenant_id, provider, entity_type)`.

---

#### DTOs

**File**: `server/Classes/DTOs/Integration/IntegrationDTOs.cs`

```csharp
// === Connection DTOs ===

public class ConnectionStatusResponse
{
    public string Provider { get; set; } = string.Empty;
    public bool IsConnected { get; set; }
    public string? CompanyName { get; set; }
    public DateTime? LastSyncAt { get; set; }
    public string? LastSyncError { get; set; }
    public bool AutoSyncEnabled { get; set; }
    public ConnectionSettingsResponse Settings { get; set; } = new();
}

public class ConnectionSettingsResponse
{
    public bool SyncCustomers { get; set; }
    public bool SyncInvoices { get; set; }
    public bool SyncPayments { get; set; }
}

public class UpdateConnectionSettingsRequest
{
    public bool? AutoSyncEnabled { get; set; }
    public bool? SyncCustomers { get; set; }
    public bool? SyncInvoices { get; set; }
    public bool? SyncPayments { get; set; }
}

// === Sync DTOs ===

public class SyncLogResponse
{
    public Guid Id { get; set; }
    public string Provider { get; set; } = string.Empty;
    public string EntityType { get; set; } = string.Empty;
    public string? EntityId { get; set; }
    public string? ExternalId { get; set; }
    public string Direction { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? ErrorMessage { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public int RetryCount { get; set; }
}

public class SyncLogFilterParams : PaginationParams
{
    public string? Provider { get; set; }
    public string? EntityType { get; set; }
    public string? Status { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
}

public class EntityMappingResponse
{
    public Guid Id { get; set; }
    public string Provider { get; set; } = string.Empty;
    public string EntityType { get; set; } = string.Empty;
    public string PrometheusId { get; set; } = string.Empty;
    public string ExternalId { get; set; } = string.Empty;
    public DateTime? LastSyncAt { get; set; }
}

public class ManualSyncRequest
{
    public string EntityType { get; set; } = string.Empty;  // "Customer", "Order", "All"
    public List<string>? EntityIds { get; set; }  // Specific IDs or null for all
}

public class SyncResultResponse
{
    public int TotalProcessed { get; set; }
    public int Successful { get; set; }
    public int Failed { get; set; }
    public int Skipped { get; set; }
    public List<string> Errors { get; set; } = new();
}

// === Outbox DTOs ===

public class OutboxItemResponse
{
    public Guid Id { get; set; }
    public string EventType { get; set; } = string.Empty;
    public string EntityType { get; set; } = string.Empty;
    public string EntityId { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? TargetSystem { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ProcessedAt { get; set; }
    public int RetryCount { get; set; }
    public string? LastError { get; set; }
}
```

---

#### Service Interfaces

**File**: `server/Services/Integration/IIntegrationService.cs`

```csharp
public interface IIntegrationService
{
    // === Connection Management ===
    Task<List<ConnectionStatusResponse>> GetConnectionsAsync();
    Task<ConnectionStatusResponse?> GetConnectionAsync(string provider);
    Task UpdateConnectionSettingsAsync(string provider, UpdateConnectionSettingsRequest request);
    Task DisconnectAsync(string provider);

    // === Sync Operations ===
    Task<SyncResultResponse> SyncEntityAsync(string provider, string entityType, string entityId);
    Task<SyncResultResponse> BulkSyncAsync(string provider, ManualSyncRequest request);
    Task RetryFailedSyncsAsync(string provider);

    // === Logs & Mappings ===
    Task<PagedResult<SyncLogResponse>> GetSyncLogsAsync(SyncLogFilterParams filter);
    Task<List<EntityMappingResponse>> GetEntityMappingsAsync(string provider, string entityType);

    // === Outbox ===
    Task<PagedResult<OutboxItemResponse>> GetOutboxItemsAsync(PaginationParams pagination);
    Task RetryOutboxItemAsync(Guid itemId);

    // === Inbox (Incoming webhook dedupe) ===
    Task<PagedResult<OutboxItemResponse>> GetInboxItemsAsync(PaginationParams pagination);
}

public interface IQuickBooksService
{
    // OAuth
    // SECURITY NOTE:
    // - State is generated and stored server-side, bound to the requesting tenant + user.
    // - Callback must validate state before exchanging code for tokens.
    Task<string> GetAuthorizationUrlAsync();
    Task<ConnectionStatusResponse> CompleteAuthorizationAsync(string code, string realmId, string state);

    // Sync
    Task<string> SyncCustomerAsync(int customerId);
    Task<string> CreateInvoiceAsync(int orderId);
    Task ProcessPaymentWebhookAsync(string payload, string signature);

    // Bulk
    Task<SyncResultResponse> SyncAllCustomersAsync();
    Task<SyncResultResponse> SyncPendingInvoicesAsync();
}

public interface INetSuiteService
{
    // Connection
    Task<ConnectionStatusResponse> ConnectAsync(NetSuiteCredentials credentials);
    Task<bool> ValidateConnectionAsync();

    // Sync
    Task<string> SyncCustomerAsync(int customerId);
    Task<string> CreateSalesOrderAsync(int orderId);

    // Bulk
    Task<SyncResultResponse> SyncAllCustomersAsync();
}
```

---

#### Controller Endpoints

**File**: `server/Controllers/IntegrationsController.cs`

```csharp
[ApiController]
[Route("api/integrations")]
[Authorize(Policy = RBACConstants.Policies.IntegrationsView)]
public class IntegrationsController : BaseController
{
    // === Connections ===

    [HttpGet("connections")]
    public async Task<IResponse<List<ConnectionStatusResponse>>> GetConnections();

    [HttpGet("connections/{provider}")]
    public async Task<IResponse<ConnectionStatusResponse>> GetConnection(string provider);

    [HttpPut("connections/{provider}/settings")]
    [Authorize(Policy = RBACConstants.Policies.IntegrationsManage)]
    public async Task<IResponse<bool>> UpdateSettings(string provider, [FromBody] UpdateConnectionSettingsRequest request);

    [HttpDelete("connections/{provider}")]
    [Authorize(Policy = RBACConstants.Policies.IntegrationsManage)]
    public async Task<IResponse<bool>> Disconnect(string provider);

    // === Sync Operations ===

    [HttpPost("sync/{provider}")]
    [Authorize(Policy = RBACConstants.Policies.IntegrationsManage)]
    public async Task<IResponse<SyncResultResponse>> ManualSync(string provider, [FromBody] ManualSyncRequest request);

    [HttpPost("sync/{provider}/retry-failed")]
    [Authorize(Policy = RBACConstants.Policies.IntegrationsManage)]
    public async Task<IResponse<SyncResultResponse>> RetryFailed(string provider);

    // === Logs ===

    [HttpGet("logs")]
    public async Task<IResponse<PagedResult<SyncLogResponse>>> GetLogs([FromQuery] SyncLogFilterParams filter);

    [HttpGet("mappings/{provider}/{entityType}")]
    public async Task<IResponse<List<EntityMappingResponse>>> GetMappings(string provider, string entityType);

    // === Outbox ===

    [HttpGet("outbox")]
    [Authorize(Policy = RBACConstants.Policies.IntegrationsManage)]
    public async Task<IResponse<PagedResult<OutboxItemResponse>>> GetOutbox([FromQuery] PaginationParams pagination);

    [HttpPost("outbox/{id:guid}/retry")]
    [Authorize(Policy = RBACConstants.Policies.IntegrationsManage)]
    public async Task<IResponse<bool>> RetryOutboxItem(Guid id);
}

[ApiController]
[Route("api/integrations/quickbooks")]
public class QuickBooksController : BaseController
{
    [HttpGet("authorize")]
    [Authorize(Policy = RBACConstants.Policies.IntegrationsManage)]
    public async Task<IResponse<string>> GetAuthorizationUrl();

    [HttpGet("callback")]
    [AllowAnonymous]
    public async Task<IActionResult> HandleCallback(
        [FromQuery] string code,
        [FromQuery] string realmId,
        [FromQuery] string state);

    [HttpPost("webhook")]
    [AllowAnonymous]
    public async Task<IActionResult> HandleWebhook();
}

[ApiController]
[Route("api/integrations/netsuite")]
[Authorize(Policy = RBACConstants.Policies.IntegrationsManage)]
public class NetSuiteController : BaseController
{
    [HttpPost("connect")]
    public async Task<IResponse<ConnectionStatusResponse>> Connect([FromBody] NetSuiteCredentials credentials);

    [HttpPost("validate")]
    public async Task<IResponse<bool>> ValidateConnection();
}
```

---

### 5.2 Backend - QuickBooks Specific

#### QuickBooks API Client

**File**: `server/Services/Integration/QuickBooks/QuickBooksApiClient.cs`

```csharp
public class QuickBooksApiClient : IQuickBooksApiClient
{
    private readonly HttpClient _httpClient;
    private readonly IQuickBooksTokenService _tokenService;
    private readonly ILogger<QuickBooksApiClient> _logger;

    private const string BaseUrl = "https://quickbooks.api.intuit.com/v3/company";
    private const int MinorVersion = 75;  // Required per Intuit Aug 2025 deprecation

    public async Task<T> GetAsync<T>(string realmId, string endpoint)
    {
        var token = await _tokenService.GetValidTokenAsync(realmId);

        var url = $"{BaseUrl}/{realmId}/{endpoint}?minorversion={MinorVersion}";
        var request = new HttpRequestMessage(HttpMethod.Get, url);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

        var response = await _httpClient.SendAsync(request);
        await EnsureSuccessAsync(response);

        return await response.Content.ReadFromJsonAsync<T>()
            ?? throw new InvalidOperationException("Empty response from QuickBooks");
    }

    public async Task<T> PostAsync<T>(string realmId, string endpoint, object data, string? idempotencyKey = null)
    {
        var token = await _tokenService.GetValidTokenAsync(realmId);

        var url = $"{BaseUrl}/{realmId}/{endpoint}?minorversion={MinorVersion}";
        var request = new HttpRequestMessage(HttpMethod.Post, url);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        request.Content = JsonContent.Create(data);

        if (!string.IsNullOrEmpty(idempotencyKey))
        {
            request.Headers.Add("Request-Id", idempotencyKey);
        }

        var response = await _httpClient.SendAsync(request);
        await EnsureSuccessAsync(response);

        return await response.Content.ReadFromJsonAsync<T>()
            ?? throw new InvalidOperationException("Empty response from QuickBooks");
    }

    private async Task EnsureSuccessAsync(HttpResponseMessage response)
    {
        if (!response.IsSuccessStatusCode)
        {
            var content = await response.Content.ReadAsStringAsync();
            _logger.LogError("QuickBooks API error: {StatusCode} - {Content}",
                response.StatusCode, content);

            throw response.StatusCode switch
            {
                HttpStatusCode.Unauthorized => new UnauthorizedAccessException("QuickBooks token expired"),
                HttpStatusCode.TooManyRequests => new RateLimitException("QuickBooks rate limit exceeded"),
                _ => new ExternalApiException($"QuickBooks error: {response.StatusCode}")
            };
        }
    }
}
```

#### Entity Mappers

**File**: `server/Services/Integration/QuickBooks/Mappers/QBOCustomerMapper.cs`

```csharp
public static class QBOCustomerMapper
{
    public static QBOCustomer ToQuickBooks(Customer customer)
    {
        return new QBOCustomer
        {
            // NOTE: Our Customer model is B2B company-first (Customer.Name, Email, Phone).
            DisplayName = customer.Name,
            CompanyName = customer.Name,
            PrimaryEmailAddr = string.IsNullOrEmpty(customer.Email)
                ? null
                : new QBOEmailAddress { Address = customer.Email },
            PrimaryPhone = string.IsNullOrEmpty(customer.Phone)
                ? null
                : new QBOTelephoneNumber { FreeFormNumber = customer.Phone },
            BillAddr = MapAddress(customer.BillingAddress),
            ShipAddr = MapAddress(customer.ShippingAddress),
            Notes = $"PrometheusId:{customer.Id}" // For reverse lookup/debugging
        };
    }

    public static void UpdateFromQuickBooks(Customer customer, QBOCustomer qboCustomer)
    {
        // V1: do not treat QBO as source-of-truth for our Customer domain fields.
        // Use webhooks primarily for triggering downstream sync actions (payments, invoice status, etc.),
        // not for overwriting internal customer records.
        //
        // If we later introduce finance-specific fields in our domain (e.g., AR balance),
        // add explicit opt-in settings and a dedicated financial model to avoid inconsistent truths.
    }

    private static QBOAddress? MapAddress(Address? address)
    {
        if (address == null) return null;

        return new QBOAddress
        {
            Line1 = address.AddressOne,
            City = address.City,
            CountrySubDivisionCode = address.State,
            PostalCode = address.ZipCode,
            Country = address.Country
        };
    }
}
```

---

### 5.3 Frontend

#### Entity Classes

**File**: `client/app/_classes/Integrations.ts`

```typescript
export class ConnectionStatus {
	provider: string
	isConnected: boolean
	companyName: string | null
	lastSyncAt: Date | null
	lastSyncError: string | null
	autoSyncEnabled: boolean
	settings: ConnectionSettings

	constructor(data?: Partial<ConnectionStatus>) {
		this.provider = data?.provider ?? ''
		this.isConnected = data?.isConnected ?? false
		this.companyName = data?.companyName ?? null
		this.lastSyncAt = data?.lastSyncAt ? new Date(data.lastSyncAt) : null
		this.lastSyncError = data?.lastSyncError ?? null
		this.autoSyncEnabled = data?.autoSyncEnabled ?? false
		this.settings = data?.settings ?? new ConnectionSettings()
	}
}

export class ConnectionSettings {
	syncCustomers: boolean
	syncInvoices: boolean
	syncPayments: boolean

	constructor(data?: Partial<ConnectionSettings>) {
		this.syncCustomers = data?.syncCustomers ?? true
		this.syncInvoices = data?.syncInvoices ?? true
		this.syncPayments = data?.syncPayments ?? true
	}
}

export class SyncLog {
	id: string
	provider: string
	entityType: string
	entityId: string | null
	externalId: string | null
	direction: 'ToExternal' | 'FromExternal'
	status: 'Pending' | 'InProgress' | 'Completed' | 'Failed' | 'Skipped'
	errorMessage: string | null
	startedAt: Date
	completedAt: Date | null
	retryCount: number

	constructor(data?: Partial<SyncLog>) {
		this.id = data?.id ?? ''
		this.provider = data?.provider ?? ''
		this.entityType = data?.entityType ?? ''
		this.entityId = data?.entityId ?? null
		this.externalId = data?.externalId ?? null
		this.direction = data?.direction ?? 'ToExternal'
		this.status = data?.status ?? 'Pending'
		this.errorMessage = data?.errorMessage ?? null
		this.startedAt = data?.startedAt ? new Date(data.startedAt) : new Date()
		this.completedAt = data?.completedAt ? new Date(data.completedAt) : null
		this.retryCount = data?.retryCount ?? 0
	}
}

export class EntityMapping {
	id: string
	provider: string
	entityType: string
	prometheusId: string
	externalId: string
	lastSyncAt: Date | null

	constructor(data?: Partial<EntityMapping>) {
		this.id = data?.id ?? ''
		this.provider = data?.provider ?? ''
		this.entityType = data?.entityType ?? ''
		this.prometheusId = data?.prometheusId ?? ''
		this.externalId = data?.externalId ?? ''
		this.lastSyncAt = data?.lastSyncAt ? new Date(data.lastSyncAt) : null
	}
}

export class SyncResult {
	totalProcessed: number
	successful: number
	failed: number
	skipped: number
	errors: string[]

	constructor(data?: Partial<SyncResult>) {
		this.totalProcessed = data?.totalProcessed ?? 0
		this.successful = data?.successful ?? 0
		this.failed = data?.failed ?? 0
		this.skipped = data?.skipped ?? 0
		this.errors = data?.errors ?? []
	}
}
```

---

#### API Integration

**File**: `client/app/_shared/services/api.ts` (additions)

```typescript
export const API = {
	// ... existing methods ...

	Integrations: {
		// Connections
		getConnections: () => HttpService.get<ConnectionStatusResponse[]>('/api/integrations/connections'),

		getConnection: (provider: string) =>
			HttpService.get<ConnectionStatusResponse>(`/api/integrations/connections/${provider}`),

		updateSettings: (provider: string, settings: UpdateConnectionSettingsRequest) =>
			HttpService.put<boolean>(`/api/integrations/connections/${provider}/settings`, settings),

		disconnect: (provider: string) => HttpService.delete<boolean>(`/api/integrations/connections/${provider}`),

		// Sync
		manualSync: (provider: string, request: ManualSyncRequest) =>
			HttpService.post<SyncResultResponse>(`/api/integrations/sync/${provider}`, request),

		retryFailed: (provider: string) =>
			HttpService.post<SyncResultResponse>(`/api/integrations/sync/${provider}/retry-failed`),

		// Logs
		getLogs: (params?: SyncLogFilterParams) =>
			HttpService.get<PagedResult<SyncLogResponse>>('/api/integrations/logs', params),

		getMappings: (provider: string, entityType: string) =>
			HttpService.get<EntityMappingResponse[]>(`/api/integrations/mappings/${provider}/${entityType}`),

		// Outbox
		getOutbox: (params?: PaginationParams) =>
			HttpService.get<PagedResult<OutboxItemResponse>>('/api/integrations/outbox', params),

		retryOutboxItem: (id: string) => HttpService.post<boolean>(`/api/integrations/outbox/${id}/retry`),
	},

	QuickBooks: {
		getAuthUrl: () => HttpService.get<string>('/api/integrations/quickbooks/authorize'),
	},

	NetSuite: {
		connect: (credentials: NetSuiteCredentials) =>
			HttpService.post<ConnectionStatusResponse>('/api/integrations/netsuite/connect', credentials),

		validate: () => HttpService.post<boolean>('/api/integrations/netsuite/validate'),
	},
}
```

---

#### Custom Hooks

**File**: `client/app/app/integrations/_components/hooks/useIntegrations.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { API } from '@_shared/services/api'

export const integrationKeys = {
	all: ['integrations'] as const,
	connections: () => [...integrationKeys.all, 'connections'] as const,
	connection: (provider: string) => [...integrationKeys.connections(), provider] as const,
	logs: (params?: SyncLogFilterParams) => [...integrationKeys.all, 'logs', params] as const,
	mappings: (provider: string, entityType: string) =>
		[...integrationKeys.all, 'mappings', provider, entityType] as const,
	outbox: (params?: PaginationParams) => [...integrationKeys.all, 'outbox', params] as const,
}

// === Connection Hooks ===

export function useConnections() {
	return useQuery({
		queryKey: integrationKeys.connections(),
		queryFn: () => API.Integrations.getConnections(),
		refetchInterval: 30000, // Refresh every 30s
	})
}

export function useConnection(provider: string) {
	return useQuery({
		queryKey: integrationKeys.connection(provider),
		queryFn: () => API.Integrations.getConnection(provider),
		enabled: !!provider,
	})
}

export function useUpdateConnectionSettings() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: ({ provider, settings }: { provider: string; settings: UpdateConnectionSettingsRequest }) =>
			API.Integrations.updateSettings(provider, settings),
		onSuccess: (_, { provider }) => {
			queryClient.invalidateQueries({ queryKey: integrationKeys.connection(provider) })
		},
	})
}

export function useDisconnect() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (provider: string) => API.Integrations.disconnect(provider),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: integrationKeys.connections() })
		},
	})
}

// === Sync Hooks ===

export function useManualSync() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: ({ provider, request }: { provider: string; request: ManualSyncRequest }) =>
			API.Integrations.manualSync(provider, request),
		onSuccess: (_, { provider }) => {
			queryClient.invalidateQueries({ queryKey: integrationKeys.connection(provider) })
			queryClient.invalidateQueries({ queryKey: integrationKeys.logs() })
		},
	})
}

export function useRetryFailedSyncs() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (provider: string) => API.Integrations.retryFailed(provider),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: integrationKeys.logs() })
		},
	})
}

// === Logs Hooks ===

export function useSyncLogs(params?: SyncLogFilterParams) {
	return useQuery({
		queryKey: integrationKeys.logs(params),
		queryFn: () => API.Integrations.getLogs(params),
	})
}

export function useEntityMappings(provider: string, entityType: string) {
	return useQuery({
		queryKey: integrationKeys.mappings(provider, entityType),
		queryFn: () => API.Integrations.getMappings(provider, entityType),
		enabled: !!provider && !!entityType,
	})
}

// === QuickBooks Hooks ===

export function useConnectQuickBooks() {
	return useMutation({
		mutationFn: async () => {
			// State is generated server-side for CSRF safety.
			const url = await API.QuickBooks.getAuthUrl()
			window.location.href = url
		},
	})
}
```

---

#### Components

**Location**: `client/app/app/integrations/_components/`

| Component                   | Purpose                                       |
| --------------------------- | --------------------------------------------- |
| `IntegrationsDashboard.tsx` | Overview of all connections with status cards |
| `ConnectionCard.tsx`        | Individual ERP connection status and actions  |
| `QuickBooksConnector.tsx`   | QuickBooks-specific connection flow           |
| `NetSuiteConnector.tsx`     | NetSuite credential input and connection      |
| `SyncLogTable.tsx`          | DataGrid of sync logs with filters            |
| `EntityMappingsTable.tsx`   | View Prometheus ↔ ERP entity mappings         |
| `SyncSettingsForm.tsx`      | Configure auto-sync, entity selection         |
| `ManualSyncModal.tsx`       | Trigger manual sync with options              |
| `OutboxViewer.tsx`          | View pending outbox items                     |
| `hooks/useIntegrations.ts`  | All integration-related hooks                 |
| `hooks/index.ts`            | Barrel export                                 |
| `index.ts`                  | Barrel export                                 |

---

### 5.4 RBAC Implementation

#### Backend Authorization

**File**: `server/Constants/RBACConstants.cs` (additions)

```csharp
public static class Policies
{
    // ... existing policies ...

    public const string IntegrationsView = "IntegrationsView";
    public const string IntegrationsManage = "IntegrationsManage";
}
```

**File**: `server/Extensions/RBACServiceExtensions.cs` (additions)

```csharp
options.AddPolicy(RBACConstants.Policies.IntegrationsView, policy =>
    policy.RequireRole("Admin", "SalesManager"));

options.AddPolicy(RBACConstants.Policies.IntegrationsManage, policy =>
    policy.RequireRole("Admin"));
```

#### Frontend Guards

```tsx
// View integrations (Admin, Sales Manager)
<PermissionGuard resource={Resources.Integrations} action={Actions.View}>
  <IntegrationsDashboard />
</PermissionGuard>

// Manage integrations (Admin only)
<PermissionGuard resource={Resources.Integrations} action={Actions.Manage}>
  <QuickBooksConnector />
</PermissionGuard>
```

---

## 6. Implementation Plan

### Phase 1: Integration Foundation (Week 1-2)

-   [ ] Create migration for integration framework entities
-   [ ] Implement `IntegrationOutbox`, `IntegrationConnections`, `IntegrationEntityMappings`, `IntegrationSyncLogs`
-   [ ] Implement `IntegrationInbox` (webhook dedupe) + `IntegrationSyncCheckpoints` (CDC/watermarks)
-   [ ] Implement outbox processor Hangfire job with exponential backoff + distributed locking (per tenant/provider)
-   [ ] Add integration events to Order/Customer services
-   [ ] Implement token encryption service (Data Protection API)
-   [ ] Add RBAC policies for integrations
-   [ ] Unit tests for outbox processor

### Phase 2: QuickBooks Foundation (Week 3-4)

-   [ ] Implement OAuth 2.0 flow for QuickBooks
-   [ ] Implement `QuickBooksApiClient` with retry/backoff
-   [ ] Implement `QuickBooksTokenService` with auto-refresh
-   [ ] Implement entity mappers (Customer, Invoice)
-   [ ] Add QBO webhook endpoint with signature verification
-   [ ] Integration tests with QBO sandbox

### Phase 3: QuickBooks Sync (Week 5-6)

-   [ ] Implement customer sync (bidirectional)
-   [ ] Implement invoice creation from orders
-   [ ] Implement payment webhook handling
-   [ ] Implement sync log recording
-   [ ] Build admin UI for QuickBooks connection
-   [ ] E2E tests for sync workflows

### Phase 4: NetSuite Integration (Week 7-10)

-   [ ] Implement NetSuite OAuth/Token auth
-   [ ] Implement `NetSuiteApiClient` with SuiteQL
-   [ ] Implement customer and sales order sync
-   [ ] Add NetSuite-specific mappers
-   [ ] Build admin UI for NetSuite connection
-   [ ] Integration tests with NetSuite sandbox

### Phase 5: Admin UI & Polish (Week 11-12)

-   [ ] Build integrations dashboard
-   [ ] Build sync log viewer with filters
-   [ ] Build entity mapping viewer
-   [ ] Build manual sync controls
-   [ ] Performance optimization
-   [ ] Documentation

---

## 7. Testing Requirements

### Unit Tests

#### Outbox Processor Tests

```csharp
[Test]
public async Task ProcessOutbox_ShouldProcessPendingItems() { }

[Test]
public async Task ProcessOutbox_ShouldApplyExponentialBackoff_OnFailure() { }

[Test]
public async Task ProcessOutbox_ShouldMarkAbandoned_AfterMaxRetries() { }

[Test]
public async Task ProcessOutbox_ShouldNotRunConcurrently_ForSameTenantAndProvider() { }

[Test]
public async Task Inbox_ShouldDedupeDuplicateWebhookEvents() { }
```

#### QuickBooks Mapper Tests

```csharp
[Test]
public void ToQuickBooks_ShouldMapAllFields() { }

[Test]
public void ToQuickBooks_ShouldHandleNullAddress() { }
```

### Integration Tests

```typescript
describe('QuickBooks Integration', () => {
	it('should complete OAuth flow', async () => {})
	it('should sync customer to QuickBooks', async () => {})
	it('should create invoice from order', async () => {})
	it('should handle payment webhook', async () => {})
	it('should be idempotent on retry', async () => {})
})
```

### RBAC Security Tests

```typescript
describe('Integrations RBAC', () => {
	it('should allow Admin to connect QuickBooks', () => {})
	it('should allow SalesManager to view sync logs', () => {})
	it('should deny SalesRep from managing integrations', () => {})
})
```

---

## 8. Performance Requirements

| Metric                    | Target  | Maximum |
| ------------------------- | ------- | ------- |
| OAuth callback            | < 2s    | 5s      |
| Single entity sync        | < 3s    | 10s     |
| Bulk sync (100 entities)  | < 60s   | 120s    |
| Sync log query            | < 200ms | 500ms   |
| Outbox processing (batch) | < 30s   | 60s     |

### Scalability + Rate Limiting Requirements (Provider Reality)

-   All external API calls must use `IHttpClientFactory` + resilience policies (retry w/ jitter, circuit breaker).
-   Handle 429/5xx with exponential backoff + jitter.
-   Enforce tenant/provider pacing:
    -   Avoid parallel fan-out per tenant (rate limit + duplicate risk).
    -   Process bulk sync in chunks (e.g., 50 entities per job).
-   Prefer incremental sync:
    -   QuickBooks: use CDC endpoints where applicable.
    -   NetSuite: use SuiteQL with `lastModifiedDate`/watermark patterns.

### Reliability Requirements

| Metric                | Target                 |
| --------------------- | ---------------------- |
| Sync success rate     | > 99%                  |
| Duplicate prevention  | 100% (via idempotency) |
| Data loss prevention  | 100% (via outbox)      |
| Token refresh success | > 99.9%                |

---

## 9. Security Considerations

### Token Storage

-   All OAuth tokens encrypted at rest using .NET Data Protection API
-   Refresh tokens have 100-day expiry (QBO standard)
-   Access tokens auto-refresh before expiry

### OAuth CSRF Protection (State)

-   `state` must be **generated server-side**, bound to `(tenant_id, user_id)`, stored with a short TTL (e.g., 10 minutes).
-   Callback must validate:
    -   state exists + not expired
    -   state belongs to the same tenant/user that initiated the flow
    -   state is single-use (delete after validation)

### Webhook Security

-   QuickBooks webhooks verified via HMAC-SHA256 signature
-   Incoming webhooks are deduped via **IntegrationInbox** to prevent double-processing
-   Webhook routing is tenant-safe:
    -   QBO webhook includes `realmId` → resolve the correct tenant by matching `IntegrationConnections.Provider="QuickBooks"` + `ExternalCompanyId=realmId`
    -   Enforce unique `(provider, external_company_id)` to prevent accidental cross-tenant routing
-   All webhook endpoints rate-limited

### Data Protection

-   Sensitive fields (tokens, credentials) never logged
-   Sync payloads may be stored **only on failure** (or tenant-scoped diagnostic mode) and scrubbed of PII after 90 days
-   Do not sync “account balance” fields in v1 unless your domain model explicitly supports and needs it (avoid inconsistent financial truths)

---

## 10. File Changes Summary

### New Files

```
server/
├── Entities/Integration/
│   ├── IntegrationOutbox.cs
│   ├── IntegrationConnection.cs
│   ├── IntegrationEntityMapping.cs
│   └── IntegrationSyncLog.cs
├── Classes/DTOs/Integration/
│   └── IntegrationDTOs.cs
├── Services/Integration/
│   ├── IIntegrationService.cs
│   ├── IntegrationService.cs
│   ├── OutboxProcessorJob.cs
│   ├── IQuickBooksService.cs
│   ├── INetSuiteService.cs
│   ├── QuickBooks/
│   │   ├── QuickBooksService.cs
│   │   ├── QuickBooksApiClient.cs
│   │   ├── QuickBooksTokenService.cs
│   │   └── Mappers/
│   │       ├── QBOCustomerMapper.cs
│   │       └── QBOInvoiceMapper.cs
│   └── NetSuite/
│       ├── NetSuiteService.cs
│       ├── NetSuiteApiClient.cs
│       └── Mappers/
│           └── NSCustomerMapper.cs
├── Controllers/
│   ├── IntegrationsController.cs
│   ├── QuickBooksController.cs
│   └── NetSuiteController.cs
└── Migrations/
    └── YYYYMMDDHHMMSS_AddIntegrationFramework.cs

client/
├── app/_classes/
│   └── Integrations.ts
└── app/app/integrations/
    ├── _components/
    │   ├── IntegrationsDashboard.tsx
    │   ├── ConnectionCard.tsx
    │   ├── QuickBooksConnector.tsx
    │   ├── NetSuiteConnector.tsx
    │   ├── SyncLogTable.tsx
    │   ├── EntityMappingsTable.tsx
    │   ├── SyncSettingsForm.tsx
    │   ├── ManualSyncModal.tsx
    │   ├── OutboxViewer.tsx
    │   ├── hooks/
    │   │   ├── useIntegrations.ts
    │   │   └── index.ts
    │   └── index.ts
    ├── quickbooks/
    │   └── callback/page.tsx
    └── page.tsx
```

### Modified Files

```
server/
├── Constants/RBACConstants.cs
├── Extensions/RBACServiceExtensions.cs
├── Database/DBContext.cs
├── Services/DB/OrderService.cs (add outbox events)
├── Services/DB/CustomerService.cs (add outbox events)
└── Program.cs (DI registration)

client/
├── app/_shared/services/api.ts
└── app/app/orders/[id]/_components/OrderDetail.tsx (sync status badge)
```

---

## 11. Success Criteria

-   [ ] Integration foundation with transactional outbox operational
-   [ ] QuickBooks OAuth flow working in production
-   [ ] Customer sync achieving > 99% success rate
-   [ ] Invoice creation working with idempotency
-   [ ] Payment webhooks updating order status
-   [ ] NetSuite connection and sync operational
-   [ ] Admin UI fully functional for both ERPs
-   [ ] All security requirements met (encryption, webhook verification)
-   [ ] Performance benchmarks met
-   [ ] 95%+ test coverage on sync services
-   [ ] Documentation complete

---

## 12. References

-   [QuickBooks Online API Documentation](https://developer.intuit.com/app/developer/qbo/docs/api/accounting/all-entities/account)
-   [NetSuite SuiteTalk REST API](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/chapter_1540391670.html)
-   [Transactional Outbox Pattern](https://microservices.io/patterns/data/transactional-outbox.html)
-   [ERP & Pricing Research Document](../../docs/ERP_PRICING_INTEGRATION_RESEARCH.md)
-   [Business Plan - Section 6.4](../../Business/Business_Plan_Prometheus.md)

---

**Document Version**: 1.0
**Last Updated**: January 12, 2026
**Status**: Ready for Implementation
