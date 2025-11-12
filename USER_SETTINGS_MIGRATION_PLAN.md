# User Settings Store Migration Plan

## Overview
Migrate MedSource Pro's user settings architecture to follow the Church of God's industry best practices for unified settings management, persistence, and separation of concerns.

## Current State (MedSource Pro)

### Issues:
1. **Mixed Concerns**: Cart and settings in one store
2. **Direct Zustand Persistence**: Uses persist middleware directly
3. **No Service Layer**: All logic in store
4. **No Versioning**: No migration strategy
5. **No DOM Sync**: No MutationObserver for theme changes
6. **Single Responsibility Violation**: Store handles persistence, state, and business logic

### Current Structure:
```
useUserSettingsStore (all-in-one)
├── theme
├── preferences (tablePageSize, sidebarCollapsed)
├── cart[]
└── Direct localStorage via persist middleware
```

## Target State (Church of God Architecture)

### Architecture Principles:
1. **Separation of Concerns**: Settings, cart, and services separated
2. **Service Layer Pattern**: Dedicated services for persistence
3. **Unified Storage**: Single localStorage key with versioning
4. **Type Safety**: Strong TypeScript interfaces throughout
5. **DOM Synchronization**: MutationObserver for external changes
6. **Migration Support**: Versioned schema with migration functions

### Target Structure:
```
useUserSettingsStore (settings only)
├── currentTheme
├── preferences (tablePageSize, sidebarCollapsed, custom)
├── themeLoading
└── Actions: setTheme, setPreference, initialize

useCartStore (cart only)
├── cart[]
└── Actions: addToCart, removeFromCart, updateQuantity, clearCart

UserSettingsService (unified persistence)
├── getSettings()
├── getSetting(key)
├── setSetting(key, value)
├── setSettings(settings)
├── clearSettings()
└── Migration logic

ThemeService (theme-specific)
├── getSystemTheme()
├── getStoredTheme()
├── getCurrentTheme()
├── setStoredTheme(theme)
├── applyTheme(theme)
└── initializeTheme()
```

## Migration Steps

### Step 1: Create SharedEnums.ts
Create enum definitions for Theme and other shared enums.

```typescript
export enum Theme {
  MedsourceClassic = 'medsource-classic',
  Winter = 'winter',
  Luxury = 'luxury',
}
```

### Step 2: Create UserSettingsService.ts
Unified service for all settings persistence with versioning.

**Features:**
- Single localStorage key: `'user-settings'`
- Versioned schema (v1)
- Type-safe getters/setters
- Migration from old persist middleware format
- Validation

**Storage Format:**
```json
{
  "version": 1,
  "settings": {
    "theme": "medsource-classic",
    "tablePageSize": 10,
    "sidebarCollapsed": false
  }
}
```

### Step 3: Create ThemeService.ts
Theme-specific service methods.

**Features:**
- System preference detection
- Theme validation
- DOM application
- Uses UserSettingsService internally

### Step 4: Create useCartStore.ts (Separate Cart)
Move cart functionality to its own store with persist middleware.

**Rationale:**
- Cart is transient data (different lifecycle than settings)
- Settings are preferences (long-term)
- Separation of concerns

### Step 5: Migrate useUserSettingsStore.ts
Refactor to Church of God architecture.

**Changes:**
- Remove persist middleware
- Add `initialize()` method
- Add `themeLoading` state
- Use ThemeService for all theme operations
- Add MutationObserver for DOM sync
- Keep MedSource-specific preferences (tablePageSize, sidebarCollapsed)
- Remove cart (moved to separate store)

**Key Features:**
- MutationObserver watches for external theme changes
- Initialize method called once on app start
- Services handle all persistence
- Store is pure state management

### Step 6: Update UserSettingsInitializer.tsx
Change from reactive theme application to initialization pattern.

**Before:**
```typescript
const theme = useUserSettingsStore(state => state.theme)
useEffect(() => {
  document.documentElement.setAttribute('data-theme', theme)
}, [theme])
```

**After:**
```typescript
const initialize = useUserSettingsStore(state => state.initialize)
useEffect(() => {
  initialize()
}, [])
```

### Step 7: Update Components
Update all components using cart or settings.

**Cart Components:**
- Update imports to use `useCartStore`
- Verify cart functionality

**Settings Components:**
- Update `AppearanceSetting.tsx` to use new store API
- Verify theme changes work

### Step 8: Migration Logic
Handle migration from old Zustand persist format to new unified format.

**Old Format (persist middleware):**
```json
{
  "state": {
    "theme": "medsource-classic",
    "preferences": { ... },
    "cart": [ ... ]
  },
  "version": 1
}
```

