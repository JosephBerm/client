import { AccountRole } from "../classes/Enums"

export default interface IRoute<T = any> {
	name: string
	location: string
	icon?: string
	accessible?: AccountRole[]
	component?: () => JSX.Element
	value?: T
}
