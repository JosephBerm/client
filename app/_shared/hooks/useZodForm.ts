/**
 * React Hook Form + Zod Integration Hook
 * 
 * Simplifies form setup by automatically configuring React Hook Form with Zod validation.
 * Eliminates boilerplate by combining useForm and zodResolver in a single hook.
 * 
 * **Benefits:**
 * - Type-safe forms with automatic TypeScript inference
 * - Centralized validation schemas
 * - Consistent error messages
 * - Single line form initialization
 * 
 * @module useZodForm
 */

'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import type { UseFormProps, UseFormReturn} from 'react-hook-form';
import type { z } from 'zod'

/**
 * Creates a React Hook Form instance with Zod schema validation.
 * Automatically configures the form resolver and infers TypeScript types from the schema.
 * 
 * **Use Cases:**
 * - All forms that require validation
 * - Forms with complex validation rules
 * - Forms that need type-safe data handling
 * 
 * @template TSchema - Zod schema type that extends z.ZodType
 * 
 * @param {TSchema} schema - Zod validation schema defining form structure and rules
 * @param {Object} options - React Hook Form options (excluding resolver)
 * @param {Object} options.defaultValues - Initial form values
 * @param {string} options.mode - Validation mode ('onChange', 'onBlur', 'onSubmit', 'all')
 * @param {boolean} options.reValidateMode - When to revalidate after submit
 * 
 * @returns {UseFormReturn<z.infer<TSchema>>} React Hook Form instance with Zod validation
 * 
 * @example
 * ```typescript
 * // Define Zod schema
 * const loginSchema = z.object({
 *   email: z.string().email('Invalid email'),
 *   password: z.string().min(6, 'Password must be at least 6 characters')
 * });
 * 
 * // Initialize form with automatic type inference
 * const form = useZodForm(loginSchema, {
 *   defaultValues: {
 *     email: '',
 *     password: ''
 *   }
 * });
 * 
 * // TypeScript knows the form data shape!
 * import { logger } from '@_core';
 * 
 * const handleSubmit = (data) => {
 *   // data.email and data.password are fully typed
 *   logger.debug('Form submitted', { email: data.email }); // string
 * };
 * 
 * // Use in component
 * <form onSubmit={form.handleSubmit(handleSubmit)}>
 *   <input {...form.register('email')} />
 *   {form.formState.errors.email && (
 *     <span>{form.formState.errors.email.message}</span>
 *   )}
 * </form>
 * ```
 * 
 * @example
 * ```typescript
 * // Complex form with nested validation
 * const profileSchema = z.object({
 *   name: z.object({
 *     first: z.string().min(1, 'First name required'),
 *     last: z.string().min(1, 'Last name required')
 *   }),
 *   email: z.string().email(),
 *   age: z.number().min(18, 'Must be 18 or older')
 * });
 * 
 * const form = useZodForm(profileSchema, {
 *   mode: 'onChange', // Validate on each change
 *   defaultValues: {
 *     name: { first: '', last: '' },
 *     email: '',
 *     age: 0
 *   }
 * });
 * ```
 */
export function useZodForm<TSchema extends z.ZodType<any, any, any>>(
	schema: TSchema,
	options?: Omit<UseFormProps<z.infer<TSchema>>, 'resolver'>
): UseFormReturn<z.infer<TSchema>> {
	// Initialize React Hook Form with Zod resolver
	// The resolver automatically validates form data against the schema
	// TypeScript infers the form data type from z.infer<TSchema>
	return useForm<z.infer<TSchema>>({
		...options,
		resolver: zodResolver(schema), // Connects Zod validation to React Hook Form
	})
}


