'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'react-toastify'
import { useZodForm } from '@_shared'
import { loginSchema, type LoginFormData } from '@_core'
import { login, useAuthStore } from '@_features/auth'
import FormInput from '@_components/forms/FormInput'
import FormCheckbox from '@_components/forms/FormCheckbox'
import Button from '@_components/ui/Button'
import Logo from '@/public/big-logo.png'

export default function LoginPage() {
	const router = useRouter()
	const [isLoading, setIsLoading] = useState(false)
	const loginUser = useAuthStore((state) => state.login)

	const form = useZodForm(loginSchema, {
		defaultValues: {
			identifier: '',
			password: '',
			rememberMe: false,
		},
	})

	const handleSubmit = async (values: LoginFormData) => {
		setIsLoading(true)

		try {
			const result = await login({
				username: values.identifier, // Backend expects username field
				password: values.password,
				rememberUser: values.rememberMe,
			})

			if (result.success && result.user) {
				// Update auth store
				loginUser(result.user)
				
				toast.success('Logged in successfully!')
				
				// Redirect to dashboard
				router.push('/medsource-app')
			} else {
				toast.error(result.message || 'Login failed. Please check your credentials.')
			}
		} catch (error) {
			console.error('Login error:', error)
			toast.error('An error occurred during login. Please try again.')
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
			<div className="card w-full max-w-md bg-base-100 shadow-xl">
				<div className="card-body">
					{/* Logo */}
					<div className="flex justify-center mb-6">
						<Image
							src={Logo}
							alt="MedSource Pro Logo"
							priority
							className="h-20 w-auto"
						/>
					</div>

					{/* Header */}
					<h1 className="text-4xl font-bold text-center text-primary mb-2">
						Welcome Back
					</h1>
					<p className="text-center text-base text-base-content/70 mb-6">
						Sign in to your account
					</p>

					{/* Login Form */}
					<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
						<FormInput
							label="Email or Username"
							type="text"
							placeholder="Enter your email or username"
							autoFocus
							{...form.register('identifier')}
							error={form.formState.errors.identifier}
						/>

						<FormInput
							label="Password"
							type="password"
							placeholder="Enter your password"
							{...form.register('password')}
							error={form.formState.errors.password}
						/>

						<div className="flex items-center justify-between">
							<FormCheckbox
								label="Remember me"
								{...form.register('rememberMe')}
							/>

							<Link
								href="/forgot-password"
								className="text-sm link link-primary"
							>
								Forgot password?
							</Link>
						</div>

						<Button
							type="submit"
							variant="primary"
							fullWidth
							loading={isLoading}
							disabled={isLoading || !form.formState.isValid}
							className="mt-6"
						>
							Sign In
						</Button>
					</form>

					{/* Sign up link */}
					<div className="divider">OR</div>
					<p className="text-center text-base">
						Don&apos;t have an account?{' '}
						<Link href="/signup" className="link link-primary font-semibold">
							Sign up
						</Link>
					</p>
				</div>
			</div>
		</div>
	)
}

