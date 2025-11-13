/**
 * Settings Modal Component
 * 
 * Modern, scalable settings modal with two-pane layout inspired by Church of God project.
 * Features a left sidebar for section navigation and right content area for settings.
 * 
 * **Features:**
 * - Two-pane layout (sidebar + content)
 * - Section-based navigation with icons
 * - Active state indication
 * - Scalable configuration (easy to add new sections)
 * - Type-safe settings structure
 * - Fully accessible (ARIA labels, keyboard navigation)
 * - Mobile-responsive design
 * 
 * **Layout:**
 * - **Left Sidebar**: Navigation menu with section icons and titles
 * - **Right Content**: Selected section's settings items
 * - **Header**: Close button
 * 
 * **Usage:**
 * ```tsx
 * const [isOpen, setIsOpen] = useState(false)
 * 
 * <SettingsModal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   defaultSectionId="general"
 * />
 * ```
 * 
 * @module SettingsModal
 */

'use client'

import { useState, useMemo, useEffect } from 'react'
import { X } from 'lucide-react'
import SettingRow from './SettingRow'
import Button from '@_components/ui/Button'
import { getSettingsSections } from '@_services/SettingsService'

/**
 * Settings Modal component props interface.
 */
interface SettingsModalProps {
	/**
	 * Whether the settings modal is currently open/visible.
	 * Controls the visibility and rendering of the modal.
	 */
	isOpen: boolean
	/**
	 * Callback function called when the modal should be closed.
	 * Triggered by close button, overlay click, or escape key.
	 */
	onClose: () => void
	/**
	 * Optional ID of the section to select by default when modal opens.
	 * If not provided, the first section is selected.
	 */
	defaultSectionId?: string
}

/**
 * Settings Modal Component
 * 
 * Comprehensive settings modal with two-pane layout for organized settings management.
 * 
 * **Accessibility:**
 * - ARIA labels and roles
 * - Keyboard navigation (Escape to close)
 * - Focus management
 * - Screen reader support
 * - Active section indication (aria-current)
 * 
 * @param props - Settings modal component props
 * @returns Settings modal element or null if not open
 */
export default function SettingsModal({
	isOpen,
	onClose,
	defaultSectionId,
}: SettingsModalProps) {
	const sections = getSettingsSections()

	// Get default section (first section if not specified)
	const defaultSection = useMemo(() => {
		if (defaultSectionId) {
			return sections.find((s) => s.id === defaultSectionId) || sections[0]
		}
		return sections[0]
	}, [sections, defaultSectionId])

	const [selectedSectionId, setSelectedSectionId] = useState<string>(
		defaultSection?.id || sections[0]?.id || ''
	)

	// Reset selected section when modal opens
	useEffect(() => {
		if (isOpen && defaultSection) {
			setSelectedSectionId(defaultSection.id)
		}
	}, [isOpen, defaultSection])

	// Get currently selected section
	const selectedSection = useMemo(() => {
		return sections.find((s) => s.id === selectedSectionId) || sections[0]
	}, [sections, selectedSectionId])

	// Handle escape key
	useEffect(() => {
		if (!isOpen) return

		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				onClose()
			}
		}

		window.addEventListener('keydown', handleEscape)
		return () => window.removeEventListener('keydown', handleEscape)
	}, [isOpen, onClose])

	// Prevent body scroll when modal is open
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = 'hidden'
		} else {
			document.body.style.overflow = ''
		}

		return () => {
			document.body.style.overflow = ''
		}
	}, [isOpen])

	if (!isOpen) return null

	return (
		<div
			className="fixed inset-0 z-[100] flex items-center justify-center sm:p-4"
			role="dialog"
			aria-modal="true"
			aria-labelledby="settings-modal-title"
		>
			{/* Overlay */}
			<div
				className="fixed inset-0 bg-black/50 transition-opacity duration-300"
				onClick={onClose}
				aria-hidden="true"
			/>

			{/* Modal Content - Responsive layout */}
		<div
				className="relative z-10 bg-base-100 w-full h-full sm:h-auto sm:max-h-[90vh] sm:rounded-2xl sm:shadow-2xl sm:max-w-2xl md:max-w-3xl lg:max-w-4xl overflow-hidden flex flex-col transform transition-all duration-300"
			onClick={(e) => e.stopPropagation()}
			tabIndex={-1}
		>
				{/* Header - Mobile: Title + Close | Desktop: Close only */}
				<div className="flex items-center justify-between p-4 sm:p-5 border-b border-base-300 lg:justify-end">
					{/* Mobile/Tablet: Section Title */}
					<h2 className="text-lg font-bold text-base-content lg:hidden">
						{selectedSection?.title || 'Settings'}
					</h2>

					{/* Close button */}
					<button
						onClick={onClose}
						className="btn btn-ghost btn-sm btn-circle hover:bg-base-200"
						aria-label="Close settings"
					>
						<X size={20} />
					</button>
				</div>

				{/* Content Wrapper */}
				<div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
					{/* Navigation - Mobile: Horizontal pills | Desktop: Vertical sidebar */}
					<nav className="lg:w-64 bg-base-100 lg:bg-base-200 border-b lg:border-b-0 lg:border-r border-base-300 overflow-x-auto lg:overflow-x-visible lg:overflow-y-auto">
						{/* Desktop: Settings Title */}
						<div className="hidden lg:block p-4 border-b border-base-300">
							<h2 className="text-lg font-semibold text-base-content">
								Settings
							</h2>
						</div>

						{/* Navigation Items */}
						<div className="flex lg:flex-col gap-2 p-3 lg:p-3">
								{sections.map((section) => {
									const Icon = section.icon
									const isActive = section.id === selectedSectionId

									return (
									<Button
										key={section.id}
												onClick={() => setSelectedSectionId(section.id)}
										variant={isActive ? 'primary' : 'ghost'}
										size="sm"
										leftIcon={<Icon size={18} />}
										className={`
											whitespace-nowrap lg:w-full lg:justify-start
											${isActive ? '!rounded-lg' : '!rounded-lg'}
										`}
												aria-label={`${section.title} settings section`}
												aria-current={isActive ? 'page' : undefined}
											>
										{section.title}
									</Button>
									)
								})}
						</div>
						</nav>

					{/* Content Area */}
			<div className="flex-1 bg-base-100 overflow-y-auto">
						{selectedSection && (
							<div className="p-4 sm:p-5 lg:p-6">
								{/* Section Header - Desktop only (mobile shows in modal header) */}
								<div className="hidden lg:block mb-6">
									<h3
										id="settings-modal-title"
										className="text-2xl font-bold text-base-content mb-2"
									>
										{selectedSection.title}
									</h3>
									{selectedSection.description && (
										<p className="text-sm text-base-content/70">
											{selectedSection.description}
										</p>
									)}
								</div>

								{/* Mobile/Tablet: Show description */}
								{selectedSection.description && (
									<div className="lg:hidden mb-4">
										<p className="text-sm text-base-content/70">
											{selectedSection.description}
										</p>
									</div>
								)}

				{/* Settings List */}
								<div className="space-y-0 bg-base-200/50 sm:bg-base-200 rounded-lg border border-base-300 overflow-hidden">
									{selectedSection.items.map((item, index) => (
										<div key={item.id}>
											<SettingRow setting={item} />
											{/* Divider between items (except last) */}
											{index < selectedSection.items.length - 1 && (
												<div className="border-b border-base-300 mx-4 sm:mx-6" />
											)}
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}

