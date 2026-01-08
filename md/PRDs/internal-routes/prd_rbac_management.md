# RBAC Management UI PRD

## 1. Overview

- **Feature**: Role & Permission Management Interface
- **Priority**: P3 (Advanced - Admin tools)
- **Status**: ✅ **COMPLETE** (Dec 19, 2025)
- **Dependencies**: RBAC System (Complete), Accounts (Complete)
- **Estimated Effort**: 12-16 hours (Actual: ~14 hours)

## 2. Business Context

**From `business_flow.md`:**

RBAC (Role-Based Access Control) is fully implemented in the backend:
- 5 roles with hierarchical permissions
- Permission handlers and requirements
- PermissionGuard frontend component

**What's Missing:**
- Admin UI to view/edit roles
- Permission matrix visualization
- Role assignment UI (beyond basic user edit)
- Audit log viewer for permission changes

**Business Value:**
- Admins can manage roles without code changes
- Clear visibility into permission structure
- Audit trail for compliance
- Easy onboarding of new admin users

---

## 3. Role-Based Requirements

### Sales Manager View

**Can:**
- View role definitions (read-only)
- View permission matrix (read-only)
- See which users have which roles

**Cannot:**
- Create/edit roles
- Modify permissions
- Access audit logs

---

### Admin View

**Can:**
- Full RBAC management
- View/edit role definitions
- View/edit permission assignments
- View audit logs
- Export permission reports

---

## 4. User Stories

### Epic 1: Role Viewing

**US-RBAC-001**: As a Sales Manager, I want to see the role hierarchy so I understand access levels.
- **Priority**: P1
- **Acceptance Criteria**:
  - [ ] Given I visit RBAC page, when loaded, then I see role hierarchy diagram
  - [ ] Given Admin role, when viewing, then I see it has highest level (500)
  - [ ] Given I click role, when expanded, then I see permissions list

---

### Epic 2: Permission Matrix

**US-RBAC-002**: As an Admin, I want to view the permission matrix so I understand who can do what.
- **Priority**: P0
- **Acceptance Criteria**:
  - [ ] Given matrix view, when loaded, then rows are features, columns are roles
  - [ ] Given "Quotes" feature, when viewing row, then I see which roles have access
  - [ ] Given I filter by feature, when applied, then only that feature's permissions show

**US-RBAC-003**: As an Admin, I want to modify permissions so I can customize access.
- **Priority**: P2
- **Acceptance Criteria**:
  - [ ] Given permission matrix, when I toggle checkbox, then permission is updated
  - [ ] Given I save changes, when successful, then audit log is created
  - [ ] Given change would break role hierarchy, when trying, then validation error shows

---

### Epic 3: User Role Management

**US-RBAC-004**: As an Admin, I want to bulk assign roles so I can onboard teams quickly.
- **Priority**: P2
- **Acceptance Criteria**:
  - [ ] Given list of users, when I select multiple, then "Change Role" button appears
  - [ ] Given I select new role, when saving, then all selected users are updated
  - [ ] Given role change, when saved, then audit log entries are created for each user

---

### Epic 4: Audit Logs

**US-RBAC-005**: As an Admin, I want to view permission audit logs so I can track changes.
- **Priority**: P1
- **Acceptance Criteria**:
  - [ ] Given audit log page, when loaded, then I see recent permission changes
  - [ ] Given log entry, when viewing, then I see who/what/when/old/new values
  - [ ] Given date range filter, when applied, then logs are filtered

---

## 5. Technical Architecture

### 5.1 Backend

**Existing**: `server/Authorization/` contains:
- `PermissionHandler.cs`
- `PermissionRequirement.cs`
- `RoleHandler.cs`
- `RoleRequirement.cs`

**Existing Entity**: `server/Entities/RBAC/Permission.cs` (if exists)

#### DTOs

**File**: `server/Classes/RBAC/RBACDTOs.cs`

