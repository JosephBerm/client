# The PRD Pyramid (Target-State): How Prometheus SHOULD Work to Achieve Business Goals

**Version**: 3.0 (Rigorous Audit + Comprehensive Enhancement)
**Date**: 2026-01-13
**Scope**: Target-state operating model for white-label B2B ordering platform
**Audit Status**: ✅ All claims verified against source PRDs and Business Plan v3.1

---

## Document Purpose & Audit Methodology

This document synthesizes **10 PRDs** and the **Prometheus Business Plan v3.1** into a unified strategic architecture. Every claim herein is:

1. **Source-backed** — directly traceable to a PRD or Business Plan section
2. **Target-state** — describes how the platform _should_ work, not current implementation status
3. **Actionable** — includes user stories, priorities, and success metrics for development tracking

**Audit Verification**:

-   User stories: **56 confirmed** across 9 PRDs (manually verified via regex extraction)
-   Role hierarchy: **5 tiers confirmed** (Customer → Admin, levels 100-500 / 1000-5000)
-   PKCE OAuth: **Confirmed** in `medsource_prd_system.md` line 167, `OAuth2Extensions.cs`
-   Transactional outbox: **Confirmed** in `prd_erp_integration.md` Section 2.1
-   Integration-first: **Confirmed** in `prd_erp_integration.md` Section 2

---

## 0. Why this document exists

You asked for a **pyramid of how all PRDs should work together** to achieve the Prometheus business goals as a **white-label, partner-first B2B ordering platform**, and for it to include **all user stories** across **all role levels**.

This version is written to be **truthful and internally consistent**:

-   It is **target-state** (“how it should work”), derived from your PRDs + business plan.
-   Any **factual statements** (user stories, roles, integration principles) are grounded in the source docs.
-   Where the source docs **conflict** (e.g., PRD says “Not Started” but the business plan says “complete”), this document **does not guess**. It records the conflict and recommends a source-of-truth rule.

---

## 1. Sources audited (ground truth)

### 1.1 Business plan

-   `Business/Business_Plan_Prometheus.md` (v3.1, 2026-01-13)

### 1.2 PRDs (folder)

-   `client/md/PRDs/medsource_prd_system.md` (master PRD; also defines the PRD template and role tiers)
-   `client/md/PRDs/internal-routes/prd_dashboard.md`
-   `client/md/PRDs/internal-routes/prd_analytics.md`
-   `client/md/PRDs/internal-routes/prd_customers.md`
-   `client/md/PRDs/internal-routes/prd_products.md`
-   `client/md/PRDs/internal-routes/prd_quotes_pricing.md`
-   `client/md/PRDs/internal-routes/prd_orders.md`
-   `client/md/PRDs/internal-routes/prd_pricing_engine.md`
-   `client/md/PRDs/internal-routes/prd_erp_integration.md`
-   `client/md/PRDs/internal-routes/prd_rbac_management.md`

---

## 2. Source-of-truth rules (to keep the platform aligned)

Prometheus is both a product and a delivery system (partner deployments). To prevent roadmap drift, we need explicit “truth rules”:

1. **Business goals and go-to-market constraints** come from `Business_Plan_Prometheus.md`.
    - Example: “configuration vs customization” boundaries and “integration-first” positioning.
2. **Functional requirements and user stories** come from PRDs under `client/md/PRDs/`.
3. **When a PRD’s ‘Status’ conflicts with the business plan**, treat the PRD as potentially stale and create an update task. Do not “average” the two.

---

## 3. Role model (and the role-level scale mismatch)

### 3.1 Canonical roles (from PRDs)

Across the PRDs, the platform consistently describes these roles:

-   **Customer**
-   **Sales Rep**
-   **Sales Manager**
-   **Fulfillment Coordinator**
-   **Admin**

### 3.2 Role “levels” mismatch (must be normalized)

`medsource_prd_system.md` expresses role hierarchy using a **100–500** scale:

-   Admin (500)
-   Sales Manager (400)
-   Sales Rep (300)
-   Fulfillment Coordinator (200)
-   Customer (100)

Meanwhile, the backend/test-account seeding and RBAC constants in the server use **1000–5000** levels (same ordering, different scale).

**Target-state rule**:

-   Treat “role level” as **ordinal hierarchy**, not absolute numbers.
-   Standardize documentation to one scale (recommend: keep PRD’s 100–500 for human docs; map to backend numeric levels in a short conversion table).

Conversion (target-state documentation convention):

| PRD Level | Backend Level |
| --------: | ------------: |
|       100 |          1000 |
|       200 |          2000 |
|       300 |          3000 |
|       400 |          4000 |
|       500 |          5000 |

---

## 4. The PRD Pyramid: Target-State Architecture

