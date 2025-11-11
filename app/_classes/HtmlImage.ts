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
 * // Basic image
 * const image = new HtmlImage({
 *   src: '/images/product-1.jpg',
 *   alt: 'Surgical mask product image'
 * });
 * 
 * // Render image
 * <img src={image.src} alt={image.alt} />
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
 * // Dynamic image gallery
 * const gallery = productImages.map((img, index) => (
 *   <img key={index} src={img.src} alt={img.alt} />
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
	 * // Basic usage
	 * const logo = new HtmlImage({
	 *   src: '/logo.png',
	 *   alt: 'MedSource Pro Company Logo'
	 * });
	 * 
	 * // Product image
	 * const productImg = new HtmlImage({
	 *   src: 'https://cdn.example.com/products/12345.jpg',
	 *   alt: 'N95 Respirator Mask - Box of 50'
	 * });
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
	 * 
	 * // Decorative image (empty alt for accessibility)
	 * const decorative = new HtmlImage({
	 *   src: '/decorations/border.svg',
	 *   alt: '' // Empty alt indicates decorative image
	 * });
	 * ```
	 */
	constructor(partial?: Partial<HtmlImage>) {
		if (partial) {
			Object.assign(this, partial) // Assign provided properties
		}
	}
}
