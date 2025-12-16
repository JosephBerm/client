/**
 * Test Data Builders
 * 
 * Builder pattern for creating test data instances.
 * Follows the Builder pattern for flexible test data creation.
 * 
 * @see https://refactoring.guru/design-patterns/builder
 */

import { Product } from '@_classes/Product'
import Address from '@_classes/common/Address'

/**
 * Builder for creating Product instances in tests.
 */
export class ProductBuilder {
  private product: Partial<Product> = {
    id: 'test-product-1',
    name: 'Test Product',
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

  withManufacturer(manufacturer: string): this {
    this.product.manufacturer = manufacturer
    return this
  }

  withOutOfStock(): this {
    this.product.stock = 0
    return this
  }

  build(): Product {
    return new Product(this.product as Partial<Product>)
  }
}

/**
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
