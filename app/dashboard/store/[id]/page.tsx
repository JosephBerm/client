'use client';
import React from 'react'
import CRUDProducts from '../../../../src/components/Store/CRUDProducts'

import Link from 'next/link'

const page = () => {

    return (
        <div className='creation-container'>
            <div style={{marginBottom:'20px'}}>
                <Link href="/dashboard/store">
                    Back to store
                </Link> 
            </div>
            <h3>Create a product</h3>
            <CRUDProducts/>
        </div>
    )
}

export default page