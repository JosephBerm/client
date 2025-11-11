'use client'

import { useForm, UseFormProps, UseFormReturn, FieldValues } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

/**
 * Custom hook for React Hook Form with Zod validation
 * Simplifies form setup with automatic Zod schema resolution
 */
export function useZodForm<TSchema extends z.ZodType<any, any, any>>(
	schema: TSchema,
	options?: Omit<UseFormProps<z.infer<TSchema>>, 'resolver'>
): UseFormReturn<z.infer<TSchema>> {
	return useForm<z.infer<TSchema>>({
		...options,
		resolver: zodResolver(schema),
	})
}


