'use client'
import React, { useState, useEffect, useCallback } from 'react'

import { useRouter } from 'next/navigation'

import { 
	ArrowLeft, 
	Building2, 
	Calendar, 
	Edit, 
	Factory, 
	Globe, 
	Mail, 
	MapPin, 
	Phone, 
	Save,
	Archive,
	RotateCcw
} from 'lucide-react'

import { Routes } from '@_features/navigation'
import { API, useAdminView, useRouteParam, notificationService } from '@_shared'
import { logger } from '@_core'

import Guid from '@_classes/Base/Guid'
import Provider from '@_classes/Provider'

import UpdateProviderForm from '@_components/forms/UpdateProviderForm'
import Button from '@_components/ui/Button'
import Badge from '@_components/ui/Badge'
import { InternalPageHeader } from '../../_components'

/**
 * Provider Detail Page
 * 
 * BUSINESS FLOW CONTEXT:
 * - View and edit provider/vendor details
 * - Providers are medical supply companies
 * - Critical for the dropshipping model
 * 
 * Modes:
 * - Create mode (/app/providers/create)
 * - View/Edit mode (/app/providers/[id])
 */
export default function ProviderDetailPage() {
	const router = useRouter()
	const providerId = useRouteParam('id')
	const { isAdminViewActive } = useAdminView()

	const [provider, setProvider] = useState<Provider>(new Provider({}))
	const [isLoading, setIsLoading] = useState(true)
	const [isEditing, setIsEditing] = useState(false)

	const isCreateMode = providerId === 'create'

	// Fetch provider data
	useEffect(() => {
		if (!providerId) {
			router.back()
			return
		}

		const fetchProvider = async () => {
			if (isCreateMode) {
				setIsLoading(false)
				setIsEditing(true)
				return
			}

			// Validate GUID format using Guid class (DRY)
			if (!Guid.isValid(providerId)) {
				logger.warn('Invalid provider ID format (must be valid GUID)', {
					component: 'ProviderDetailPage',
					action: 'fetchProvider',
					providerId,
				})
				notificationService.error('Invalid provider ID format')
				router.back()
				return
			}

			setIsLoading(true)
			try {
				const { data } = await API.Providers.get(providerId)
				if (data.payload) {
					setProvider(new Provider(data.payload))
				}
			} catch (error) {
				logger.error('Failed to fetch provider', { error, providerId })
				notificationService.error('Failed to load provider details')
			} finally {
				setIsLoading(false)
			}
		}

		void fetchProvider()
	}, [providerId, router, isCreateMode])

	/**
	 * Handle successful form update
	 */
	const handleUpdate = useCallback((updatedProvider: Provider) => {
		setProvider(updatedProvider)
		setIsEditing(false)
		if (isCreateMode && updatedProvider.id) {
			router.push(Routes.Providers.detail(updatedProvider.id))
		}
	}, [isCreateMode, router])

	/**
	 * Handle archive/restore
	 */
	const handleArchiveToggle = useCallback(async () => {
		const action = provider.isArchived ? 'restore' : 'archive'
		try {
			const { data } = provider.isArchived
				? await API.Providers.restore(provider.id as string)
				: await API.Providers.archive(provider.id as string)
			if (data.statusCode === 200) {
				setProvider(new Provider({ ...provider, isArchived: !provider.isArchived }))
				notificationService.success(`Provider ${action}d successfully`)
			}
		} catch (error) {
			logger.error(`Failed to ${action} provider`, { error })
			notificationService.error(`Failed to ${action} provider`)
		}
	}, [provider])

	// Loading state
	if (isLoading) {
		return (
			<div className="animate-pulse">
				<div className="h-8 bg-base-200 rounded w-48 mb-4" />
				<div className="h-4 bg-base-200 rounded w-64 mb-8" />
				<div className="card bg-base-100 shadow-xl">
					<div className="card-body">
						<div className="space-y-4">
							<div className="h-10 bg-base-200 rounded" />
							<div className="h-10 bg-base-200 rounded" />
							<div className="h-10 bg-base-200 rounded" />
						</div>
					</div>
				</div>
			</div>
		)
	}

	return (
		<>
			{/* Header */}
			<InternalPageHeader
				title={isCreateMode ? 'New Provider' : provider.name || 'Provider Details'}
				description={
					isCreateMode 
						? 'Add a new medical supply vendor to the system'
						: isAdminViewActive
						? `Vendor ID: ${provider.identifier || provider.id}`
						: 'View and manage provider details'
				}
				actions={
					<div className="flex items-center gap-2">
						<Button
							variant="ghost"
							onClick={() => router.push(Routes.Providers.location)}
							leftIcon={<ArrowLeft className="w-4 h-4" />}
						>
							Back
						</Button>
						{!isCreateMode && !isEditing && (
							<>
								<Button
									variant={provider.isArchived ? 'success' : 'accent'}
									onClick={() => void handleArchiveToggle()}
									leftIcon={provider.isArchived ? <RotateCcw className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
								>
									{provider.isArchived ? 'Restore' : 'Archive'}
								</Button>
								<Button
									variant="primary"
									onClick={() => setIsEditing(true)}
									leftIcon={<Edit className="w-4 h-4" />}
								>
									Edit
								</Button>
							</>
						)}
					</div>
				}
			/>

			{/* Status Badge */}
			{!isCreateMode && provider.isArchived && (
				<div className="alert alert-warning mb-6">
					<Archive className="w-5 h-5" />
					<span>This provider is archived and won&apos;t appear in active lists.</span>
				</div>
			)}

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Main Content - Form or Details */}
				<div className="lg:col-span-2">
					<div className="card bg-base-100 shadow-xl">
						<div className="card-body">
							{isEditing || isCreateMode ? (
								<>
									<div className="flex items-center justify-between mb-6">
										<h2 className="card-title">
											<Factory className="w-5 h-5 text-primary" />
											{isCreateMode ? 'Provider Information' : 'Edit Provider'}
										</h2>
										{!isCreateMode && (
											<Button
												variant="ghost"
												size="sm"
												onClick={() => setIsEditing(false)}
											>
												Cancel
											</Button>
										)}
									</div>
									<UpdateProviderForm 
										provider={provider} 
										onUpdate={handleUpdate}
									/>
								</>
							) : (
								<>
									<h2 className="card-title mb-6">
										<Factory className="w-5 h-5 text-primary" />
										Provider Information
									</h2>
									
									{/* Provider Details View */}
									<div className="space-y-6">
										{/* Basic Info */}
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<div>
												<label className="text-sm font-medium text-base-content/60">
													Provider Name
												</label>
												<p className="mt-1 font-semibold">{provider.name || '—'}</p>
											</div>
											<div>
												<label className="text-sm font-medium text-base-content/60">
													Identifier
												</label>
												<p className="mt-1 font-mono">{provider.identifier || '—'}</p>
											</div>
										</div>

										{/* Contact Info */}
										<div className="border-t border-base-200 pt-4">
											<h3 className="text-sm font-semibold text-base-content/70 mb-3">
												Contact Information
											</h3>
											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
												<div className="flex items-center gap-3">
													<div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
														<Mail className="w-5 h-5 text-primary" />
													</div>
													<div>
														<label className="text-xs text-base-content/60">Email</label>
														{provider.email ? (
															<a 
																href={`mailto:${provider.email}`}
																className="block text-primary hover:underline"
															>
																{provider.email}
															</a>
														) : (
															<p className="text-base-content/40">Not provided</p>
														)}
													</div>
												</div>
												<div className="flex items-center gap-3">
													<div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
														<Phone className="w-5 h-5 text-primary" />
													</div>
													<div>
														<label className="text-xs text-base-content/60">Phone</label>
														{provider.phone ? (
															<a 
																href={`tel:${provider.phone}`}
																className="block text-primary hover:underline"
															>
																{provider.phone}
															</a>
														) : (
															<p className="text-base-content/40">Not provided</p>
														)}
													</div>
												</div>
												<div className="flex items-center gap-3">
													<div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
														<Globe className="w-5 h-5 text-primary" />
													</div>
													<div>
														<label className="text-xs text-base-content/60">Website</label>
														{provider.website ? (
															<a 
																href={provider.website}
																target="_blank"
																rel="noopener noreferrer"
																className="block text-primary hover:underline"
															>
																{provider.website}
															</a>
														) : (
															<p className="text-base-content/40">Not provided</p>
														)}
													</div>
												</div>
												<div className="flex items-center gap-3">
													<div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
														<Building2 className="w-5 h-5 text-primary" />
													</div>
													<div>
														<label className="text-xs text-base-content/60">Tax ID</label>
														<p className="font-mono">
															{isAdminViewActive ? provider.taxId || '—' : 'Hidden'}
														</p>
													</div>
												</div>
											</div>
										</div>

										{/* Address */}
										{provider.address && (
											<div className="border-t border-base-200 pt-4">
												<h3 className="text-sm font-semibold text-base-content/70 mb-3">
													Business Address
												</h3>
												<div className="flex items-start gap-3">
													<div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
														<MapPin className="w-5 h-5 text-primary" />
													</div>
													<div>
														{provider.address.addressOne && <p>{provider.address.addressOne}</p>}
														<p>
															{[
																provider.address.city,
																provider.address.state,
																provider.address.zipCode
															].filter(Boolean).join(', ')}
														</p>
														{provider.address.country && <p>{provider.address.country}</p>}
													</div>
												</div>
											</div>
										)}
									</div>
								</>
							)}
						</div>
					</div>
				</div>

				{/* Sidebar */}
				<div className="lg:col-span-1 space-y-6">
					{/* Status Card */}
					{!isCreateMode && (
						<div className="card bg-base-100 shadow-xl">
							<div className="card-body">
								<h3 className="font-semibold mb-4">Status</h3>
								<div className="flex items-center justify-between">
									<span className="text-sm text-base-content/70">Current Status</span>
									<Badge 
										variant={provider.isArchived ? 'warning' : 'success'}
									>
										{provider.isArchived ? 'Archived' : 'Active'}
									</Badge>
								</div>
								<div className="divider my-2" />
								<div className="space-y-2 text-sm">
									<div className="flex items-center gap-2 text-base-content/70">
										<Calendar className="w-4 h-4" />
										<span>Created: {provider.createdAt?.toLocaleDateString() || '—'}</span>
									</div>
									{provider.updatedAt && (
										<div className="flex items-center gap-2 text-base-content/70">
											<Calendar className="w-4 h-4" />
											<span>Updated: {provider.updatedAt.toLocaleDateString()}</span>
										</div>
									)}
								</div>
							</div>
						</div>
					)}

					{/* Products Card - Future enhancement */}
					{!isCreateMode && (
						<div className="card bg-base-100 shadow-xl">
							<div className="card-body">
								<h3 className="font-semibold mb-4">Products</h3>
								<div className="text-center py-6 text-base-content/50">
									<Factory className="w-8 h-8 mx-auto mb-2 opacity-50" />
									<p className="text-sm">Product list coming soon</p>
								</div>
							</div>
						</div>
					)}

					{/* Quick Actions */}
					{!isCreateMode && !isEditing && (
						<div className="card bg-base-100 shadow-xl">
							<div className="card-body">
								<h3 className="font-semibold mb-4">Quick Actions</h3>
								<div className="space-y-2">
									<Button
										variant="ghost"
										size="sm"
										className="w-full justify-start"
										onClick={() => setIsEditing(true)}
										leftIcon={<Edit className="w-4 h-4" />}
									>
										Edit Provider
									</Button>
									{provider.email && (
										<Button
											variant="ghost"
											size="sm"
											className="w-full justify-start"
											onClick={() => window.open(`mailto:${provider.email}`)}
											leftIcon={<Mail className="w-4 h-4" />}
										>
											Send Email
										</Button>
									)}
									{provider.phone && (
										<Button
											variant="ghost"
											size="sm"
											className="w-full justify-start"
											onClick={() => window.open(`tel:${provider.phone}`)}
											leftIcon={<Phone className="w-4 h-4" />}
										>
											Call Provider
										</Button>
									)}
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</>
	)
}
