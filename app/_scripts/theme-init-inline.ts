/**
 * Inline theme initialization script
 * This prevents FOUC (Flash of Unstyled Content) by setting theme before React hydrates
 * This file should be inlined in the HTML head via a script tag
 */

export const themeInitScript = `
(function() {
  try {
    // Try unified settings first (new format)
    const unifiedSettings = localStorage.getItem('user-settings');
    let theme;
    
    if (unifiedSettings) {
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
    // Theme applied successfully - no logging needed (handled by logger system after React loads)
  } catch (e) {
    // Fallback to default if anything fails
    // Only log fatal errors - this runs before logger system is available
    // This is the ONLY necessary console.* usage (critical initialization failure)
    if (typeof console !== 'undefined' && console.error) {
      console.error('[Theme Init] Fatal error, falling back to light:', e);
    }
    document.documentElement.setAttribute('data-theme', 'light');
  }
})();
`.trim()

