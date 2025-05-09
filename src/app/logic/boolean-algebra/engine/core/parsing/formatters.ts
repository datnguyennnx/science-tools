/**
 * Expression Formatters
 *
 * This module provides functions for formatting Boolean expression trees
 * into different string representations.
 */

import { BooleanExpression } from '../types/types'
import { InputFormat } from './types'

/**
 * Format a Boolean expression tree as a standard Boolean string
 */
export function formatToBoolean(expr: BooleanExpression): string {
  switch (expr.type) {
    case 'VARIABLE':
      return expr.value as string
    case 'CONSTANT':
      return (expr.value as boolean) ? '1' : '0'
    case 'NOT':
      return `!(${formatToBoolean(expr.left!)})`
    case 'AND':
      return `(${formatToBoolean(expr.left!)} * ${formatToBoolean(expr.right!)})`
    case 'OR':
      return `(${formatToBoolean(expr.left!)} + ${formatToBoolean(expr.right!)})`
    default:
      throw new Error(`Unknown expression type: ${expr.type}`)
  }
}

/**
 * Format a Boolean expression tree as a LaTeX string
 */
export function formatToLatex(expr: BooleanExpression): string {
  switch (expr.type) {
    case 'VARIABLE':
      return expr.value as string
    case 'CONSTANT':
      return (expr.value as boolean) ? '1' : '0'
    case 'NOT':
      // Format the inner expression and add negation
      const inner = formatToLatex(expr.left!)

      // Add LaTeX negation
      return `\\lnot ${inner}`
    case 'AND':
      return `(${formatToLatex(expr.left!)} \\land ${formatToLatex(expr.right!)})`
    case 'OR':
      return `(${formatToLatex(expr.left!)} \\lor ${formatToLatex(expr.right!)})`
    default:
      throw new Error(`Unknown expression type: ${expr.type}`)
  }
}

/**
 * Format expression to the specified output format
 */
export function formatExpression(
  expr: BooleanExpression,
  outputFormat: InputFormat = 'standard'
): string {
  if (outputFormat === 'latex') {
    return formatToLatex(expr)
  }
  return formatToBoolean(expr)
}
