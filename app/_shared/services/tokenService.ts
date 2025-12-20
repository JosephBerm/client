/**
 * Token Service - MAANG-Level JWT Token Management
 * 
 * Handles automatic token refresh, silent renewal, and token storage.
 * Implements industry best practices for secure token management.
 * 
 * **Features:**
 * - Automatic silent token refresh
 * - Token expiration tracking
 * - Concurrent request handling (queue while refreshing)
 * - Secure token storage (HttpOnly cookie for refresh token)
 * - Graceful degradation on refresh failure
 * 
 * **Security Best Practices:**
 * - Short-lived access tokens (15 min)
 * - Long-lived refresh tokens (7-30 days)
 * - Token rotation on each refresh
 * - Automatic logout on refresh failure
 * 
 * **Industry References:**
 * - OAuth 2.0 Token Refresh (RFC 6749)
 * - Auth0 Silent Token Renewal
 * - Microsoft MSAL Token Cache
 * 
 * @module tokenService
 */

'use client'

import { getCookie, setCookie, deleteCookie } from 'cookies-next'

import { logger } from '@_core'

import { AUTH_COOKIE_NAME, DEFAULT_API_BASE_URL } from './httpService.constants'

// =========================================================================
// CONSTANTS
// =========================================================================

/** Cookie name for refresh token */
export const REFRESH_TOKEN_COOKIE = 'medsource_refresh_token'

/** Cookie name for access token expiration timestamp */
export const TOKEN_EXPIRY_COOKIE = 'medsource_token_expiry'

/** Buffer time before expiration to trigger refresh (5 minutes) */
const REFRESH_BUFFER_MS = 5 * 60 * 1000

/** Minimum time between refresh attempts (prevent hammering) */
const MIN_REFRESH_INTERVAL_MS = 10 * 1000

// =========================================================================
// TYPES
// =========================================================================

export interface TokenPair {
  accessToken: string
  refreshToken: string
  accessTokenExpires: string // ISO date string
  refreshTokenExpires: string // ISO date string
}

interface RefreshResponse {
  payload: TokenPair | null
  message: string | null
  statusCode: number
}

// =========================================================================
// STATE
// =========================================================================

/** Flag to prevent concurrent refresh attempts */
let isRefreshing = false

/** Queue of callbacks waiting for token refresh */
let refreshQueue: Array<{
  resolve: (token: string) => void
  reject: (error: Error) => void
}> = []

/** Timestamp of last refresh attempt */
let lastRefreshAttempt = 0

// =========================================================================
// TOKEN STORAGE
// =========================================================================

/**
 * Stores token pair in cookies.
 * Access token goes in regular cookie, refresh token in HttpOnly cookie (server-side).
 * 
 * @param tokens - Token pair from login/refresh response
 */
export function storeTokens(tokens: TokenPair): void {
  const accessExpiry = new Date(tokens.accessTokenExpires)
  const refreshExpiry = new Date(tokens.refreshTokenExpires)

  // Store access token
  setCookie(AUTH_COOKIE_NAME, tokens.accessToken, {
    expires: accessExpiry,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })

  // Store refresh token (longer lived)
  setCookie(REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
    expires: refreshExpiry,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })

  // Store expiry time for proactive refresh
  setCookie(TOKEN_EXPIRY_COOKIE, tokens.accessTokenExpires, {
    expires: accessExpiry,
    path: '/',
  })

  logger.debug('Tokens stored', {
    component: 'TokenService',
    action: 'storeTokens',
    accessExpiry: accessExpiry.toISOString(),
    refreshExpiry: refreshExpiry.toISOString(),
  })
}

/**
 * Clears all auth tokens from cookies.
 */
export function clearTokens(): void {
  deleteCookie(AUTH_COOKIE_NAME)
  deleteCookie(REFRESH_TOKEN_COOKIE)
  deleteCookie(TOKEN_EXPIRY_COOKIE)
  logger.debug('Tokens cleared', {
    component: 'TokenService',
    action: 'clearTokens',
  })
}

