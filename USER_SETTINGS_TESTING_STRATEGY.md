# User Settings Migration - Testing Strategy

## Overview

Comprehensive testing strategy for the user settings migration following industry best practices. This document outlines the testing approach, test coverage, and manual testing procedures.

## Testing Pyramid

```
           ╱ ╲
          ╱ E2E╲         End-to-End Tests (Manual)
         ╱───────╲
        ╱ Integ. ╲       Integration Tests (Automated)
       ╱───────────╲
      ╱   Unit      ╲    Unit Tests (Automated)
     ╱───────────────╲
```

## Automated Testing

### Unit Tests

#### 1. UserSettingsService Tests
**File:** `app/_services/__tests__/UserSettingsService.test.ts`

**Coverage:**
- ✅ `getSettings()` - Default values, stored values, merging, corruption handling
- ✅ `getSetting()` - Specific setting retrieval, defaults
- ✅ `setSetting()` - Setting updates, validation, persistence
- ✅ `setSettings()` - Batch updates, validation
- ✅ `clearSettings()` - Data clearing
- ✅ Migration logic - Legacy format migration
- ✅ Validation - Theme, tablePageSize, sidebarCollapsed
- ✅ Edge cases - Null values, large objects, concurrent updates
- ✅ SSR safety - Server-side rendering compatibility

**Test Count:** 35+ test cases

#### 2. ThemeService Tests
**File:** `app/_services/__tests__/ThemeService.test.ts`

**Coverage:**
- ✅ `getSystemTheme()` - Dark/light mode detection
- ✅ `getStoredTheme()` - localStorage retrieval, fallbacks
- ✅ `getCurrentTheme()` - DOM attribute reading
- ✅ `setStoredTheme()` - Persistence via UserSettingsService
- ✅ `applyTheme()` - DOM manipulation
- ✅ `initializeTheme()` - Initialization flow
- ✅ Integration with UserSettingsService
- ✅ Edge cases - Rapid changes, invalid values
- ✅ SSR safety

**Test Count:** 25+ test cases

#### 3. useUserSettingsStore Tests
**File:** `app/_stores/__tests__/useUserSettingsStore.test.tsx`

**Coverage:**
- ✅ Initial state
- ✅ `setTheme()` - Store updates, DOM sync, persistence
- ✅ `setPreference()` - Custom preferences
- ✅ `setTablePageSize()` - Specific preference
- ✅ `setSidebarCollapsed()` - Boolean preference
- ✅ `initialize()` - Loading from storage, applying to DOM
- ✅ MutationObserver - Setup, external changes, singleton pattern
- ✅ Integration - Store ↔ localStorage ↔ DOM consistency
- ✅ Performance - Multiple subscribers, selective subscriptions
- ✅ Edge cases

**Test Count:** 30+ test cases

#### 4. useCartStore Tests
**File:** `app/_stores/__tests__/useCartStore.test.tsx`

**Coverage:**
- ✅ Initial state
- ✅ `addToCart()` - Adding items, merging quantities
- ✅ `removeFromCart()` - Removing items
- ✅ `updateCartQuantity()` - Updating quantities, removal on 0
- ✅ `clearCart()` - Clearing all items
- ✅ Persistence - localStorage sync
- ✅ Business logic - Totals, item counts
- ✅ Edge cases - Special characters, large quantities, empty values
- ✅ Performance - Large carts, many operations

**Test Count:** 30+ test cases

### Total Automated Tests: **120+ test cases**

