'use client'
import { User } from '@/src/classes/User';
import API from '@/src/services/api';
import React from 'react'

const page = ({userId}: {userId: string}) => {

    const [user, setUser] = React.useState<User | null>(null);
    const [loading, setLoading] = React.useState<boolean>(false);

    const fetchUser = async () => {
        try {
            const { data } = await API.account.get(userId);
            if (data.payload) {
                setUser(data.payload);
            }
        } finally {
            setLoading(true);
        }
    }

    React.useEffect(() => {
        fetchUser();
    }, []);

    
  return (
    <div>
        <h1>Account Page</h1>
        {loading && user && (
            <div>
                <h2>{user.firstName} {user.lastName}</h2>
                <p>{user.email}</p>
            </div>
        )}
    </div>
  )
}

export default page