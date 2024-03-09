import { NextRouter } from 'next/router'

class Routes {
	private static router: NextRouter
	public static navRoutes: Route[] = [
		{
			name: 'Dashboard',
			location: '/dashboard',
		},
		{
			name: 'Store',
			location: '/dashboard/store',
		},
	]

	static getCurrentPath(): string {
		if (!Routes.router) {
			throw new Error('Router not initialized')
		}
		return Routes.router.asPath
	}

	// Add more route-related methods as needed
}

interface Route {
	name: string
	location: string
}

export default Routes
