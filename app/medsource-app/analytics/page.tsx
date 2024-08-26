'use client'

import React, { useState, useEffect } from 'react'
import FinanceNumbers from '@/classes/FinanceNumbers'
import API from '@/services/api'

function Page() {
	const [financeNumbers, setFinanceNumbers] = useState(new FinanceNumbers())
	const getFinanceNumbers = async () => {
		try {
			const { data } = await API.Finance.getFinanceNumbers()
			if (data.statusCode !== 200 || !data.payload)
				throw new Error(data?.message ?? 'An error occurred while fetching finance numbers')

			console.log('FINANCE NUMBERS', data.payload)
			setFinanceNumbers(new FinanceNumbers(data.payload))
		} catch (e) {
			console.error('Error fetching finance numbers', e)
		}
	}

	useEffect(() => {
		getFinanceNumbers()
	}, [])

	return (
		<div className='page-container'>
			<div className='page-header'>
				<h2 className='page-title'>Analytics</h2>
			</div>
		</div>
	)
}

export default Page
