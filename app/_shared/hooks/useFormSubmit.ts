'use client'

import { useState } from 'react'

import { notificationService } from '../services/notification.service'

/**
 * Generic form submission hook following DRY (Don't Repeat Yourself) principles.
 * Eliminates boilerplate code by centralizing loading state management, error handling,
 * and success notifications across all forms.
 * 
 * **Benefits:**
 * - Automatic loading state management
 * - Consistent error handling with toast notifications
 * - Success callbacks for navigation or data refresh
 * - Reduces form code by ~70%
 * 
 * @template TData - The type of data being submitted (form data)
 * @template TResult - The type of data returned from the API (defaults to any)
 * 
 * @param {Function} submitFn - Async function that submits data to the API
 * @param {Object} options - Configuration options for the submission
 * @param {string} options.successMessage - Message to display on successful submission
 * @param {string} options.errorMessage - Default error message if API doesn't provide one
 * @param {Function} options.onSuccess - Callback executed after successful submission
 * @param {Function} options.onError - Callback executed after failed submission
 * 
 * @returns {Object} Object containing submit function, loading state, and error state
 * @returns {Function} returns.submit - Function to call for form submission
 * @returns {boolean} returns.isSubmitting - True while the request is in progress
 * @returns {Error|null} returns.error - Error object if submission failed, null otherwise
 * 
 * @example
 * ```typescript
 * // Basic usage with success message
 * const { submit, isSubmitting } = useFormSubmit(
 *   async (data) => await API.Users.create(data),
 *   {
 *     successMessage: 'User created successfully!',
 *     errorMessage: 'Failed to create user'
 *   }
 * );
 * 
 * // With success callback for navigation
 * import { Routes } from '@_features/navigation';
 * const { submit, isSubmitting } = useFormSubmit(
 *   async (data) => await API.Products.update(data),
 *   {
 *     successMessage: 'Product updated!',
 *     onSuccess: (result) => router.push(Routes.InternalStore.detail(result.id))
 *   }
 * );
 * 
 * // In form handler
 * const handleSubmit = async (formData) => {
 *   const result = await submit(formData);
 *   if (result.success) {
 *     logger.debug('Form submitted successfully', { data: result.data });
 *   }
 * };
 * ```
 */
export function useFormSubmit<TData, TResult = any>(
  submitFn: (data: TData) => Promise<{ data: { statusCode: number; message?: string | null; payload?: TResult | null } }>,
  options?: {
    successMessage?: string
    errorMessage?: string
    componentName?: string
    actionName?: string
    onSuccess?: (result: TResult | null) => void | Promise<void>
    onError?: (error: Error) => void | Promise<void>
  }
) {
  // Track submission state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  /**
   * Submit function that handles the entire submission lifecycle.
   * Manages loading state, calls the API, handles success/error, and shows toast notifications.
   * 
   * @param {TData} data - The form data to submit
   * @returns {Promise<Object>} Object indicating success status and optional result data
   */
  const submit = async (data: TData): Promise<{ success: boolean; data?: TResult | null }> => {
    try {
      // Start loading state
      setIsSubmitting(true)
      setError(null)

      // Call the provided submit function (API call)
      const response = await submitFn(data)

      // Check if API returned success status code (200 or 201)
      if (response.data.statusCode === 200 || response.data.statusCode === 201) {
      // Success path: show success toast if message provided
      if (options?.successMessage) {
        notificationService.success(options.successMessage, {
          component: options?.componentName || 'FormSubmit',
          action: options?.actionName || 'submit',
        })
      }

        // Execute success callback (e.g., navigation, data refresh)
        if (options?.onSuccess) {
          await options.onSuccess(response.data.payload ?? null)
        }

        return { success: true, data: response.data.payload ?? null }
      } else {
      // API returned error status code
      const errorMsg = response.data.message || options?.errorMessage || 'An error occurred'
      notificationService.error(errorMsg, {
        metadata: { statusCode: response.data.statusCode },
        component: options?.componentName || 'FormSubmit',
        action: options?.actionName || 'submit',
      })
      return { success: false }
      }
    } catch (err: any) {
      // Network error or unexpected exception
      const errorMsg = err.message || options?.errorMessage || 'An unexpected error occurred'
      notificationService.error(errorMsg, {
        metadata: { error: err, context: 'form_submit' },
        component: options?.componentName || 'FormSubmit',
        action: options?.actionName || 'submit',
      })
      setError(err)

      // Execute error callback if provided
      if (options?.onError) {
        await options.onError(err)
      }

      return { success: false }
    } finally {
      // Always reset loading state when done
      setIsSubmitting(false)
    }
  }

  return {
    submit,        // Function to call when submitting the form
    isSubmitting,  // Boolean indicating if submission is in progress
    error,         // Error object if submission failed
  }
}

