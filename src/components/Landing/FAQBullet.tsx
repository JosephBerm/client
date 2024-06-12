import React from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'

const variants = {
    open: { opacity: 1, height: "auto", applyAtStart: { display: "block" }, delay:20, applyAtEnd: { overflowY: 'auto' } },
    closed: { opacity: 0, height: 0, applyAtEnd: { display: "none" } }
}

interface props {
    title: string,
    content: string,
    isOpen: boolean,
    index: number,
    toggleCaret: (index: number) => void
}

const FAQBullet = ({isOpen, title, content, index, toggleCaret}:props) => {
    return (
        <div className='bullet-container'  >
            <div className="faq-header" onClick={() => toggleCaret(index)}>
                <span>{title}</span>
                <Image src='/caret.svg' alt="caret" width={16} height={10} className="caret" style={{transform: isOpen ? `rotate(180deg)` : 'none'}} />
            </div>

            <motion.div className={`faq-bullet-content ${isOpen ? "display":"hide"}`} variants={variants} animate={isOpen ? "open" : "closed"} >
                <p className={isOpen ? "display":"hide"}>{content}</p>
            </motion.div>
        </div>
    )
}

export default FAQBullet