'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'react-toastify'
import { useZodForm } from '@_shared'
import { signupSchema, type SignupFormData } from '@_core'
import { signup } from '@_features/auth'
import FormInput from '@_components/forms/FormInput'
import FormCheckbox from '@_components/forms/FormCheckbox'
import Button from '@_components/ui/Button'
import Name from '@_classes/common/Name'
import Logo from '@/public/big-logo.png'

export default function SignupPage() {
	const router = useRouter()
	const [isLoading, setIsLoading] = useState(false)

	const form = useZodForm(signupSchema, {
		defaultValues: {
			username: '',
			email: '',
			password: '',
			confirmPassword: '',
			name: {
				first: '',
				middle: '',
				last: '',
			},
			dateOfBirth: undefined,
			acceptTerms: false,
		},
	})

	const handleSubmit = async (values: SignupFormData) => {
		setIsLoading(true)

		try {
			const result = await signup({
				username: values.username,
				email: values.email,
				password: values.password,
				name: new Name(values.name),
				dateOfBirth: values.dateOfBirth,
			})

			if (result.success && result.user) {
				toast.success('Account created successfully! Please log in.')
				router.push('/login')
			} else {
				toast.error(result.message || 'Signup failed. Please try again.')
			}
		} catch (error) {
			console.error('Signup error:', error)
			toast.error('An error occurred during signup. Please try again.')
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-base-200 px-4 py-8">
			<div className="card w-full max-w-2xl bg-base-100 shadow-xl">
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
						Create Account
					</h1>
					<p className="text-center text-base-content/70 mb-6">
						Join MedSource Pro today
					</p>

					{/* Signup Form */}
					<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
						{/* Account Information */}
						<div className="space-y-4">
							<h2 className="text-lg font-semibold">Account Information</h2>
							
							<FormInput
								label="Username"
								type="text"
								placeholder="Choose a username"
								required
								{...form.register('username')}
								error={form.formState.errors.username}
							/>

							<FormInput
								label="Email"
								type="email"
								placeholder="your.email@example.com"
								required
								{...form.register('email')}
								error={form.formState.errors.email}
							/>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<FormInput
									label="Password"
									type="password"
									placeholder="Create a strong password"
									required
									{...form.register('password')}
									error={form.formState.errors.password}
								/>

								<FormInput
									label="Confirm Password"
									type="password"
									placeholder="Re-enter your password"
									required
									{...form.register('confirmPassword')}
									error={form.formState.errors.confirmPassword}
								/>
							</div>
						</div>

						{/* Personal Information */}
						<div className="space-y-4">
							<h2 className="text-lg font-semibold">Personal Information</h2>
							
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<FormInput
									label="First Name"
									type="text"
									placeholder="First name"
									required
									{...form.register('name.first')}
									error={form.formState.errors.name?.first}
								/>

								<FormInput
									label="Last Name"
									type="text"
									placeholder="Last name"
									required
									{...form.register('name.last')}
									error={form.formState.errors.name?.last}
								/>
							</div>

							<FormInput
								label="Middle Name (Optional)"
								type="text"
								placeholder="Middle name"
								{...form.register('name.middle')}
								error={form.formState.errors.name?.middle}
							/>

							<FormInput
								label="Date of Birth (Optional)"
								type="date"
								{...form.register('dateOfBirth')}
								error={form.formState.errors.dateOfBirth}
							/>
						</div>

						{/* Terms and Conditions */}
						<FormCheckbox
							label="I accept the terms and conditions"
							required
							{...form.register('acceptTerms')}
							error={form.formState.errors.acceptTerms}
						/>

						<Button
							type="submit"
							variant="primary"
							fullWidth
							loading={isLoading}
							disabled={isLoading || !form.formState.isValid}
							className="mt-6"
						>
							Create Account
						</Button>
					</form>

					{/* Login link */}
					<div className="divider">OR</div>
					<p className="text-center text-sm">
						Already have an account?{' '}
						<Link href="/login" className="link link-primary font-semibold">
							Sign in
						</Link>
					</p>
				</div>
			</div>
		</div>
	)
}

