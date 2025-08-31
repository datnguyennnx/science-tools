/**
 * Canonical Forms
 *
 * Provides transformations to canonical boolean algebra forms:
 * - Sum of Products (SoP) - canonical sum form
 * - Product of Sums (PoS) - canonical product form
 */

export { toSumOfProducts, toSopCanonical, isSumOfProducts } from './sum-of-products'

export { toProductOfSums, toPosCanonical, isProductOfSums } from './product-of-sums'

// Re-export types for convenience
export type { ExpressionTransformer } from '../core/boolean-types'
