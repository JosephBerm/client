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
    let themeSource = 'default';
    
    if (unifiedSettings) {
      try {
        const parsed = JSON.parse(unifiedSettings);
        // New format: { version: 1, settings: { theme: "luxury" } }
        if (parsed.settings && parsed.settings.theme && 
            (parsed.settings.theme === 'winter' || parsed.settings.theme === 'luxury')) {
          theme = parsed.settings.theme;
          themeSource = 'localStorage (new format)';
        }
        // Old format fallback: { state: { theme: "luxury" }, version: 1 }
        else if (parsed.state && parsed.state.theme &&
            (parsed.state.theme === 'winter' || parsed.state.theme === 'luxury')) {
          theme = parsed.state.theme;
          themeSource = 'localStorage (old format)';
        }
      } catch (e) {
        // Invalid JSON, fall through to system preference silently
        // Error is non-fatal and handled gracefully
      }
    }
    
    // If still no theme, use system preference
    if (!theme) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      theme = prefersDark ? 'luxury' : 'winter';
      themeSource = 'system preference (' + (prefersDark ? 'dark' : 'light') + ')';
    }
    
    document.documentElement.setAttribute('data-theme', theme);
    // Theme applied successfully - no logging needed (handled by logger system after React loads)
  } catch (e) {
    // Fallback to default if anything fails
    // Only log fatal errors - this runs before logger system is available
    // This is the ONLY necessary console.* usage (critical initialization failure)
    if (typeof console !== 'undefined' && console.error) {
      console.error('[Theme Init] Fatal error, falling back to winter:', e);
    }
    document.documentElement.setAttribute('data-theme', 'winter');
  }
})();
`.trim()

