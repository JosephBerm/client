"use client"
import React from 'react'
import Table from '@/src/common/table'
import { User } from '@/src/classes/User';
import { TableColumn } from '@/src/interfaces/TableColumn';
import API from '@/src/services/api';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import "@/styles/accounts.css"


const page = () => {
	const [tables, setTables] = React.useState<User[]>([]);
	const [loading, setLoaidng] = React.useState<boolean>(false);
	const route = useRouter();

	const fetchAccounts = async () => {
		try {
			const { data } = await API.account.getAll();
			setTables(data.payload || []); // Handle null case by providing an empty array as the default value
		} finally {
			setLoaidng(true);
		}
	}

	React.useEffect(() => {
		fetchAccounts();
	}, []);

	const columns: TableColumn<User>[] = [
		{
			path: 'firstName',
			label: 'Name',
			content: (user: User) => (
				<>
					{user.firstName} {user.lastName}
				</>
			),
		},
		{
			path: 'email',
			label: 'Email',
		},
		{
			path: 'createdAt',
			label: 'Date Created',
			content: (user: User) => (
				<>
					{dayjs(user.createdAt).format('MM/DD/YYYY')}
				</>
			),
		},
		{
			path: 'id',
			label: 'actions',
			content: (user: User) => (
				<div className='flex gap-5'>
					<button className='btn btn-danger btn-sm' onClick={() => {
						route.push(`/dashboard/accounts/${user.id}`)
					}}>Edit</button>
					<button className='btn btn-danger btn-sm'>Delete</button>
				</div>
			),
		},

	]

	return (
		<div className='accounts-page-container'>
			<h1 style={{alignSelf:'flex-start', margin: 0}}>Accounts</h1>
			
			<Table<User>
				columns={columns}
				data={tables}
			/>

		</div>
	)
}

export default page