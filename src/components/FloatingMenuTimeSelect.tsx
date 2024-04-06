import React, { useMemo } from 'react'
import FloatingMenu from '@/common/FloatingMenu'

type FloatingMenuTimeSelectProps = {
	onChange: Function
}

function FloatingMenuTimeSelect({ onChange: handleChange }: FloatingMenuTimeSelectProps) {
	const options = useMemo(() => ['Today', 'Week', 'Month', 'Year', 'YTD', 'All Time'], [])

	return (
		<div className='FloatingMenuTimeSelect w-full'>
			<FloatingMenu options={options} onChange={handleChange} />
		</div>
	)
}

export default FloatingMenuTimeSelect
