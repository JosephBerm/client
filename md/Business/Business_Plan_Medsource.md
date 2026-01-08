# MedSource
## Medical Supply Distribution B2B Platform Business Plan

**Version**: 1.0  
**Date**: January 2026  
**Classification**: Confidential  
**Parent Company**: Powered by Prometheus Platform

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | January 2026 | Founder | Initial draft |

---

## Important Notice

**MedSource is NOT a separate software company.** MedSource is:

1. The **first tenant/implementation** of the Prometheus Platform
2. A **proof-of-concept** demonstrating the platform's capabilities
3. A **vertical-specific configuration** for medical supply distribution
4. A **case study** for Prometheus partner sales

For the main business plan (platform licensing), see: **Business_Plan_Prometheus.md**

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Company Relationship](#2-company-relationship)
3. [Market Opportunity](#3-market-opportunity)
4. [Product Configuration](#4-product-configuration)
5. [Target Customer Profile](#5-target-customer-profile)
6. [Business Model](#6-business-model)
7. [Go-to-Market Strategy](#7-go-to-market-strategy)
8. [Financial Projections](#8-financial-projections)
9. [Risk Analysis](#9-risk-analysis)
10. [Appendices](#10-appendices)

---

## 1. Executive Summary

### 1.1 What is MedSource?

MedSource is a **medical supply distribution ordering platform** built on the Prometheus Platform. It serves as:

- **First Implementation**: Proof that Prometheus Platform works in production
- **Vertical Example**: Shows how the platform adapts to medical supply industry
- **Reference Customer**: Case study for selling to Prometheus partners
- **Direct Revenue**: Generates SaaS revenue while validating the platform

### 1.2 Relationship to Prometheus

```
Prometheus Technologies LLC
└── Prometheus Platform (White-Label B2B Software)
    ├── Tenant 1: MedSource (Medical Supply) ← THIS DOCUMENT
    ├── Tenant 2: [Future Partner Customer]
    ├── Tenant 3: [Future Partner Customer]
    └── Tenant N: [Future Deployments]
```

**Key Points**:
- MedSource is **NOT** a separate company
- MedSource is a **tenant** using Prometheus Platform
- MedSource revenue flows to Prometheus Technologies
- MedSource serves as validation and case study

### 1.3 Strategic Value

| Value | Description |
|-------|-------------|
| **Proof of Concept** | Demonstrates platform works in production |
| **Case Study** | Reference for partner sales conversations |
| **Revenue Generator** | Direct SaaS revenue while building partner channel |
| **Industry Expertise** | Deepens medical supply vertical knowledge |
| **Product Feedback** | Real customers drive feature prioritization |

---

## 2. Company Relationship

### 2.1 Legal Structure

| Entity | Role |
|--------|------|
| **Prometheus Technologies LLC** | Platform owner, MedSource operator |
| **MedSource** | Brand name for medical supply vertical |

MedSource is a **DBA (Doing Business As)** or **trade name** of Prometheus Technologies LLC, not a separate legal entity.

### 2.2 Operational Model

```
Prometheus Technologies LLC
├── Platform Development (shared)
├── Infrastructure (shared)
├── Partner Channel (Prometheus)
└── Direct Sales (MedSource brand for medical supply)
```

**Why Separate Branding?**

1. **Industry Credibility**: "MedSource" sounds like a medical supply company
2. **Marketing Focus**: Targeted messaging for medical distributors
3. **Partner Protection**: Partners don't compete with "Prometheus"
4. **Future Optionality**: Could spin off or license brand separately

### 2.3 Revenue Attribution

| Source | Attribution |
|--------|-------------|
| MedSource direct SaaS customers | 100% to Prometheus Technologies |
| Partner-deployed medical supply tenants | Revenue share to Prometheus |

---

## 3. Market Opportunity

### 3.1 Medical Supply Distribution Industry Overview

**Industry Size (United States)**:
- **Market Size**: $350+ billion annually (Healthcare Distribution Alliance, 2024)
- **Number of Distributors**: Approximately 2,500-5,000 (excluding very small)
- **Growth Rate**: 4-6% CAGR (driven by aging population, healthcare expansion)

**Industry Characteristics**:

| Characteristic | Detail |
|----------------|--------|
| **Fragmentation** | Top 5 distributors control ~60%, rest is fragmented |
| **Consolidation** | Ongoing M&A activity |
| **Regulation** | FDA, DEA oversight for certain products |
| **Technology Adoption** | Lagging; many still use phone/fax/email |
| **Margins** | Thin (1-3% net); efficiency critical |

### 3.2 Target Segment

**Focus**: Mid-market medical supply distributors

| Attribute | Range |
|-----------|-------|
| **Annual Revenue** | $10M - $100M |
| **Employees** | 25-250 |
| **Sales Reps** | 5-25 |
| **Customers (B2B)** | 100-2,000 |
| **Products (SKUs)** | 5,000-50,000 |
| **Current Tech** | Manual (Excel, email, phone) or legacy systems |

**Why This Segment?**

1. **Underserved**: Too small for enterprise solutions ($100K+)
2. **Budget Available**: Can afford $1,500-$5,000/month
3. **Pain Points**: Real operational inefficiencies
4. **Decision Speed**: Faster than enterprise (owner-operated)
5. **Referenceable**: Good for case studies

### 3.3 Serviceable Market

**Geographic Focus**: United States (initially)

| Region | Priority | Rationale |
|--------|----------|-----------|
| Florida | PRIMARY | Home base, Miami network |
| Southeast | SECONDARY | Regional expansion |
| National | TERTIARY | Post-validation |

**Addressable Customers**:
- **Total Distributors**: ~3,500 in target segment
- **Technology-Ready**: ~1,500 (actively seeking solutions)
- **Year 1 Target**: 5-10 customers
- **Year 3 Target**: 30-50 customers

### 3.4 Industry Pain Points

| Pain Point | Impact | MedSource Solution |
|------------|--------|-------------------|
| **Manual Quote Process** | 2-4 hours per quote, errors common | Automated quote generation |
| **No Self-Service** | Customers call/email for everything | 24/7 customer portal |
| **Order Visibility** | "Where's my order?" calls | Real-time tracking |
| **Sales Rep Productivity** | 50%+ time on admin, not selling | Streamlined workflows |
| **Analytics Gap** | No visibility into performance | Dashboard reporting |
| **Customer Retention** | Poor experience = lost customers | Better service = retention |

---

## 4. Product Configuration

### 4.1 MedSource Features (Prometheus Platform)

All MedSource features are **standard Prometheus Platform features** configured for medical supply:

| Feature | Standard Name | MedSource Configuration |
|---------|---------------|------------------------|
| Quote Management | ✅ Standard | Medical supply terminology |
| Order Management | ✅ Standard | Standard |
| Customer Portal | ✅ Standard | Healthcare-branded |
| Product Catalog | ✅ Standard | Medical product categories |
| Sales Rep Management | ✅ Standard | Territory by hospital/clinic |
| Analytics | ✅ Standard | Healthcare-specific metrics |
| RBAC | ✅ Standard | Standard roles |
| Multi-Tenancy | ✅ Standard | Single tenant (MedSource) |

### 4.2 Medical Supply-Specific Customizations

| Customization | Description | Status |
|---------------|-------------|--------|
| **Terminology** | "Facilities" instead of "Companies" | ✅ Configurable |
| **Categories** | Medical product categories (PPE, Equipment, etc.) | ✅ Seed data |
| **Branding** | MedSource logo, healthcare colors | ✅ Implemented |
| **Compliance** | HIPAA-ready (no PHI stored currently) | ⚠️ Future |
| **Integrations** | Healthcare-specific ERPs | ❌ Not yet |

### 4.3 Limitations

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| No HIPAA certification | Cannot handle PHI | Avoid PHI in platform |
| No DEA integration | Cannot track controlled substances | Out of scope for now |
| No EDI | Large customers require EDI | Phase 2 roadmap |
| No healthcare ERP integration | Manual data entry | QuickBooks/NetSuite first |

---

## 5. Target Customer Profile

### 5.1 Ideal Customer Profile (ICP)

**Company Characteristics**:

| Attribute | Ideal | Acceptable | Avoid |
|-----------|-------|------------|-------|
| **Revenue** | $15M-$50M | $10M-$100M | <$5M, >$200M |
| **Employees** | 30-100 | 25-200 | <15, >300 |
| **Sales Reps** | 8-15 | 5-25 | <3, >40 |
| **Tech Maturity** | Low-Medium | Any | Very high (ERP-heavy) |
| **Decision Maker** | Owner/CEO | VP Sales/Ops | IT Committee |
| **Sales Cycle** | 2-4 months | 1-6 months | >9 months |

**Behavioral Characteristics**:
- ✅ Currently using Excel/email for quotes
- ✅ Frustrated with manual processes
- ✅ Lost customers due to poor service
- ✅ Open to technology solutions
- ✅ Can make decisions without board approval
- ❌ Avoid: Happy with current systems, heavy ERP investment

### 5.2 Buyer Personas

**Primary: Owner/CEO**
| Attribute | Detail |
|-----------|--------|
| **Title** | Owner, CEO, President |
| **Age** | 45-65 |
| **Pain Points** | Lack of visibility, inefficiency, competitive pressure |
| **Motivations** | Growth, profitability, operational excellence |
| **Decision Authority** | Full |
| **Objections** | Cost, implementation time, change management |

**Secondary: VP of Sales/Operations**
| Attribute | Detail |
|-----------|--------|
| **Title** | VP Sales, Director of Operations, Sales Manager |
| **Age** | 35-55 |
| **Pain Points** | Rep productivity, quote errors, customer complaints |
| **Motivations** | Team efficiency, hitting quotas, reducing stress |
| **Decision Authority** | Recommend, sometimes approve |
| **Objections** | Learning curve, team adoption |

### 5.3 Anti-Personas (Do NOT Target)

| Type | Why Avoid |
|------|-----------|
| **Very Small (<$5M)** | Can't afford, high churn risk |
| **Very Large (>$200M)** | Need enterprise features we lack |
| **Tech-Heavy (ERP)** | Integration requirements too complex |
| **Highly Regulated** | HIPAA/DEA compliance not ready |
| **Committee-Driven** | Sales cycle too long |

---

## 6. Business Model

### 6.1 Pricing Tiers

| Tier | Monthly Price | Sales Reps | Features |
|------|---------------|------------|----------|
| **Starter** | $999/month | 1-5 | Core features, email support |
| **Professional** | $1,999/month | 6-15 | Analytics, phone support |
| **Enterprise** | $3,999/month | 16-30 | API access, dedicated support |
| **Custom** | $5,000+/month | 30+ | Custom integrations, SLA |

### 6.2 Value Proposition

**ROI Calculation for Target Customer**:

```
Customer Profile: $25M revenue, 10 sales reps, 500 customers

Current State:
- Sales rep time on quotes: 15 hours/week each = 150 hours/week total
- Error rate: 5% of orders have errors (rework cost)
- Missed opportunities: 10% of RFQs not responded in time
- Customer service calls: 200/week for order status

MedSource Investment:
- Plan: Professional @ $1,999/month = $23,988/year

MedSource Value:
- Time savings: 50% reduction = 75 hours/week saved
  → 75 hours × $50/hour × 52 weeks = $195,000/year
- Error reduction: 50% fewer errors
  → 2.5% × $25M orders × 5% rework cost = $31,250/year saved
- Faster quotes: 20% more RFQs won
  → 20% × $500K missed opportunities = $100,000/year
- Self-service: 50% fewer status calls
  → 100 calls × $15/call × 52 weeks = $78,000/year saved

Total Annual Value: $404,250
MedSource Cost: $23,988
ROI: 16.9× (1,585% return)
Payback: 22 days
```

### 6.3 Customer Acquisition Cost (CAC)

| Item | Cost | Notes |
|------|------|-------|
| Marketing (allocated) | $2,000 | Content, ads per customer |
| Sales time | $5,000 | 40 hours @ $125/hour |
| Demo/POC | $1,500 | Environment, support |
| **Total CAC** | **$8,500** | |

### 6.4 Lifetime Value (LTV)

| Metric | Value |
|--------|-------|
| Average MRR | $2,000 |
| Gross Margin | 85% |
| Monthly Gross Profit | $1,700 |
| Expected Lifetime | 36 months (10% annual churn) |
| **LTV** | **$61,200** |
| **LTV:CAC** | **7.2:1** |

---

## 7. Go-to-Market Strategy

### 7.1 Phase 1: Local Validation (Months 1-6)

**Objective**: Sign 3-5 customers in South Florida

**Tactics**:

| Channel | Action | Target |
|---------|--------|--------|
| **Network** | Personal introductions via Miami healthcare contacts | 5-10 meetings |
| **LinkedIn** | Direct outreach to medical supply CEOs in FL | 100 messages |
| **Content** | Blog posts on medical supply distribution pain points | 6 posts |
| **Referrals** | Ask early customers for introductions | 2-3 referrals |

**Local Advantages**:
- Face-to-face meetings possible
- Faster trust building
- Easier to support during pilot
- Stronger reference value ("local company")

### 7.2 Phase 2: Regional Expansion (Months 7-12)

**Objective**: Expand to 8-12 customers in Southeast US

**Tactics**:

| Channel | Action | Target |
|---------|--------|--------|
| **Case Studies** | Publish 2-3 customer success stories | Social proof |
| **Webinars** | "Modernizing Medical Supply Sales" webinar series | 50 attendees/month |
| **LinkedIn Ads** | Targeted ads to medical supply executives | 10,000 impressions/month |
| **Industry Events** | Healthcare Distribution Alliance regional events | 20 leads/event |
| **Partnerships** | Partner with healthcare IT consultants (feeds back to Prometheus) | 2-3 partnerships |

### 7.3 Phase 3: National Scale (Year 2-3)

**Objective**: Scale to 30-50 customers nationally

**Tactics**:
- Hire dedicated sales rep for MedSource vertical
- Expand content marketing (SEO, video)
- Attend national trade shows (HIDA, HDA)
- Launch customer referral program (20% discount for referrer/referee)

### 7.4 Sales Process

| Stage | Duration | Activities |
|-------|----------|------------|
| **Lead** | 1 week | Identify, qualify via LinkedIn/content |
| **Discovery** | 1-2 weeks | Call to understand pain points, current state |
| **Demo** | 1 week | 45-minute platform demonstration |
| **Pilot** | 2-4 weeks | 30-day free trial with real data |
| **Proposal** | 1 week | Pricing, implementation plan |
| **Close** | 1-2 weeks | Contract negotiation, payment |
| **Onboarding** | 2-4 weeks | Data migration, training, go-live |

**Total Sales Cycle**: 8-14 weeks (realistic for mid-market)

---

## 8. Financial Projections

### 8.1 Year 1 Projections (Conservative)

| Quarter | New Customers | Total Customers | MRR | Quarterly Revenue |
|---------|---------------|-----------------|-----|-------------------|
| Q1 | 1 | 1 | $2,000 | $6,000 |
| Q2 | 2 | 3 | $6,000 | $18,000 |
| Q3 | 2 | 5 | $10,000 | $30,000 |
| Q4 | 2 | 7 | $14,000 | $42,000 |
| **Year 1** | **7** | **7** | **$14,000** | **$96,000** |

**Assumptions**:
- Average deal size: $2,000/month
- Sales cycle: 3-4 months
- Churn: 1 customer (14% annual)
- Net revenue retention: 100% (no expansion yet)

### 8.2 Year 2 Projections

| Metric | Value |
|--------|-------|
| Starting Customers | 7 |
| New Customers | 12 |
| Churned Customers | 2 |
| Ending Customers | 17 |
| Ending MRR | $34,000 |
| Annual Revenue | $264,000 |

### 8.3 Year 3 Projections

| Metric | Value |
|--------|-------|
| Starting Customers | 17 |
| New Customers | 20 |
| Churned Customers | 4 |
| Ending Customers | 33 |
| Ending MRR | $66,000 |
| Annual Revenue | $540,000 |

### 8.4 Cost Allocation

MedSource shares costs with Prometheus:

| Cost Category | Allocation Method | MedSource Share (Year 1) |
|---------------|-------------------|--------------------------|
| **Platform Development** | Shared | $0 (already built) |
| **Infrastructure** | Per-tenant | $6,000 |
| **Marketing** | Dedicated + shared | $15,000 |
| **Sales** | Founder time | $30,000 (allocated) |
| **Support** | Per-customer | $10,000 |
| **Total** | | **$61,000** |

### 8.5 MedSource P&L Summary

| Metric | Year 1 | Year 2 | Year 3 |
|--------|--------|--------|--------|
| **Revenue** | $96,000 | $264,000 | $540,000 |
| **Costs** | $61,000 | $100,000 | $150,000 |
| **Contribution** | $35,000 | $164,000 | $390,000 |
| **Margin** | 36% | 62% | 72% |

**Note**: MedSource contribution flows directly to Prometheus Technologies.

---

## 9. Risk Analysis

### 9.1 MedSource-Specific Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **HIPAA/Compliance** | 30% | High | Avoid PHI, pursue certification in Year 2 |
| **Industry Concentration** | 25% | Medium | Diversify across customer sizes |
| **Competitive Entry** | 40% | Medium | Move fast, build relationships |
| **Integration Requirements** | 50% | High | Prioritize QuickBooks, communicate roadmap |
| **Economic Downturn** | 20% | Medium | Healthcare is relatively resilient |

### 9.2 MedSource vs. Partner Channel Conflict

**Potential Conflict**: Partners may want to sell to medical supply customers

**Resolution**:
1. MedSource targets direct-to-customer sales (no partner involved)
2. Partners who want medical supply vertical get leads/support
3. Clear territory/account rules in partner agreements
4. MedSource serves as lead generator for partner channel (warm referrals)

### 9.3 Success Metrics

| Metric | Year 1 Target | Warning | Failure |
|--------|---------------|---------|---------|
| Customers Acquired | 7 | 4 | 2 |
| MRR | $14,000 | $8,000 | $4,000 |
| Churn Rate | <15% | <25% | <40% |
| NPS | 50+ | 30 | 10 |
| CAC Payback | <6 months | <9 months | <12 months |

---

## 10. Appendices

### Appendix A: Medical Supply Industry Associations

| Association | Purpose | Membership Value |
|-------------|---------|------------------|
| **HIDA** | Healthcare Industry Distributors Association | Events, leads |
| **HDA** | Healthcare Distribution Alliance | Research, credibility |
| **NAW** | National Association of Wholesaler-Distributors | General distribution |

### Appendix B: Competitive Solutions in Medical Supply

| Competitor | Type | Pricing | Notes |
|------------|------|---------|-------|
| **McKesson Connect** | Big 3 platform | Enterprise | Only for McKesson customers |
| **Cardinal Health OrderConnect** | Big 3 platform | Enterprise | Only for Cardinal customers |
| **NetSuite** | ERP + Commerce | $100K+/year | Overkill for mid-market |
| **Cin7** | Inventory focus | $349-$999/mo | Weak on B2B ordering |
| **Generic B2B platforms** | Various | Varies | Not healthcare-specific |

**MedSource Differentiation**: Purpose-built for medical supply distribution, affordable for mid-market, quote-based workflow.

### Appendix C: Sample Customer Journey

**Day 1-14: Discovery**
- CEO sees LinkedIn post about medical supply ordering challenges
- Downloads guide: "5 Signs Your Ordering Process is Costing You Money"
- Books demo via website

**Day 15-21: Demo**
- 45-minute demo with CEO and Sales Manager
- Shows quote workflow, customer portal, analytics
- Answers questions about implementation, pricing

**Day 22-52: Pilot**
- 30-day free trial with 3 sales reps
- Loads 1,000 products, 50 customers
- Processes 20 quotes, 10 orders
- Weekly check-in calls

**Day 53-60: Close**
- Presents pilot results (time saved, errors avoided)
- Negotiates Professional tier ($1,999/month)
- Signs 12-month contract

**Day 61-90: Onboarding**
- Full data migration (all products, customers)
- Training for all sales reps (4 sessions)
- Customer portal rollout to top 100 customers
- Go-live with dedicated support

**Day 91+: Success**
- Monthly check-ins
- Quarterly business reviews
- Expansion discussions (more users, features)
- Referral requests

---

## Summary

MedSource is not a separate business—it's the **first implementation of the Prometheus Platform** in the medical supply distribution vertical. It serves three strategic purposes:

1. **Validation**: Proves the platform works with real customers
2. **Revenue**: Generates direct SaaS income while building the partner channel
3. **Reference**: Provides case studies and credibility for Prometheus partner sales

The medical supply market offers a $350+ billion opportunity with significant pain points that MedSource addresses. With conservative projections of 7 customers and $96,000 revenue in Year 1, MedSource contributes meaningfully to Prometheus while validating the platform's value proposition.

**Key Insight**: Every MedSource success is also a Prometheus success—demonstrating that the platform works and creating referenceable customers for partner sales.

---

**Parent Document**: Business_Plan_Prometheus.md  
**Last Updated**: January 7, 2026  
**Confidential**: This document contains proprietary information.