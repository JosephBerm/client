'use client'
import { useAccountStore } from '@/src/stores/user'

const Page = () => {

	const User = useAccountStore(state => state.User);


	return (
		<>
			<h1>Welcome {User.username}</h1>
		</>
	)
}

export default Page
