import React, { createContext, useContext, useRef, useState, useEffect } from 'react'

const OpenMenusContext = createContext<{
	openMenu: (id: string) => void
	closeMenu: (id: string) => void
	isMenuOpen: (id: string) => boolean
}>({
	openMenu: () => {},
	closeMenu: () => {},
	isMenuOpen: () => false,
})

export const useMenuContext = () => useContext(OpenMenusContext)

export const FloatingMenuProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [openMenus, setOpenMenus] = useState<Set<string>>(new Set())

	const openMenu = (id: string) => setOpenMenus((prev) => new Set(prev.add(id)))
	const closeMenu = (id: string) =>
		setOpenMenus((prev) => {
			const newSet = new Set(prev)
			newSet.delete(id)
			return newSet
		})
	const isMenuOpen = (id: string) => openMenus.has(id)

	// Close all menus on outside click
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as Node
			document.querySelectorAll('.FloatingMenu').forEach((menu) => {
				if (!menu.contains(target)) {
					const id = menu.getAttribute('data-id')
					if (id) closeMenu(id)
				}
			})
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [])

	return <OpenMenusContext.Provider value={{ openMenu, closeMenu, isMenuOpen }}>{children}</OpenMenusContext.Provider>
}
