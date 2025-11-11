/**
 * UploadedFile Entity Class
 * 
 * Represents a file that has been uploaded to the server.
 * Used for handling file uploads (product images, documents, etc.) with metadata.
 * Tracks file name, content type, binary data, and server file path.
 * 
 * **Features:**
 * - File name tracking
 * - Content type/MIME type
 * - Binary file data (Uint8Array)
 * - Server file path reference
 * - File type extraction utility
 * 
 * **Use Cases:**
 * - Product image uploads
 * - Document attachments
 * - Profile pictures
 * - Any file upload operations
 * 
 * @example
 * ```typescript
 * // Create from file upload
 * const uploadedFile = new UploadedFile({
 *   name: 'product-image.jpg',
 *   contentType: 'image/jpeg',
 *   data: new Uint8Array([...]),
 *   filePath: '/uploads/products/product-image.jpg'
 * });
 * 
 * // Get file extension
 * console.log(uploadedFile.GetFileType()); // 'jpg'
 * 
 * // Image upload response
 * const response = await API.Store.Products.uploadImage(productId, formData);
 * const files: UploadedFile[] = response.data.payload;
 * files.forEach(file => {
 *   console.log(`Uploaded: ${file.name} at ${file.filePath}`);
 * });
 * ```
 * 
 * @module UploadedFile
 */

/**
 * UploadedFile Entity Class
 * 
 * Main uploaded file entity representing a file stored on the server.
 * Contains file metadata and optional binary data.
 */
export default class UploadedFile {
	/** Original file name (e.g., 'image.jpg', 'document.pdf') */
	public name: string | null = null
	
	/** MIME content type (e.g., 'image/jpeg', 'application/pdf') */
	public contentType: string | null = null
	
	/** Binary file data as Uint8Array (optional, may not be included in responses) */
	public data: Uint8Array | null = null
	
	/** Server file path where file is stored (e.g., '/uploads/products/image.jpg') */
	public filePath: string | null = null

	/**
	 * Creates a new UploadedFile instance.
	 * Performs shallow copy of properties.
	 * 
	 * @param {Partial<UploadedFile>} partial - Partial file data to initialize
	 * 
	 * @example
	 * ```typescript
	 * // Basic file metadata
	 * const file = new UploadedFile({
	 *   name: 'invoice.pdf',
	 *   contentType: 'application/pdf',
	 *   filePath: '/uploads/invoices/invoice-123.pdf'
	 * });
	 * 
	 * // File with binary data
	 * const fileWithData = new UploadedFile({
	 *   name: 'logo.png',
	 *   contentType: 'image/png',
	 *   data: new Uint8Array([137, 80, 78, 71, ...]),
	 *   filePath: '/uploads/logos/logo.png'
	 * });
	 * ```
	 */
	constructor(partial: Partial<UploadedFile>) {
		if (partial) {
			Object.assign(this, partial)
		}
	}

	/**
	 * Extracts and returns the file extension from the file name.
	 * Splits on '.' and returns the last part (extension).
	 * 
	 * @returns {string | null} File extension without dot (e.g., 'jpg', 'pdf') or null if no extension
	 * 
	 * @example
	 * ```typescript
	 * const file1 = new UploadedFile({ name: 'image.jpg' });
	 * console.log(file1.GetFileType()); // 'jpg'
	 * 
	 * const file2 = new UploadedFile({ name: 'document.backup.pdf' });
	 * console.log(file2.GetFileType()); // 'pdf' (last part only)
	 * 
	 * const file3 = new UploadedFile({ name: 'noextension' });
	 * console.log(file3.GetFileType()); // null
	 * 
	 * const file4 = new UploadedFile({ name: null });
	 * console.log(file4.GetFileType()); // null
	 * ```
	 */
	public GetFileType(): string | null {
		// Split filename on '.' and get last part (extension)
		// Returns null if name is null or has no extension
		return this.name?.split('.')[1] ?? null
	}
}
