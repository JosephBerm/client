'use client'
import { User } from '@/src/classes/User';
import API from '@/src/services/api';
import React from 'react'
import { useFormik } from 'formik';
import UpdateAccountForm from '@/src/components/UpdateAccountForm';
import "@/styles/accounts.css"
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';

const page = () => {

    const params = useParams();

    const [user, setUser] = React.useState<User>(new User({}));
    const [loading, setLoading] = React.useState<boolean>(false);
    const route = useRouter();

    const userId = params.id;

    if(!userId) return route.back();

    const form = useFormik({
        initialValues: user,
        onSubmit: async (values) => {
            try {
                await API.account.update(values);
            } finally {
                fetchUser();
            }
        }
    });

    const fetchUser = async () => {
        console.log("XXX", userId)
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
            <button className='mb-10' onClick={() => route.back()}>Back</button>
            <h1>Account Page</h1>
            {loading && user && (
                <div>
                    <UpdateAccountForm user={user}/>
                    
                </div>
            )}
        </div>
    )
}

export default page