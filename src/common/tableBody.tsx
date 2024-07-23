import React, { ReactNode, useCallback } from 'react';
import { TableProps, TableColumn } from '@/interfaces/Table';
import _ from 'lodash';

const TableBody = React.memo(<T extends object>(props: TableProps<T>) => {
	const { data, columns, cssRowClass, onRowClick } = props;

	const renderCell = useCallback((item: T, column: TableColumn<T>): ReactNode => {
		if (typeof column.content === 'function') {
			const content = column.content(item);
			return React.isValidElement(content) ? content : null;
		}
		return column.name ? _.get(item, column.name) as ReactNode : null;
	}, []);

	const getRowClass = useCallback((item: T): string => {
		let className = 'row';
		if (cssRowClass) className += ` ${cssRowClass(item)}`;
		if (onRowClick) className += ' clickable';
		return className;
	}, [cssRowClass, onRowClick]);

	const handleRowClick = useCallback((item: T) => {
		if (onRowClick) onRowClick(item);
	}, [onRowClick]);

	const getTdKey = useCallback((item: T, columnInd: number): string => {
		const key = (item as any).name || (item as any).key || (item as any).desc || (item as any).description || (item as any).label || (item as any).title;
		const returnKey = `${key}-${columnInd}`
		return returnKey;
	}, []);

	return (
		<tbody>
			{data.map((row, rowIndex) => (
				<tr key={rowIndex} className={getRowClass(row)} onClick={() => handleRowClick(row)}>
					{columns.map((column, columnIndex) => (
						<td key={getTdKey(row, columnIndex)} data-label={column.label}>
							{renderCell(row, column)}
						</td>
					))}
				</tr>
			))}
		</tbody>
	);
});

export default TableBody;