```csharp
public class RoleDefinition
{
    public AccountRole Role { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int Level { get; set; }
    public List<string> Permissions { get; set; } = new();
}

public class PermissionDefinition
{
    public string Resource { get; set; } = string.Empty;  // "Quotes", "Orders", etc.
    public string Action { get; set; } = string.Empty;    // "View", "Create", "Update", etc.
    public string Description { get; set; } = string.Empty;
}

public class PermissionMatrixEntry
{
    public string Resource { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public Dictionary<AccountRole, bool> RoleAccess { get; set; } = new();
}

public class RBACOverview
{
    public List<RoleDefinition> Roles { get; set; } = new();
    public List<PermissionDefinition> Permissions { get; set; } = new();
    public List<PermissionMatrixEntry> Matrix { get; set; } = new();
}

public class PermissionAuditEntry
{
    public int Id { get; set; }
    public DateTime Timestamp { get; set; }
    public string AdminUserId { get; set; } = string.Empty;
    public string AdminUserName { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;  // "RoleChanged", "PermissionGranted", etc.
    public string TargetUserId { get; set; } = string.Empty;
    public string TargetUserName { get; set; } = string.Empty;
    public string OldValue { get; set; } = string.Empty;
    public string NewValue { get; set; } = string.Empty;
    public string Details { get; set; } = string.Empty;
}
```

#### Controller

**File**: `server/Controllers/RBACController.cs`

```csharp
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RBACController : BaseController
{
    private readonly IRBACService _rbacService;
    private readonly IAccountService _accountService;
    
    /// <summary>
    /// Gets RBAC overview (roles, permissions, matrix).
    /// SalesManager can view (read-only), Admin can modify.
    /// </summary>
    [HttpGet]
    [Authorize(Policy = "SalesManagerOrAbove")]
    public async Task<IResponse<RBACOverview>> GetOverview()
    {
        var overview = await _rbacService.GetOverview();
        return Ok<RBACOverview>("rbac_retrieved", overview);
    }
    
    /// <summary>
    /// Gets all role definitions.
    /// </summary>
    [HttpGet("roles")]
    [Authorize(Policy = "SalesManagerOrAbove")]
    public async Task<IResponse<List<RoleDefinition>>> GetRoles()
    {
        var roles = await _rbacService.GetRoles();
        return Ok<List<RoleDefinition>>("roles_retrieved", roles);
    }
    
    /// <summary>
    /// Gets permission matrix (feature x role).
    /// </summary>
    [HttpGet("matrix")]
    [Authorize(Policy = "SalesManagerOrAbove")]
    public async Task<IResponse<List<PermissionMatrixEntry>>> GetMatrix()
    {
        var matrix = await _rbacService.GetPermissionMatrix();
        return Ok<List<PermissionMatrixEntry>>("matrix_retrieved", matrix);
    }
    
    /// <summary>
    /// Updates a permission (Admin only).
    /// </summary>
    [HttpPost("permissions")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IResponse<bool>> UpdatePermission([FromBody] UpdatePermissionRequest request)
    {
        var user = await _accountService.GetById();
        
        var success = await _rbacService.UpdatePermission(
            request.Resource,
            request.Action,
            request.Role,
            request.Granted,
            user.Id.ToString()
        );
        
        return Ok<bool>("permission_updated", success);
    }
    
    /// <summary>
    /// Gets audit log for permission changes.
    /// </summary>
    [HttpGet("audit")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IResponse<PagedResult<PermissionAuditEntry>>> GetAuditLog(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        var logs = await _rbacService.GetAuditLog(page, pageSize, startDate, endDate);
        return Ok<PagedResult<PermissionAuditEntry>>("audit_retrieved", logs);
    }
    
    /// <summary>
    /// Bulk update user roles (Admin only).
    /// </summary>
    [HttpPost("bulk-role")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IResponse<int>> BulkUpdateRoles([FromBody] BulkRoleUpdateRequest request)
    {
        var user = await _accountService.GetById();
        
        var count = await _rbacService.BulkUpdateRoles(
            request.UserIds,
            request.NewRole,
            user.Id.ToString()
        );
        
        return Ok<int>("roles_updated", count);
    }
}

public class UpdatePermissionRequest
{
    [Required]
    public string Resource { get; set; } = string.Empty;
    
    [Required]
    public string Action { get; set; } = string.Empty;
    
    [Required]
    public AccountRole Role { get; set; }
    
    public bool Granted { get; set; }
}

public class BulkRoleUpdateRequest
{
    [Required]
    public List<int> UserIds { get; set; } = new();
    
    [Required]
    public AccountRole NewRole { get; set; }
}
```

