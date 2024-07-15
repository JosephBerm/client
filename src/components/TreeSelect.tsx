import React, { useState, useEffect } from 'react'
import classNames from 'classnames'
import InputRadio from '@/components/InputRadio'

class TreeBranch<T> {
	isExpanded: boolean = false
	isSelected: boolean = false
	constructor(public item: T, public childKey: keyof T) {
		this.item = item
		this.childKey = childKey
	}

	get children(): T[] {
		return this.item[this.childKey] as T[]
	}
}

type TreeSelectProps<T> = {
	list: T[]
	label: keyof T | ((item: T) => string)
	childKey: keyof T
	onItemSelected: (selectedItem: T) => void
}

function TreeSelect<T>({ list, label, childKey, onItemSelected }: TreeSelectProps<T>) {
	const [treeItems, setTreeItems] = useState<TreeBranch<T>[]>([])

	useEffect(() => {
		setTreeItems(list.map((item) => new TreeBranch(item, childKey)))
	}, [list])

	const getLabel = (item: T) => {
		if (label instanceof Function) {
			return label(item)
		}
		return item[label] as string
	}

	const expandIfHasChild = (branch: TreeBranch<T>) => {
		if (Array.isArray(branch.item[childKey]) && branch.item[childKey].length) {
			branch.isExpanded = !branch.isExpanded
			setTreeItems([...treeItems])
		} else {
			handleTreeItemSelection(branch)
		}
	}
	const handleTreeItemSelection = (branch: TreeBranch<T>) => {
		onItemSelected(branch.item)
		branch.isSelected = !branch.isSelected
		setTreeItems([...treeItems])
	}

	const isParentBranch = (branch: TreeBranch<T>) => {
		return branch.children.length > 0
	}
	const isSelectedOrHasSelected = (branch: TreeBranch<T>) => {
		if (branch.isSelected) return true
		if (isParentBranch(branch)) {
			for (const child of branch.children) {
				// THIS WON'T WORK BECAUSE THE CHILD IS NOT A TREEITEMS OBJ
				// const childBranch = treeItems.find((item) => item.item === child)
				// if (childBranch && isSelectedOrHasSelected(childBranch)) {
				// 	return true
				// }
			}
		}

		return false
	}
	return (
		<ul className='TreeSelect'>
			{treeItems.map((branch, index) => (
				<div className={classNames({ branch: true, selected: isSelectedOrHasSelected(branch) })} key={index}>
					<div className={classNames({ item: true, 'parent-branch': isParentBranch(branch) })}>
						<InputRadio
							value={branch.isSelected}
							handleToggleSelection={() => handleTreeItemSelection(branch)}
						/>
						<li className='clickable' onClick={() => expandIfHasChild(branch)}>
							{getLabel(branch.item)}
							<br />
						</li>
					</div>

					{branch.isExpanded && (
						<TreeSelect<T>
							list={branch.children}
							label={label}
							childKey={childKey}
							onItemSelected={onItemSelected}
						/>
					)}
				</div>
			))}
		</ul>
	)
}

export default TreeSelect
