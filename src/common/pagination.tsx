import React from 'react'
import _ from 'lodash'

interface PaginationArgs {
	itemsCount: number
	pageSize: number
	currentPage: number
	onPageChange: (page: number) => void
}
const Pagination = ({ itemsCount, pageSize, currentPage, onPageChange }: PaginationArgs) => {
	const pagesCount = Math.ceil(itemsCount / pageSize)
	console.log('itemsCount', itemsCount)
	console.log('pageSize', pageSize)

	// console.log('currentPage', currentPage)
	// console.log('pagesCount', pagesCount)
	if (pagesCount === 1) return null
	const pages = _.range(1, pagesCount + 1)
	return (
		<nav>
			<ul className='pagination'>
				{pages.map((page) => (
					<li
						key={page}
						className={
							page === currentPage
								? 'page-item active clickable magnify'
								: 'page-active clickable magnify'
						}>
						<a onClick={() => onPageChange(page)} className='page-link'>
							{page}
						</a>
					</li>
				))}
			</ul>
		</nav>
	)
}

export default Pagination
