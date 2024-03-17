'use client'

import { Quote } from '@/src/classes/Quote'
import API from '@/src/services/api'
import React from 'react'
import { useRouter } from 'next/navigation'

const page = () => {

    const router = useRouter()
    const [quotes, setQuotes] = React.useState<Quote[]>([])
    const [loading, setLoading] = React.useState<boolean>(false)
    const getQuotes = async () => {
        try {
            setLoading(true)
            const response = await API.quote.get<Quote[]>(null)

            if (response.data.statusCode == 200) {
                setQuotes(response.data.payload!)
            }
        } catch(err) {
            console.log(err)
        } finally {
            setLoading(false)
        }
    }

    React.useEffect(() => {
        getQuotes()
    }, [])

    return (
        <div>
            <h3>Quotes</h3>

            {quotes.map((quote, index) => (
                <div key={index}>
                    <h4>{quote.name}</h4>
                    <p>{quote.contactName}</p>
                    
                    <button onClick={() => router.push(`/dashboard/quotes/${quote.id}`)}>View</button>

                    <hr />

                </div>
            ))}
        </div>
    )
}

export default page