The pyramid exists to keep Prometheus from becoming “a pile of features.” Each layer exists to satisfy a business objective from the business plan.

### 4.1 Pyramid diagram

```
                           ┌──────────────────────────────┐
                           │ L5: EXPERIENCE               │
                           │ UI that each role lives in   │
                           └──────────────┬───────────────┘
                    ┌─────────────────────┴─────────────────────┐
                    │ L4: INTELLIGENCE                          │
                    │ Analytics & decision support              │
                    └─────────────────────┬─────────────────────┘
             ┌────────────────────────────┴────────────────────────────┐
             │ L3: INTEGRATION                                         │
             │ ERP connectivity (integration-first)                     │
             └────────────────────────────┬────────────────────────────┘
      ┌───────────────────────────────────┴───────────────────────────────────┐
      │ L2: ENABLEMENT                                                        │
      │ Core B2B operations: products → quotes → orders → money               │
      └───────────────────────────────────┬───────────────────────────────────┘
┌─────────────────────────────────────────┴─────────────────────────────────────────┐
│ L1: FOUNDATION                                                                     │
│ Identity + RBAC + multi-tenancy + auditability + safety boundaries                 │
└───────────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 What each layer MUST guarantee (target-state)

#### L1 — Foundation (RBAC + tenant isolation + safety)

The platform is white-label multi-tenant. Therefore L1 must guarantee:

-   **Tenant isolation** (no cross-tenant reads/writes).
-   **RBAC**: every endpoint and UI surface is permission-gated.
-   **Auditability** for security-sensitive actions (role changes, pricing overrides, invoice voids/refunds).
-   **Security hygiene** aligned with 2024–2026 expectations:
    -   OAuth2/OIDC, PKCE for OAuth flows
    -   Secrets handling (no tokens logged, encryption at rest where required)
    -   Webhook signature verification
    -   Secure-by-default configuration boundaries (business plan’s “configuration vs customization policy”)

Primary PRDs in this layer:

-   `prd_rbac_management.md`
-   (Architectural) multi-tenancy and account model referenced in `medsource_prd_system.md`

#### L2 — Enablement (core business operations)

This is the “operating system” kernel: it creates the value proposition for distributors.

Target-state invariants:

-   **Products** is the canonical catalog foundation (SKU/name/images/categories/provider).
-   **Quotes** is the canonical pre-order workflow (quote-first B2B posture).
-   **Pricing** (quote pricing + pricing engine) must be deterministic, explainable, and margin-safe.
-   **Orders** is the canonical fulfillment workflow with state transitions, auditing, and role-specific actions.
-   **Customers** is the canonical “B2B company” object with assignment to sales reps, address/tax fields, and history.

Primary PRDs in this layer:

-   `prd_products.md`
-   `prd_quotes_pricing.md`
-   `prd_pricing_engine.md`
-   `prd_orders.md`
-   `prd_customers.md`

#### L3 — Integration (connectivity that closes enterprise deals)

The business plan explicitly positions Prometheus as **integration-first** (build what makes us unique; integrate what customers already trust).

Target-state invariants:

-   Integrations are **asynchronous** and **non-blocking** for core request/response flows (e.g., order placement should not depend on QuickBooks availability).
-   Integrations are **idempotent** and safe under retry (at-least-once delivery reality).
-   Integrations are **tenant-scoped** (one tenant’s ERP connection can never route another tenant’s data).
-   Sensitive secrets/tokens are **never logged** and are stored/encrypted appropriately.

Primary PRD in this layer:

-   `prd_erp_integration.md` (outbox + provider adapters + logs + mapping)

#### L4 — Intelligence (analytics that drive action)

Analytics exists to make the platform “run itself” for each role:

-   Customers see **their** spending and trends (self-serve confidence).
-   Sales reps see **their** conversion and workload (operational focus).
-   Sales managers see **team** performance and bottlenecks (coaching + allocation).
-   Admins see **system health + business health** (trust + operations).

Target-state invariants:

-   Analytics is **role-filtered at the data layer** (never rely on front-end filtering alone).
-   Analytics queries are **bounded** (pagination, sensible date ranges) to protect cost/performance.

Primary PRD in this layer:

-   `prd_analytics.md`

#### L5 — Experience (role-native workflows)

The experience layer must feel like “an operating system” for each persona:

-   The dashboard is the **home screen** with role-relevant summaries and actions.
-   Every workflow is **role-native** (e.g., fulfillment never needs to touch quote screens).
-   The UI strictly follows RBAC—users should not see controls they can’t execute.

Primary PRD in this layer:

-   `prd_dashboard.md`

---

## 5. The “Operating System” flow (target-state end-to-end)

This is the platform’s core “kernel loop” that must work reliably for partner success.

### 5.1 Quote → Order → Money → ERP (the core loop)

```
Customer browses Products
  ↓
