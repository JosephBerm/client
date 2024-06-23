import React from 'react'
import { useAccountStore } from '@/src/stores/user'
import Image from 'next/image'

function ProfilePicture() {
	const { User: UserFromStore } = useAccountStore((state) => state)

	const { profilePictureUrl } = UserFromStore
	return (
		<div className='ProfilePicture'>
			<Image
				priority
				src='https://img.freepik.com/free-photo/close-up-portrait-young-bearded-man-white-shirt-jacket-posing-camera-with-broad-smile-isolated-gray_171337-629.jpg?t=st=1719099683~exp=1719103283~hmac=aa0b160ef8dcece4302233160a015c293bd99f476a02db05d1cbfe38a7b7a0d3&w=996'
				alt='profile picture'
				width='400'
				height='400'
			/>
			{/* {profilePictureUrl?.length >= 0 ? (
				<Image priority src={profilePictureUrl} alt='profile picture' />
			) : (
				<i class='fa-solid fa-user'></i>
			)} */}
		</div>
	)
}

export default ProfilePicture
