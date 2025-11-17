/**
 * HtmlImage Entity Class
 * 
 * Represents an HTML image element's essential attributes (src and alt).
 * Simple data model for managing image source URLs and accessibility alt text.
 * Used primarily for content management and ensuring accessible image implementations.
 * 
 * **Features:**
 * - Image source URL
 * - Accessibility alt text
 * - Simple, reusable image data structure
 * 
 * **Use Cases:**
 * - Content management systems
 * - Product galleries
 * - Accessible image implementations
 * - Image carousels
 * - Dynamic image loading
 * 
 * @example
 * ```typescript
 * import Image from 'next/image';
 * 
 * // Basic image
 * const image = new HtmlImage({
 *   src: '/images/product-1.jpg',
 *   alt: 'Surgical mask product image'
 * });
 * 
 * // Render image with Next.js Image (recommended for optimal performance)
 * <Image 
 *   src={image.src} 
 *   alt={image.alt} 
 *   width={500} 
 *   height={500}
 *   loading="lazy"
 * />
 * 
 * // Product images array
 * const productImages: HtmlImage[] = [
 *   new HtmlImage({
 *     src: '/products/mask-front.jpg',
 *     alt: 'Front view of surgical mask'
 *   }),
 *   new HtmlImage({
 *     src: '/products/mask-side.jpg',
 *     alt: 'Side view of surgical mask'
 *   })
 * ];
 * 
 * // Dynamic image gallery with Next.js Image
 * const gallery = productImages.map((img, index) => (
 *   <Image 
 *     key={index} 
 *     src={img.src} 
 *     alt={img.alt}
 *     width={500}
 *     height={500}
 *     loading="lazy"
 *   />
 * ));
 * ```
 * 
 * @module HtmlImage
 */

/**
 * HtmlImage Entity Class
 * 
 * Simple image data model containing source URL and alt text.
 * Ensures accessible image implementations across the application.
 */
export default class HtmlImage {
	/** Image source URL (absolute or relative path) */
	public src: string = ''
	
	/** Accessibility alt text describing the image content */
	public alt: string = ''

	/**
	 * Creates a new HtmlImage instance.
	 * Performs shallow copy of properties.
	 * 
	 * @param {Partial<HtmlImage>} partial - Partial image data to initialize
	 * 
 * @example
 * ```typescript
 * import Image from 'next/image';
 * 
 * // Basic usage
 * const logo = new HtmlImage({
 *   src: '/logo.png',
 *   alt: 'MedSource Pro Company Logo'
 * });
 * // Render with Next.js Image
 * <Image src={logo.src} alt={logo.alt} width={200} height={200} priority />
 * 
 * // Product image (external URL - ensure it's configured in next.config.mjs)
 * const productImg = new HtmlImage({
 *   src: 'https://cdn.example.com/products/12345.jpg',
 *   alt: 'N95 Respirator Mask - Box of 50'
 * });
 * // Render with Next.js Image
 * <Image src={productImg.src} alt={productImg.alt} width={500} height={500} loading="lazy" />
 * 
 * // From API response
 * const apiImage = {
 *   imagePath: '/uploads/product-123.jpg',
 *   imageDescription: 'Medical gloves'
 * };
 * const htmlImage = new HtmlImage({
 *   src: apiImage.imagePath,
 *   alt: apiImage.imageDescription
 * });
 * // Render with Next.js Image
 * <Image src={htmlImage.src} alt={htmlImage.alt} width={500} height={500} loading="lazy" />
 * 
 * // Decorative image (empty alt for accessibility)
 * const decorative = new HtmlImage({
 *   src: '/decorations/border.svg',
 *   alt: '' // Empty alt indicates decorative image
 * });
 * // Render with Next.js Image
 * <Image src={decorative.src} alt={decorative.alt} width={100} height={20} role="presentation" />
 * ```
	 */
	constructor(partial?: Partial<HtmlImage>) {
		if (partial) {
			Object.assign(this, partial) // Assign provided properties
		}
	}
}
