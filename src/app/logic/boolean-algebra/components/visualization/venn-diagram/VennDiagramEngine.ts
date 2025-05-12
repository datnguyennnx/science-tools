import { BooleanExpression } from '../../../engine'
// Import functions from KMapEngine to be used locally and/or re-exported
import { extractVariablesFromTree, evaluateExpression } from '../k-map/KMapEngine'

// Re-export them as per the original structure, making them available if other modules depend on VennDiagramEngine for these
export { extractVariablesFromTree, evaluateExpression }

export interface VennData2Vars {
  A_only: boolean
  B_only: boolean
  A_and_B: boolean
  Neither: boolean
}

export interface VennData3Vars {
  A_only: boolean
  B_only: boolean
  C_only: boolean
  A_B_only: boolean // A and B, not C
  A_C_only: boolean // A and C, not B
  B_C_only: boolean // B and C, not A
  A_B_C: boolean // A and B and C
  Neither: boolean
}

// Future: Consider VennData4Vars if 4-variable diagrams are implemented
// export interface VennData4Vars { ... }

export type VennData = VennData2Vars | VennData3Vars // | VennData4Vars

/**
 * Normalizes an expression tree to ensure all nodes are evaluable by a basic evaluator.
 * Specifically transforms XNOR nodes into !(XOR) equivalents.
 * @param tree The boolean expression tree to normalize.
 * @returns A new boolean expression tree with XNOR nodes transformed.
 */
function normalizeTreeForEvaluation(tree: BooleanExpression): BooleanExpression {
  switch (tree.type) {
    case 'XNOR':
      // Transform XNOR(A, B) into NOT(XOR(A, B))
      return {
        type: 'NOT',
        left: {
          type: 'XOR',
          left: normalizeTreeForEvaluation(tree.left as BooleanExpression),
          right: normalizeTreeForEvaluation(tree.right as BooleanExpression),
        },
      }
    case 'NOT':
      return {
        type: 'NOT',
        left: normalizeTreeForEvaluation(tree.left as BooleanExpression),
      }
    case 'AND':
      return {
        type: 'AND',
        left: normalizeTreeForEvaluation(tree.left as BooleanExpression),
        right: normalizeTreeForEvaluation(tree.right as BooleanExpression),
      }
    case 'OR':
      return {
        type: 'OR',
        left: normalizeTreeForEvaluation(tree.left as BooleanExpression),
        right: normalizeTreeForEvaluation(tree.right as BooleanExpression),
      }
    case 'XOR': // XOR is handled by the main evaluator, so we can keep it.
      return {
        type: 'XOR',
        left: normalizeTreeForEvaluation(tree.left as BooleanExpression),
        right: normalizeTreeForEvaluation(tree.right as BooleanExpression),
      }
    case 'NAND': // NAND is handled by the main evaluator
      return {
        type: 'NAND',
        left: normalizeTreeForEvaluation(tree.left as BooleanExpression),
        right: normalizeTreeForEvaluation(tree.right as BooleanExpression),
      }
    case 'NOR': // NOR is handled by the main evaluator
      return {
        type: 'NOR',
        left: normalizeTreeForEvaluation(tree.left as BooleanExpression),
        right: normalizeTreeForEvaluation(tree.right as BooleanExpression),
      }
    case 'VARIABLE':
    case 'CONSTANT':
      return tree // Leaf nodes, no change
    default:
      // Should not happen with a valid BooleanExpression type, but as a safeguard
      // or if new types are added and not handled here.
      // console.warn(\`normalizeTreeForEvaluation: Unhandled node type \${tree.type}\`);
      return tree
  }
}

/**
 * Generates data for Venn diagram highlighting based on a boolean expression.
 *
 * @param expressionTree The parsed boolean expression.
 * @param variables An array of variable names (e.g., ['A', 'B']).
 * @returns VennData object indicating which regions to highlight, or null if variable count is unsupported.
 */
