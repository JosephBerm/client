import { create } from 'zustand'
import React, { Ref, RefObject } from 'react'

interface Dropdown {
	id: number
	isOpen: boolean
	ref: React.RefObject<HTMLDivElement>
}

interface DropdownState {
	dropdowns: Map<number, Dropdown>

	addDropdown: (dropdownRef: RefObject<HTMLDivElement>) => number
	removeDropdown: (id: number) => void
	toggleDropdown: (id: number, isOpen: boolean) => void
	closeAll: () => void
	isDropdownOpen: (id: number) => boolean
	initializeListener: () => VoidAnonymousFunction
	getOpenedDropdown: () => Dropdown | undefined
}

type VoidAnonymousFunction = () => void

const useDropdownStore = create<DropdownState>((set, get) => ({
	// How many dropdowns could possibly be open at once? If it's a small number, you could use a Set instead of an array.

	//TODO: Improve run-time performance by using a Map instead of an array. { id: Dropdown }. This will allow for O(1) lookups.

	// TODO: Feature could use a Map until the number of dropdowns is large enough to warrant a performance improvement.
	// Create a function to convert the Map to an array when the number of dropdowns is large enough to warrant a performance improvement.

	dropdowns: new Map<number, Dropdown>(),
	addDropdown: (dropdownRef: RefObject<HTMLDivElement>) => {
		let newId: number = 1
		set((state) => {
			// Calculate new ID
			const keys = Array.from(state.dropdowns.keys())
			if (keys.length > 0) {
				newId = Math.max(...keys) + 1
			}
			// Add new dropdown to Map
			const newDropdown = {
				id: newId,
				isOpen: false,
				ref: dropdownRef,
			}

			state.dropdowns.set(newId, newDropdown)

			return { dropdowns: new Map(state.dropdowns) }
		})
		return newId
	},

	removeDropdown: (id) =>
		set((state) => {
			state.dropdowns.delete(id)

			// Recreate Map to trigger re-render
			return { dropdowns: new Map(state.dropdowns) }
		}),

	toggleDropdown: (id, isOpen) =>
		set((state) => {
			const dropdown = state.dropdowns.get(id)
			if (dropdown) {
				dropdown.isOpen = isOpen
				state.dropdowns.set(id, dropdown) // Update dropdown in Map
			}

			// Recreate Map to trigger re-render
			return { dropdowns: new Map(state.dropdowns) }
		}),

	closeAll: () =>
		set((state) => {
			state.dropdowns.forEach((dropdown) => {
				dropdown.isOpen = false
			})

			// Recreate Map to trigger re-render
			return { dropdowns: new Map(state.dropdowns) }
		}),

	isDropdownOpen: (id: number) => {
		const dropdown = get().dropdowns.get(id)
		return !!dropdown?.isOpen
	},

	getOpenedDropdown: () => {
		for (const dropdown of get().dropdowns.values()) {
			if (dropdown.isOpen) {
				return dropdown
			}
		}
		return undefined
	},

	initializeListener: (): VoidAnonymousFunction => {
		const handleClickOutside = (event: MouseEvent) => {
			const openedDropdown = get().getOpenedDropdown()
			if (!openedDropdown) return

			const isClickInsideDropdown = openedDropdown.ref.current?.contains(event.target as Node)
			if (isClickInsideDropdown === false) {
				// If the click is outside the dropdown, close all open dropdowns
				get().toggleDropdown(openedDropdown.id, false)
			}
		}

		// Add global event listener
		document.addEventListener('mousedown', handleClickOutside)

		// Cleanup listener when the store is destroyed
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	},
}))

export default useDropdownStore
