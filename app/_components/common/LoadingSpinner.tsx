import classNames from 'classnames'

interface LoadingSpinnerProps {
	size?: 'xs' | 'sm' | 'md' | 'lg'
	color?: 'primary' | 'secondary' | 'accent' | 'neutral'
	text?: string
	fullScreen?: boolean
}

/**
 * Loading spinner component
 * Can be used inline or as a full-screen overlay
 */
export default function LoadingSpinner({
	size = 'md',
	color = 'primary',
	text,
	fullScreen = false,
}: LoadingSpinnerProps) {
	const spinner = (
		<div className="flex flex-col items-center justify-center gap-4">
			<span
				className={classNames('loading loading-spinner', `loading-${size}`, `text-${color}`)}
			/>
			{text && <p className="text-sm text-base-content/70">{text}</p>}
		</div>
	)

	if (fullScreen) {
		return (
			<div className="fixed inset-0 bg-base-100/80 backdrop-blur-sm z-50 flex items-center justify-center">
				{spinner}
			</div>
		)
	}

	return spinner
}


