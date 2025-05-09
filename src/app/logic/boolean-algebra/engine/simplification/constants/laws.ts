// File: laws.ts
import { BooleanLaws } from './types'

/**
 * The master table of Boolean-algebra laws.
 */
export const booleanLaws: BooleanLaws = {
  // Identity laws
  identity: [
    {
      name: 'AND Identity',
      formula: 'A * 1 = A',
      regex: /([A-Z])\s*\*\s*(1|T)|(?:1|T)\s*\*\s*([A-Z])/g,
      replacement: (m: RegExpMatchArray) => m[1] || m[3],
    },
    {
      name: 'OR Identity',
      formula: 'A + 0 = A',
      regex: /([A-Z])\s*\+\s*(0|F)|(?:0|F)\s*\+\s*([A-Z])/g,
      replacement: (m: RegExpMatchArray) => m[1] || m[3],
    },
  ],

  // Domination laws
  domination: [
    {
      name: 'AND Domination',
      formula: 'A * 0 = 0',
      regex: /([A-Z])\s*\*\s*(0|F)|(?:0|F)\s*\*\s*([A-Z])/g,
      replacement: '0',
    },
    {
      name: 'OR Domination',
      formula: 'A + 1 = 1',
      regex: /([A-Z])\s*\+\s*(1|T)|(?:1|T)\s*\+\s*([A-Z])/g,
      replacement: '1',
    },
  ],

  // Idempotent laws
  idempotent: [
    {
      name: 'AND Idempotent',
      formula: 'A * A = A',
      regex: /([A-Z])\s*\*\s*\1(?![A-Za-z0-9_])/g,
      replacement: '$1',
    },
    {
      name: 'OR Idempotent',
      formula: 'A + A = A',
      regex: /([A-Z])\s*\+\s*\1(?![A-Za-z0-9_])/g,
      replacement: '$1',
    },
    {
      name: 'Repeated Variable',
      formula: 'AA = A',
      regex: /([A-Z])([A-Z])\b/g,
      replacement: (m: RegExpMatchArray) => (m[1] === m[2] ? m[1] : m[0]),
    },
  ],

  // Double negation
  doubleNegation: {
    name: 'Double Negation',
    formula: '!(!A) = A',
    regex: /!\s*!\s*([A-Z](?![A-Za-z0-9_])|\([^)]*\))/g,
    replacement: '$1',
  },

  // Complement laws
  complement: [
    {
      name: 'AND Complement',
      formula: 'A * !A = 0',
      regex: /(?:([A-Z])\s*\*\s*!\1|!([A-Z])\s*\*\s*\2)(?![A-Za-z0-9_])/g,
      replacement: '0',
    },
    {
      name: 'OR Complement',
      formula: 'A + !A = 1',
      regex: /(?:([A-Z])\s*\+\s*!\1|!([A-Z])\s*\+\s*\2)(?![A-Za-z0-9_])/g,
      replacement: '1',
    },
  ],

  // Absorption laws
  absorption: [
    {
      name: 'Absorption (A + A*B = A)',
      formula: 'A + A*B = A',
      regex:
        /([A-Z])\s*\+\s*\1\s*\*\s*([A-Z01])(?![A-Za-z0-9_])|([A-Z01])\s*\*\s*([A-Z])\s*\+\s*\4(?![A-Za-z0-9_])/g,
      replacement: (m: RegExpMatchArray) => m[1] || m[4] || m[0],
    },
    {
      name: 'Absorption (A*(A+B)=A)',
      formula: 'A * (A + B) = A',
      regex:
        /([A-Z])\s*\*\s*\(\s*\1\s*\+\s*([A-Z01])\s*\)(?![A-Za-z0-9_])|\(\s*([A-Z01])\s*\+\s*([A-Z])\s*\)\s*\*\s*\4(?![A-Za-z0-9_])/g,
      replacement: (m: RegExpMatchArray) => m[1] || m[4] || m[0],
    },
  ],

  // De Morgan's laws (now handles nested subexpressions)
  deMorgan: [
    {
      name: "De Morgan's (product)",
      formula: '!(X * Y) = !X + !Y',
      regex: /!\(\s*(?:\([^()]+\)|[A-Z01])\s*\*\s*(?:\([^()]+\)|[A-Z01])\s*\)/g,
      replacement: (m: RegExpMatchArray) => {
        const inner = m[0].slice(2, -1).trim()
        const [L, R] = inner.split(/\*/).map((s: string) => s.trim())
        const rL = L.startsWith('!') ? L : `!(${L})`
        const rR = R.startsWith('!') ? R : `!(${R})`
        return `${rL} + ${rR}`
      },
    },
    {
      name: "De Morgan's (sum)",
      formula: '!(X + Y) = !X * !Y',
      regex: /!\(\s*([^()]+)\s*\+\s*([^()]+)\s*\)/g,
      replacement: (m: RegExpMatchArray) => {
        const [, A, B] = m
        const rA = A.startsWith('!') ? A : `!(${A})`
        const rB = B.startsWith('!') ? B : `!(${B})`
        return `${rA} * ${rB}`
      },
    },
  ],

  // Commutative & associative (no regex needed)
  commutative: [
    { name: 'AND Commutative', formula: 'A * B = B * A' },
    { name: 'OR Commutative', formula: 'A + B = B + A' },
  ],
  associative: [
    { name: 'AND Associative', formula: '(A * B) * C = A * (B * C)' },
    { name: 'OR Associative', formula: '(A + B) + C = A + (B + C)' },
  ],

  // Distributive expansions & factorizations
  distributive: [
    {
      name: 'Distributive (X*(Y+Z))',
      formula: 'X * (Y + Z) = XY + XZ',
      regex: /([A-Z01]|!\([^()]+\))\s*\*\s*\(\s*([^()]+)\s*\+\s*([^()]+)\s*\)/g,
      replacement: '($1 * $2) + ($1 * $3)',
    },
    {
      name: 'Distributive (X+(Y*Z))',
      formula: 'X + (Y * Z) = (X + Y)(X + Z)',
      regex: /([A-Z01]|!\([^()]+\))\s*\+\s*\(\s*([^()]+)\s*\*\s*([^()]+)\s*\)/g,
      replacement: '($1 + $2) * ($1 + $3)',
    },
    {
      name: 'Distributive ( (X+Y)*Z )',
      formula: '(X + Y) * Z = XZ + YZ',
      regex: /\(\s*([^()]+)\s*\+\s*([^()]+)\s*\)\s*\*\s*([^()]+)/g,
      replacement: '($1 * $3) + ($2 * $3)',
    },
    {
      name: 'Distributive (XZ + YZ → (X+Y)Z)',
      formula: 'X*Z + Y*Z = (X+Y)*Z',
      regex: /([A-Z01]|!\([^()]+\))\s*\*\s*([^()]+)\s*\+\s*\1\s*\*\s*([^()]+)/g,
      replacement: '$1 * ($2 + $3)',
    },
  ],

  // Constant-reduction (0/1) laws
  constantReduction: [
    { name: '!0=1', formula: '!0 = 1', regex: /!\s*0/g, replacement: '1' },
    { name: '!1=0', formula: '!1 = 0', regex: /!\s*1/g, replacement: '0' },
    { name: 'X*0=0', formula: 'X * 0 = 0', regex: /([A-Z])\s*\*\s*0/g, replacement: '0' },
    { name: 'X*1=X', formula: 'X * 1 = X', regex: /([A-Z])\s*\*\s*1/g, replacement: '$1' },
    { name: '0*X=0', formula: '0 * X = 0', regex: /0\s*\*\s*([A-Z])/g, replacement: '0' },
    { name: '1*X=X', formula: '1 * X = X', regex: /1\s*\*\s*([A-Z])/g, replacement: '$1' },
    { name: 'X+0=X', formula: 'X + 0 = X', regex: /([A-Z])\s*\+\s*0/g, replacement: '$1' },
    { name: 'X+1=1', formula: 'X + 1 = 1', regex: /([A-Z])\s*\+\s*1/g, replacement: '1' },
    { name: '0+X=X', formula: '0 + X = X', regex: /0\s*\+\s*([A-Z])/g, replacement: '$1' },
    { name: '1+X=1', formula: '1 + X = 1', regex: /1\s*\+\s*([A-Z])/g, replacement: '1' },
  ],

  // (Optional) any hard-coded commonPatterns
  commonPatterns: [
    // … your existing specific regex→replacement patterns …
  ],

  // Only minimal cleanup remains here:
  specialPatterns: [
    {
      name: 'Simplify Negated Parentheses',
      formula: '!(V) = !V',
      regex: /!\(\s*([^()]+)\s*\)/g,
      replacement: '!$1',
    },
    {
      name: 'Remove Redundant Parentheses',
      formula: '(V) = V',
      regex: /\(\s*([^()]+)\s*\)/g,
      replacement: '$1',
    },
  ],

  // (We no longer need latexPatterns since we do a full LaTeX→boolean preprocess)
  latexPatterns: [],
}
