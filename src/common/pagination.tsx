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

	let startPage = Math.max(currentPage - 3, 1)
	let endPage = Math.min(startPage + 6, pagesCount)

	if (endPage - startPage < 6) {
		startPage = Math.max(endPage - 6, 1)
	}

	const pages = _.range(startPage, endPage + 1, 1)

	return (
		<nav>
			<ul className='pagination'>
				<li
					onClick={() => onPageChange(1)}
					className='page-item clickable magnify'
				>
					<a className='page-link'>&laquo;</a>
				</li>
				{pages.map((page) => (
					<li
						onClick={() => onPageChange(page)}
						key={page}
						className={
							page === currentPage
								? 'page-item active clickable magnify'
								: 'page-active clickable magnify'
						}
					>
						<a className='page-link'>{page}</a>
					</li>
				))}
				<li
					onClick={() => onPageChange(pagesCount)}
					className='page-item clickable magnify'
				>
					<a className='page-link'>&raquo;</a>
				</li>
			</ul>
		</nav>
	)
}

export default Pagination
