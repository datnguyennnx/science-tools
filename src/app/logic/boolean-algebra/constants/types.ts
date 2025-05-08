/**
 * Types for the Boolean algebra laws
 */

export interface BooleanLaw {
  name: string
  formula: string
  regex?: RegExp
  replacement?: string | ((match: RegExpMatchArray) => string)
}

export interface BooleanLaws {
  identity: BooleanLaw[]
  domination: BooleanLaw[]
  idempotent: BooleanLaw[]
  doubleNegation: BooleanLaw
  complement: BooleanLaw[]
  absorption: BooleanLaw[]
  deMorgan: BooleanLaw[]
  commutative: BooleanLaw[]
  associative: BooleanLaw[]
  distributive: BooleanLaw[]
  constantReduction: BooleanLaw[]
  commonPatterns: BooleanLaw[]
  specialPatterns: BooleanLaw[]
  latexPatterns: BooleanLaw[]
}
