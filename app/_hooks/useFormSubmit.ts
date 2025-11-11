import { useState } from 'react'
import { toast } from 'react-toastify'

/**
 * Generic form submission hook following DRY principles
 * Handles loading state, error handling, and success notifications
 * 
 * @example
 * const { submit, isSubmitting } = useFormSubmit(async (data) => {
 *   return await API.Users.create(data)
 * }, {
 *   successMessage: 'User created!',
 *   onSuccess: () => router.push('/users')
 * })
 */
export function useFormSubmit<TData, TResult = any>(
  submitFn: (data: TData) => Promise<{ data: { statusCode: number; message?: string | null; payload?: TResult | null } }>,
  options?: {
    successMessage?: string
    errorMessage?: string
    onSuccess?: (result: TResult | null) => void | Promise<void>
    onError?: (error: Error) => void | Promise<void>
  }
) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const submit = async (data: TData): Promise<{ success: boolean; data?: TResult | null }> => {
    try {
      setIsSubmitting(true)
      setError(null)

      const response = await submitFn(data)

      if (response.data.statusCode === 200 || response.data.statusCode === 201) {
        // Success
        if (options?.successMessage) {
          toast.success(options.successMessage)
        }

        if (options?.onSuccess) {
          await options.onSuccess(response.data.payload ?? null)
        }

        return { success: true, data: response.data.payload ?? null }
      } else {
        // API returned error
        const errorMsg = response.data.message || options?.errorMessage || 'An error occurred'
        toast.error(errorMsg)
        return { success: false }
      }
    } catch (err: any) {
      // Network or unexpected error
      const errorMsg = err.message || options?.errorMessage || 'An unexpected error occurred'
      toast.error(errorMsg)
      setError(err)

      if (options?.onError) {
        await options.onError(err)
      }

      return { success: false }
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    submit,
    isSubmitting,
    error,
  }
}

/**
 * Specialized hook for CRUD operations following REST conventions
 * 
 * @example
 * const { create, update, remove, isLoading } = useCRUDSubmit(API.Users, {
 *   entityName: 'User',
 *   onCreateSuccess: (user) => router.push(`/users/${user.id}`)
 * })
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
  const entityName = options?.entityName || 'Item'

  const createSubmit = useFormSubmit(
    apiService.create,
    {
      successMessage: `${entityName} created successfully`,
      onSuccess: options?.onCreateSuccess,
    }
  )

  const updateSubmit = useFormSubmit(
    apiService.update,
    {
      successMessage: `${entityName} updated successfully`,
      onSuccess: options?.onUpdateSuccess,
    }
  )

  const deleteSubmit = useFormSubmit(
    apiService.delete,
    {
      successMessage: `${entityName} deleted successfully`,
      onSuccess: options?.onDeleteSuccess,
    }
  )

  return {
    create: createSubmit.submit,
    update: updateSubmit.submit,
    remove: deleteSubmit.submit,
    isLoading: createSubmit.isSubmitting || updateSubmit.isSubmitting || deleteSubmit.isSubmitting,
  }
}


