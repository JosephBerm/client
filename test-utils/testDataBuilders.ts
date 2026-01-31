/**
 * Test Data Builders Pattern
 * 
 * MAANG-Level: Provides deterministic test data with builder pattern.
 * Ensures consistent, predictable test data across all test files.
 * 
 * **Benefits:**
 * - DRY: No duplicate test data creation
 * - Flexibility: Easy to customize data for specific test cases
 * - Maintainability: Single source of truth for test data
 * - Edge Case Testing: Built-in methods for testing edge cases
 * 
 * **Usage:**
 * ```typescript
 * import { ProductBuilder, CartItemBuilder } from '@/test-utils/testDataBuilders'
 * 
 * const product = new ProductBuilder()
 *   .withId('prod-1')
 *   .withName('Test Product')
 *   .withPrice(99.99)
 *   .build()
 * ```
 */

import { Product } from '@_classes/Product'
import Quote from '@_classes/Quote'
import Name from '@_classes/common/Name'
import Address from '@_classes/common/Address'
import type { CartItem } from '@_features/cart/stores/useCartStore'
import type { QuoteFormData } from '@_core'

/**
 * Product Test Data Builder
 * 
 * Builder pattern for creating Product instances in tests.
 * Provides fluent API for easy test data creation.
 */
export class ProductBuilder {
  private product: Partial<Product> = {
    id: 'test-product-1',
    name: 'Test Medical Product',
    sku: 'TEST-001',
    price: 99.99,
    stock: 10,
    category: 'PPE',
    description: 'Test product description',
    manufacturer: 'Test Manufacturer',
    createdAt: new Date('2024-01-01'),
    updatedAt: null,
  }

  withId(id: string): this {
    this.product.id = id
    return this
  }

  withName(name: string): this {
    this.product.name = name
    return this
  }

  withSku(sku: string): this {
    this.product.sku = sku
    return this
  }

  withPrice(price: number): this {
    this.product.price = price
    return this
  }

  withStock(stock: number): this {
    this.product.stock = stock
    return this
  }

  withCategory(category: string): this {
    this.product.category = category
    return this
  }

  withDescription(description: string): this {
    this.product.description = description
    return this
  }

  withoutId(): this {
    this.product.id = undefined
    return this
  }

  withZeroPrice(): this {
    this.product.price = 0
    return this
  }

  withNegativePrice(): this {
    this.product.price = -10
    return this
  }

  withZeroStock(): this {
    this.product.stock = 0
    return this
  }

  withEmptyName(): this {
    this.product.name = ''
    return this
  }

  withVeryLongName(): this {
    this.product.name = 'A'.repeat(10000)
    return this
  }

  withUnicodeName(): this {
    this.product.name = '产品名称 🚀 Test Product'
    return this
  }

  withMaliciousName(): this {
    this.product.name = '<script>alert("xss")</script>'
    return this
  }

  build(): Product {
    return new Product(this.product as Partial<Product>)
  }
}

/**
 * Cart Item Test Data Builder
 * 
 * Builder pattern for creating CartItem instances in tests.
 */
export class CartItemBuilder {
  private item: Partial<CartItem> = {
    productId: 'test-product-1',
    quantity: 1,
    price: 99.99,
    name: 'Test Product',
  }

  withProductId(productId: string): this {
    this.item.productId = productId
    return this
  }

  withQuantity(quantity: number): this {
    this.item.quantity = quantity
    return this
  }

  withPrice(price: number): this {
    this.item.price = price
    return this
  }

  withName(name: string): this {
    this.item.name = name
    return this
  }

  withZeroQuantity(): this {
    this.item.quantity = 0
    return this
  }

  withNegativeQuantity(): this {
    this.item.quantity = -1
    return this
  }

  withZeroPrice(): this {
    this.item.price = 0
    return this
  }

  withNegativePrice(): this {
    this.item.price = -10
    return this
  }

  withMaxQuantity(): this {
    this.item.quantity = Number.MAX_SAFE_INTEGER
    return this
  }

  withEmptyProductId(): this {
    this.item.productId = ''
    return this
  }

  withUnicodeProductId(): this {
    this.item.productId = '产品-1'
    return this
  }

  build(): CartItem {
    return {
      productId: this.item.productId!,
      quantity: this.item.quantity!,
      price: this.item.price!,
      name: this.item.name!,
    }
  }
}

