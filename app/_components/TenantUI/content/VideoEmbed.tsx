'use client';

interface VideoEmbedProps {
  provider?: 'youtube' | 'vimeo' | 'custom';
  videoId?: string;
  url?: string;
  title?: string;
  aspectRatio?: '16:9' | '4:3' | '1:1';
}

/**
 * Video Embed Component
 *
 * Embeds videos from various providers (YouTube, Vimeo, custom URLs).
 * Responsive with configurable aspect ratios.
 * Uses DaisyUI semantic colors.
 *
 * TIER: Standard
 * CATEGORY: Content
 */
export default function VideoEmbed({
  provider = 'youtube',
  videoId = '',
  url = '',
  title = 'Video',
  aspectRatio = '16:9',
}: VideoEmbedProps) {
  const getEmbedUrl = () => {
    switch (provider) {
      case 'youtube':
        return `https://www.youtube.com/embed/${videoId}`;
      case 'vimeo':
        return `https://player.vimeo.com/video/${videoId}`;
      case 'custom':
        return url;
      default:
        return '';
    }
  };

  const aspectRatioClass = {
    '16:9': 'aspect-video',
    '4:3': 'aspect-[4/3]',
    '1:1': 'aspect-square',
  }[aspectRatio];

  const embedUrl = getEmbedUrl();

  if (!embedUrl) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-lg bg-base-200">
        <p className="text-base-content/60">No video URL provided</p>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-lg bg-neutral ${aspectRatioClass}`}>
      <iframe
        src={embedUrl}
        title={title}
        className="absolute inset-0 h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
