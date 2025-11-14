/**
 * Utility class for working with GUIDs (Globally Unique Identifiers).
 * Provides methods for generating and validating UUID strings.
 * 
 * @example
 * ```typescript
 * // Generate a new GUID
 * const id = Guid.newGuid();
 * 
 * // Check if GUID is empty
 * import { logger } from '@_core';
 * 
 * if (Guid.isEmpty(id)) {
 *   logger.warn('Empty GUID detected');
 * }
 * ```
 */
class Guid {
    /**
     * Generates a new random UUID (v4).
     * Uses the browser's crypto.randomUUID() for cryptographically strong random values.
     * 
     * @returns {string} A new UUID string in the format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
     * 
     * @example
     * ```typescript
     * const userId = Guid.newGuid(); // "550e8400-e29b-41d4-a716-446655440000"
     * ```
     */
    static newGuid(): string {
        return crypto.randomUUID();
    }

    /**
     * Checks if a GUID is empty (all zeros).
     * 
     * @param {string} guid - The GUID string to check
     * @returns {boolean} True if the GUID is empty (00000000-0000-0000-0000-000000000000), false otherwise
     * 
     * @example
     * ```typescript
     * Guid.isEmpty('00000000-0000-0000-0000-000000000000'); // true
     * Guid.isEmpty('550e8400-e29b-41d4-a716-446655440000'); // false
     * ```
     */
    static isEmpty(guid: string): boolean {
        return guid === '00000000-0000-0000-0000-000000000000';
    }

    /**
     * Checks if a GUID is not empty (contains any non-zero values).
     * 
     * @param {string} guid - The GUID string to check
     * @returns {boolean} True if the GUID is not empty, false if it is empty
     * 
     * @example
     * ```typescript
     * Guid.isNotEmpty('550e8400-e29b-41d4-a716-446655440000'); // true
     * Guid.isNotEmpty('00000000-0000-0000-0000-000000000000'); // false
     * ```
     */
    static isNotEmpty(guid: string): boolean {
        return !Guid.isEmpty(guid);
    }

    /**
     * Checks if a GUID is null or empty.
     * Useful for validating optional GUID fields.
     * 
     * @param {string | null} guid - The GUID string to check, or null
     * @returns {boolean} True if the GUID is null or empty, false otherwise
     * 
     * @example
     * ```typescript
     * Guid.isNullOrEmpty(null); // true
     * Guid.isNullOrEmpty('00000000-0000-0000-0000-000000000000'); // true
     * Guid.isNullOrEmpty('550e8400-e29b-41d4-a716-446655440000'); // false
     * ```
     */
    static isNullOrEmpty(guid: string | null): boolean {
        return guid === null || Guid.isEmpty(guid);
    }

    /**
     * Checks if a GUID is neither null nor empty.
     * Useful for validating required GUID fields.
     * 
     * @param {string | null} guid - The GUID string to check, or null
     * @returns {boolean} True if the GUID has a value and is not empty, false otherwise
     * 
     * @example
     * ```typescript
     * Guid.isNotNullOrEmpty('550e8400-e29b-41d4-a716-446655440000'); // true
     * Guid.isNotNullOrEmpty(null); // false
     * Guid.isNotNullOrEmpty('00000000-0000-0000-0000-000000000000'); // false
     * ```
     */
    static isNotNullOrEmpty(guid: string | null): boolean {
        return !Guid.isNullOrEmpty(guid);
    }
}

export default Guid;
