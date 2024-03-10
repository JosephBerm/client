'use client'

import React from 'react'
import InputTextBox from '../InputTextBox'
import API from '@/src/services/api';
import {toast} from 'react-toastify'

class PasswordForm {
    oldPassword: string = "";
    newPassword: string = "";
    confirmNewPassword: string = "";
}

const ChangePasswordForm = () => {

    const [passwordForm, setPasswordForm] = React.useState<PasswordForm>(new PasswordForm())
    const [loading, setLoading] = React.useState<boolean>(false)

    const handleChange = (field: string, value: string) => {
        setPasswordForm((prev) => {
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
            if(passwordForm.newPassword !== passwordForm.confirmNewPassword){
                throw new Error("Passwords do not match")
            }
            const response = await API.account.changePassword<Boolean>(passwordForm.oldPassword, passwordForm.newPassword)

            if(response && response.data.statusCode === 200){
                toast.success(response.data.message)
                setPasswordForm(new PasswordForm())
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
                    
                    label="Old Password"
                    type="password"
                    placeholder="Old Password"
                    value={passwordForm.oldPassword}
                    handleChange={(e: string) => handleChange("oldPassword", e)}
                />

                <InputTextBox
                    
                    label="New Password"
                    type="password"
                    placeholder="New Password"
                    value={passwordForm.newPassword}
                    handleChange={(e: string) => handleChange("newPassword", e)}
                />
                <InputTextBox
                    
                    label="Confirm New Password"
                    type="password"
                    placeholder="Confirm New Password"
                    value={passwordForm.confirmNewPassword}
                    handleChange={(e: string) => handleChange("confirmNewPassword", e)}
                />

                <button type="submit" disabled={loading}>Change Password</button>
            </form>



        </div>
    )
}

export default ChangePasswordForm