'use client'
import React, { useEffect } from 'react'
import InputTextBox from '../InputTextBox'
import { User } from '@/src/classes/User'
import { useAccountStore } from '@/src/stores/user'
import API from '@/src/services/api'
import {toast} from 'react-toastify'

const UpdateProfileForm = () => {
    
    const { User: UserFromStore } = useAccountStore(state => state)
    const [loading, setLoading] = React.useState<boolean>(false)
    const [UserData, setUserData] = React.useState<User>(UserFromStore)

    useEffect(() => {
        setUserData(UserFromStore)
    }
    , [UserFromStore])

    const handleChange = (field: string, value: string) => {
        setUserData((prev) => {
            return {
                ...prev,
                [field]: value
            }
        })
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        try{ 
            setLoading(true)
            const response = await API.account.update<Boolean>(UserData)

            if(response && response.data.statusCode === 200){
                toast.success(response.data.message)
                useAccountStore.setState({User: UserData})
            } else {
                toast.error(response.data.message)
            }
        } catch(err: any){
            toast.error(err.message)
        } finally { 
            setLoading(false)
        }
    }

    return (
        <div>
            <h2>Account</h2>
            <form onSubmit={handleSubmit}>
            
                <InputTextBox
                    label="First Name"
                    type="text"
                    placeholder="First Name"
                    value={UserData.firstName}
                    handleChange={(x ) => handleChange("firstName", x)}
                />
                <InputTextBox
                    label="Last Name"
                    type="text"
                    placeholder="Last Name"
                    value={UserData.lastName}
                    handleChange={(x ) => handleChange("lastName", x)}
                />

                <InputTextBox
                    label="Email"
                    type="email"
                    placeholder="Email"
                    value={UserData.email}
                    handleChange={(x ) => handleChange("email", x)}
                />
                <button type="submit" className="btn btn-primary" disabled={loading}>Update Profile</button>
            </form>
        </div>
    )
}

export default UpdateProfileForm