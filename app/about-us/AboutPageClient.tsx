'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, Heart, Shield, Users, Activity } from 'lucide-react'
import { ReactNode } from 'react'

import Aboutus11 from '@/public/aboutus11.png'
import Aboutus22 from '@/public/aboutus22.png'
import Aboutus33 from '@/public/aboutus33.png'
import Aboutus44 from '@/public/aboutus44.png'
import Aboutus55 from '@/public/aboutus55.png'
// Assuming this exists based on file list
import AboutUsMain from '@/public/aboutus-main.png'

// Animation variants
const fadeIn = {
	hidden: { opacity: 0, y: 20 },
	visible: { 
		opacity: 1, 
		y: 0,
		transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as any }
	}
}

const staggerContainer = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.2
		}
	}
}

const features = [
	{
		title: 'Our Mission',
		description: 'To connect healthcare providers with trusted medical supplies and services that improve patient care, building healthier communities.',
		image: Aboutus11,
		icon: Activity,
		color: 'text-blue-500',
		bg: 'bg-blue-50'
	},
	{
		title: 'Quality Assurance',
		description: 'We partner exclusively with vetted manufacturers. Every item is evaluated for safety, efficacy, and reliability.',
		image: Aboutus22,
		icon: Shield,
		color: 'text-emerald-500',
		bg: 'bg-emerald-50'
	},
	{
		title: 'Customer Focus',
		description: 'Our customer success team supports you from product discovery through post-delivery, ensuring tailored interactions.',
		image: Aboutus33,
		icon: Users,
		color: 'text-purple-500',
		bg: 'bg-purple-50'
	},
	{
		title: 'Community Impact',
		description: 'We invest in health initiatives and collaborate with nonprofits to increase access in underserved regions.',
		image: Aboutus44,
		icon: Heart,
		color: 'text-rose-500',
		bg: 'bg-rose-50'
	},
    {
		title: 'Future Vision',
		description: 'Helping you deliver better outcomes. Whether you run a clinic or coordinate care networks, we are your partner.',
		image: Aboutus55,
		icon: CheckCircle2,
		color: 'text-amber-500',
		bg: 'bg-amber-50'
	}
]