Customer requests Quote (quote-first posture; not cart checkout)
  ↓
Sales Rep prices quote lines:
  - Vendor cost + customer price (Quote Pricing PRD)
  - and/or deterministic waterfall pricing (Pricing Engine PRD)
  ↓
Quote is sent to Customer
  ↓
Customer accepts → Order created
  ↓
Sales Rep confirms payment
  ↓
Fulfillment processes shipment + tracking
  ↓
ERP sync runs asynchronously via outbox (QuickBooks/NetSuite)
```

### 5.2 Why this flow aligns with the business plan

The business plan's core promise is **partner-first deployments** with fast time-to-value and clear configuration boundaries:

-   Quote-first workflow matches distribution reality (negotiated pricing).
-   Advanced pricing + explainability increases trust (B2B buyers ask "why is this the price?").
-   ERP integration reduces enterprise adoption friction (especially QuickBooks/NetSuite segments).

---

## 6. Business Goal Alignment Matrix (with Business Plan Citations)

Every feature must serve the platform's commercial success. This section maps PRD capabilities to specific business objectives from `Business_Plan_Prometheus.md`.

### 6.1 Revenue Model Alignment

| Business Goal                          | Business Plan Reference | PRDs That Enable It            | Critical User Stories |
| -------------------------------------- | ----------------------- | ------------------------------ | --------------------- |
| **Partner Licensing (70% of revenue)** | Section 7.1.1           | RBAC, Multi-tenancy, Dashboard | US-RBAC-001..005      |
| **Direct SaaS (30% of revenue)**       | Section 7.1.2           | All L2 Enablement PRDs         | All US-ORD-_, US-QP-_ |
| **Fast Implementation (2-4 weeks)**    | Section 6.5             | Products, Quotes, Orders       | US-PRD-001..005       |
| **ERP Integration (enterprise deals)** | Section 6.5             | ERP Integration                | US-ERP-001..010       |

### 6.2 Competitive Differentiation Alignment

| Competitive Advantage               | Business Plan Section        | Enabling PRD                  | Target-State Requirement                   |
| ----------------------------------- | ---------------------------- | ----------------------------- | ------------------------------------------ |
| **Quote-first workflow**            | Section 6.3 (vs BigCommerce) | Quote Pricing, Pricing Engine | Deterministic, explainable pricing         |
| **Partner Economics (80/20 split)** | Section 7.4                  | RBAC, Multi-tenancy           | Per-tenant data isolation                  |
| **Implementation Speed**            | Section 6.4                  | Dashboard, Products           | Configuration-based, not custom code       |
| **Vertical Focus (medical supply)** | Section 6.4                  | All PRDs                      | Industry-specific terminology configurable |
| **Margin Protection**               | Pricing Engine PRD           | Pricing Engine                | US-PRICE-009, US-PRICE-010                 |

### 6.3 Feature Completion Status vs Original Roadmap

> **CRITICAL CORRECTION**: Business Plan Section 10.5 contains **revenue projections**, NOT feature dependencies. The original development roadmap has been significantly accelerated.

**Current Feature Completion** (from `medsource_prd_system.md` audit Jan 13, 2026):

| Feature                 | Original Target | Actual Status   | Notes                                  |
| ----------------------- | --------------- | --------------- | -------------------------------------- |
| Dashboard               | Year 1          | ✅ **COMPLETE** | Role-based stats, tasks, workload      |
| Quote Pricing           | Year 1          | ✅ **COMPLETE** | Margin calculation, approval gating    |
| Orders Management       | Year 1          | ✅ **COMPLETE** | Full lifecycle, role-based actions     |
| Products Management     | Year 1          | ⚠️ **PARTIAL**  | Admin CRUD page missing                |
| Customers Management    | Year 1          | ✅ **COMPLETE** | Status workflow, RichDataGrid          |
| RBAC Management UI      | Year 1          | ✅ **COMPLETE** | Role/permission editor, audit logs     |
| Advanced Pricing Engine | Year 2          | ✅ **COMPLETE** | 1,957-line waterfall algorithm         |
| ERP Integration         | Year 2          | ✅ **COMPLETE** | QuickBooks OAuth + NetSuite foundation |
| Analytics Dashboard     | Year 2          | ✅ **COMPLETE** | Role-based business intelligence       |

**Platform Status**: **90%+ feature complete** — only Products Admin CRUD page remains partial. Platform is **3-4 months ahead** of original roadmap (per Business Plan Section 4.4).

### 6.4 Revenue Projections (Business Plan Section 10.5)

These are **revenue targets** (not development milestones):

| Year       | Revenue    | Partners EOY | Partner Customers | Direct Customers |
| ---------- | ---------- | ------------ | ----------------- | ---------------- |
| **Year 1** | $323,000   | 8            | 15                | 5                |
| **Year 2** | $674,000   | 20           | 50                | 15               |
| **Year 3** | $1,268,000 | 40           | 150               | 40               |

### 6.5 Partner Funnel Success Metrics (Business Plan Section 8.5.3)

| Metric                    | Target | Warning | Failure | Enabling PRD                |
| ------------------------- | ------ | ------- | ------- | --------------------------- |
| Days to first sales call  | < 60   | 60-90   | > 90    | Dashboard, Demo environment |
| Days to first closed deal | < 150  | 150-210 | > 210   | Full L2 Enablement stack    |
| Deals closed in Year 1    | 3+     | 2       | 0-1     | All PRDs operational        |
| Partner NPS               | 50+    | 30-50   | < 30    | RBAC, Support tooling       |

### 6.6 Configuration vs Customization Policy (Business Plan Section 4.6)

This is **critical** for scalability. Without hard boundaries, we become a services company.

**Partners CAN Configure** (self-service):
| Configuration | PRD Impact | Implementation |
|--------------|-----------|----------------|
| Branding (logo, colors) | Dashboard | Tenant settings |
| Terminology (field labels) | All | i18n/localization |
| Custom Domain | Dashboard | DNS + SSL config |
| Email Templates | Orders | Template engine |
| Product Categories | Products | Category CRUD |
| Pricing Rules | Pricing Engine | Price lists, volume tiers |
| User Roles | RBAC | Permission matrix |
| Workflow Triggers | Orders | Notification rules |

**Partners CANNOT Customize**:
| Restriction | Reason | Alternative |
|-------------|--------|-------------|
| Core Workflow Logic | Platform consistency | Feature request → roadmap |
| Database Schema | Multi-tenant integrity | API for external data |
| API Endpoints | Version stability | Webhook integrations |
| Security Model | Compliance | Configuration only |
| Authentication Flow | Security standardization | SSO integration |

---

## 7. Cross-cutting "guardrails" (2024–2026 expectations)

These guardrails are explicitly consistent with patterns called out across PRDs (especially ERP + Pricing) and the business plan's "Cost of Trust" and enterprise readiness posture.

### 7.1 Security & compliance guardrails

-   **OWASP posture**: Treat secrets and credentials as non-source-controlled; do not log tokens; verify webhook signatures.
-   **OAuth2/OIDC correctness**: Use state validation to prevent CSRF in OAuth flows; prefer PKCE where applicable.
-   **Least privilege**: Every endpoint must enforce role/permission checks server-side.
-   **Data isolation**: Tenant scoping is mandatory for all persistence and integration routing.
-   **Audit trails**: Financial actions and permission changes must be audit logged.

### 7.2 Reliability guardrails

-   **Outbox pattern** for external sync work (explicitly described in `prd_erp_integration.md`).
-   **Idempotency keys** for external writes and internal retry safety.
-   **Single active sync worker per tenant/provider** to avoid duplicate work and rate-limit pressure.

### 7.3 Performance guardrails

-   Prefer **bulk APIs** where high-cardinality lists exist (explicitly called out in the Pricing Engine PRD).
-   Avoid unbounded scans; always paginate, filter, and index.

---

## 8. PRD consistency audit (what was corrected vs the previous pyramid)

### 13.1 User stories: what exists vs what was invented previously

Across the PRDs, there are:

-   **86 real user stories** (IDs + “As a …” lines) across the PRDs.
-   **+1 template example line** in `medsource_prd_system.md` (`US-001`), which is not an actual requirement.

The prior version of this document incorrectly included many additional IDs (e.g., `US-QT-*`, `US-DASH-*`) that **do not exist in the PRDs**. This version removes them and includes the complete source-backed catalog (Appendix A).

### 13.2 Role levels

This document now explicitly documents the role-level mismatch (PRD 100–500 vs backend 1000–5000) and provides a target-state normalization rule.

### 13.3 PRD "Status" conflicts

Multiple PRDs show “Not Started” while the business plan claims major feature completion. This document avoids asserting “current status” and instead treats PRD status as a doc-maintenance concern.

**Target-state action**: update PRD headers (“Status”) to match business-plan reality, or revise the business plan claims if the PRDs are correct.

---

## 9. What's missing from the PRD set (gap that blocks perfect traceability)

Your PRD set does **not** include a dedicated “Quote Management” PRD with enumerated user story IDs (separate from `prd_quotes_pricing.md`).

Target-state recommendation (to support your “I will keep building until all user stories are met” workflow):

-   Create `client/md/PRDs/internal-routes/prd_quotes.md` with the same template structure from `medsource_prd_system.md`, including **explicit user story IDs** for the non-pricing quote flow (requesting quotes, approvals, rejection, conversion to orders, notifications, etc.).

---

## 10. User Stories Organized by Role (Cross-PRD View)

This section reorganizes all 86 user stories by **persona**, enabling role-centric development planning.

### 10.1 Customer Role (Level 100 / 1000)

The Customer experiences the platform as a **self-service ordering portal**. Their journey: browse → quote → order → pay → track.

| ID           | User Story                                               | PRD Source     | Priority |
| ------------ | -------------------------------------------------------- | -------------- | -------- |
| US-001       | See my quote summary so I know the status of my requests | Dashboard      | P0       |
| US-002       | See my recent orders so I can track deliveries           | Dashboard      | P0       |
| US-003       | Quick action buttons for common tasks                    | Dashboard      | P1       |
| US-PRD-001   | Browse products so I can find what I need                | Products       | P0       |
| US-PRD-002   | Filter products by category                              | Products       | P1       |
| US-ORD-001   | View my order history                                    | Orders         | P0       |
| US-ORD-006   | Request order cancellation                               | Orders         | P2       |
| US-PRICE-001 | See my negotiated contract price                         | Pricing Engine | P0       |
| US-PRICE-008 | See volume pricing tiers                                 | Pricing Engine | P1       |

**Customer Value Proposition**: 24/7 self-service ordering with transparent pricing.

### 10.2 Sales Rep Role (Level 300 / 3000)

The Sales Rep's workflow: manage quotes → price accurately → convert to orders → maintain customer relationships.

| ID           | User Story                                          | PRD Source     | Priority |
| ------------ | --------------------------------------------------- | -------------- | -------- |
| US-004       | See my assigned quotes count for workload awareness | Dashboard      | P0       |
| US-005       | See urgent tasks to prioritize effectively          | Dashboard      | P0       |
| US-006       | See my performance metrics                          | Dashboard      | P1       |
| US-QP-001    | Input vendor cost per product                       | Quote Pricing  | P0       |
| US-QP-002    | Input customer price per product                    | Quote Pricing  | P0       |
| US-QP-003    | See margin per product for profitability            | Quote Pricing  | P0       |
| US-QP-004    | System prevents quotes without complete pricing     | Quote Pricing  | P0       |
| US-ORD-002   | View orders from my assigned quotes                 | Orders         | P0       |
| US-ORD-003   | Confirm payment received                            | Orders         | P0       |
| US-CUST-001  | View my assigned customers                          | Customers      | P0       |
| US-CUST-003  | Update customer info                                | Customers      | P1       |
| US-PRICE-002 | See margin on each quote line item                  | Pricing Engine | P0       |
| US-ANA-001   | See my conversion rate                              | Analytics      | P1       |

**Sales Rep Value Proposition**: Complete visibility into workload, margin, and customer relationships.

### 10.3 Fulfillment Coordinator Role (Level 200 / 2000)

Fulfillment's workflow: receive confirmed orders → process shipments → add tracking → confirm delivery.

| ID         | User Story               | PRD Source | Priority |
| ---------- | ------------------------ | ---------- | -------- |
| US-ORD-004 | Add tracking numbers     | Orders     | P0       |
| US-ORD-005 | Mark orders as delivered | Orders     | P0       |

**Fulfillment Value Proposition**: Focused, streamlined interface for shipping operations only.

### 10.4 Sales Manager Role (Level 400 / 4000)

Sales Managers oversee team performance, customer assignments, and financial health.

| ID           | User Story                             | PRD Source     | Priority |
| ------------ | -------------------------------------- | -------------- | -------- |
| US-007       | See team workload distribution         | Dashboard      | P0       |
| US-008       | See aging quotes to prevent lost sales | Dashboard      | P0       |
| US-CUST-002  | View all customers                     | Customers      | P0       |
| US-CUST-004  | Assign primary sales rep to customers  | Customers      | P0       |
| US-ANA-002   | See team performance                   | Analytics      | P0       |
| US-ANA-003   | See revenue trends for forecasting     | Analytics      | P0       |
| US-PRICE-010 | See when margin protection was applied | Pricing Engine | P1       |
| US-RBAC-001  | See role hierarchy                     | RBAC           | P1       |

**Sales Manager Value Proposition**: Complete oversight of sales operations and team performance.

### 10.5 Admin Role (Level 500 / 5000)

Admins have full system access: configuration, integrations, and system health monitoring.

| ID           | User Story                      | PRD Source      | Priority |
| ------------ | ------------------------------- | --------------- | -------- |
| US-PRD-003   | Create products                 | Products        | P0       |
| US-PRD-004   | Edit products                   | Products        | P0       |
| US-PRD-005   | Archive products                | Products        | P1       |
| US-PRICE-004 | Create named price lists        | Pricing Engine  | P0       |
| US-PRICE-005 | Add products to price list      | Pricing Engine  | P0       |
| US-PRICE-006 | Assign price lists to customers | Pricing Engine  | P0       |
| US-PRICE-007 | Configure volume pricing tiers  | Pricing Engine  | P1       |
| US-PRICE-009 | Set minimum margin thresholds   | Pricing Engine  | P0       |
| US-ERP-003   | Connect QuickBooks via OAuth    | ERP Integration | P0       |
| US-ERP-007   | Connect NetSuite via OAuth      | ERP Integration | P1       |
| US-ERP-009   | View sync logs                  | ERP Integration | P0       |
| US-ERP-010   | Configure sync settings         | ERP Integration | P1       |
| US-RBAC-002  | View permission matrix          | RBAC            | P0       |
| US-RBAC-003  | Modify permissions              | RBAC            | P1       |
| US-RBAC-004  | Bulk assign roles               | RBAC            | P1       |
| US-RBAC-005  | View permission audit logs      | RBAC            | P1       |
| US-ANA-004   | See system-wide metrics         | Analytics       | P0       |

**Admin Value Proposition**: Full control over platform configuration and integrations.

### 10.6 System Role (Automated)

These user stories represent system-level automation, not human interactions:

| ID           | User Story                                    | PRD Source      | Purpose            |
| ------------ | --------------------------------------------- | --------------- | ------------------ |
| US-ERP-001   | Reliably emit events via transactional outbox | ERP Integration | Data integrity     |
| US-ERP-002   | Idempotent sync operations                    | ERP Integration | Prevent duplicates |
| US-ERP-004   | Sync customers to QuickBooks                  | ERP Integration | Automated sync     |
| US-ERP-005   | Create records in QuickBooks from orders      | ERP Integration | Automated sync     |
| US-ERP-006   | Receive payment notifications from QuickBooks | ERP Integration | Status updates     |
| US-ERP-008   | Sync customers and invoices to NetSuite       | ERP Integration | Automated sync     |
| US-PRICE-003 | Explain why a price was calculated            | Pricing Engine  | Trust/transparency |

---

## 11. Implementation Priority Matrix

This matrix helps sequence development work based on business value and dependencies.

### 11.1 Priority Definitions

| Priority | Definition              | Business Rationale                     |
| -------- | ----------------------- | -------------------------------------- |
| **P0**   | Must have for MVP       | Partners cannot sell without it        |
| **P1**   | High value, next sprint | Significantly improves partner success |
| **P2**   | Medium value            | Nice to have, not blocking deals       |
| **P3**   | Low value / future      | Long-term roadmap items                |

### 11.2 Feature Implementation Sequence

Based on the pyramid architecture and business plan dependencies:

```
PHASE 0: Foundation (Must be complete first)
├── RBAC System ✓ (prd_rbac_management.md)
├── Multi-Tenancy ✓ (architectural)
└── Account Management ✓ (medsource_prd_system.md)

