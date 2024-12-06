import React, { useState, useEffect } from 'react'
import classNames from 'classnames'
import InputRadio from '@/components/InputRadio'

class TreeBranch<T> {
	id: string = crypto.randomUUID()
	isExpanded: boolean = false
	isSelected: boolean = false
	isDisabled: boolean = false
	branches?: TreeBranch<T>[]
	constructor(public item: T, public childKey: keyof T) {
		this.childKey = childKey
		this.item = item
		const children = item[childKey]
		if (Array.isArray(children)) {
			this.branches = children.map((child) => new TreeBranch(child, childKey))
		}
	}

	get children(): TreeBranch<T>[] {
		return this.branches || []
	}
}

type TreeSelectProps<T> = {
	list?: T[]
	label: keyof T | ((item: T) => string)
	childKey: keyof T
	onItemSelected: (selectedItem: T) => void
	branches?: TreeBranch<T>[]
}

function TreeSelect<T>({ list, label, childKey, branches, onItemSelected }: TreeSelectProps<T>) {
	const [treeItems, setTreeItems] = useState<TreeBranch<T>[]>([])

	useEffect(() => {
		if (list) setTreeItems(list.map((item) => new TreeBranch<T>(item, childKey)))
		else if (branches) {
			setTreeItems(branches)
		} else {
			setTreeItems([])
		}
	}, [list, childKey, branches])

	const getLabel = (item: T) => {
		if (label instanceof Function) {
			return label(item)
		}
		return item[label] as string
	}

	const expandIfHasChild = (branch: TreeBranch<T>) => {
		// Type guard to check if branch.item[childKey] is an array
		const children = branch.item[childKey]
		if (Array.isArray(children) && children.length > 0) {
			const updatedBranch = new TreeBranch(branch.item, childKey)
			updatedBranch.isExpanded = !branch.isExpanded

			const updatedTreeItems = treeItems.map((item) => (item === branch ? updatedBranch : item))
			setTreeItems(updatedTreeItems)
		} else {
			handleTreeItemSelection(branch)
		}
	}
	const handleTreeItemSelection = (root: TreeBranch<T>) => {
		if (root.isDisabled) return

		onItemSelected(root.item)
		root.isSelected = !root.isSelected
		if (root.branches) {
			root.branches.forEach((branch) => {
				branch.isSelected = root.isSelected
				branch.isDisabled = root.isSelected
			})
		}
		setTreeItems([...treeItems])
	}

	const isParentBranch = (branch: TreeBranch<T>) => {
		return branch.children.length > 0
	}
	const isSelectedOrHasSelected = (branch: TreeBranch<T>) => {
		if (branch.isSelected) return true
		return branch.children.some(isSelectedOrHasSelected)
	}
	return (
		<ul className='TreeSelect'>
			{treeItems.map((branch) => (
				<div
					className={classNames({ branch: true, selected: isSelectedOrHasSelected(branch) })}
					key={branch.id}>
					<div
						className={classNames({
							item: true,
							'parent-branch': isParentBranch(branch),
							disabled: branch.isDisabled,
							selected: branch.isSelected,
						})}
						onClick={() => handleTreeItemSelection(branch)}>
						<InputRadio value={branch.isSelected} />
						<li className='clickable'>
							{getLabel(branch.item)}
							<br />
						</li>
						{branch.children.length > 0 && (
							<button
								className='expand-btn'
								onClick={(e) => {
									e.stopPropagation()
									expandIfHasChild(branch)
								}}>
								<i
									className={classNames({
										'fa-solid': true,
										'fa-plus': !branch.isExpanded,
										'fa-minus expanded': branch.isExpanded,
									})}
								/>
							</button>
						)}
					</div>

					{branch.isExpanded && (
						<TreeSelect<T>
							branches={branch.children}
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
