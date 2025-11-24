'use client'

import { memo, useRef, useState, useEffect } from 'react'

import Image from 'next/image'
import Link from 'next/link'

import { Volume2, VolumeX, Play } from 'lucide-react'

import Button from '@_components/ui/Button'

import type { CarouselSlide as CarouselSlideType } from './types'

interface CarouselSlideProps {
	slide: CarouselSlideType
	isActive: boolean
	showGradientOverlay?: boolean
	className?: string
	style?: React.CSSProperties
}

/**
 * Individual carousel slide component
 * Supports images, videos, and text slides with controls and custom overlays
 */
const CarouselSlideComponent = memo(function CarouselSlide({
	slide,
	isActive,
	showGradientOverlay = false,
	className = '',
	style,
}: CarouselSlideProps) {
	const videoRef = useRef<HTMLVideoElement>(null)
	const [isMuted, setIsMuted] = useState(true)
	const [isPlaying, setIsPlaying] = useState(false)

	// Initialize video element (volume, muted state)
	useEffect(() => {
		if (slide.type === 'video' && videoRef.current) {
			const video = videoRef.current
			
			// Ensure volume is set (defaults to 1.0, but make it explicit)
			// Only set if not already set to avoid overriding user preferences
			if (video.volume === 0) {
				video.volume = 1.0
			}
			
			// Ensure muted state matches our state
			video.muted = isMuted
		}
	}, [slide.type, isMuted])

	// Handle video play/pause based on active state
	useEffect(() => {
		if (slide.type === 'video' && videoRef.current) {
			const video = videoRef.current

			// Event listeners to keep state in sync
			const handlePlay = () => setIsPlaying(true)
			const handlePause = () => setIsPlaying(false)

			video.addEventListener('play', handlePlay)
			video.addEventListener('pause', handlePause)

			if (isActive) {
				// Auto-play when slide becomes active (muted by default)
				// Ensure muted state is set before playing
				video.muted = isMuted
				video.play().catch(() => {
					// Autoplay may be blocked by browser
					setIsPlaying(false)
				})
			} else {
				// Pause when slide is not active
				video.pause()
				setIsPlaying(false)
			}

			return () => {
				video.removeEventListener('play', handlePlay)
				video.removeEventListener('pause', handlePause)
			}
		}
	}, [isActive, slide.type, isMuted])

	const handleMuteToggle = () => {
		if (videoRef.current) {
			const video = videoRef.current
			const newMutedState = !isMuted
			
			// Update muted state
			video.muted = newMutedState
			setIsMuted(newMutedState)
			
			// Ensure volume is set to maximum when unmuting
			if (!newMutedState) {
				video.volume = 1.0
			}
			
			// Ensure video is playing when unmuting (required for audio to work)
			// If video is paused, try to play it (user interaction allows this)
			if (!newMutedState && video.paused) {
				video.play().catch((error) => {
					console.warn('Failed to play video after unmuting:', error)
				})
			}
		}
	}

	const handlePlayPause = () => {
		if (videoRef.current) {
			if (isPlaying) {
				videoRef.current.pause()
			} else {
				void videoRef.current.play()
			}
			// State will be updated by event listeners
		}
	}

	// Handle video click to pause/play
	const handleVideoClick = (e: React.MouseEvent<HTMLVideoElement>) => {
		// Don't trigger if clicking on a button or interactive element
		const target = e.target as HTMLElement
		if (target.tagName === 'BUTTON' || target.closest('button')) {
			return
		}
		
		if (videoRef.current) {
			if (videoRef.current.paused) {
				void videoRef.current.play()
			} else {
				videoRef.current.pause()
			}
		}
	}

	// Get overlay position classes (mobile-first)
	const getOverlayPositionClasses = (position?: string) => {
		switch (position) {
			case 'top-left':
				return 'top-4 md:top-8 left-4 md:left-8 items-start text-left'
			case 'top-center':
				return 'top-4 md:top-8 left-1/2 -translate-x-1/2 items-center text-center'
			case 'top-right':
				return 'top-4 md:top-8 right-4 md:right-8 items-end text-right'
			case 'center':
				return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 items-center text-center'
			case 'bottom-left':
				return 'bottom-4 md:bottom-8 left-4 md:left-8 items-start text-left'
			case 'bottom-center':
				return 'bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 items-center text-center'
			case 'bottom-right':
				return 'bottom-4 md:bottom-8 right-4 md:right-8 items-end text-right'
			default:
				return 'bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 items-center text-center'
		}
	}

	// Render overlay content
	const renderOverlay = () => {
		if (!slide.overlay) {return null}

		const { title, heading, subheading, ctas, customContent, position = 'bottom-center' } = slide.overlay
		
		// Special handling for all bottom positions: horizontal layout (text left, buttons right)
		// This ensures all slides with bottom positioning use horizontal layout
		const isBottomPosition = position === 'bottom-center' || position === 'bottom-left' || position === 'bottom-right'
		
		if (isBottomPosition) {
			return (
				<>
					{/* Optional title - Top left, independent of overlay position */}
					{title && (
						<p className='absolute top-4 sm:top-6 md:top-8 left-4 sm:left-6 md:left-8 z-20 text-white text-lg sm:text-xl md:text-2xl lg:text-3xl font-normal italic drop-shadow-lg pointer-events-none tracking-wide'>
							{title}
						</p>
					)}
					
					{/* Horizontal layout container at bottom - Allow clicks to pass through except buttons */}
					<div className={`absolute bottom-4 md:bottom-8 z-20 flex flex-col md:flex-row md:items-end gap-4 md:gap-8 pointer-events-none ${
						position === 'bottom-left' 
							? 'left-4 md:left-8 right-4 md:right-8 md:justify-start' 
							: position === 'bottom-right'
							? 'left-4 md:left-8 right-4 md:right-8 md:justify-end'
							: 'left-4 md:left-8 right-4 md:right-8 md:justify-between'
					}`}>
						{/* Left Section: Text Content - Horizontal layout - Allow clicks to pass through */}
						<div className='flex flex-col gap-2 md:gap-3 flex-1 md:flex-initial md:max-w-2xl items-center md:items-start pointer-events-none'>
							{/* Heading */}
							{heading && (
								<h2 className='text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight drop-shadow-lg text-left md:whitespace-nowrap'>
									{heading}
								</h2>
							)}

							{/* Subheading */}
							{subheading && (
								<p className='text-base md:text-lg lg:text-xl text-white/90 leading-relaxed drop-shadow-md text-left'>{subheading}</p>
							)}

							{/* Custom content */}
							{customContent && <div>{customContent}</div>}
						</div>

						{/* Right Section: Buttons - Re-enable pointer events for buttons */}
						{ctas && ctas.length > 0 && (
							<div className='flex flex-col sm:flex-row gap-3 md:gap-4 shrink-0 max-w-[75%] self-center md:max-w-none md:self-auto pointer-events-auto'>
								{ctas.map((cta, index) => {
									// Map CTA variant to Button variant (Button doesn't support 'link', use 'ghost' instead)
									const buttonVariant = cta.variant === 'link' ? 'ghost' : (cta.variant || 'primary') as 'primary' | 'secondary' | 'accent' | 'ghost' | 'outline' | 'error' | 'success'
									
									const buttonContent = (
										<Button
											variant={buttonVariant}
											size='md'
											fullWidth={false}
											className='w-full sm:w-auto'
											onClick={cta.onClick}
											rightIcon={cta.variant === 'link' ? <span>→</span> : undefined}>
											{cta.label}
										</Button>
									)

									return cta.href ? (
										<Link key={index} href={cta.href} target={cta.target || '_self'}>
											{buttonContent}
										</Link>
									) : (
										<div key={index}>{buttonContent}</div>
									)
								})}
							</div>
						)}
					</div>
				</>
			)
		}

		// Default behavior for other positions (vertical stacking)
		const positionClasses = getOverlayPositionClasses(position)
		return (
			<>
				{/* Optional title - Top left, independent of overlay position */}
				{title && (
					<p className='absolute top-4 sm:top-6 md:top-8 left-4 sm:left-6 md:left-8 z-20 text-white text-lg sm:text-xl md:text-2xl lg:text-3xl font-normal italic drop-shadow-lg pointer-events-none tracking-wide'>
						{title}
					</p>
				)}
				<div className={`absolute ${positionClasses} z-20 flex flex-col gap-3 md:gap-4 max-w-2xl px-4 md:px-8 w-full sm:w-auto pointer-events-none`}>

					{/* Heading */}
					{heading && (
						<h2 className='text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight drop-shadow-lg text-center pointer-events-none'>
							{heading}
						</h2>
					)}

					{/* Subheading */}
					{subheading && (
						<p className='text-base md:text-lg lg:text-xl text-white/90 leading-relaxed drop-shadow-md text-center pointer-events-none'>{subheading}</p>
					)}

					{/* Custom content */}
					{customContent && <div className='pointer-events-none'>{customContent}</div>}

					{/* CTAs - Re-enable pointer events for buttons */}
					{ctas && ctas.length > 0 && (
						<div className='flex flex-col gap-3 md:gap-4 mt-2 md:mt-4 w-full items-center pointer-events-auto'>
							{ctas.map((cta, index) => {
								// Map CTA variant to Button variant (Button doesn't support 'link', use 'ghost' instead)
								const buttonVariant = cta.variant === 'link' ? 'ghost' : (cta.variant || 'primary') as 'primary' | 'secondary' | 'accent' | 'ghost' | 'outline' | 'error' | 'success'
								
								const buttonContent = (
									<Button
										variant={buttonVariant}
										size='md'
										fullWidth={false}
										className='w-full sm:w-auto'
										onClick={cta.onClick}
										rightIcon={cta.variant === 'link' ? <span>→</span> : undefined}>
										{cta.label}
									</Button>
								)

								return cta.href ? (
									<Link key={index} href={cta.href} target={cta.target || '_self'}>
										{buttonContent}
									</Link>
								) : (
									<div key={index}>{buttonContent}</div>
								)
							})}
						</div>
					)}
				</div>
			</>
		)
	}


	// Render media (image, video, or text)
	const renderMedia = () => {
		if (slide.type === 'text') {
			// Text-only slide - full height with centered content - Mobile-first
			return (
				<div className='flex items-center justify-center w-full h-full p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 bg-gradient-to-br from-base-200/50 via-base-200/40 to-base-300/30 min-w-0'>
					<div className='text-center px-2 sm:px-4 w-full max-w-full min-w-0'>
						{slide.text && (
							<h3 className='text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-base-content leading-tight tracking-tight break-words overflow-wrap-anywhere'>
								{slide.text}
							</h3>
						)}
						{slide.title && !slide.text && (
							<h3 className='text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-base-content leading-tight tracking-tight break-words overflow-wrap-anywhere'>
								{slide.title}
							</h3>
						)}
					</div>
				</div>
			)
		}

		if (slide.type === 'image') {
			return (
				<Image
					src={slide.src || ''}
					alt={slide.alt || slide.title || 'Carousel slide'}
					fill
					className='object-cover'
					sizes='100vw'
					priority={isActive}
					unoptimized={slide.src?.startsWith('http')}
				/>
			)
		}

		// Video
		return (
			<>
				<video
					ref={videoRef}
					src={slide.src}
					className='w-full h-full object-cover cursor-pointer'
					muted={isMuted}
					loop
					playsInline
					poster={slide.thumbnail}
					onClick={handleVideoClick}
					aria-label={slide.title || 'Video slide'}>
					{/* Caption track for accessibility - empty track as placeholder */}
					<track kind="captions" srcLang="en" label="English" />
					Your browser does not support the video tag.
				</video>

				{/* Mute Button - Top Right - Mobile-first sizing */}
				<button
					onClick={handleMuteToggle}
					className='absolute top-3 right-3 sm:top-3.5 sm:right-3.5 md:top-4 md:right-4 z-30 btn btn-circle btn-sm sm:btn-sm md:btn-md min-h-[44px] min-w-[44px] bg-black/30 hover:bg-black/50 active:bg-black/60 border border-white/20 text-white backdrop-blur-sm transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 hover:scale-110 active:scale-95'
					aria-label={isMuted ? 'Unmute video' : 'Mute video'}
					type='button'>
					{isMuted ? <VolumeX size={16} className='sm:w-4 sm:h-4 md:w-5 md:h-5' /> : <Volume2 size={16} className='sm:w-4 sm:h-4 md:w-5 md:h-5' />}
				</button>

				{/* Centered Play/Pause Button Overlay - Only show when paused - Mobile-first sizing */}
				{!isPlaying && (
					<button
						onClick={handlePlayPause}
						className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 btn btn-circle btn-md sm:btn-md md:btn-lg min-h-[44px] min-w-[44px] bg-white/10 hover:bg-white/20 active:bg-white/30 border border-white/40 text-white backdrop-blur-sm transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 hover:scale-110 active:scale-95'
						aria-label='Play video'
						type='button'>
						<Play size={28} fill='white' className='ml-0.5 sm:ml-1 sm:w-8 sm:h-8 md:w-10 md:h-10' />
					</button>
				)}
			</>
		)
	}

	// Determine slide height based on type - Mobile-first approach
	const getSlideHeight = () => {
		if (slide.type === 'text') {
			// Text slides: reduced height for more compact presentation - Mobile-first
			return 'h-[160px] sm:h-[180px] md:h-[200px] lg:h-[220px] xl:h-[240px]'
		}
		// Image and video slides use the original aspect-video height - Mobile-first
		return 'aspect-video min-h-[400px] sm:min-h-[450px] md:min-h-[550px] lg:min-h-[650px] xl:min-h-[750px] 2xl:min-h-[850px]'
	}

	return (
		<div 
			className={`shrink-0 w-full max-w-full overflow-hidden ${className}`}
			style={style}>
			<div className={`relative w-full max-w-full ${getSlideHeight()} flex`}>
				{/* Media (Image, Video, or Text) */}
				{renderMedia()}

				{/* Bottom Gradient Overlay - Only for image/video slides with overlays */}
				{showGradientOverlay && slide.overlay && slide.type !== 'text' && (
					<>
						{/* Gradient fade section - smooth transition from transparent to gray */}
						<div className='absolute bottom-0 left-0 right-0 h-[45%] md:h-[40%] bg-gradient-to-t from-base-content/70 via-base-content/50 to-transparent pointer-events-none z-10' />
						{/* Solid color zone at bottom with fade at top (30-35% of total height) */}
						<div className='absolute bottom-0 left-0 right-0 h-[30%] md:h-[25%] bg-gradient-to-t from-base-content/80 via-base-content/70 to-transparent pointer-events-none z-10' />
					</>
				)}

				{/* Overlay Content - Only for image/video slides */}
				{slide.type !== 'text' && renderOverlay()}

				{/* Fallback title if no overlay - Only for image/video slides */}
				{!slide.overlay && slide.title && slide.type !== 'text' && (
					<div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6 z-10'>
						<p className='text-white text-lg md:text-xl font-semibold'>{slide.title}</p>
					</div>
				)}
			</div>
		</div>
	)
})

CarouselSlideComponent.displayName = 'CarouselSlide'

export default CarouselSlideComponent

