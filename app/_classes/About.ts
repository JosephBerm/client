/**
 * About Page Static Content Class
 *
 * Contains all static content and copy for the MedSource Pro about page.
 * Centralized content management for hero section, statistics, features, and CTA.
 *
 * **Sections:**
 * - **HeroSection**: Main headline, badge, and call-to-action
 * - **Stats**: Company statistics and trust metrics
 * - **Features**: Company values and mission highlights
 * - **CTA**: Call-to-action section content
 *
 * **Benefits:**
 * - Centralized content management
 * - Easy content updates without touching JSX
 * - Type-safe feature structure
 * - Consistent messaging across pages
 *
 * @example
 * ```typescript
 * import About from '@_classes/About';
 *
 * // Hero Section
 * <HeroSection
 *   badge={About.HeroSection.badge}
 *   title={About.HeroSection.title}
 *   titleHighlight={About.HeroSection.titleHighlight}
 *   subtitle={About.HeroSection.subtitle}
 *   primaryCTA={About.HeroSection.primaryCTA}
 *   secondaryCTA={About.HeroSection.secondaryCTA}
 * />
 *
 * // Stats Banner
 * <StatsBanner stats={About.Stats} />
 *
 * // Features
 * {About.Features.map((feature, index) => (
 *   <FeatureSection
 *     key={index}
 *     title={feature.title}
 *     description={feature.description}
 *     icon={feature.icon}
 *     iconColor={feature.color}
 *     iconBg={feature.bg}
 *   />
 * ))}
 *
 * // CTA Section
 * <CTASection
 *   title={About.CTA.title}
 *   description={About.CTA.description}
 *   primaryCTA={About.CTA.primaryCTA}
 *   secondaryCTA={About.CTA.secondaryCTA}
 * />
 * ```
 *
 * @module About
 */

import { type LucideIcon, Activity, Shield, Users, Heart, CheckCircle2 } from 'lucide-react'

import type { ColorVariant } from '@_components/landing/colorVariants'

/**
 * Feature Interface
 *
 * Type definition for feature objects displayed in alternating sections.
 * Ensures consistent structure for all feature entries.
 * 
 * **Important**: Uses ColorVariant instead of raw class strings to ensure
 * Tailwind CSS classes are detected at build time and not purged in production.
 */
export interface Feature {
	/** Feature title */
	title: string
	/** Feature description */
	description: string
	/** Icon component from lucide-react */
	icon: LucideIcon
	/** Color variant for icon styling (type-safe, not purged in production) */
	colorVariant: ColorVariant
}

/**
 * Stat Interface
 *
 * Type definition for statistics displayed in the stats banner.
 */
export interface Stat {
	/** Stat label/description */
	label: string
	/** Stat value */
	value: string
}

/**
 * CTA Interface
 *
 * Type definition for call-to-action buttons.
 */
export interface CTA {
	/** Button label */
	label: string
	/** Button href/link */
	href: string
}

/**
 * About Class
 *
 * Static content repository for about page sections.
 * All content is defined as static properties for easy access throughout the application.
 */
export default class About {
	/**
	 * Hero Section Content
	 *
	 * Main headline, badge, and call-to-action for the about page hero.
	 * First content visitors see when landing on the about page.
	 */
	public static HeroSection = {
		/** Badge text displayed above title */
		badge: 'About MedSource Pro',
		/** Main hero title */
		title: 'Empowering Healthcare',
		/** Highlighted portion of title (styled differently) */
		titleHighlight: 'Through Innovation',
		/** Subtitle/description text */
		subtitle:
			'Delivering reliable medical supply solutions, exceptional service, and measurable impact for the healthcare organizations we serve.',
		/** Primary call-to-action button */
		primaryCTA: {
			label: 'Get in Touch',
			href: '/contact',
		} as CTA,
		/** Secondary call-to-action button */
		secondaryCTA: {
			label: 'View Catalog',
			href: '/store',
		} as CTA,
		/** Background image alt text */
		backgroundImageAlt: 'Medical professionals collaborating in a modern healthcare facility',
	}

	/**
	 * Statistics/Trust Metrics
	 *
	 * Company statistics displayed in the stats banner.
	 * Builds trust and credibility with visitors.
	 */
	public static Stats: Stat[] = [
		{ label: 'Years Experience', value: '15+' },
		{ label: 'Products Available', value: '50k+' },
		{ label: 'Happy Clients', value: '2,000+' },
		{ label: 'Delivery Accuracy', value: '99.9%' },
	]

	/**
	 * Features Section
	 *
	 * Company values, mission, and differentiators displayed in alternating sections.
	 * Communicates brand promise and company culture to potential customers.
	 * 
	 * **MAANG-Level**: Uses DaisyUI semantic color variants that follow the theme.
	 * Colors automatically adapt when user switches themes (light, dark, etc.)
	 * 
	 * **Semantic Color Mapping:**
	 * - Mission → `info` (informational content, blue family)
	 * - Quality → `success` (positive assurance, green family)
	 * - Customer → `secondary` (supporting brand message)
	 * - Community → `error` (heart/passion/love, red family)
	 * - Vision → `warning` (forward-looking, amber family)
	 */
	public static Features: Feature[] = [
		{
			title: 'Our Mission',
			description:
				'To connect healthcare providers with trusted medical supplies and services that improve patient care, building healthier communities.',
			icon: Activity,
			colorVariant: 'info',
		},
		{
			title: 'Quality Assurance',
			description:
				'We partner exclusively with vetted manufacturers. Every item is evaluated for safety, efficacy, and reliability.',
			icon: Shield,
			colorVariant: 'success',
		},
		{
			title: 'Customer Focus',
			description:
				'Our customer success team supports you from product discovery through post-delivery, ensuring tailored interactions.',
			icon: Users,
			colorVariant: 'secondary',
		},
		{
			title: 'Community Impact',
			description:
				'We invest in health initiatives and collaborate with nonprofits to increase access in underserved regions.',
			icon: Heart,
			colorVariant: 'error',
		},
		{
			title: 'Future Vision',
			description:
				'Helping you deliver better outcomes. Whether you run a clinic or coordinate care networks, we are your partner.',
			icon: CheckCircle2,
			colorVariant: 'warning',
		},
	]

	/**
	 * Call-to-Action Section
	 *
	 * Conversion-focused content displayed at the end of the about page.
	 * Encourages visitors to take action (contact, explore products, etc.).
	 */
	public static CTA = {
		/** CTA section title */
		title: 'Ready to Transform Your Healthcare Supply Chain?',
		/** CTA section description */
		description:
			'Join thousands of healthcare providers who trust MedSource Pro for quality, reliability, and service.',
		/** Primary call-to-action button */
		primaryCTA: {
			label: 'Partner With Us',
			href: '/contact',
		} as CTA,
		/** Secondary call-to-action button */
		secondaryCTA: {
			label: 'Explore Products',
			href: '/store',
		} as CTA,
	}
}

