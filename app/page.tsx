import Link from 'next/link'

export default function Home() {
	return (
		<main className='flex flex-col items-center justify-center w-full pt-10'>
			<h1>Home</h1>
			<Link href='/login'>
				<span className='route-link'>Login</span>
			</Link>
		</main>
	)
}
