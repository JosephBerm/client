import React from 'react'

function AccountOverview() {
	type OverviewDetail = {
		title: string
		value: number
		selectedTime: number
		icon: string
	}

	const overviewDetails: OverviewDetail[] = [
		{
			title: 'Product Requests',
			value: 10,
			selectedTime: 7,
			icon: 'fa-solid fa-bell-concierge',
		},
		{
			title: 'Orders In Process',
			value: 37,
			selectedTime: 30,
			icon: 'fa-solid fa-truck',
		},
		{
			title: 'Total Orders Completed',
			value: 50,
			selectedTime: 90,
			icon: 'fa-solid fa-box',
		},
	]
	return (
		<section className='account-overviews'>
			{overviewDetails.map((overview, index) => (
				<div className='overview-container clickable' key={index}>
					<div className='details'>
						<h4>{overview.title}</h4>
						<span className='value'>{overview.value}</span>
						<span className='time-select'>last {overview.selectedTime} days</span>
					</div>
					<div className='icon-container'>
						<i className={overview.icon} />
					</div>
				</div>
			))}
		</section>
	)
}

export default AccountOverview
