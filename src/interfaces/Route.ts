import { AccountRole } from "../classes/Enums"

export default interface Route {
	name: string
	location: string
	icon?: string
	accessible?: AccountRole[]
	component?: () => JSX.Element
}
