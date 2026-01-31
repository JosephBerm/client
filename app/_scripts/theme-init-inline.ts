/**
 * Inline theme initialization script
 * This prevents FOUC (Flash of Unstyled Content) by setting theme before React hydrates
 * This file should be inlined in the HTML head via a script tag
 */

import { DAISY_UI_THEME_NAMES } from '@_core/validation'
import { TENANT_THEME_CACHE_KEY, TENANT_THEME_CACHE_MAX_AGE_MS } from '@_shared/constants/tenantTheme'

export const themeInitScript = `
(function() {
  try {
    // Try unified settings first (new format)
    const unifiedSettings = localStorage.getItem('user-settings');
    let theme;
    const tenantTheme = document.documentElement.getAttribute('data-tenant-theme');
    const tenantThemeCacheKey = '${TENANT_THEME_CACHE_KEY}';
    const tenantThemeCacheMaxAgeMs = ${TENANT_THEME_CACHE_MAX_AGE_MS};
    const validThemes = ${JSON.stringify(DAISY_UI_THEME_NAMES)};

    if (tenantTheme) {
      theme = tenantTheme;
    } else {
      // Try cached tenant theme (prevents FOUC before server theme loads)
      const cachedTenantTheme = localStorage.getItem(tenantThemeCacheKey);
      if (cachedTenantTheme) {
        try {
          const parsedCache = JSON.parse(cachedTenantTheme);
          const cacheHost = parsedCache && typeof parsedCache.host === 'string' ? parsedCache.host : null;
          const cacheTheme = parsedCache && typeof parsedCache.themeName === 'string' ? parsedCache.themeName : null;
          const cacheUpdatedAt = parsedCache && typeof parsedCache.updatedAt === 'number' ? parsedCache.updatedAt : null;
          const isFresh = cacheUpdatedAt && (Date.now() - cacheUpdatedAt) < tenantThemeCacheMaxAgeMs;
          const hostMatches = cacheHost && cacheHost === window.location.hostname;

          if (cacheTheme && validThemes.indexOf(cacheTheme) !== -1 && isFresh && hostMatches) {
            theme = cacheTheme;
          }
        } catch (e) {
          // Invalid cache, ignore and fall through
        }
      }
    }

    if (!theme && unifiedSettings) {
      try {
        const parsed = JSON.parse(unifiedSettings);
        // New format: { version: 1, settings: { theme: "<theme-name>" } }
        var isValidTheme = function(t) {
          return t === 'light' || t === 'dark' || t === 'corporate' || t === 'sunset' || t === 'winter' || t === 'luxury';
        };
        if (parsed.settings && parsed.settings.theme && isValidTheme(parsed.settings.theme)) {
          theme = parsed.settings.theme;

        }
      } catch (e) {
        // Invalid JSON, fall through to system preference silently
        // Error is non-fatal and handled gracefully
      }
    }

    // If still no theme, use system preference
    if (!theme) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      // Map system preference to standard DaisyUI themes
      theme = prefersDark ? 'dark' : 'light';
    }

    document.documentElement.setAttribute('data-theme', theme);

    // Initialize reduced motion preference (prevents animation FOUC)
    try {
      let prefersReducedMotion = null; // null indicates not set yet

      if (unifiedSettings) {
        try {
          const parsed = JSON.parse(unifiedSettings);
          if (parsed.settings && typeof parsed.settings.prefersReducedMotion === 'boolean') {
            prefersReducedMotion = parsed.settings.prefersReducedMotion;
          }
        } catch (e) {
          // Invalid JSON, fall through to system preference silently
        }
      }

      // If no stored preference, use system preference
      if (prefersReducedMotion === null) {
        prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      }

      document.documentElement.setAttribute('data-reduced-motion', String(prefersReducedMotion));
    } catch (e) {
      // Fallback to system preference if anything fails
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      document.documentElement.setAttribute('data-reduced-motion', String(prefersReducedMotion));
    }

    // Theme applied successfully - no logging needed (handled by logger system after React loads)
  } catch (e) {
    // Fallback to default if anything fails
    // Only log fatal errors - this runs before logger system is available
    // This is the ONLY necessary console.* usage (critical initialization failure)
    if (typeof console !== 'undefined' && console.error) {
      console.error('[Theme Init] Fatal error, falling back to light:', e);
    }
    document.documentElement.setAttribute('data-theme', 'light');
    // Also set reduced motion to system preference as fallback
    try {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      document.documentElement.setAttribute('data-reduced-motion', String(prefersReducedMotion));
    } catch (e) {
      // If even this fails, default to false (full motion)
      document.documentElement.setAttribute('data-reduced-motion', 'false');
    }
  }
})();
`.trim()
