/**
 * Constants for Boolean Algebra Simplification Components
 *
 * This file contains all the rule mappings and constants used by the
 * simplification components to provide user-friendly displays.
 */

export type RuleMapping = {
  displayName: string
  description: string
  formula: string | string[]
}

export type RuleMappings = Record<string, RuleMapping>

/**
 * Enhanced rule mappings for user-friendly step information display
 */
export const RULE_MAPPINGS: RuleMappings = {
  // Stage-level mappings
  'Expand XNOR Operations': {
    displayName: 'Expand XNOR Operations',
    description:
      'Convert biconditional (↔) operations to standard AND/OR form for easier manipulation',
    formula: 'A \\leftrightarrow B = (A \\land B) \\lor (\\lnot A \\land \\lnot B)',
  },
  'Expand NOR Operations': {
    displayName: 'Expand NOR Operations',
    description: 'Convert NOR (↓) operations to NOT/OR form to prepare for further simplification',
    formula: 'A \\downarrow B = \\lnot (A \\lor B)',
  },
  'Remove Double Negations': {
    displayName: 'Remove Double Negations',
    description: 'Simplify expressions like ¬¬A to just A using double negation elimination',
    formula: '\\lnot \\lnot A = A',
  },
  'Apply Boolean Algebra Rules': {
    displayName: 'Apply Boolean Algebra Rules',
    description:
      "Use fundamental Boolean algebra laws like idempotence, absorption, and De Morgan's laws",
    formula:
      'A \\land A = A \\quad A \\lor A = A \\quad A \\land (A \\lor B) = A \\quad \\lnot(A \\land B) = \\lnot A \\lor \\lnot B',
  },
  'Basic Minimization': {
    displayName: 'Basic Minimization',
    description: 'Apply absorption and consensus theorems to reduce expression complexity',
    formula:
      'A \\land (A \\lor B) = A \\quad A \\lor (A \\land B) = A \\quad AB + \\bar{A}C + BC = AB + \\bar{A}C',
  },
  'Convert to Canonical Form': {
    displayName: 'Convert to Canonical Form',
    description:
      'Transform expression to Sum of Products (SOP) or Product of Sums (POS) canonical form',
    formula: '\\text{SOP: } \\sum m(1,3,5)\\ \\text{POS: } \\prod M(0,2,4)',
  },
  'Convert to Sum of Products (SOP) Canonical Form': {
    displayName: 'Convert to Sum of Products (SOP)',
    description:
      'Transform expression to Sum of Products canonical form for systematic analysis and further optimization',
    formula:
      'f(A,B,C) = \\sum m(0,1,3,5,7) = ABC + A\\bar{B}C + A\\bar{B}\\bar{C} + \\bar{A}BC + AB\\bar{C}',
  },
  'Convert to Product of Sums (POS) Canonical Form': {
    displayName: 'Convert to Product of Sums (POS)',
    description:
      'Transform expression to Product of Sums canonical form for systematic analysis and further optimization',
    formula:
      'f(A,B,C) = \\prod M(0,2,4,6) = (A+B+C)(A+B+\\bar{C})(A+\\bar{B}+C)(\\bar{A}+B+C)(\\bar{A}+B+\\bar{C})',
  },
  'Advanced Minimization': {
    displayName: 'Advanced Minimization',
    description:
      'Apply systematic methods to find the most efficient Boolean expression. Karnaugh maps use visual grouping to identify simplifications, while Quine-McCluskey provides algorithmic term reduction for complex expressions',
    formula: [
      '\\text{Karnaugh Map: Visual grouping method}',
      '\\text{Quine-McCluskey: Systematic algorithmic reduction}',
      '\\text{Example: }f(A,B,C)=\\sum m(0,1,3,5,7)',
    ],
  },

  // Canonical form variations (consolidated)

  // Individual rule mappings
  'AND Idempotence': {
    displayName: 'Idempotent Law (AND)',
    description: 'Remove duplicate terms in AND operations',
    formula: 'A \\land A = A',
  },
  'OR Idempotence': {
    displayName: 'Idempotent Law (OR)',
    description: 'Remove duplicate terms in OR operations',
    formula: 'A \\lor A = A',
  },
  'AND Absorption': {
    displayName: 'Absorption Law (AND)',
    description: 'Simplify expressions like A ∧ (A ∨ B) to just A',
    formula: 'A \\land (A \\lor B) = A',
  },
  'OR Absorption': {
    displayName: 'Absorption Law (OR)',
    description: 'Simplify expressions like A ∨ (A ∧ B) to just A',
    formula: 'A \\lor (A \\land B) = A',
  },
  "De Morgan's Law (AND)": {
    displayName: "De Morgan's Law (AND)",
    description: 'Convert negation of AND to OR of negations',
    formula: '\\lnot (A \\land B) = \\lnot A \\lor \\lnot B',
  },
  "De Morgan's Law (OR)": {
    displayName: "De Morgan's Law (OR)",
    description: 'Convert negation of OR to AND of negations',
    formula: '\\lnot (A \\lor B) = \\lnot A \\land \\lnot B',
  },
  'Double Negation': {
    displayName: 'Double Negation',
    description: 'Remove pairs of negations that cancel each other out',
    formula: '\\lnot \\lnot A = A',
  },
  'Consensus Theorem': {
    displayName: 'Consensus Theorem',
    description: 'Identify and remove redundant terms in Boolean expressions',
    formula: 'A \\land B + \\lnot A \\land C + B \\land C = A \\land B + \\lnot A \\land C',
  },
  'XNOR Expansion': {
    displayName: 'XNOR to AND/OR',
    description: 'Convert biconditional operations to standard Boolean operations',
    formula: 'A \\leftrightarrow B = (A \\land B) \\lor (\\lnot A \\land \\lnot B)',
  },
  'NOR Expansion': {
    displayName: 'NOR to NOT/OR',
    description: 'Convert NOR operations to equivalent NOT/OR expressions',
    formula: 'A \\downarrow B = \\lnot (A \\lor B)',
  },

  // Additional rule variations and aliases
  'eliminate-double-negation': {
    displayName: 'Remove Double Negations',
    description: 'Simplify expressions like ¬¬A to just A',
    formula: '\\lnot \\lnot A = A',
  },
  'apply-basic-rules': {
    displayName: 'Apply Boolean Algebra Rules',
    description:
      "Use fundamental Boolean algebra laws like idempotence, absorption, and De Morgan's laws",
    formula:
      '\\text{Idempotent: } A \\land A = A,\\ A \\lor A = A\\\\\\text{Absorption: } A \\land (A \\lor B) = A',
  },
  'basic-minimization': {
    displayName: 'Basic Minimization',
    description: 'Apply absorption and consensus theorems to reduce expression complexity',
    formula: '\\text{Absorption: } A \\land (A \\lor B) = A,\\ A \\lor (A \\land B) = A',
  },
  'canonical-form': {
    displayName: 'Convert to Canonical Form',
    description:
      'Transform expression to Sum of Products (SOP) or Product of Sums (POS) canonical form',
    formula: '\\text{SOP: } \\sum m(1,3,5)\\ \\text{POS: } \\prod M(0,2,4)',
  },
  'advanced-minimization': {
    displayName: 'Advanced Minimization',
    description:
      'Apply systematic methods to find the most efficient Boolean expression. Karnaugh maps use visual grouping to identify simplifications, while Quine-McCluskey provides algorithmic term reduction for complex expressions',
    formula: [
      '\\text{Karnaugh Map: Visual grouping method}',
      '\\text{Quine-McCluskey: Systematic algorithmic reduction}',
      '\\text{Example: }f(A,B,C)=\\sum m(0,1,3,5,7)',
    ],
  },
}
