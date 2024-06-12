'use client'
import React, { useState } from 'react'
import FAQBullet from './FAQBullet'

interface FAQ { 
    question: string,
    answer: string,
    isOpen: boolean
}

const FAQ = () => {
    const [Questions, setQuestions] = useState<FAQ[]>([
        {
            question: "Does MTS do medical gas installs?",
            answer: "Yes, MTS has various partnerships with a number of medical gas installation contractors. Each sub contractor employees qualifying ASSE 6010 Medical Gas Installers ready to meet your needs.",
            isOpen: false
        },
        {
            question: "What is a medical gas certification?",
            answer: "A Medical Gas Certification (Also called a medical gas verification) is an NFPA required inspection and approval of newly installed medical gas delivery systems. All newly in installed medical gas pipeline and equipment must be certified by an ASSE 6030 before use.",
            isOpen: false
        },
        {
            question: "Does MTS do medical gas installs?",
            answer: "Per NFPA guidelines, it is a requirement for any facilities using medical grade gases for the purpose of human consumption to have their gas delivery systems inspected by and ASSE 6040. Read more about Medical Gas Inspections Here.",
            isOpen: false
        },
        {
            question: "Does MTS provide Medical Gas Inspections?",
            answer: "Yes, MTS provides annual medical gas inspections. We provide discounts on Annual Inspections when you sign multi year contracts.",
            isOpen: false
        },
        {
            question: "How to get certified as a medical gas installer?",
            answer: "The Plumbing and Mechanical Systems Board issues medical gas piping certification to medical gas system installers who possess valid certification from the National Inspection Testing Certification Corporation or NITC. Certification from other organizations may be considered with approval of the board.",
            isOpen: false
        },
        {
            question: "Does MTS do medical gas installs?",
            answer: "Yes, we can adapt any fittings to the desired hosing for any medical grade gas. High pressure gases such as Nitrogen can also be accommodated.",
            isOpen: false
        },

    ])
    const toggleCaret: (index: number) => void = (index) => {
        setQuestions(prev => {
            return prev.map((question, i) => {
                if (i === index) {
                    return {
                        ...question,
                        isOpen: !question.isOpen
                    }
                }
                return question
            })
        
        })
    }


   
    return (
        <div className='faq-container'>
            <h1>FAQS</h1>

            <p style={{marginBottom: 50}}>Find answers to frequently asked questions about our products, ordering process, shipping policies, and more. If you have a question, chances are it's answered here. If not, feel free to reach out to us directly.</p>

            <div className='bullets-holder'>
                <div className='faq-bullets-container'>
                    {Questions.slice(0, 3).map((question, index) => {
                        return <FAQBullet key={index} title={question.question} content={question.answer} isOpen={question.isOpen} index={index} toggleCaret={toggleCaret} />
                    })}
                </div>

                <div className='faq-bullets-container'>
                    {Questions.slice(3, 6).map((question, index) => {
                        return <FAQBullet key={index} title={question.question} content={question.answer} isOpen={question.isOpen} index={index + 3} toggleCaret={toggleCaret} />
                    })}
                </div>
            </div>
        
        </div>
    )
}

export default FAQ