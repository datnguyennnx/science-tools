/**
 * Derived Boolean Operations
 *
 * This module provides functions to create complex boolean operations (XOR, NAND, NOR)
 * using the basic operations (AND, OR, NOT) supported by the boolean algebra engine.
 */

/**
 * Create an XOR expression from two input expressions
 * A XOR B ≡ (A OR B) AND NOT(A AND B)
 *
 * @param exprA The first expression as a string
 * @param exprB The second expression as a string
 * @returns A string representing the XOR operation using basic operators
 */
export function createXOR(
  exprA: string | number | boolean,
  exprB: string | number | boolean
): string {
  // Convert inputs to strings if they aren't already
  const strA = String(exprA)
  const strB = String(exprB)

  // Ensure expressions are properly parenthesized
  const a = wrapWithParens(strA)
  const b = wrapWithParens(strB)

  // XOR implementation: (A OR B) AND NOT(A AND B)
  return `(${a} + ${b}) * !(${a} * ${b})`
}

/**
 * Create a NAND expression from two input expressions
 * A NAND B ≡ NOT(A AND B)
 *
 * @param exprA The first expression as a string
 * @param exprB The second expression as a string
 * @returns A string representing the NAND operation using basic operators
 */
export function createNAND(
  exprA: string | number | boolean,
  exprB: string | number | boolean
): string {
  // Convert inputs to strings if they aren't already
  const strA = String(exprA)
  const strB = String(exprB)

  // Ensure expressions are properly parenthesized
  const a = wrapWithParens(strA)
  const b = wrapWithParens(strB)

  // NAND implementation: NOT(A AND B)
  return `!(${a} * ${b})`
}

/**
 * Create a NOR expression from two input expressions
 * A NOR B ≡ NOT(A OR B)
 *
 * @param exprA The first expression as a string
 * @param exprB The second expression as a string
 * @returns A string representing the NOR operation using basic operators
 */
export function createNOR(
  exprA: string | number | boolean,
  exprB: string | number | boolean
): string {
  // Convert inputs to strings if they aren't already
  const strA = String(exprA)
  const strB = String(exprB)

  // Ensure expressions are properly parenthesized
  const a = wrapWithParens(strA)
  const b = wrapWithParens(strB)

  // NOR implementation: NOT(A OR B)
  return `!(${a} + ${b})`
}

/**
 * Helper function to wrap an expression with parentheses if it's not already wrapped
 * and if the expression is not a single variable or constant
 * @returns The expression wrapped with parentheses if needed
 */
function wrapWithParens(expr: string): string {
  expr = expr.trim()

  // If it's a simple variable or constant, wrap it with parentheses for consistency
  if (expr.length === 1 || (expr.length === 2 && expr.startsWith('!'))) {
    return `(${expr})`
  }

  // If it's already fully parenthesized, return as is
  if (expr.startsWith('(') && expr.endsWith(')')) {
    return expr
  }

  // Otherwise, wrap it with parentheses
  return `(${expr})`
}

/**
 * Higher-level operation functions that can be exposed to users
 */

/**
 * Create an XOR expression with a friendlier API
 */
export function xor(a: string | number | boolean, b: string | number | boolean): string {
  return createXOR(a, b)
}

/**
 * Create a NAND expression with a friendlier API
 */
export function nand(a: string | number | boolean, b: string | number | boolean): string {
  return createNAND(a, b)
}

/**
 * Create a NOR expression with a friendlier API
 */
export function nor(a: string | number | boolean, b: string | number | boolean): string {
  return createNOR(a, b)
}

/**
 * Create an XNOR (equivalence) expression
 * A XNOR B ≡ NOT(A XOR B) ≡ (A AND B) OR (NOT A AND NOT B)
 */
export function xnor(a: string | number | boolean, b: string | number | boolean): string {
  return `!(${createXOR(a, b)})`
}

/**
 * Create an implication expression
 * A IMPLIES B ≡ NOT A OR B
 */
export function implies(a: string | number | boolean, b: string | number | boolean): string {
  const strA = String(a)
  const wrappedA = wrapWithParens(strA)
  const wrappedB = wrapWithParens(String(b))

  return `!(${wrappedA}) + ${wrappedB}`
}

/**
 * Create a bi-implication (if and only if) expression
 * A IFF B ≡ (A IMPLIES B) AND (B IMPLIES A) ≡ A XNOR B
 */
export function iff(a: string | number | boolean, b: string | number | boolean): string {
  return xnor(a, b)
}