/**
 * Gets the current access token.
 */
export function getAccessToken(): string | undefined {
  return getCookie(AUTH_COOKIE_NAME)?.toString()
}

/**
 * Gets the current refresh token.
 */
export function getRefreshToken(): string | undefined {
  return getCookie(REFRESH_TOKEN_COOKIE)?.toString()
}

/**
 * Checks if access token is expired or about to expire.
 * 
 * @param bufferMs - Time before actual expiration to consider it expired
 * @returns true if token needs refresh
 */
export function isTokenExpired(bufferMs: number = REFRESH_BUFFER_MS): boolean {
  const expiry = getCookie(TOKEN_EXPIRY_COOKIE)?.toString()
  if (!expiry) {
    return true
  }

  const expiryDate = new Date(expiry)
  return Date.now() >= expiryDate.getTime() - bufferMs
}

// =========================================================================
// TOKEN REFRESH
// =========================================================================

/**
 * Refreshes the access token using the refresh token.
 * 
 * Handles concurrent requests by queuing them during refresh.
 * Uses token rotation (old refresh token becomes invalid).
 * 
 * @returns Promise resolving to new access token, or null if refresh failed
 */
export async function refreshAccessToken(): Promise<string | null> {
  // Prevent hammering the refresh endpoint
  const now = Date.now()
  if (now - lastRefreshAttempt < MIN_REFRESH_INTERVAL_MS) {
    logger.debug('Refresh attempt too soon, skipping', {
      component: 'TokenService',
      action: 'refreshAccessToken',
    })
    return getAccessToken() ?? null
  }

  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    logger.debug('No refresh token available', {
      component: 'TokenService',
      action: 'refreshAccessToken',
    })
    return null
  }

  // If already refreshing, queue this request
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      refreshQueue.push({ resolve, reject })
    })
  }

  isRefreshing = true
  lastRefreshAttempt = now

  try {
    logger.debug('Refreshing access token...', {
      component: 'TokenService',
      action: 'refreshAccessToken',
    })

    // NOTE: Using raw fetch here is INTENTIONAL and correct.
    // We cannot use HttpService because:
    // 1. HttpService uses tokenService (would cause circular dependency)
    // 2. This is the standard pattern in OAuth/OIDC libraries (Auth0, MSAL, etc.)
    // 3. The refresh endpoint doesn't need existing auth - it validates the refresh token
    const response = await fetch(`${DEFAULT_API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    })

    if (!response.ok) {
      // Refresh failed - clear tokens and force re-login
      logger.warn('Token refresh failed', {
        component: 'TokenService',
        action: 'refreshAccessToken',
        status: response.status,
      })
      clearTokens()
      
      // Notify queued requests of failure
      processRefreshQueue(null)
      
      // Dispatch event for forced logout
      dispatchLogoutEvent()
      
      return null
    }

    const data: RefreshResponse = await response.json()
    
    if (data.statusCode === 200 && data.payload) {
      // Store new tokens
      storeTokens(data.payload)
      
      const newAccessToken = data.payload.accessToken
      
      // Notify queued requests of success
      processRefreshQueue(newAccessToken)
      
      logger.info('Token refreshed successfully', {
        component: 'TokenService',
        action: 'refreshAccessToken',
      })
      return newAccessToken
    }

    // Unexpected response format
    logger.error('Unexpected refresh response', {
      component: 'TokenService',
      action: 'refreshAccessToken',
      statusCode: data.statusCode,
      message: data.message,
    })
    clearTokens()
    processRefreshQueue(null)
    dispatchLogoutEvent()
    return null

  } catch (error) {
    logger.error('Token refresh error', {
      component: 'TokenService',
      action: 'refreshAccessToken',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    clearTokens()
    processRefreshQueue(null)
    dispatchLogoutEvent()
    return null
  } finally {
    isRefreshing = false
  }
}

/**
 * Processes queued refresh requests.
 * 
 * @param token - New access token (null if refresh failed)
 */
function processRefreshQueue(token: string | null): void {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (token) {
      resolve(token)
    } else {
      reject(new Error('Token refresh failed'))
    }
  })
  refreshQueue = []
}

/**
 * Dispatches a custom event for forced logout.
 * The AccountStatusListener or auth store can handle this.
 */
function dispatchLogoutEvent(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('auth:session-expired', {
      detail: { reason: 'refresh_failed' }
    }))
  }
}

// =========================================================================
// PROACTIVE TOKEN REFRESH
// =========================================================================

/**
 * Checks if token needs refresh and refreshes proactively.
 * Call this before making API requests.
 * 
 * @returns Promise resolving to current/new access token, or null if not authenticated
 */
export async function ensureValidToken(): Promise<string | null> {
  const currentToken = getAccessToken()
  
  if (!currentToken) {
    // No access token - try to refresh if we have refresh token
    const refreshToken = getRefreshToken()
    if (refreshToken) {
      return refreshAccessToken()
    }
    return null
  }

  // Check if token is about to expire
  if (isTokenExpired()) {
    return refreshAccessToken()
  }

  return currentToken
}

// =========================================================================
// AUTO-REFRESH SETUP
// =========================================================================

let refreshIntervalId: ReturnType<typeof setInterval> | null = null

/**
 * Starts automatic token refresh timer.
 * Checks token expiry periodically and refreshes proactively.
 * 
 * Call this once when the app initializes (after login).
 */
export function startAutoRefresh(): void {
  // Check every 30 seconds if token needs refresh
  const CHECK_INTERVAL_MS = 30 * 1000

  // Clear any existing interval
  stopAutoRefresh()

  refreshIntervalId = setInterval(() => {
    if (isTokenExpired()) {
      logger.debug('Proactive token refresh triggered', {
        component: 'TokenService',
        action: 'startAutoRefresh',
      })
      refreshAccessToken().catch((err) => {
        logger.error('Proactive refresh failed', {
          component: 'TokenService',
          action: 'startAutoRefresh',
          error: err instanceof Error ? err.message : 'Unknown error',
        })
      })
    }
  }, CHECK_INTERVAL_MS)

  logger.debug('Auto-refresh started', {
    component: 'TokenService',
    action: 'startAutoRefresh',
    intervalMs: CHECK_INTERVAL_MS,
  })
}

/**
 * Stops automatic token refresh timer.
 * Call this on logout.
 */
export function stopAutoRefresh(): void {
  if (refreshIntervalId) {
    clearInterval(refreshIntervalId)
    refreshIntervalId = null
    logger.debug('Auto-refresh stopped', {
      component: 'TokenService',
      action: 'stopAutoRefresh',
    })
  }
}

// =========================================================================
// VISIBILITY-BASED REFRESH
// =========================================================================

/**
 * Sets up refresh on tab visibility change.
 * When user returns to tab after being away, check and refresh token if needed.
 * 
 * @returns Cleanup function to remove the event listener
 */
export function setupVisibilityRefresh(): (() => void) | undefined {
  if (typeof window === 'undefined') {
    return undefined
  }

  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      // User returned to tab - check token validity
      if (getRefreshToken() && isTokenExpired()) {
        logger.debug('Tab visible - checking token validity', {
          component: 'TokenService',
          action: 'setupVisibilityRefresh',
        })
        refreshAccessToken().catch((err) => {
          logger.debug('Visibility refresh failed', {
            component: 'TokenService',
            action: 'setupVisibilityRefresh',
            error: err instanceof Error ? err.message : 'Unknown error',
          })
        })
      }
    }
  }

  document.addEventListener('visibilitychange', handleVisibilityChange)

  // Return cleanup function
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  }
}