## Test Execution

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test UserSettingsService.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="Migration"
```

### Expected Coverage

| Component                  | Statements | Branches | Functions | Lines |
|---------------------------|------------|----------|-----------|-------|
| UserSettingsService       | 100%       | 100%     | 100%      | 100%  |
| ThemeService             | 100%       | 100%     | 100%      | 100%  |
| useUserSettingsStore     | 95%+       | 95%+     | 100%      | 95%+  |
| useCartStore             | 100%       | 100%     | 100%      | 100%  |

## Manual Testing

### User Stories & Acceptance Criteria

#### User Story 1: Theme Selection
**As a** user  
**I want to** change the application theme  
**So that** I can personalize my experience

**Acceptance Criteria:**
- [ ] User can open settings modal
- [ ] User sees current theme selected in dropdown
- [ ] User can select different theme
- [ ] Theme changes immediately (visual feedback)
- [ ] Theme persists after page reload
- [ ] Theme persists across browser sessions
- [ ] Theme applies to all pages consistently

**Test Steps:**
1. Open application
2. Open settings modal (gear icon)
3. Verify current theme is displayed
4. Change theme to "Winter"
5. Verify UI updates immediately
6. Reload page
7. Verify theme is still "Winter"
8. Close browser
9. Reopen application
10. Verify theme is still "Winter"

**Expected Result:** ✅ Theme changes persist and apply correctly

---

#### User Story 2: Table Pagination Preference
**As a** user  
**I want to** set my preferred table page size  
**So that** I can see more/fewer items at once

**Acceptance Criteria:**
- [ ] User can change table page size
- [ ] Preference applies to all tables
- [ ] Preference persists after page reload
- [ ] Valid range: 10, 25, 50, 100

**Test Steps:**
1. Navigate to page with table (Orders, Quotes, etc.)
2. Note current page size
3. Change page size to 50
4. Verify table shows 50 items
5. Navigate to different table
6. Verify page size is 50
7. Reload page
8. Verify page size is still 50

**Expected Result:** ✅ Page size preference persists and applies to all tables

---

#### User Story 3: Sidebar Collapse State
**As a** user  
**I want** the sidebar state to persist  
**So that** my layout preference is remembered

**Acceptance Criteria:**
- [ ] User can collapse/expand sidebar
- [ ] State persists after page reload
- [ ] State applies across all pages

**Test Steps:**
1. Collapse sidebar
2. Navigate to different page
3. Verify sidebar is still collapsed
4. Reload page
5. Verify sidebar is still collapsed
6. Expand sidebar
7. Reload page
8. Verify sidebar is expanded

**Expected Result:** ✅ Sidebar state persists correctly

---

#### User Story 4: Shopping Cart Persistence
**As a** user  
**I want** my cart to persist  
**So that** I don't lose items when I navigate away

**Acceptance Criteria:**
- [ ] Items added to cart persist after navigation
- [ ] Cart persists after page reload
- [ ] Cart persists across browser sessions
- [ ] Quantities update correctly
- [ ] Items can be removed
- [ ] Cart can be cleared

**Test Steps:**
1. Add item to cart
2. Navigate to different page
3. Verify cart icon shows count
4. Reload page
5. Verify cart still has items
6. Update quantity
7. Reload page
8. Verify quantity updated
9. Remove item
10. Verify cart updated
11. Clear cart
12. Verify cart is empty

**Expected Result:** ✅ Cart operations persist correctly

---

#### User Story 5: Data Migration from Old Format
**As an** existing user  
**I want** my settings to be preserved  
**When** the system upgrades

**Acceptance Criteria:**
- [ ] Old settings format is automatically migrated
- [ ] Theme is preserved
- [ ] Preferences are preserved
- [ ] Custom settings are preserved
- [ ] Migration happens seamlessly (no user action)
- [ ] Old data is not lost

**Test Steps:**
1. Manually create old format in localStorage:
```javascript
localStorage.setItem('user-settings', JSON.stringify({
  state: {
    theme: 'luxury',
    preferences: {
      tablePageSize: 50,
      sidebarCollapsed: true
    },
    cart: []
  },
  version: 1
}))
```
2. Reload application
3. Verify theme is "Luxury"
4. Verify table page size is 50
5. Verify sidebar is collapsed
6. Check localStorage format has been updated

**Expected Result:** ✅ Old data migrated to new format successfully

---

### Browser Compatibility Testing

Test in the following browsers:

- [ ] **Chrome** (latest)
- [ ] **Firefox** (latest)
- [ ] **Safari** (latest)
- [ ] **Edge** (latest)
- [ ] **Mobile Safari** (iOS)
- [ ] **Chrome Mobile** (Android)

**Test Cases:**
1. Theme switching
2. Settings persistence
3. Cart operations
4. localStorage access
5. MutationObserver functionality

---

### Performance Testing

#### 1. Large Cart Performance
**Test:** Add 100 items to cart

**Steps:**
1. Add 100 different products to cart
2. Measure time to add each item
3. Measure page load time
4. Measure cart page render time

**Acceptance Criteria:**
- [ ] Adding item takes < 50ms
- [ ] Page load with 100 items < 2s
- [ ] Cart page renders in < 1s
- [ ] No memory leaks

---

#### 2. Rapid Setting Changes
**Test:** Change settings rapidly

**Steps:**
1. Change theme 10 times rapidly
2. Change table page size 10 times rapidly
3. Toggle sidebar 10 times rapidly

**Acceptance Criteria:**
- [ ] No errors in console
- [ ] UI remains responsive
- [ ] Final values are correct
- [ ] localStorage not corrupted

---

#### 3. Multiple Tabs
**Test:** Settings sync across tabs

**Steps:**
1. Open application in two tabs
2. Change theme in tab 1
3. Verify tab 2 updates (or doesn't, depending on design)
4. Change settings in both tabs simultaneously

**Acceptance Criteria:**
- [ ] No data corruption
- [ ] Settings eventually consistent
- [ ] No localStorage errors

---

### Accessibility Testing

- [ ] **Keyboard Navigation:** Can navigate settings modal with Tab/Enter
- [ ] **Screen Reader:** ARIA labels are announced correctly
- [ ] **Focus Management:** Focus returns to trigger after closing modal
- [ ] **Color Contrast:** All themes meet WCAG AA standards
- [ ] **Reduced Motion:** Respects prefers-reduced-motion

---

### Security Testing

- [ ] **XSS Prevention:** Test special characters in cart item names
- [ ] **localStorage Limits:** Handle quota exceeded errors
- [ ] **Data Validation:** Invalid data is rejected
- [ ] **No Sensitive Data:** No passwords/tokens in localStorage

---

### Error Handling

#### 1. localStorage Unavailable
**Test:** Disable localStorage (private browsing)

**Steps:**
1. Use private/incognito mode
2. Attempt to change settings
3. Add items to cart

**Expected Behavior:**
- [ ] Settings work in memory (don't persist)
- [ ] No errors thrown
- [ ] User is notified (optional)
- [ ] Application remains functional

---

#### 2. Corrupted Data
**Test:** Corrupt localStorage data

**Steps:**
1. Set invalid JSON in localStorage:
```javascript
localStorage.setItem('user-settings', 'invalid{json')
```
2. Reload page

**Expected Behavior:**
- [ ] Application loads with defaults
- [ ] Error is logged to console
- [ ] No crash
- [ ] User can continue using app

---

#### 3. Version Mismatch
**Test:** Future version number

**Steps:**
1. Set future version in localStorage:
```javascript
localStorage.setItem('user-settings', JSON.stringify({
  version: 999,
  settings: {
    theme: 'luxury'
  }
}))
```
2. Reload page

**Expected Behavior:**
- [ ] Warning is logged
- [ ] Settings are still loaded
- [ ] Application functions normally

---

## Integration Testing

### Scenario 1: Complete User Journey
1. First visit (no settings)
2. Theme selection
3. Browse products
4. Add to cart
5. Adjust cart
6. Request quote
7. Reload page
8. Verify everything persists

---

### Scenario 2: Settings + Cart Workflow
1. Change theme to Luxury
2. Set table page size to 50
3. Collapse sidebar
4. Add 5 items to cart
5. Update quantities
6. Remove 2 items
7. Reload page
8. Verify all changes persisted

---

### Scenario 3: Migration + Usage
1. Set up old format data
2. Reload page (triggers migration)
3. Verify migrated correctly
4. Make new changes
5. Verify new format used

---

## Test Data

### Sample Theme Values
```typescript
const themes = [
  Theme.MedsourceClassic, // 'medsource-classic'
  Theme.Winter,           // 'winter'
  Theme.Luxury,           // 'luxury'
]
```

### Sample Cart Items
```typescript
const sampleItems = [
  {
    productId: '1',
    quantity: 2,
    price: 99.99,
    name: 'Surgical Gloves - Box of 100'
  },
  {
    productId: '2',
    quantity: 1,
    price: 249.99,
    name: 'Digital Thermometer'
  },
  {
    productId: '3',
    quantity: 5,
    price: 15.99,
    name: 'Face Masks - Pack of 50'
  }
]
```

### Sample Settings
```typescript
const sampleSettings = {
  theme: Theme.Luxury,
  tablePageSize: 25,
  sidebarCollapsed: true,
  customPref1: 'value1',
  customPref2: 'value2'
}
```

---

## Continuous Integration

### GitHub Actions Workflow

```yaml
name: Test User Settings

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

