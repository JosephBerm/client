import React, { useState, useEffect } from 'react'
import CustomerSummary, { OverviewDetail } from '@/classes/Base/CustomerSummary'
import { toast } from 'react-toastify'

import API from '@/services/api'

function AccountOverview() {
	const [summary, setSummary] = useState<CustomerSummary>(new CustomerSummary({}))
	const [isLoadingData, setIsLoadingData] = useState<boolean>(false)

	const fetchSummary = async () => {
		try {
			setIsLoadingData(true)
			const { data } = await API.Accounts.getDashboardSummary()
			if (data?.payload) setSummary(new CustomerSummary(data.payload))
		} catch (err: any) {
			console.warn(err)
			toast.error(err)
		} finally {
			setIsLoadingData(false)
		}
	}

	useEffect(() => {
		fetchSummary()
	}, [])

	return (
		<section className='account-overviews'>
			{summary.GenerateOverviewDetails().map((overview, index) => (
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
