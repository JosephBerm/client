/**
 * Settings Modal Component
 *
 * MAANG-level settings modal with two-pane layout and Framer Motion animations.
 * Features a left sidebar for section navigation and right content area for settings.
 *
 * **Portal Rendering:**
 * Uses React Portal to render at document.body, ensuring the modal is never
 * clipped by parent containers with overflow:hidden.
 *
 * **Animation System:**
 * - Spring physics for natural, organic feel (Apple, Linear, Notion standard)
 * - AnimatePresence for smooth exit animations
 * - Respects prefers-reduced-motion and data-reduced-motion
 * - Separate backdrop/content animations for depth perception
 *
 * **Features:**
 * - Two-pane layout (sidebar + content)
 * - Section-based navigation with icons
 * - Active state indication
 * - Scalable configuration (easy to add new sections)
 * - Type-safe settings structure
 * - Fully accessible (ARIA labels, keyboard navigation)
 * - Mobile-first responsive design
 *
 * @module SettingsModal
 */

'use client'

import { useState, useMemo, useEffect, useRef, useCallback } from 'react'

import { createPortal } from 'react-dom'

import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

import { getSettingsSections } from '@_features/settings'

import { useModal } from '@_shared'

import { checkReducedMotion, REDUCED_MOTION_VARIANTS, MODAL_ANIMATION } from '@_components/common/animations'
import Button from '@_components/ui/Button'

import AppearanceSetting from './AppearanceSetting'
import AdminViewSetting from './AdminViewSetting'
import ReducedMotionSetting from './ReducedMotionSetting'
import SettingRow from './SettingRow'

// ============================================================================
// TYPES
// ============================================================================

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

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Settings Modal Component
 *
 * Comprehensive settings modal with two-pane layout for organized settings management.
 * Uses React Portal and Framer Motion for MAANG-level polish.
 *
 * @param props - Settings modal component props
 * @returns Settings modal element or null if not open
 */
