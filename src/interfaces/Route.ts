export default interface Route {
	name: string
	location: string
	icon: string
	component?: () => JSX.Element
}
