'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { Product } from '@/classes/Product'
import { useParams, useRouter } from 'next/navigation'
import { SortColumn, TableColumn } from '@/interfaces/Table'
import Order, { OrderItem } from '@/classes/Order'

import API from '@/services/api'
import Table from '@/common/table'
import InputNumber from '@/components/InputNumber'
import InputDropdown from '@/components/InputDropdown'
import Company from '@/src/classes/Company'
import Routes from '@/services/routes'

interface OrdersProps {
	order: Order
	products: Product[]
	customers: Company[]
}

const UserOrdersPage = ({ order, products, customers }: OrdersProps) => {
	return <h1>Coming soon!</h1>
}

export default UserOrdersPage
