import { ReactNode } from 'react'

export interface Section {
	children?: ReactNode
	footer?: JSX.Element
	header: {
		title: string
		action?: JSX.Element
	}
	cssClass?: string
	inLineStyle?: { [style: string]: any }
}