export default function AboutPageClient() {
	return (
		<div className="flex flex-col w-full overflow-x-hidden bg-base-100">
			{/* Hero Section */}
			<section className="relative w-full min-h-[80vh] flex items-center justify-center overflow-hidden">
				{/* Background Image with Overlay */}
				<div className="absolute inset-0 z-0">
					<Image 
						src={AboutUsMain} 
						alt="Medical professionals collaboration" 
						fill
						className="object-cover object-center"
						priority
                        placeholder="blur"
					/>
					<div className="absolute inset-0 bg-gradient-to-r from-neutral-900/90 via-neutral-900/70 to-neutral-900/30" />
				</div>

				{/* Hero Content */}
				<div className="container relative z-10 px-6 mx-auto md:px-12">
					<motion.div 
						initial="hidden"
						animate="visible"
						variants={staggerContainer}
						className="max-w-3xl space-y-6"
					>
						<motion.div variants={fadeIn}>
							<span className="px-4 py-2 text-sm font-medium tracking-wider uppercase bg-primary/20 text-primary-content rounded-full backdrop-blur-sm border border-primary/30">
								About MedSource Pro
							</span>
						</motion.div>
						
						<motion.h1 variants={fadeIn} className="text-4xl font-bold leading-tight text-white md:text-6xl lg:text-7xl">
							Empowering Healthcare <br/>
							<span className="text-primary">Through Innovation</span>
						</motion.h1>
						
						<motion.p variants={fadeIn} className="text-lg text-gray-300 md:text-xl max-w-2xl leading-relaxed">
							Delivering reliable medical supply solutions, exceptional service, and measurable impact for the healthcare organizations we serve.
						</motion.p>

						<motion.div variants={fadeIn} className="flex flex-wrap gap-4 pt-4">
                            <Link href="/contact" className="btn btn-primary btn-lg gap-2 shadow-lg shadow-primary/25">
                                Get in Touch
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link href="/store" className="btn btn-outline btn-lg text-white hover:bg-white/10 hover:border-white gap-2">
                                View Catalog
                            </Link>
						</motion.div>
					</motion.div>
				</div>

                {/* Scroll Indicator */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5, duration: 1 }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/50 animate-bounce"
                >
                    <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
                        <div className="w-1 h-2 bg-white/50 rounded-full" />
                    </div>
                </motion.div>
			</section>

            {/* Stats/Trust Banner */}
            <section className="py-12 bg-neutral text-neutral-content border-y border-base-content/5">
                <div className="container mx-auto px-6 md:px-12">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {[
                            { label: 'Years Experience', value: '15+' },
                            { label: 'Products Available', value: '50k+' },
                            { label: 'Happy Clients', value: '2,000+' },
                            { label: 'Delivery Accuracy', value: '99.9%' },
                        ].map((stat, idx) => (
                            <motion.div 
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="space-y-2"
                            >
                                <h3 className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</h3>
                                <p className="text-sm md:text-base text-neutral-content/70 uppercase tracking-wide">{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

			{/* Alternating Features Sections */}
			<div className="flex flex-col">
				{features.map((feature, idx) => {
                    const isEven = idx % 2 === 0;
					return (
						<section 
                            key={idx} 
                            className={`py-20 md:py-32 overflow-hidden ${isEven ? 'bg-base-100' : 'bg-base-200/50'}`}
                        >
							<div className="container mx-auto px-6 md:px-12">
								<div className={`flex flex-col lg:flex-row items-center gap-12 lg:gap-24 ${isEven ? '' : 'lg:flex-row-reverse'}`}>
									
                                    {/* Text Content */}
									<motion.div 
                                        className="flex-1 space-y-6"
                                        initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true, margin: "-100px" }}
                                        transition={{ duration: 0.7, ease: "easeOut" }}
                                    >
										<div className={`inline-flex items-center justify-center p-3 rounded-2xl ${feature.bg} ${feature.color} mb-4`}>
											<feature.icon className="w-8 h-8" />
										</div>
										<h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-base-content leading-tight">
											{feature.title}
										</h2>
										<p className="text-lg text-base-content/70 leading-relaxed">
											{feature.description}
										</p>
                                        <div className="pt-4">
                                            <button className="btn btn-ghost hover:bg-base-200 pl-0 gap-2 text-primary group">
                                                Learn more <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                            </button>
                                        </div>
									</motion.div>

                                    {/* Image Content */}
									<motion.div 
                                        className="flex-1 w-full"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true, margin: "-100px" }}
                                        transition={{ duration: 0.7, delay: 0.2 }}
                                    >
										<div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl shadow-base-content/5 group">
                                            <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
											<Image 
												src={feature.image} 
												alt={feature.title}
												fill
												className="object-cover transition-transform duration-700 group-hover:scale-105"
											/>
										</div>
									</motion.div>
								</div>
							</div>
						</section>
					)
				})}
			</div>

			{/* CTA Section */}
			<section className="relative py-24 overflow-hidden">
                <div className="absolute inset-0 bg-neutral text-neutral-content">
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px] opacity-20" />
                </div>
                
				<div className="container relative z-10 mx-auto px-6 md:px-12 text-center">
					<motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="max-w-4xl mx-auto space-y-8"
                    >
						<h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
							Ready to Transform Your Healthcare Supply Chain?
						</h2>
						<p className="text-xl text-white/80 max-w-2xl mx-auto mb-10">
							Join thousands of healthcare providers who trust MedSource Pro for quality, reliability, and service.
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<Link href="/contact" className="btn btn-primary btn-lg shadow-lg shadow-primary/25 border-0">
								Partner With Us
							</Link>
							<Link href="/store" className="btn btn-outline text-white btn-lg hover:bg-white hover:text-neutral border-white/30 hover:border-white">
								Explore Products
							</Link>
						</div>
					</motion.div>
				</div>
			</section>
		</div>
	)
}

