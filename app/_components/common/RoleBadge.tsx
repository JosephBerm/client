import Badge from '@_components/ui/Badge'

// User role enum (should match backend)
export enum UserRole {
	Customer = 0,
	Admin = 9999999,
}

interface RoleBadgeProps {
	role: UserRole | number
	className?: string
}

/**
 * Badge component for user roles with appropriate colors
 */
export default function RoleBadge({ role, className }: RoleBadgeProps) {
	const getRoleConfig = (role: number) => {
		switch (role) {
			case UserRole.Admin:
				return { label: 'Admin', variant: 'error' as const }
			case UserRole.Customer:
				return { label: 'Customer', variant: 'primary' as const }
			default:
				return { label: 'User', variant: 'neutral' as const }
		}
	}

	const config = getRoleConfig(role)

	return (
		<Badge variant={config.variant} className={className}>
			{config.label}
		</Badge>
	)
}