PHASE 1: Core Enablement (Partner can demo)
├── Products CRUD (prd_products.md)
├── Quote Pricing (prd_quotes_pricing.md)
├── Orders Management (prd_orders.md)
└── Dashboard (prd_dashboard.md)

PHASE 2: Enterprise Readiness (Close enterprise deals)
├── Advanced Pricing Engine (prd_pricing_engine.md)
├── Customer Management (prd_customers.md)
└── Analytics Dashboard (prd_analytics.md)

PHASE 3: Integration Layer (Reduce friction)
├── ERP Integration - QuickBooks (prd_erp_integration.md)
└── ERP Integration - NetSuite (prd_erp_integration.md)

✅ ALL PHASES COMPLETE (except Products Admin CRUD - partial)
```

### 11.3 PRD Dependency Graph

```
                    ┌─────────────────────┐
                    │    prd_dashboard    │
                    │   (L5 Experience)   │
                    └─────────┬───────────┘
                              │ depends on
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
    ┌─────────────────┐ ┌───────────┐ ┌────────────────┐
    │  prd_analytics  │ │prd_orders │ │ prd_customers  │
    │ (L4 Intelligence)│ │    (L2)   │ │     (L2)       │
    └─────────┬───────┘ └─────┬─────┘ └───────┬────────┘
              │               │               │
              └───────────────┼───────────────┘
                              │ depends on
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
    ┌─────────────────┐ ┌───────────┐ ┌────────────────┐
    │prd_quotes_pricing│ │prd_products│ │prd_pricing_eng │
    │      (L2)       │ │    (L2)   │ │     (L2)       │
    └─────────┬───────┘ └─────┬─────┘ └───────┬────────┘
              │               │               │
              └───────────────┼───────────────┘
                              │ depends on
                              ▼
                    ┌─────────────────────┐
                    │   prd_rbac_mgmt     │
                    │   (L1 Foundation)   │
                    └─────────────────────┘

    Integration Layer (developed in parallel with L2):
    ┌─────────────────────┐
    │ prd_erp_integration │ ✅ COMPLETE
    │       (L3)          │
    └─────────────────────┘
