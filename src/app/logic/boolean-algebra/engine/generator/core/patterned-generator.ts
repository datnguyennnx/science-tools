/**
 * Patterned Expression Generator
 *
 * Generates expressions with specific Boolean algebra patterns for educational purposes.
 */

import {
  ExpressionPattern,
  GeneratorOptions,
  defaultGeneratorOptions,
  OutputFormat,
  OperatorType,
} from '../types'
import { operatorSymbols } from '../symbols'

/**
 * Generate an expression with a guaranteed specific form or pattern
 */
export function generatePatternedExpression(
  pattern: ExpressionPattern,
  options: Partial<GeneratorOptions> = {}
): string {
  // Merge with default options
  const config = {
    ...defaultGeneratorOptions,
    ...options,
  }

  // Validate and default output format
  const validFormats = Object.keys(operatorSymbols) as OutputFormat[]
  const outputFormat = validFormats.includes(config.outputFormat) ? config.outputFormat : 'standard'

  // Variables to use
  const variables = config.availableVariables.slice(0, 3)
  const var1 = variables[Math.floor(Math.random() * variables.length)]
  const var2 = variables[(variables.indexOf(var1) + 1) % variables.length]
  const var3 = variables[(variables.indexOf(var2) + 1) % variables.length]

  // Get operator symbols for the current format
  const getSym = (op: string) => operatorSymbols[outputFormat][op as OperatorType]

  switch (pattern) {
    case 'deMorgan':
      return generateDeMorganPattern(var1, var2, outputFormat, getSym)

    case 'absorption':
      return generateAbsorptionPattern(var1, var2, outputFormat, getSym)

    case 'idempotent':
      return generateIdempotentPattern(var1, outputFormat, getSym)

    case 'distributive':
      return generateDistributivePattern(var1, var2, var3, outputFormat, getSym)

    case 'complement':
      return generateComplementPattern(var1, outputFormat, getSym)

    default:
      // Fallback to random expression
      return generateRandomExpression(3, config)
  }
}

function generateDeMorganPattern(
  var1: string,
  var2: string,
  outputFormat: OutputFormat,
  getSym: (op: string) => string
): string {
  const notSymbol = getSym('NOT')
  const orSymbol = getSym('OR')

  return outputFormat === 'latex'
    ? `${notSymbol} (${var1} ${orSymbol} ${var2})`
    : `${notSymbol}(${var1} ${orSymbol} ${var2})`
}

function generateAbsorptionPattern(
  var1: string,
  var2: string,
  outputFormat: OutputFormat,
  getSym: (op: string) => string
): string {
  const andSymbol = getSym('AND')
  const orSymbol = getSym('OR')

  // Generate A + (A * B) or A * (A + B) which can be simplified using absorption law
  const useOrForm = Math.random() < 0.5

  if (useOrForm) {
    return `${var1} ${orSymbol} (${var1} ${andSymbol} ${var2})`
  } else {
    return `${var1} ${andSymbol} (${var1} ${orSymbol} ${var2})`
  }
}

function generateIdempotentPattern(
  var1: string,
  outputFormat: OutputFormat,
  getSym: (op: string) => string
): string {
  const orSymbol = getSym('OR')
  return `${var1} ${orSymbol} ${var1}`
}

function generateDistributivePattern(
  var1: string,
  var2: string,
  var3: string,
  outputFormat: OutputFormat,
  getSym: (op: string) => string
): string {
  const andSymbol = getSym('AND')
  const orSymbol = getSym('OR')

  // Generate A * (B + C) or A + (B * C) which demonstrates distributive law
  const useAndOutside = Math.random() < 0.5

  if (useAndOutside) {
    return `${var1} ${andSymbol} (${var2} ${orSymbol} ${var3})`
  } else {
    return `${var1} ${orSymbol} (${var2} ${andSymbol} ${var3})`
  }
}

function generateComplementPattern(
  var1: string,
  outputFormat: OutputFormat,
  getSym: (op: string) => string
): string {
  const notSymbol = getSym('NOT')
  const orSymbol = getSym('OR')

  const negatedVar = outputFormat === 'latex' ? `${notSymbol} ${var1}` : `${notSymbol}(${var1})`
  return `${var1} ${orSymbol} ${negatedVar}`
}

// Import the random generator for fallback
import { generateRandomExpression } from './random-generator'
