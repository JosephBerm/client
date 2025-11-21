/**
 * @file useFocusManagement.ts
 * @description Focus management utilities for tables
 * Handles focus trapping, saving/restoring focus, and auto-focus
 * 
 * @see https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/
 */

'use client'

import { useEffect, useRef, useCallback, RefObject } from 'react'
import { logger } from '@_core'
import { FOCUSABLE_ELEMENTS_SELECTOR } from '../types/divTableConstants'

/**
 * Focus trap options
 */
interface FocusTrapOptions {
  /**
   * Whether to trap focus within the container
   * @default false
   */
  enabled?: boolean

  /**
   * Whether to restore focus when trap is disabled
   * @default true
   */
  restoreFocus?: boolean

  /**
   * Element to focus when trap is enabled
   * @default 'first focusable element'
   */
  initialFocus?: 'first' | 'last' | HTMLElement

  /**
   * Callback when user attempts to leave trap
   */
  onEscapeAttempt?: () => void
}

/**
 * Hook configuration
 */
interface UseFocusManagementOptions {
  /**
   * Reference to the container element
   */
  containerRef: RefObject<HTMLElement>

  /**
   * Focus trap configuration
   */
  trap?: FocusTrapOptions

  /**
   * Whether to save focus position on unmount
   * @default false
   */
  saveFocusOnUnmount?: boolean

  /**
   * Whether to restore saved focus on mount
   * @default false
   */
  restoreFocusOnMount?: boolean

  /**
   * Element to auto-focus on mount
   */
  autoFocus?: 'first' | 'last' | RefObject<HTMLElement>
}

/**
 * Custom hook for focus management in tables
 * 
 * Features:
 * - Focus trapping for modal tables
 * - Save/restore focus position
 * - Auto-focus on mount
 * - Accessibility-compliant focus handling
 * 
 * @param options - Configuration options
 * 
 * @example
 * ```tsx
 * const tableRef = useRef<HTMLDivElement>(null)
 * 
 * useFocusManagement({
 *   containerRef: tableRef,
 *   trap: { enabled: isModal },
 *   autoFocus: 'first'
 * })
 * ```
 */