export function generateVennData(
  expressionTree: BooleanExpression,
  variables: string[]
): VennData | null {
  const numVars = variables.length
  const normalizedTree = normalizeTreeForEvaluation(expressionTree) // Normalize the tree first

  // Use the imported evaluateExpression from KMapEngine (now in local scope)
  const evalExpr = evaluateExpression

  if (numVars === 2) {
    const [varA, varB] = variables
    const regions: VennData2Vars = {
      A_only: false,
      B_only: false,
      A_and_B: false,
      Neither: false,
    }

    // Minterms for 2 variables:
    // 00 (!A !B) -> Neither (if expression is simplified to 0 for this region)
    // 01 (!A B)  -> B_only
    // 10 (A !B)  -> A_only
    // 11 (A B)   -> A_and_B

    // Check A_only region (A=true, B=false)
    if (evalExpr(normalizedTree, { [varA]: true, [varB]: false })) {
      regions.A_only = true
    }
    // Check B_only region (A=false, B=true)
    if (evalExpr(normalizedTree, { [varA]: false, [varB]: true })) {
      regions.B_only = true
    }
    // Check A_and_B region (A=true, B=true)
    if (evalExpr(normalizedTree, { [varA]: true, [varB]: true })) {
      regions.A_and_B = true
    }
    // Check Neither region (A=false, B=false)
    if (evalExpr(normalizedTree, { [varA]: false, [varB]: false })) {
      regions.Neither = true
    }
    return regions
  } else if (numVars === 3) {
    const [varA, varB, varC] = variables
    const regions: VennData3Vars = {
      A_only: false,
      B_only: false,
      C_only: false,
      A_B_only: false,
      A_C_only: false,
      B_C_only: false,
      A_B_C: false,
      Neither: false,
    }

    // Minterms for 3 variables (ABC):
    // 000 (!A !B !C) -> Neither
    // 001 (!A !B C)  -> C_only
    // 010 (!A B !C)  -> B_only
    // 011 (!A B C)   -> B_C_only
    // 100 (A !B !C)  -> A_only
    // 101 (A !B C)   -> A_C_only
    // 110 (A B !C)   -> A_B_only
    // 111 (A B C)    -> A_B_C

    // Evaluate all 8 minterms
    for (let i = 0; i < 8; i++) {
      const aVal = (i & 4) !== 0 // Check 3rd bit for A
      const bVal = (i & 2) !== 0 // Check 2nd bit for B
      const cVal = (i & 1) !== 0 // Check 1st bit for C

      if (evalExpr(normalizedTree, { [varA]: aVal, [varB]: bVal, [varC]: cVal })) {
        if (aVal && !bVal && !cVal) regions.A_only = true
        else if (!aVal && bVal && !cVal) regions.B_only = true
        else if (!aVal && !bVal && cVal) regions.C_only = true
        else if (aVal && bVal && !cVal) regions.A_B_only = true
        else if (aVal && !bVal && cVal) regions.A_C_only = true
        else if (!aVal && bVal && cVal) regions.B_C_only = true
        else if (aVal && bVal && cVal) regions.A_B_C = true
        else if (!aVal && !bVal && !cVal) regions.Neither = true
      }
    }
    return regions
  }

  // Add support for 4 variables if desired, though it's visually complex for Venn.
  // else if (numVars === 4) { ... }

  return null // Unsupported number of variables
}

// Helper function (can be moved from KMapEngine or kept if KMapEngine's evaluateExpression changes)
// For now, we are re-exporting from KMapEngine.
// If KMapEngine.evaluateExpression is not suitable (e.g. handles too many ops),
// a local, simpler version might be needed.
/*
function evaluateExpression( // This local version was removed as we re-export
  expr: BooleanExpression,
  variableValues: Record<string, boolean>
): boolean {
  if (expr.type === 'CONSTANT') {
    return expr.value as boolean
  }
  if (expr.type === 'VARIABLE') {
    const varName = expr.value as string
    return variableValues[varName] ?? false // Default to false if variable not found
  }
  if (expr.type === 'NOT') {
    if (!expr.left) throw new Error('Invalid NOT expression: missing operand')
    return !evaluateExpression(expr.left, variableValues)
  }
  if (expr.type === 'AND') {
    if (!expr.left || !expr.right) throw new Error('Invalid AND expression: missing operands')
    return (
      evaluateExpression(expr.left, variableValues) &&
      evaluateExpression(expr.right, variableValues)
    )
  }
  if (expr.type === 'OR') {
    if (!expr.left || !expr.right) throw new Error('Invalid OR expression: missing operands')
    return (
      evaluateExpression(expr.left, variableValues) ||
      evaluateExpression(expr.right, variableValues)
    )
  }
  // Add XOR, NAND, NOR, XNOR if the main expression tree can contain them directly
  // Otherwise, they should be expanded by the parser/simplifier before this stage.
  // For K-Map and Venn, typically we evaluate based on a simplified, canonical form
  // or a form using only AND, OR, NOT.

  // Fallback for unknown types, though parser should prevent this.
  console.warn(\`Unsupported expression type in VennDiagramEngine.evaluateExpression: \${expr.type}\`)
  return false
}
*/
