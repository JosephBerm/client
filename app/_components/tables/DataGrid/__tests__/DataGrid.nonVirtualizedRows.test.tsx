import { beforeAll, afterAll, describe, expect, it, vi } from 'vitest'
import { render } from '@testing-library/react'
import type { ColumnDef } from '@tanstack/react-table'

import { DataGrid } from '../DataGrid'

interface TestRow {
	name: string
	quantity: number
}

const columns: ColumnDef<TestRow>[] = [
	{
		accessorKey: 'name',
		header: 'Name',
	},
	{
		accessorKey: 'quantity',
		header: 'Quantity',
	},
]

const data: TestRow[] = [
	{ name: 'Nitrile Gloves', quantity: 10 },
	{ name: 'Surgical Masks', quantity: 25 },
]

class ResizeObserverMock {
	observe() {}
	unobserve() {}
	disconnect() {}
}

describe('DataGrid row positioning', () => {
	beforeAll(() => {
		vi.stubGlobal('ResizeObserver', ResizeObserverMock)
	})

	afterAll(() => {
		vi.unstubAllGlobals()
	})

	it('does not absolutely position rows when virtualization is disabled', () => {
		const { container } = render(
			<DataGrid
				columns={columns}
				data={data}
				ariaLabel='Non-virtualized data grid'
				enableVirtualization={false}
				mobileBreakpoint={0}
			/>
		)

		const firstRow = container.querySelector('.data-grid-row[data-row-index="0"]') as HTMLElement | null
		expect(firstRow).not.toBeNull()
		expect(firstRow?.style.position).toBe('')
		expect(firstRow?.style.transform).toBe('')
	})
})