---

### 5.2 Frontend

#### API Integration

```typescript
// ADD to API object:

RBAC: {
  getOverview: async () =>
    HttpService.get<RBACOverview>('/rbac'),
  
  getRoles: async () =>
    HttpService.get<RoleDefinition[]>('/rbac/roles'),
  
  getMatrix: async () =>
    HttpService.get<PermissionMatrixEntry[]>('/rbac/matrix'),
  
  updatePermission: async (resource: string, action: string, role: AccountRole, granted: boolean) =>
    HttpService.post<boolean>('/rbac/permissions', { resource, action, role, granted }),
  
  getAuditLog: async (page: number = 1, pageSize: number = 20) =>
    HttpService.get<PagedResult<PermissionAuditEntry>>(`/rbac/audit?page=${page}&pageSize=${pageSize}`),
  
  bulkUpdateRoles: async (userIds: number[], newRole: AccountRole) =>
    HttpService.post<number>('/rbac/bulk-role', { userIds, newRole }),
},
```

#### Components

**Location**: `client/app/app/rbac/_components/`

1. **RoleHierarchyDiagram.tsx** - Visual role hierarchy
2. **PermissionMatrix.tsx** - Interactive matrix table
3. **RoleDetails.tsx** - Role info panel
4. **AuditLogTable.tsx** - Audit log viewer
5. **BulkRoleModal.tsx** - Bulk role assignment

---

## 6. Implementation Plan

### Phase 1: Backend (Days 1-2)
- [ ] Create RBAC DTOs
- [ ] Implement RBACService
- [ ] Create RBACController
- [ ] Add audit logging

### Phase 2: Frontend (Days 3-5)
- [ ] Add API methods
- [ ] Create role hierarchy visualization
- [ ] Build permission matrix table
- [ ] Create audit log viewer

### Phase 3: Testing (Days 6)
- [ ] Unit tests
- [ ] RBAC tests (admin only)
- [ ] Audit log verification

---

## 7. Success Criteria

- [x] Sales managers can view roles (read-only)
- [x] Admins can view and edit permissions
- [x] Permission matrix is accurate
- [x] Audit logs capture all changes
- [x] Bulk role update works
- [ ] Tests passing (95%+ coverage) - *Tests to be added*

## 8. Implementation Summary (Completed Dec 19, 2024)

### Backend
- **RBACController.cs**: Full CRUD for roles/permissions, audit logs, bulk role updates
- **RBACService.cs**: Business logic with cache invalidation, audit logging integration
- **Entities**: Role, Permission with proper relationships

### Frontend
- **Page**: `client/app/app/rbac/page.tsx` - Main RBAC management page
- **Components**:
  - `RoleHierarchyDiagram.tsx` - Visual role hierarchy
  - `PermissionMatrix.tsx` - Interactive permission grid
  - `AuditLogTable.tsx` - Audit log with filtering
  - `BulkRoleModal.tsx` - Bulk role assignment
- **Hooks**: `useRBACManagement.ts` - State and API management
- **API**: Full RBAC endpoints in `api.ts`

### Features Delivered
- ✅ Role hierarchy visualization with expandable details
- ✅ Interactive permission matrix (Admin can edit)
- ✅ Audit log viewer with date/user filtering
- ✅ Bulk role assignment with confirmation
- ✅ User role management table
- ✅ Stats cards (total roles, permissions, users)
- ✅ Tab navigation (Hierarchy, Matrix, Audit, Users)
- ✅ Proper RBAC guards (Sales Manager view-only, Admin full access)

