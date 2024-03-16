'use client'
import { Quote } from '@/src/classes/Quote'
import API from '@/src/services/api'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect } from 'react'

const page = () => {
    const params = useParams()
    const route = useRouter()
    const [quote, setQuote] = React.useState<Quote | null>(null)
    const [loading, setLoading] = React.useState<boolean>(false)


    const getQuote = async (id: string) => {
        try {
            setLoading(true)
            const response = await API.quote.get<Quote>(id)

            if (response.data.statusCode == 200) {
                setQuote(response.data.payload!)
            }
        } catch(err) {
            console.log(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {   
        if(params.id){
            getQuote(params.id as string)
        }
    }, [])



    return (
        <div>
            <button onClick={() => route.back()}>Go back</button>
            <h3>Quote</h3>
            {loading && <p>Loading...</p>}
            {quote && (
                <div>
                    <h4>{quote.name}</h4>
                    <p>{quote.contactName}</p>
                    <p>{quote.emailAddress}</p>
                    <p>{quote.phoneNumber}</p>
                    <p>{quote.typeOfBusiness}</p>

                    <p>{quote.description}</p>
                </div>
            )}

        </div>
    )
}

export default page