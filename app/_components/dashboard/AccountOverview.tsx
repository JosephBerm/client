'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import { Building2, BellRing, ShoppingCart, FileText } from 'lucide-react'
import type { ComponentType } from 'react'

import Card from '@_components/ui/Card'
import Badge from '@_components/ui/Badge'
import RoleBadge from '@_components/common/RoleBadge'
import { useAuthStore } from '@_stores/useAuthStore'

const MULTI_LINE_INFO_CLASS = 'text-sm text-base-content/70'

export default function AccountOverview() {
	const user = useAuthStore((state) => state.user)

	if (!user) {
		return (
			<Card className="border border-base-200 bg-base-100 shadow-sm">
				<p className="text-sm text-base-content/70">
					We could not load your account information. Please refresh the dashboard or sign in again.
				</p>
			</Card>
		)
	}

	const createdAt = user.createdAt ? new Date(user.createdAt as any) : null
	const memberSince = createdAt && !isNaN(createdAt.getTime()) ? format(createdAt, 'MMMM dd, yyyy') : 'Not available'

	const notificationsCount = Array.isArray(user.notifications) ? user.notifications.length : 0
	const ordersCount = Array.isArray(user.orders) ? user.orders.length : 0
	const quotesCount = Array.isArray(user.customer?.quotes) ? user.customer!.quotes.length : 0
	const customerName = user.customer?.name || 'Unassigned'
	const contactEmail = user.email || 'No email on file'
	const contactPhone = user.phone || user.mobile || 'No phone on file'

	const fullName =
		user.name && typeof user.name === 'object'
			? [user.name.first, user.name.middle, user.name.last].filter(Boolean).join(' ') || user.username || 'MedSource User'
			: user.username || 'MedSource User'

	return (
		<div className="grid gap-6 lg:grid-cols-3">
			<Card className="flex flex-col justify-between border border-base-200 bg-base-100 shadow-sm lg:col-span-2">
				<div className="flex flex-col gap-6">
					<div className="flex flex-col gap-2">
						<div className="flex flex-wrap items-center gap-3">
							<RoleBadge role={user.role ?? 0} />
							<span className="text-xs uppercase tracking-wide text-base-content/60">
								Account {user.id ? `#${user.id}` : 'pending'}
							</span>
						</div>
						<h2 className="text-2xl font-semibold text-base-content md:text-3xl">{fullName}</h2>
						<p className="text-base text-base-content/70">
							{customerName === 'Unassigned'
								? 'Link this account to a customer organization to access purchasing workflows.'
								: customerName}
						</p>
					</div>

					<div className="grid gap-4 md:grid-cols-2">
						<div>
							<p className="text-xs font-semibold uppercase text-base-content/60">Contact</p>
							<p className={MULTI_LINE_INFO_CLASS}>{contactEmail}</p>
							<p className={MULTI_LINE_INFO_CLASS}>{contactPhone}</p>
						</div>
						<div>
							<p className="text-xs font-semibold uppercase text-base-content/60">Member since</p>
							<p className={MULTI_LINE_INFO_CLASS}>{memberSince}</p>
						</div>
					</div>
				</div>

				<div className="mt-6 flex flex-wrap gap-3">
					<Link href="/medsource-app/profile" className="btn btn-primary">
						Manage Profile
					</Link>
					<Link href="/medsource-app/orders" className="btn btn-ghost">
						View Orders
					</Link>
				</div>
			</Card>

			<div className="grid gap-4">
				<Card className="border border-base-200 bg-base-100 shadow-sm">
					<div className="flex items-start justify-between">
						<div>
							<p className="text-sm font-medium text-base-content/70">Customer Organization</p>
							<p className="text-lg font-semibold text-base-content">{customerName}</p>
						</div>
						<Badge variant="neutral" className="flex items-center gap-2">
							<Building2 className="h-4 w-4" />
							<span>{user.customerId && user.customerId > 0 ? 'Assigned' : 'Pending'}</span>
						</Badge>
					</div>
				</Card>

				<div className="grid gap-4 sm:grid-cols-3">
					<StatCard
						icon={BellRing}
						label="Notifications"
						value={notificationsCount}
						href="/medsource-app/notifications"
					/>
					<StatCard icon={ShoppingCart} label="Orders" value={ordersCount} href="/medsource-app/orders" />
					<StatCard icon={FileText} label="Quotes" value={quotesCount} href="/medsource-app/quotes" />
				</div>
			</div>
		</div>
	)
}

interface StatCardProps {
	icon: ComponentType<{ className?: string }>
	label: string
	value: number
	href: string
}

function StatCard({ icon: Icon, label, value, href }: StatCardProps) {
	return (
		<Link href={href} className="group">
			<Card className="h-full border border-base-200 bg-base-100 transition-shadow hover:shadow-md">
				<div className="flex items-center gap-3">
					<span className="rounded-full bg-primary/10 p-3 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-content">
						<Icon className="h-5 w-5" />
					</span>
					<div>
						<p className="text-xs uppercase tracking-wide text-base-content/60">{label}</p>
						<p className="text-lg font-semibold text-base-content">{value}</p>
					</div>
				</div>
			</Card>
		</Link>
	)
}

