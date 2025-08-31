/**
 * Operator Symbols
 *
 * Mapping of operator types to their string representations for different output formats.
 */

import { OutputFormat, OperatorType } from './types'

/**
 * Mapping of operator types to their string representations for each format.
 */
export const operatorSymbols: Record<OutputFormat, Record<OperatorType, string>> = {
  standard: {
    AND: '*',
    OR: '+',
    NOT: '!',
    XOR: '^',
    NAND: '@', // Assuming '@' for NAND
    NOR: '#', // Assuming '#' for NOR
    XNOR: '<=>', // Assuming '<=>' for XNOR
  },
  latex: {
    AND: '\\land',
    OR: '\\lor',
    NOT: '\\lnot',
    XOR: '\\oplus',
    NAND: '\\uparrow',
    NOR: '\\downarrow',
    XNOR: '\\leftrightarrow',
  },
}