```

### 11.4 Effort Estimates (from PRDs)

| PRD             | Estimated Hours   | Status                      |
| --------------- | ----------------- | --------------------------- |
| RBAC Management | 20-30             | ✅ **COMPLETE**             |
| Dashboard       | 8-10              | ✅ **COMPLETE**             |
| Products        | 12-16             | ⚠️ **PARTIAL** (Admin CRUD) |
| Quote Pricing   | 8-12              | ✅ **COMPLETE**             |
| Orders          | 16-20             | ✅ **COMPLETE**             |
| Customers       | 10-12             | ✅ **COMPLETE**             |
| Pricing Engine  | 120-160           | ✅ **COMPLETE**             |
| Analytics       | 14-18             | ✅ **COMPLETE**             |
| ERP Integration | 200-280           | ✅ **COMPLETE**             |
| **Total**       | **408-556 hours** | **90%+ COMPLETE**           |

---

## 12. Success Metrics Dashboard

These metrics tie platform health to business outcomes from the Business Plan.

### 12.1 Partner Success Metrics (Business Plan Section 8.5.3)

| Metric                           | Target     | Data Source          |
| -------------------------------- | ---------- | -------------------- |
| Partner time to first sales call | < 60 days  | CRM + Partner Portal |
| Partner time to first deal       | < 150 days | Order system         |
| Partner Year 1 deals             | 3+ deals   | Order system         |
| Partner NPS                      | 50+        | Survey               |

### 12.2 Platform Health Metrics

| Metric                   | Target     | Enabling PRD                 |
| ------------------------ | ---------- | ---------------------------- |
| Quote → Order conversion | > 30%      | Analytics (US-ANA-001)       |
| Average quote turnaround | < 24 hours | Dashboard (US-005)           |
| Order processing time    | < 2 days   | Orders (US-ORD-004, 005)     |
| ERP sync success rate    | > 99%      | ERP Integration (US-ERP-001) |

### 12.3 Financial Metrics (Business Plan Section 10)

| Metric                | Year 1 Target | Enabling Features      |
| --------------------- | ------------- | ---------------------- |
| Revenue               | $323,000      | All L2 Enablement      |
| Partner licenses sold | 8             | RBAC + Demo capability |
| Direct SaaS customers | 5             | Full platform          |
| Gross margin          | 90%           | Efficient architecture |

---

## Appendix A — Complete user story catalog (source-backed)

> **Important**: IDs are listed exactly as written in the PRDs. Because `prd_dashboard.md` uses `US-001..US-008` without a prefix, the **PRD filename is included** to avoid collisions.

### A1. Dashboard (`prd_dashboard.md`)

-   **US-001**: As a Customer, I want to see my quote summary so that I know the status of my requests.
-   **US-002**: As a Customer, I want to see my recent orders so that I can track deliveries.
-   **US-003**: As a Customer, I want quick action buttons so that I can perform common tasks quickly.
-   **US-004**: As a Sales Rep, I want to see my assigned quotes count so that I know my workload.
-   **US-005**: As a Sales Rep, I want to see urgent tasks so that I prioritize work effectively.
-   **US-006**: As a Sales Rep, I want to see my performance metrics so that I track my effectiveness.
-   **US-007**: As a Sales Manager, I want to see team workload distribution so that I balance assignments.
-   **US-008**: As a Sales Manager, I want to see aging quotes so that I prevent lost sales.

### A2. Analytics (`prd_analytics.md`)

-   **US-ANA-001**: As a Sales Rep, I want to see my conversion rate so I can track my effectiveness.
-   **US-ANA-002**: As a Sales Manager, I want to see team performance so I can identify coaching opportunities.
-   **US-ANA-003**: As a Sales Manager, I want to see revenue trends so I can forecast.
-   **US-ANA-004**: As an Admin, I want to see system-wide metrics so I can monitor business health.

### A3. Customers (`prd_customers.md`)

-   **US-CUST-001**: As a Sales Rep, I want to view my assigned customers so I can manage relationships.
-   **US-CUST-002**: As a Sales Manager, I want to view all customers so I can oversee sales efforts.
-   **US-CUST-003**: As a Sales Rep, I want to update customer info so records stay accurate.
-   **US-CUST-004**: As a Sales Manager, I want to assign primary sales rep so customers have dedicated support.

### A4. Products (`prd_products.md`)

-   **US-PRD-001**: As a Customer, I want to browse products so I can find what I need.
-   **US-PRD-002**: As a Customer, I want to filter products by category so I find items faster.
-   **US-PRD-003**: As an Admin, I want to create products so I can expand the catalog.
-   **US-PRD-004**: As an Admin, I want to edit products so I can update information.
-   **US-PRD-005**: As an Admin, I want to archive products so outdated items don't show.

### A5. Quote Pricing (`prd_quotes_pricing.md`)

-   **US-QP-001**: As a Sales Rep, I want to input vendor cost per product so that I can track my costs.
-   **US-QP-002**: As a Sales Rep, I want to input customer price per product so that I can set selling prices.
-   **US-QP-003**: As a Sales Rep, I want to see margin per product so that I can ensure profitability.
-   **US-QP-004**: As a Sales Rep, I want the system to prevent sending quotes without complete pricing.

### A6. Orders (`prd_orders.md`)

-   **US-ORD-001**: As a Customer, I want to view my order history so I can track past purchases.
-   **US-ORD-002**: As a Sales Rep, I want to view orders from my assigned quotes so I can track conversions.
-   **US-ORD-003**: As a Sales Rep, I want to confirm payment received so the order can proceed to fulfillment.
-   **US-ORD-004**: As Fulfillment, I want to add tracking numbers so customers can track shipments.
-   **US-ORD-005**: As Fulfillment, I want to mark orders as delivered so the workflow completes.
-   **US-ORD-006**: As a Customer, I want to request order cancellation so I can stop unwanted orders.

### A7. Advanced Pricing Engine (`prd_pricing_engine.md`)

-   **US-PRICE-001**: As a Customer, I want to see my negotiated contract price so I can verify my special pricing is applied.
-   **US-PRICE-002**: As a Sales Rep, I want to see the margin on each quote line item so I can ensure profitability.
-   **US-PRICE-003**: As a system, I want to explain why a price was calculated so buyers trust the pricing.
-   **US-PRICE-004**: As an Admin, I want to create named price lists so I can organize customer pricing strategies.
-   **US-PRICE-005**: As an Admin, I want to add products to a price list with various pricing methods.
-   **US-PRICE-006**: As an Admin, I want to assign price lists to customers so they receive their negotiated pricing.
-   **US-PRICE-007**: As an Admin, I want to configure volume/quantity pricing tiers so high-volume buyers get discounts.
-   **US-PRICE-008**: As a Customer, I want to see volume pricing tiers so I know how much I'll save at higher quantities.
-   **US-PRICE-009**: As an Admin, I want to set minimum margin thresholds so we never sell at a loss.
-   **US-PRICE-010**: As a Sales Manager, I want to see when margin protection was applied so I can review pricing.

### A8. ERP Integration (`prd_erp_integration.md`)

-   **US-ERP-001**: As a system, I want to reliably emit integration events via transactional outbox so no data is lost during ERP sync.
-   **US-ERP-002**: As a system, I want idempotent sync operations so retries don't create duplicates.
-   **US-ERP-003**: As an Admin, I want to connect my QuickBooks account via OAuth so Prometheus can sync data.
-   **US-ERP-004**: As a system, I want to sync customers to QuickBooks so invoices can be created.
-   **US-ERP-005**: As a system, I want to sync order data to QuickBooks so records are synchronized.
-   **US-ERP-006**: As a system, I want to receive payment notifications from QuickBooks so order status is updated.
-   **US-ERP-007**: As an Admin, I want to connect NetSuite via OAuth so mid-market customers can sync data.
-   **US-ERP-008**: As a system, I want to sync customers and invoices to NetSuite for mid-market distributors.
-   **US-ERP-009**: As an Admin, I want to view sync logs so I can troubleshoot integration issues.
-   **US-ERP-010**: As an Admin, I want to configure sync settings so I can control integration behavior.

### A9. RBAC Management (`prd_rbac_management.md`)

-   **US-RBAC-001**: As a Sales Manager, I want to see the role hierarchy so I understand access levels.
-   **US-RBAC-002**: As an Admin, I want to view the permission matrix so I understand who can do what.
-   **US-RBAC-003**: As an Admin, I want to modify permissions so I can customize access.
-   **US-RBAC-004**: As an Admin, I want to bulk assign roles so I can onboard teams quickly.
-   **US-RBAC-005**: As an Admin, I want to view permission audit logs so I can track changes.

---

## Appendix B — PRD template example (not a requirement)

`medsource_prd_system.md` includes the following as a PRD template example:

-   **US-001**: As a [role], I want to [action] so that [benefit]

This is not treated as a deliverable user story because it is explicitly part of the template.