/**
 * Specialized CRUD (Create, Read, Update, Delete) hook built on useFormSubmit.
 * Provides standardized create, update, and delete operations with consistent
 * success messages and error handling.
 * 
 * **Use Case:** Simplifies CRUD operations for entity management pages (users, products, orders).
 * 
 * @template TEntity - The entity type being managed (e.g., User, Product, Order)
 * 
 * @param {Object} apiService - API service object with CRUD methods
 * @param {Function} apiService.create - Function to create a new entity
 * @param {Function} apiService.update - Function to update an existing entity
 * @param {Function} apiService.delete - Function to delete an entity by ID
 * @param {Object} options - Configuration options
 * @param {string} options.entityName - Name of the entity for success messages (e.g., 'User', 'Product')
 * @param {Function} options.onCreateSuccess - Callback after successful creation
 * @param {Function} options.onUpdateSuccess - Callback after successful update
 * @param {Function} options.onDeleteSuccess - Callback after successful deletion
 * 
 * @returns {Object} Object containing CRUD functions and loading state
 * @returns {Function} returns.create - Function to create a new entity
 * @returns {Function} returns.update - Function to update an entity
 * @returns {Function} returns.remove - Function to delete an entity
 * @returns {boolean} returns.isLoading - True if any CRUD operation is in progress
 * 
 * @example
 * ```typescript
 * // Basic usage for user management
 * import { Routes } from '@_features/navigation';
 * const { create, update, remove, isLoading } = useCRUDSubmit(API.Users, {
 *   entityName: 'User',
 *   onCreateSuccess: (user) => {
 *     logger.info('User created successfully', { userId: user.id });
 *     router.push(Routes.Accounts.detail(user.id));
 *   },
 *   onUpdateSuccess: () => {
 *     router.push(Routes.Accounts.location);
 *   },
 *   onDeleteSuccess: () => {
 *     notificationService.info('User removed from system', { component: 'UserDeleteButton', action: 'delete' });
 *   }
 * });
 * 
 * // In component
 * const handleCreate = async (userData) => {
 *   await create(userData);
 * };
 * 
 * const handleUpdate = async (userData) => {
 *   await update(userData);
 * };
 * 
 * const handleDelete = async (userId) => {
 *   await remove(userId);
 * };
 * ```
 */
export function useCRUDSubmit<TEntity>(
  apiService: {
    create: (entity: TEntity) => Promise<any>
    update: (entity: TEntity) => Promise<any>
    delete: (id: string | number) => Promise<any>
  },
  options?: {
    entityName?: string
    onCreateSuccess?: (entity: TEntity | null) => void | Promise<void>
    onUpdateSuccess?: (entity: TEntity | null) => void | Promise<void>
    onDeleteSuccess?: () => void | Promise<void>
  }
) {
  // Default entity name if not provided
  const entityName = options?.entityName || 'Item'

  // Create submission handler with automatic success message
  const createSubmit = useFormSubmit(
    apiService.create,
    {
      successMessage: `${entityName} created successfully`,
      onSuccess: options?.onCreateSuccess,
    }
  )

  // Update submission handler with automatic success message
  const updateSubmit = useFormSubmit(
    apiService.update,
    {
      successMessage: `${entityName} updated successfully`,
      onSuccess: options?.onUpdateSuccess,
    }
  )

  // Delete submission handler with automatic success message
  const deleteSubmit = useFormSubmit(
    apiService.delete,
    {
      successMessage: `${entityName} deleted successfully`,
      onSuccess: options?.onDeleteSuccess,
    }
  )

  return {
    create: createSubmit.submit,     // Create function
    update: updateSubmit.submit,     // Update function
    remove: deleteSubmit.submit,     // Delete function (named 'remove' to avoid keyword conflict)
    isLoading: createSubmit.isSubmitting || updateSubmit.isSubmitting || deleteSubmit.isSubmitting, // Combined loading state
  }
}


