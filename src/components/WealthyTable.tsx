import React from 'react'

interface TableProps {
	headers: string[]
	data: any[]
}

const WealthyTable: React.FC<TableProps> = ({ headers, data }) => {
	return (
		<div className='custom-table'>
			<div className='custom-table-header'>
				{headers.map((header, index) => (
					<div key={index} className='custom-table-cell header-cell'>
						{header}
					</div>
				))}
			</div>
			<div className='custom-table-body'>
				{data.map((row, rowIndex) => (
					<div key={rowIndex} className='custom-table-row'>
						{headers.map((header, colIndex) => (
							<div key={colIndex} className='custom-table-cell'>
								<div className='mobile-header'>{header}</div>
								{row[header]}
							</div>
						))}
					</div>
				))}
			</div>
		</div>
	)
}

export default WealthyTable