**New Format (UserSettingsService):**
```json
{
  "version": 1,
  "settings": {
    "theme": "medsource-classic",
    "tablePageSize": 10,
    "sidebarCollapsed": false
  }
}
```

**Migration Function:**
- Check for old `user-settings` key (persist format)
- Extract settings
- Save to new format
- Keep old key for safety (can remove in future version)

## Benefits of New Architecture

### 1. Separation of Concerns
- Settings store = user preferences (theme, UI settings)
- Cart store = shopping data
- Services = persistence and business logic

### 2. Service Layer Pattern
- **UserSettingsService**: Unified settings management
- **ThemeService**: Theme-specific operations
- Easy to test, mock, and extend

### 3. Better Type Safety
- Explicit interfaces for all settings
- Strong typing through services
- No `any` types

### 4. Versioning & Migrations
- Schema version tracking
- Migration functions for breaking changes
- Backward compatibility

### 5. DOM Synchronization
- MutationObserver watches theme attribute
- Keeps store in sync with external changes
- Handles edge cases (browser extensions, etc.)

### 6. Industry Best Practices
- Single source of truth (UserSettingsService)
- Pure state management (stores)
- Business logic in services
- Type-safe throughout
- SSR-safe (graceful fallbacks)

## MedSource-Specific Considerations

### Keep These Features:
1. **tablePageSize**: Used by DataTable components
2. **sidebarCollapsed**: Navigation state
3. **Custom preferences**: `[key: string]: any` for extensibility
4. **Theme options**: medsource-classic, winter, luxury

### Remove from Settings Store:
1. **cart**: Move to separate `useCartStore`
   - Cart is transient, settings are persistent
   - Different lifecycle and concerns

### Add from Church of God:
1. **MutationObserver**: Theme DOM sync
2. **initialize()**: Single initialization point
3. **Service layer**: UserSettingsService, ThemeService
4. **Versioning**: Schema migrations
5. **Loading states**: `themeLoading`

## Future Extensions (Not in Initial Migration)

### Language Support (Future)
When internationalization is needed:
1. Add `LanguageService.ts`
2. Add `currentLanguage` to store
3. Add translation management
4. Update HTML lang attribute

### Additional Settings (Future)
- Notification preferences
- Accessibility settings
- Display density
- Custom dashboards

## Testing Strategy

### 1. Unit Tests
- UserSettingsService methods
- ThemeService methods
- Migration logic

### 2. Integration Tests
- Store initialization
- Theme changes
- Persistence across page reloads
- Migration from old format

### 3. Manual Testing
- [ ] Theme switching works
- [ ] Settings persist on page reload
- [ ] Cart persistence works (separate store)
- [ ] Table page size preference works
- [ ] Sidebar collapse state persists
- [ ] No localStorage errors
- [ ] Migration from old format successful
- [ ] MutationObserver working (check DevTools)

## Risk Mitigation

### Backward Compatibility
- Keep old localStorage key temporarily
- Migrate data on first load
- Validate all migrated data

### Rollback Plan
- Old implementation documented
- Can revert to previous version if needed
- No data loss (migration copies, doesn't delete)

### Gradual Rollout
1. ✅ Create new services (non-breaking)
2. ✅ Create new cart store (non-breaking)
3. ✅ Migrate settings store (breaking, but with migration)
4. ✅ Update components (verify functionality)
5. ✅ Test thoroughly
6. ✅ Deploy
7. ⏰ Monitor for issues
8. ⏰ Remove legacy code after verification period

## Implementation Timeline

### Phase 1: Foundation (Current)
- [x] Analysis complete
- [ ] Create SharedEnums.ts
- [ ] Create UserSettingsService.ts
- [ ] Create ThemeService.ts

### Phase 2: Stores
- [ ] Create useCartStore.ts
- [ ] Migrate useUserSettingsStore.ts

### Phase 3: Components
- [ ] Update UserSettingsInitializer.tsx
- [ ] Update cart components
- [ ] Update settings components

### Phase 4: Testing & Cleanup
- [ ] Test all functionality
- [ ] Verify localStorage
- [ ] Documentation updates
- [ ] Remove TODO markers

## Success Criteria

✅ Migration Complete When:
1. All tests pass
2. Theme switching works
3. Settings persist correctly
4. Cart functions properly in separate store
5. Migration from old format works
6. No console errors
7. MutationObserver syncing theme
8. Documentation updated
9. No regression in existing features
10. Code follows Church of God patterns

## Conclusion

This migration brings MedSource Pro's user settings architecture up to industry best practices while maintaining all existing functionality and adding robust features like versioning, migration support, and DOM synchronization. The result is a more maintainable, testable, and scalable codebase.

