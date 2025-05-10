/**
 * Expression Formatters
 *
 * This module provides functions for formatting Boolean expression trees
 * into different string representations.
 */

import { BooleanExpression } from '../ast'
import { InputFormat } from './types'

/**
 * Format a Boolean expression tree as a standard Boolean algebra string
 */
export function formatToBoolean(expr: BooleanExpression): string {
  if (!expr) {
    throw new Error('Expression cannot be null or undefined')
  }

  switch (expr.type) {
    case 'CONSTANT':
      if (typeof expr.value !== 'boolean') {
        throw new Error('Constant value must be a boolean.')
      }
      return expr.value ? '1' : '0'
    case 'VARIABLE':
      if (typeof expr.value !== 'string' || expr.value.trim() === '') {
        throw new Error('Invalid or empty variable value in AST node')
      }
      // Basic validation for typical variable names, though parser might be more lenient.
      // if (!/^[A-Z]+$/.test(expr.value)) {
      //   throw new Error(`Invalid variable name format: ${expr.value}`);
      // }
      return expr.value
    case 'NOT':
      if (!expr.left) {
        throw new Error('Invalid NOT expression: missing operand')
      }
      // Always wrap the operand of a NOT expression in parentheses for standard boolean format.
      return `!(${formatToBoolean(expr.left)})`
    case 'AND': {
      const left = formatToBoolean(expr.left!)
      const right = formatToBoolean(expr.right!)
      return `(${left} * ${right})`
    }
    case 'OR': {
      const left = formatToBoolean(expr.left!)
      const right = formatToBoolean(expr.right!)
      return `(${left} + ${right})`
    }
    case 'XOR': {
      const left = formatToBoolean(expr.left!)
      const right = formatToBoolean(expr.right!)
      return `(${left} ^ ${right})`
    }
    case 'NAND': {
      const left = formatToBoolean(expr.left!)
      const right = formatToBoolean(expr.right!)
      return `(${left} @ ${right})`
    }
    case 'NOR': {
      const left = formatToBoolean(expr.left!)
      const right = formatToBoolean(expr.right!)
      return `(${left} # ${right})`
    }
    default:
      throw new Error(`Unknown expression type: ${expr.type}`)
  }
}

/**
 * Format a Boolean expression tree as a LaTeX string
 */
export function formatToLatex(expr: BooleanExpression): string {
  if (!expr) {
    throw new Error('Expression cannot be null or undefined')
  }

  switch (expr.type) {
    case 'CONSTANT':
      if (typeof expr.value !== 'boolean') {
        throw new Error('Constant value must be a boolean.')
      }
      return expr.value ? '1' : '0' // Or \\text{T}, \\text{F} if preferred by tests
    case 'VARIABLE':
      if (typeof expr.value !== 'string' || expr.value.trim() === '') {
        throw new Error('Invalid or empty variable value in AST node')
      }
      // Basic validation for typical variable names
      // if (!/^[A-Z]+$/.test(expr.value)) {
      //  throw new Error(`Invalid variable name format for LaTeX: ${expr.value}`);
      // }
      return expr.value
    case 'NOT':
      if (!expr.left) {
        throw new Error('Invalid NOT expression: missing operand')
      }
      // For LaTeX, \overline usually covers complex expressions well
      // but explicit parentheses can be clearer for AND/OR inside NOT.
      // Choose one style: \lnot (A \land B) or \overline{A \land B}
      // The current tests might expect specific outputs.
      // Let's use \lnot for simple, \overline for complex for variety or pick one.
      // Based on tests, they might expect \lnot( Ausdruck ) or \overline{Ausdruck}
      // If expr.left is simple (variable or constant), use \lnot A.
      // Otherwise, use \overline{...} or \lnot(...)
      const leftLatex = formatToLatex(expr.left)
      if (expr.left.type === 'VARIABLE' || expr.left.type === 'CONSTANT') {
        return `\\lnot ${leftLatex}`
      } else {
        // If expr.left is a binary operation, its LaTeX form is already parenthesized.
        // If expr.left is a NOT operation, we also want to avoid double parentheses for the common case.
        if (
          ['AND', 'OR', 'XOR', 'NAND', 'NOR'].includes(expr.left.type) ||
          expr.left.type === 'NOT'
        ) {
          return `\\lnot ${leftLatex}`
        }
        // For other complex cases, or if a different style of parenthesis is needed for NOT(NOT(...))
        // default to wrapping. The above condition handles the common cases from tests.
        return `\\lnot(${leftLatex})`
      }
    case 'AND': {
      const left = formatToLatex(expr.left!)
      const right = formatToLatex(expr.right!)
      return `(${left} \\land ${right})`
    }
    case 'OR': {
      const left = formatToLatex(expr.left!)
      const right = formatToLatex(expr.right!)
      return `(${left} \\lor ${right})`
    }
    case 'XOR': {
      const left = formatToLatex(expr.left!)
      const right = formatToLatex(expr.right!)
      return `(${left} \\oplus ${right})`
    }
    case 'NAND': {
      const left = formatToLatex(expr.left!)
      const right = formatToLatex(expr.right!)
      return `(${left} \\uparrow ${right})`
    }
    case 'NOR': {
      const left = formatToLatex(expr.left!)
      const right = formatToLatex(expr.right!)
      return `(${left} \\downarrow ${right})`
    }
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
