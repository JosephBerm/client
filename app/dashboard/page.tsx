'use client'
import SectionPreviewer from '@/components/SectionPreviewer'
import { useAccountStore } from '@/src/stores/user'
import { Section } from '@/interfaces/Section'
import Table from '@/common/table'
import '@/styles/dashboard.css'
import FloatingMenuTimeSelect from '@/components/FloatingMenuTimeSelect'

const Page = () => {
	const User = useAccountStore((state) => state.User)

	const sections: Section[] = [
		{
			header: {
				title: 'Your Performance',
				action: (
					<FloatingMenuTimeSelect onChange={(option: string) => handlePerformanceTimeLapseChange(option)} />
				),
			},
			children: (
				<div className='performance-chart'>
					<div>Chart Component showing the data</div>
				</div>
			),
		},
		{
			header: {
				title: 'Hottest Products',
				action: (
					<FloatingMenuTimeSelect
						onChange={(option: string) => handleHottestProductsTimeLapseChange(option)}
					/>
				),
			},
			children: (
				<div className='performance-chart'>
					<div>Chart Component showing the data</div>
				</div>
			),
			footer: (
				<div className='footer'>
					<a className='inline-link text-sm'>
						See All
						<i className='fa-solid fa-arrow-right-long relative left-2' />
					</a>
				</div>
			),
		},
		{
			header: {
				title: 'Shipping Statuses',
			},
			children: (
				<div className='performance-chart'>
					{/* <Table /> */}
					<span>company name</span>
					<span>order made</span>
					<span>status with enum</span>
					<span>action to mark as completed</span>
				</div>
			),
			footer: (
				<div className='footer'>
					<a className='inline-link text-sm'>
						See All
						<i className='fa-solid fa-arrow-right-long relative left-2' />
					</a>
				</div>
			),
		},
		{
			header: {
				title: 'Returns & Refunds Requests',
			},
			children: (
				<div className='performance-chart'>
					{/* <Table /> */}
					<span>company name</span>
					<span>refund request made</span>
					<span>status with enum</span>
					<span>action to mark as completed. Should be a confirmation number?</span>
				</div>
			),
			footer: (
				<div className='footer'>
					<a className='inline-link text-sm'>
						See All
						<i className='fa-solid fa-arrow-right-long relative left-2' />
					</a>
				</div>
			),
		},
	]

	const handlePerformanceTimeLapseChange = (option: string) => {
		console.log('Performance timelapse changed to', option)
	}
	const handleHottestProductsTimeLapseChange = (option: string) => {
		console.log('Hottest Products timelapse changed to', option)
	}

	return (
		<div className='Dashboard'>
			<h1>Welcome {User.username}</h1>

			<div className='sections-container'>
				{sections.map((section, index) => (
					<SectionPreviewer
						key={index}
						header={section.header}
						footer={section.footer}
						cssClass={section.cssClass}
						inLineStyle={section.inLineStyle}>
						{section.children}
					</SectionPreviewer>
				))}
			</div>
		</div>
	)
}

export default Page
