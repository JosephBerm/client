'use client';

import Button from '@_components/ui/Button';
import Link from 'next/link';

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  backgroundImage?: string;
}

/**
 * Hero Section Component
 *
 * Large banner section with title, subtitle, and call-to-action.
 * Uses DaisyUI hero pattern with semantic colors.
 * Mobile-first responsive design (sm: → md: → lg:).
 *
 * TIER: Trial (available to all tiers)
 * CATEGORY: Layout
 */
export default function HeroSection({
  title = 'Welcome to Your Medical Supply Platform',
  subtitle = 'Find the medical supplies you need, when you need them',
  ctaText = 'Get Started',
  ctaLink = '/products',
  backgroundImage,
}: HeroSectionProps) {
  return (
    <section
      className="hero relative min-h-[400px] bg-linear-to-r from-primary to-secondary"
      style={
        backgroundImage
          ? {
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : undefined
      }
    >
      {backgroundImage && (
        <div className="hero-overlay bg-opacity-60" aria-hidden="true" />
      )}

      <div className="hero-content text-center">
        <div className="max-w-2xl space-y-6">
          {/* Mobile-first: sm → md → lg progression */}
          <h1 className="text-3xl font-bold tracking-tight text-primary-content sm:text-4xl md:text-5xl lg:text-6xl">
            {title}
          </h1>

          {subtitle && (
            <p className="text-base text-primary-content/90 sm:text-lg md:text-xl">
              {subtitle}
            </p>
          )}

          {ctaText && ctaLink && (
            <div className="flex justify-center gap-4">
              <Link href={ctaLink}>
                <Button variant="secondary" size="lg">
                  {ctaText}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
