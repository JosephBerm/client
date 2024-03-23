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

	if (pagesCount === 1) return null
	const pages = _.range(1, pagesCount + 1)
	return (
		<nav>
			<ul className='pagination'>
				{pages.map((page) => (
					<li
						onClick={() => onPageChange(page)}
						key={page}
						className={
							page === currentPage
								? 'page-item active clickable magnify'
								: 'page-active clickable magnify'
						}>
						<a className='page-link'>{page}</a>
					</li>
				))}
			</ul>
		</nav>
	)
}

export default Pagination
