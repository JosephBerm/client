/**
 * AuthDivider Component
 * 
 * Horizontal divider with "OR" text for separating auth options.
 * Animated show/hide for transitions.
 * 
 * @module LoginModal/AuthDivider
 */

'use client'

import {
	ANIMATION_CLASSES,
	LAYOUT_CLASSES,
	LINK_TEXT,
} from './LoginModal.constants'

/**
 * AuthDivider component props.
 */
interface AuthDividerProps {
	/** Whether to hide the divider */
	isHidden: boolean
}

/**
 * AuthDivider Component
 * 
 * Renders the "OR" divider between social login and email login.
 * 
 * @param props - Component props
 * @returns Divider section
 */
export default function AuthDivider({ isHidden }: AuthDividerProps) {
	return (
		<div
			className={`${ANIMATION_CLASSES.TRANSITION} ${
				isHidden
					? 'max-h-0 opacity-0 my-0'
					: 'max-h-20 opacity-100 my-4 sm:my-5 md:my-6'
			}`}
		>
			<div className={LAYOUT_CLASSES.DIVIDER_ROW}>
				<div className='flex-1 h-px bg-base-300' />
				<span className='text-xs sm:text-sm text-base-content/60 uppercase font-medium tracking-wider'>
					{LINK_TEXT.DIVIDER}
				</span>
				<div className='flex-1 h-px bg-base-300' />
			</div>
		</div>
	)
}