---

## Test Maintenance

### When to Update Tests
1. **New Features:** Add tests for any new settings
2. **Bug Fixes:** Add regression tests
3. **Refactoring:** Ensure tests still pass
4. **Dependencies:** Update mocks if dependencies change

### Test Review Checklist
- [ ] All tests pass
- [ ] Coverage > 95%
- [ ] No flaky tests
- [ ] Tests are fast (< 5s total)
- [ ] Tests are isolated (no dependencies)
- [ ] Tests are readable
- [ ] Tests follow AAA pattern (Arrange, Act, Assert)

---

## Success Criteria

✅ **Testing is considered complete when:**
1. All automated tests pass (120+ test cases)
2. Code coverage > 95%
3. All manual test scenarios pass
4. All user stories met
5. Browser compatibility confirmed
6. Performance benchmarks met
7. Accessibility standards met
8. Error handling verified
9. Security testing passed
10. Documentation complete

---

## Test Results Log

| Date | Tester | Tests Run | Passed | Failed | Notes |
|------|--------|-----------|--------|--------|-------|
| YYYY-MM-DD | Name | 120 | TBD | TBD | Initial test run |

---

## Known Issues

*(To be filled during testing)*

---

## Test Environment

- **Node Version:** 18.x
- **Testing Framework:** Jest + React Testing Library
- **Coverage Tool:** Jest Coverage
- **Browsers:** Chrome 120+, Firefox 121+, Safari 17+, Edge 120+
- **Devices:** Desktop, Mobile (iOS, Android)

---

## Conclusion

This comprehensive testing strategy ensures the user settings migration is robust, reliable, and production-ready. All tests follow industry best practices and cover unit, integration, manual, and performance testing scenarios.

