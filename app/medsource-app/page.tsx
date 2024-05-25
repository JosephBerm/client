'use client'
import SectionPreviewer from '@/components/SectionPreviewer'
import { useAccountStore } from '@/src/stores/user'
import { Section } from '@/interfaces/Section'
import Table from '@/common/table'
import '@/styles/dashboard.css'

const Page = () => {
	const User = useAccountStore((state) => state.User)

	return (
		<div className='Dashboard'>
			<h1>Welcome {User.username}</h1>
		</div>
	)
}

export default Page
