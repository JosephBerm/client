import React from 'react'

type isBusyLoadingProps = {
	isBusy: boolean
}
function IsBusyLoading({ isBusy }: isBusyLoadingProps) {
	if (!isBusy) return

	return (
		<div className='isBusyLoading'>
			<h3>Loading...</h3>
		</div>
	)
}

export default IsBusyLoading
