'use client';

import classNames from 'classnames';

interface RichTextProps {
  content?: string;
  className?: string;
}

/**
 * Rich Text Component
 *
 * Displays rich text content with proper HTML rendering.
 * Supports markdown-like formatting.
 * Uses DaisyUI semantic colors via prose plugin.
 *
 * TIER: Trial (available to all tiers)
 * CATEGORY: Content
 *
 * SECURITY:
 * - Content should be sanitized on backend before storing
 * - Uses dangerouslySetInnerHTML only for trusted content
 */
export default function RichText({
  content = '<p>Add your content here...</p>',
  className = '',
}: RichTextProps) {
  return (
    <div
      className={classNames(
        // Base prose styling with DaisyUI theme integration
        'prose prose-base max-w-none',
        // Headings use base-content
        'prose-headings:text-base-content',
        // Body text
        'prose-p:text-base-content/80',
        // Links use primary color
        'prose-a:text-primary prose-a:no-underline hover:prose-a:underline',
        // Strong/bold
        'prose-strong:text-base-content',
        // Code blocks
        'prose-code:rounded prose-code:bg-base-200 prose-code:px-1 prose-code:text-base-content',
        'prose-pre:bg-base-200 prose-pre:text-base-content',
        // Blockquotes
        'prose-blockquote:border-primary prose-blockquote:text-base-content/70',
        // Lists
        'prose-li:text-base-content/80',
        className
      )}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
