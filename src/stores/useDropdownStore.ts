import { create } from 'zustand'
import React from 'react'

interface Dropdown {
	id: number
	isOpen: boolean
	ref: React.RefObject<HTMLDivElement>
}

interface DropdownState {
	dropdowns: Dropdown[]

	addDropdown: () => number
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

	dropdowns: [],
	addDropdown: () => {
		let newId: number = 1
		set((state) => {
			const isFirstDropdown = state.dropdowns.length <= 0
			if (!isFirstDropdown) {
				newId = Math.max(...state.dropdowns.map((d) => d.id)) + 1
			}

			const newDropdownsState = {
				dropdowns: [
					...state.dropdowns,
					{
						id: newId,
						isOpen: false,
						ref: React.createRef<HTMLDivElement>(),
					},
				],
			}

			return newDropdownsState
		})
		return newId
	},
	removeDropdown: (id) =>
		set((state) => ({
			dropdowns: state.dropdowns.filter((dropdown) => dropdown.id !== id),
		})),
	toggleDropdown: (id, isOpen) =>
		set((state) => ({
			dropdowns: state.dropdowns.map((dropdown) => (dropdown.id === id ? { ...dropdown, isOpen } : dropdown)),
		})),
	closeAll: () =>
		set((state) => ({
			dropdowns: state.dropdowns.map((dropdown) => ({
				...dropdown,
				isOpen: false,
			})),
		})),
	isDropdownOpen: (id: number) => {
		return get().dropdowns.some((d) => d.id === id && d.isOpen)
	},

	getOpenedDropdown: () => {
		return get().dropdowns.find((d) => d.isOpen)
	},

	initializeListener: (): VoidAnonymousFunction => {
		const handleClickOutside = (event: MouseEvent) => {
			console.log('event triggered')

			const hasOpenedDropdown = get().getOpenedDropdown()
			if (!hasOpenedDropdown) return

			const dropdowns = get().dropdowns
			const isClickInsideDropdown = dropdowns.some((dropdown) =>
				dropdown.ref.current?.contains(event.target as Node)
			)

			if (!isClickInsideDropdown) {
				// If the click is outside the dropdown, close all open dropdowns
				get().closeAll()
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