/**
 * Quote Form Data Test Data Builder
 * 
 * Builder pattern for creating QuoteFormData instances in tests.
 * Supports both authenticated and guest user scenarios.
 */
export class QuoteFormDataBuilder {
  private data: Partial<QuoteFormData> = {
    items: [],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    notes: '',
  }

  // Authenticated user fields
  withCustomerId(customerId: string): this {
    this.data.customerId = customerId
    this.data.isAuthenticated = true
    return this
  }

  withIsAuthenticated(isAuthenticated: boolean): this {
    this.data.isAuthenticated = isAuthenticated
    return this
  }

  // Guest user fields
  withFirstName(firstName: string): this {
    this.data.firstName = firstName
    this.data.isAuthenticated = false
    return this
  }

  withLastName(lastName: string): this {
    this.data.lastName = lastName
    this.data.isAuthenticated = false
    return this
  }

  withEmail(email: string): this {
    this.data.email = email
    this.data.isAuthenticated = false
    return this
  }

  // Common fields
  withItems(items: Array<{ productId: string; quantity: number; price: number }>): this {
    this.data.items = items
    return this
  }

  withItem(productId: string, quantity: number, price: number): this {
    if (!this.data.items) {
      this.data.items = []
    }
    this.data.items.push({ productId, quantity, price })
    return this
  }

  withNotes(notes: string): this {
    this.data.notes = notes
    return this
  }

  withEmptyNotes(): this {
    this.data.notes = ''
    return this
  }

  withValidUntil(date: Date): this {
    this.data.validUntil = date
    return this
  }

  withPastValidUntil(): this {
    this.data.validUntil = new Date(Date.now() - 24 * 60 * 60 * 1000) // Yesterday
    return this
  }

  withEmptyItems(): this {
    this.data.items = []
    return this
  }

  withInvalidEmail(): this {
    this.data.email = 'not-an-email'
    this.data.isAuthenticated = false
    return this
  }

  withEmptyFirstName(): this {
    this.data.firstName = ''
    this.data.isAuthenticated = false
    return this
  }

  withEmptyLastName(): this {
    this.data.lastName = ''
    this.data.isAuthenticated = false
    return this
  }

  build(): QuoteFormData {
    // Ensure at least one item for valid quote
    if (!this.data.items || this.data.items.length === 0) {
      this.data.items = [
        {
          productId: 'test-product-1',
          quantity: 1,
          price: 99.99,
        },
      ]
    }

    // Ensure validUntil is set
    if (!this.data.validUntil) {
      this.data.validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }

    return this.data as QuoteFormData
  }
}

/**
 * Name Test Data Builder
 * 
 * Builder pattern for creating Name instances in tests.
 */
export class NameBuilder {
  private name: Partial<Name> = {
    first: 'John',
    last: 'Doe',
  }

  withFirst(first: string): this {
    this.name.first = first
    return this
  }

  withLast(last: string): this {
    this.name.last = last
    return this
  }

  withMiddle(middle: string): this {
    this.name.middle = middle
    return this
  }

  withTitle(title: string): this {
    this.name.title = title
    return this
  }

  withSuffix(suffix: string): this {
    this.name.suffix = suffix
    return this
  }

  withEmptyFirst(): this {
    this.name.first = ''
    return this
  }

  withEmptyLast(): this {
    this.name.last = ''
    return this
  }

  build(): Name {
    return new Name(this.name)
  }
}

/**
 * Address Test Data Builder
 * 
 * Builder pattern for creating Address instances in tests.
 */
export class AddressBuilder {
  private address: Partial<Address> = {
    addressOne: '123 Test Street',
    city: 'Austin',
    state: 'TX',
    zipCode: '78701',
    country: 'USA',
  }

  withStreet(street: string): this {
    this.address.addressOne = street
    return this
  }

  withCity(city: string): this {
    this.address.city = city
    return this
  }

  withState(state: string): this {
    this.address.state = state
    return this
  }

  withZip(zip: string): this {
    this.address.zipCode = zip
    return this
  }

  withCountry(country: string): this {
    this.address.country = country
    return this
  }

  withEmptyStreet(): this {
    this.address.addressOne = ''
    return this
  }

  build(): Address {
    return new Address(this.address as Partial<Address>)
  }
}
