import { AccountRole } from "../classes/Enums"

export default interface Route {
	name: string
	location: string
	icon?: string
	accessable?: AccountRole 
	component?: () => JSX.Element
}
