import React from 'react'

function ProfilePreview(title: string) {
	return (
		<div className='ProfilePreview titled clickable flex justify-center items-center' data-title='Profile'>
			<div className='picture-container'>pfp</div>
		</div>
	)
}

export default ProfilePreview