export function useFocusManagement({
  containerRef,
  trap,
  saveFocusOnUnmount = false,
  restoreFocusOnMount = false,
  autoFocus,
}: UseFocusManagementOptions) {
  // Store the element that had focus before we took over
  const previousActiveElement = useRef<HTMLElement | null>(null)

  // Store saved focus position
  const savedFocusPosition = useRef<{
    rowIndex: number
    colIndex: number
  } | null>(null)

  /**
   * Get all focusable elements within container
   */
  const getFocusableElements = useCallback((): HTMLElement[] => {
    if (!containerRef.current) return []

    const elements = Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENTS_SELECTOR)
    )

    // Filter out elements that are not visible
    return elements.filter((element) => {
      const style = window.getComputedStyle(element)
      return (
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        element.offsetParent !== null
      )
    })
  }, [containerRef])

  /**
   * Focus the first focusable element
   */
  const focusFirst = useCallback(() => {
    const focusableElements = getFocusableElements()
    if (focusableElements.length > 0) {
      focusableElements[0].focus()
      logger.debug('Focused first element', { hook: 'useFocusManagement' })
      return true
    }
    return false
  }, [getFocusableElements])

  /**
   * Focus the last focusable element
   */
  const focusLast = useCallback(() => {
    const focusableElements = getFocusableElements()
    if (focusableElements.length > 0) {
      focusableElements[focusableElements.length - 1].focus()
      logger.debug('Focused last element', { hook: 'useFocusManagement' })
      return true
    }
    return false
  }, [getFocusableElements])

  /**
   * Save current focus position
   */
  const saveFocus = useCallback(() => {
    if (!containerRef.current) return

    const activeElement = document.activeElement as HTMLElement
    if (!activeElement || !containerRef.current.contains(activeElement)) {
      return
    }

    // Try to get grid position if in a grid cell
    const cell = activeElement.closest('[role="gridcell"]')
    if (cell) {
      const row = cell.closest('[role="row"]')
      if (row) {
        const rowIndexParsed = parseInt(row.getAttribute('aria-rowindex') || '0', 10)
        const colIndexParsed = parseInt(cell.getAttribute('aria-colindex') || '0', 10)

        if (!isNaN(rowIndexParsed) && !isNaN(colIndexParsed)) {
          savedFocusPosition.current = {
            rowIndex: rowIndexParsed - 2, // Convert to 0-based, excluding header
            colIndex: colIndexParsed - 1, // Convert to 0-based
          }

          logger.debug('Saved focus position', {
            hook: 'useFocusManagement',
            rowIndex: savedFocusPosition.current.rowIndex,
            colIndex: savedFocusPosition.current.colIndex,
          })
        }
      }
    }
  }, [containerRef])

  /**
   * Restore saved focus position
   */
  const restoreFocus = useCallback(() => {
    if (!containerRef.current || !savedFocusPosition.current) return false

    const { rowIndex, colIndex } = savedFocusPosition.current

    try {
      // Find the cell using aria attributes
      const targetRow = containerRef.current.querySelector(
        `[role="row"][aria-rowindex="${rowIndex + 2}"]`
      )

      if (!targetRow) return false

      const targetCell = targetRow.querySelector(
        `[role="gridcell"][aria-colindex="${colIndex + 1}"]`
      ) as HTMLElement

      if (!targetCell) return false

      // Focus the cell or first focusable element within
      const focusableElement =
        targetCell.querySelector<HTMLElement>(
          'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) || targetCell

      focusableElement.focus()

      logger.debug('Restored focus position', {
        hook: 'useFocusManagement',
        rowIndex,
        colIndex,
      })

      return true
    } catch (error) {
      logger.error('Failed to restore focus', {
        hook: 'useFocusManagement',
        error,
        position: { rowIndex, colIndex },
      })
      return false
    }
  }, [containerRef])

  /**
   * Handle focus trap
   */
  const handleFocusTrap = useCallback(
    (event: KeyboardEvent) => {
      if (!trap?.enabled || !containerRef.current) return

      // Only trap Tab key
      if (event.key !== 'Tab') return

      const focusableElements = getFocusableElements()
      if (focusableElements.length === 0) return

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]
      const activeElement = document.activeElement as HTMLElement

      if (event.shiftKey) {
        // Shift+Tab: going backwards
        if (activeElement === firstElement) {
          event.preventDefault()
          lastElement.focus()
        }
      } else {
        // Tab: going forwards
        if (activeElement === lastElement) {
          event.preventDefault()
          firstElement.focus()
        }
      }
    },
    [trap?.enabled, containerRef, getFocusableElements]
  )

  /**
   * Handle escape key in focus trap
   */
  const handleEscape = useCallback(
    (event: KeyboardEvent) => {
      if (!trap?.enabled || event.key !== 'Escape') return

      trap.onEscapeAttempt?.()
    },
    [trap]
  )

  /**
   * Auto-focus on mount
   */
  useEffect(() => {
    if (!autoFocus || !containerRef.current) return

    // Wait for next tick to ensure elements are rendered
    const timeoutId = setTimeout(() => {
      if (autoFocus === 'first') {
        focusFirst()
      } else if (autoFocus === 'last') {
        focusLast()
      } else if ('current' in autoFocus && autoFocus.current) {
        autoFocus.current.focus()
        logger.debug('Auto-focused element', { hook: 'useFocusManagement' })
      }
    }, 0)

    return () => clearTimeout(timeoutId)
  }, [autoFocus, containerRef, focusFirst, focusLast])

  /**
   * Restore focus on mount
   */
  useEffect(() => {
    if (!restoreFocusOnMount || !containerRef.current) return

    const timeoutId = setTimeout(() => {
      restoreFocus()
    }, 0)

    return () => clearTimeout(timeoutId)
  }, [restoreFocusOnMount, containerRef, restoreFocus])

  /**
   * Save focus on unmount
   */
  useEffect(() => {
    return () => {
      if (saveFocusOnUnmount) {
        saveFocus()
      }
    }
  }, [saveFocusOnUnmount, saveFocus])

  /**
   * Set up focus trap
   */
  useEffect(() => {
    if (!trap?.enabled || !containerRef.current) return

    // Save the element that currently has focus
    previousActiveElement.current = document.activeElement as HTMLElement

    // Focus initial element
    if (trap.initialFocus === 'first') {
      focusFirst()
    } else if (trap.initialFocus === 'last') {
      focusLast()
    } else if (trap.initialFocus instanceof HTMLElement) {
      trap.initialFocus.focus()
    } else {
      focusFirst()
    }

    // Add event listeners
    const containerElement = containerRef.current
    containerElement.addEventListener('keydown', handleFocusTrap)
    containerElement.addEventListener('keydown', handleEscape)

    logger.debug('Focus trap enabled', { hook: 'useFocusManagement' })

    // Cleanup
    return () => {
      containerElement.removeEventListener('keydown', handleFocusTrap)
      containerElement.removeEventListener('keydown', handleEscape)

      // Restore focus if requested
      if (trap.restoreFocus && previousActiveElement.current) {
        previousActiveElement.current.focus()
        logger.debug('Focus trap disabled, focus restored', { hook: 'useFocusManagement' })
      }
    }
  }, [trap, containerRef, focusFirst, focusLast, handleFocusTrap, handleEscape])

  /**
   * Return utility functions
   */
  return {
    /**
     * Focus the first focusable element
     */
    focusFirst,

    /**
     * Focus the last focusable element
     */
    focusLast,

    /**
     * Save current focus position
     */
    saveFocus,

    /**
     * Restore saved focus position
     */
    restoreFocus,

    /**
     * Get all focusable elements
     */
    getFocusableElements,
  }
}