export default function SettingsModal({ isOpen, onClose, defaultSectionId }: SettingsModalProps) {
	// Component map for settings - injected by UI layer (clean architecture)
	const componentMap = {
		appearance: AppearanceSetting,
		'reduced-motion': ReducedMotionSetting,
		'admin-view': AdminViewSetting,
	}

	const sections = getSettingsSections(componentMap)

	// Refs for modal and focus management
	const modalRef = useRef<HTMLDivElement>(null)
	const closeButtonRef = useRef<HTMLButtonElement>(null)
	const sectionButtonRefs = useRef<Map<string, HTMLButtonElement>>(new Map())
	const liveRegionRef = useRef<HTMLDivElement>(null)

	// SSR-safe portal mounting state
	const [isMounted, setIsMounted] = useState(false)

	// Reduced motion preference state
	const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

	// Mount effect for SSR safety
	useEffect(() => {
		setIsMounted(true)
	}, [])

	// Reduced motion detection
	useEffect(() => {
		if (typeof window === 'undefined') return

		setPrefersReducedMotion(checkReducedMotion())

		const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
		const handleChange = () => setPrefersReducedMotion(checkReducedMotion())

		const observer = new MutationObserver(handleChange)
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['data-reduced-motion'],
		})

		mediaQuery.addEventListener('change', handleChange)

		return () => {
			mediaQuery.removeEventListener('change', handleChange)
			observer.disconnect()
		}
	}, [])

	// Animation variants - memoized for performance
	const backdropVariants = useMemo(() => {
		if (prefersReducedMotion) {
			return {
				hidden: { opacity: 0 },
				visible: { opacity: 1, transition: { duration: 0.001 } },
				exit: { opacity: 0, transition: { duration: 0.001 } },
			}
		}

		return {
			hidden: { opacity: 0 },
			visible: { opacity: 1, transition: MODAL_ANIMATION.backdrop },
			exit: { opacity: 0, transition: MODAL_ANIMATION.backdrop },
		}
	}, [prefersReducedMotion])

	const contentVariants = useMemo(() => {
		if (prefersReducedMotion) {
			return REDUCED_MOTION_VARIANTS
		}

		return {
			hidden: {
				opacity: 0,
				scale: MODAL_ANIMATION.distance.scale,
				y: MODAL_ANIMATION.distance.y,
			},
			visible: {
				opacity: 1,
				scale: 1,
				y: 0,
				transition: MODAL_ANIMATION.content.spring,
			},
			exit: {
				opacity: 0,
				scale: MODAL_ANIMATION.distance.scale,
				y: MODAL_ANIMATION.distance.y,
				transition: MODAL_ANIMATION.content.exit,
			},
		}
	}, [prefersReducedMotion])

	// Get default section (first section if not specified)
	const defaultSection = useMemo(() => {
		if (defaultSectionId) {
			return sections.find((s) => s.id === defaultSectionId) || sections[0]
		}
		return sections[0]
	}, [sections, defaultSectionId])

	const [selectedSectionId, setSelectedSectionId] = useState<string>(defaultSection?.id || sections[0]?.id || '')

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

	// Common modal behaviors (focus trap, escape key, body scroll lock)
	useModal(modalRef, isOpen, onClose, {
		closeOnEscape: true,
		lockBodyScroll: true,
		initialFocus: closeButtonRef,
		restoreFocus: true,
	})

	// Announce section changes to screen readers
	useEffect(() => {
		if (isOpen && selectedSection && liveRegionRef.current) {
			liveRegionRef.current.textContent = `Settings section changed to ${selectedSection.title}`
			setTimeout(() => {
				if (liveRegionRef.current) {
					liveRegionRef.current.textContent = ''
				}
			}, 1000)
		}
	}, [isOpen, selectedSection])

	// Handle keyboard navigation for sections
	useEffect(() => {
		if (!isOpen) return

		const handleKeyDown = (e: KeyboardEvent) => {
			const { activeElement } = document
			const isSectionButton = Array.from(sectionButtonRefs.current.values()).includes(
				activeElement as HTMLButtonElement
			)

			if (!isSectionButton) return

			const currentIndex = sections.findIndex((s) => s.id === selectedSectionId)
			let newIndex = currentIndex

			switch (e.key) {
				case 'ArrowDown':
				case 'ArrowRight':
					e.preventDefault()
					newIndex = (currentIndex + 1) % sections.length
					break
				case 'ArrowUp':
				case 'ArrowLeft':
					e.preventDefault()
					newIndex = currentIndex === 0 ? sections.length - 1 : currentIndex - 1
					break
				case 'Home':
					e.preventDefault()
					newIndex = 0
					break
				case 'End':
					e.preventDefault()
					newIndex = sections.length - 1
					break
				default:
					return
			}

			const newSection = sections[newIndex]
			if (newSection) {
				setSelectedSectionId(newSection.id)
				const buttonRef = sectionButtonRefs.current.get(newSection.id)
				if (buttonRef) {
					setTimeout(() => buttonRef.focus(), 0)
				}
			}
		}

		window.addEventListener('keydown', handleKeyDown)
		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [isOpen, sections, selectedSectionId])

	// Event handlers
	const handleOverlayClick = useCallback(
		(e: React.MouseEvent<HTMLDivElement>) => {
			if (e.target === e.currentTarget) {
				onClose()
			}
		},
		[onClose]
	)

	const handleOverlayKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLDivElement>) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault()
				onClose()
			}
		},
		[onClose]
	)

	const handleContentClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
		e.stopPropagation()
	}, [])

	// Don't render portal until mounted (SSR-safe)
	if (!isMounted) return null

	// Portal renders modal at document.body to escape container overflow constraints
	return createPortal(
		<AnimatePresence mode='wait'>
			{isOpen && (
				<>
					{/* Screen reader live region for announcements */}
					<div
						ref={liveRegionRef}
						role='status'
						aria-live='polite'
						aria-atomic='true'
						className='sr-only'
					/>

					<div
						className='fixed inset-0 z-100 flex items-end sm:items-center justify-center p-0 sm:p-4'
						role='dialog'
						aria-modal='true'
						aria-labelledby='settings-modal-title'>
						{/* Backdrop Overlay */}
						<motion.div
							key='settings-backdrop'
							variants={backdropVariants}
							initial='hidden'
							animate='visible'
							exit='exit'
							className='fixed inset-0 bg-black/50 backdrop-blur-[2px]'
							onClick={handleOverlayClick}
							onKeyDown={handleOverlayKeyDown}
							role='button'
							tabIndex={-1}
							aria-label='Close settings'
							aria-hidden='false'
						/>

						{/* Modal Content */}
						{/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/click-events-have-key-events */}
						<motion.div
							ref={modalRef}
							key='settings-content'
							variants={contentVariants}
							initial='hidden'
							animate='visible'
							exit='exit'
							className={`
								relative z-10
								bg-base-100
								w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl
								h-full sm:h-auto sm:max-h-[90vh]
								rounded-t-2xl sm:rounded-2xl
								shadow-2xl
								overflow-hidden
								flex flex-col
								focus:outline-none
							`}
							onClick={handleContentClick}
							role='dialog'
							tabIndex={-1}>
							{/* Header - Mobile: Title + Close | Desktop: Close only */}
							<div className='flex items-center justify-between p-4 sm:p-5 border-b border-base-300 lg:justify-end shrink-0'>
								{/* Mobile/Tablet: Section Title */}
								<h2 className='text-lg font-bold text-base-content lg:hidden leading-tight'>
									{selectedSection?.title || 'Settings'}
								</h2>

								{/* Close button */}
								<Button
									ref={closeButtonRef}
									onClick={onClose}
									variant='ghost'
									size='sm'
									className='btn-circle hover:bg-base-200 focus:outline-2 focus:outline-offset-2 focus:outline-primary transition-colors duration-150'
									aria-label='Close settings'
									leftIcon={<X size={20} />}
								/>
							</div>

							{/* Content Wrapper */}
							<div className='flex flex-col lg:flex-row flex-1 overflow-hidden'>
								{/* Navigation - Mobile: Horizontal pills | Desktop: Vertical sidebar */}
								<nav className='lg:w-64 bg-base-100 lg:bg-base-200 border-b lg:border-b-0 lg:border-r border-base-300 overflow-x-auto lg:overflow-x-visible lg:overflow-y-auto shrink-0'>
									{/* Desktop: Settings Title */}
									<div className='hidden lg:block p-4 border-b border-base-300'>
										<h2 className='text-lg font-semibold text-base-content'>Settings</h2>
									</div>

									{/* Navigation Items */}
									<div
										className='flex lg:flex-col gap-2 p-3'
										role='tablist'
										aria-label='Settings sections'>
										{sections.map((section) => {
											const Icon = section.icon
											const isActive = section.id === selectedSectionId

											return (
												<Button
													key={section.id}
													ref={(el) => {
														if (el) {
															sectionButtonRefs.current.set(section.id, el)
														} else {
															sectionButtonRefs.current.delete(section.id)
														}
													}}
													onClick={() => {
														setSelectedSectionId(section.id)
														const buttonRef = sectionButtonRefs.current.get(section.id)
														if (buttonRef) {
															setTimeout(() => buttonRef.focus(), 0)
														}
													}}
													variant={isActive ? 'primary' : 'ghost'}
													size='sm'
													leftIcon={<Icon size={18} />}
													className='whitespace-nowrap lg:w-full lg:justify-start focus:outline-2 focus:outline-offset-2 focus:outline-primary rounded-lg'
													role='tab'
													id={`settings-tab-${section.id}`}
													aria-selected={isActive}
													aria-controls={`settings-section-${section.id}`}
													tabIndex={isActive ? 0 : -1}
													aria-label={`${section.title} settings section`}>
													{section.title}
												</Button>
											)
										})}
									</div>
								</nav>

								{/* Content Area */}
								<div
									className='flex-1 bg-base-100 overflow-y-auto overscroll-contain'
									role='tabpanel'
									id={`settings-section-${selectedSection?.id}`}
									aria-labelledby={`settings-tab-${selectedSection?.id}`}>
									{selectedSection && (
										<div className='p-4 sm:p-5 lg:p-6'>
											{/* Section Header - Desktop only */}
											<div className='hidden lg:block mb-6'>
												<h3
													id='settings-modal-title'
													className='text-xl md:text-2xl font-bold text-base-content mb-2 leading-tight'>
													{selectedSection.title}
												</h3>
												{selectedSection.description && (
													<p className='text-sm text-base-content/70'>
														{selectedSection.description}
													</p>
												)}
											</div>

											{/* Mobile/Tablet: Show description */}
											{selectedSection.description && (
												<div className='lg:hidden mb-4'>
													<p className='text-sm text-base-content/70'>
														{selectedSection.description}
													</p>
												</div>
											)}

											{/* Settings List */}
											<div className='space-y-0 bg-base-200/50 sm:bg-base-200 rounded-lg border border-base-300 overflow-hidden'>
												{selectedSection.items.map((item, index) => (
													<div key={item.id}>
														<SettingRow setting={item} />
														{/* Divider between items (except last) */}
														{index < selectedSection.items.length - 1 && (
															<div className='border-b border-base-300 mx-4 sm:mx-6' />
														)}
													</div>
												))}
											</div>
										</div>
									)}
								</div>
							</div>
						</motion.div>
					</div>
				</>
			)}
		</AnimatePresence>,
		document.body
	)
}
