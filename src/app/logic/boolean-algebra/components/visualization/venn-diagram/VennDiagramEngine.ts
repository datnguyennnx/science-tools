import { BooleanExpression } from '../../../engine'
import {
  evaluateExpression,
  extractVariablesFromTree,
  generateReducedExpressionSet,
  getOptimalVariableOrder,
} from '../utils/ExpressionUtils'

// Re-export the extractVariablesFromTree function for backward compatibility
export { extractVariablesFromTree }

/**
 * Venn diagram data for a constant expression (0 variables)
 */
export interface VennDataConstant {
  type: 'constant'
  value: boolean // True or False
}

/**
 * Venn diagram data for a 1-variable expression
 */
export interface VennData1Var {
  type: '1-var'
  variableName: string
  variableTrue: boolean
  variableFalse: boolean
}

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

// Now we have a type for 4-variable Venn diagrams
export interface VennData4Vars {
  A_only: boolean
  B_only: boolean
  C_only: boolean
  D_only: boolean
  A_B_only: boolean // A and B, not C, not D
  A_C_only: boolean // A and C, not B, not D
  A_D_only: boolean // A and D, not B, not C
  B_C_only: boolean // B and C, not A, not D
  B_D_only: boolean // B and D, not A, not C
  C_D_only: boolean // C and D, not A, not B
  A_B_C_only: boolean // A, B, C not D
  A_B_D_only: boolean // A, B, D not C
  A_C_D_only: boolean // A, C, D not B
  B_C_D_only: boolean // B, C, D not A
  A_B_C_D: boolean // A and B and C and D
  Neither: boolean // not A, not B, not C, not D
}

// For 5-variable Venn diagrams, we'll use a composite approach
// where we show multiple 4-variable Venn diagrams for different values of the 5th variable
export interface VennData5Vars {
  // These represent the results when the 5th variable E is true
  whenEIsTrue: VennData4Vars
  // These represent the results when the 5th variable E is false
  whenEIsFalse: VennData4Vars
  // Additional metadata for display
  E_name: string
}

export type VennData =
  | VennDataConstant
  | VennData1Var
  | VennData2Vars
  | VennData3Vars
  | VennData4Vars
  | VennData5Vars

/**
 * Evaluates a constant boolean expression (0 variables)
 *
 * @param expr The boolean expression tree (should be a constant)
 * @returns Data structure for a constant Venn diagram
 */
export function evaluateConstantVenn(expr: BooleanExpression): VennDataConstant {
  // For a constant expression, we expect it to be a CONSTANT node
  let value = false

  if (expr.type === 'CONSTANT') {
    value = expr.value as boolean
  } else {
    // If somehow we got here with a non-constant expression
    // we'll evaluate it with an empty variable set
    value = evaluateExpression(expr, {})
  }

  return {
    type: 'constant',
    value,
  }
}

/**
 * Evaluates a boolean expression for visualization in a 1-variable Venn diagram
 *
 * @param expr The boolean expression tree
 * @param variables The variables to use in the visualization (must be 1)
 * @returns Data structure for a 1-variable Venn diagram
 */
export function evaluate1VarVenn(expr: BooleanExpression, variables: string[]): VennData1Var {
  if (variables.length !== 1) {
    throw new Error('1-variable Venn diagram requires exactly 1 variable')
  }

  const variableName = variables[0]

  // Evaluate for both possible values of the variable
  const variableTrue = evaluateExpression(expr, { [variableName]: true })
  const variableFalse = evaluateExpression(expr, { [variableName]: false })

  return {
    type: '1-var',
    variableName,
    variableTrue,
    variableFalse,
  }
}

/**
 * Evaluates a boolean expression for visualization in a 2-variable Venn diagram
 *
 * @param expr The boolean expression tree
 * @param variables The variables to use in the visualization (must be 2)
 * @returns Data structure for a 2-variable Venn diagram
 */
export function evaluate2VarVenn(expr: BooleanExpression, variables: string[]): VennData2Vars {
  if (variables.length !== 2) {
    throw new Error('2-variable Venn diagram requires exactly 2 variables')
  }

  const [A, B] = variables

  const neitherValue = evaluateExpression(expr, { [A]: false, [B]: false })
  const aOnlyValue = evaluateExpression(expr, { [A]: true, [B]: false })
  const bOnlyValue = evaluateExpression(expr, { [A]: false, [B]: true })
  const bothValue = evaluateExpression(expr, { [A]: true, [B]: true })

  return {
    A_only: aOnlyValue,
    B_only: bOnlyValue,
    A_and_B: bothValue,
    Neither: neitherValue,
  }
}

/**
 * Evaluates a boolean expression for visualization in a 3-variable Venn diagram
 *
 * @param expr The boolean expression tree
 * @param variables The variables to use in the visualization (must be 3)
 * @returns Data structure for a 3-variable Venn diagram
 */
export function evaluate3VarVenn(expr: BooleanExpression, variables: string[]): VennData3Vars {
  if (variables.length !== 3) {
    throw new Error('3-variable Venn diagram requires exactly 3 variables')
  }

  const [A, B, C] = variables

  return {
    A_only: evaluateExpression(expr, { [A]: true, [B]: false, [C]: false }),
    B_only: evaluateExpression(expr, { [A]: false, [B]: true, [C]: false }),
    C_only: evaluateExpression(expr, { [A]: false, [B]: false, [C]: true }),
    A_B_only: evaluateExpression(expr, { [A]: true, [B]: true, [C]: false }),
    A_C_only: evaluateExpression(expr, { [A]: true, [B]: false, [C]: true }),
    B_C_only: evaluateExpression(expr, { [A]: false, [B]: true, [C]: true }),
    A_B_C: evaluateExpression(expr, { [A]: true, [B]: true, [C]: true }),
    Neither: evaluateExpression(expr, { [A]: false, [B]: false, [C]: false }),
  }
}

/**
 * Evaluates a boolean expression for visualization in a 4-variable Venn diagram
 *
 * @param expr The boolean expression tree
 * @param variables The variables to use in the visualization (must be 4)
 * @returns Data structure for a 4-variable Venn diagram
 */
export function evaluate4VarVenn(expr: BooleanExpression, variables: string[]): VennData4Vars {
  if (variables.length !== 4) {
    throw new Error('4-variable Venn diagram requires exactly 4 variables')
  }

  const [A, B, C, D] = variables
  const results: VennData4Vars = {
    A_only: false,
    B_only: false,
    C_only: false,
    D_only: false,
    A_B_only: false,
    A_C_only: false,
    A_D_only: false,
    B_C_only: false,
    B_D_only: false,
    C_D_only: false,
    A_B_C_only: false,
    A_B_D_only: false,
    A_C_D_only: false,
    B_C_D_only: false,
    A_B_C_D: false,
    Neither: false,
  }

  // Create a reusable function for performance
  const evaluate = (a: boolean, b: boolean, c: boolean, d: boolean): boolean => {
    return evaluateExpression(expr, { [A]: a, [B]: b, [C]: c, [D]: d })
  }

  // Explicitly calculate all 16 possible combinations
  // Neither region (0000)
  results.Neither = evaluate(false, false, false, false)

  // Single variable regions
  results.A_only = evaluate(true, false, false, false)
  results.B_only = evaluate(false, true, false, false)
  results.C_only = evaluate(false, false, true, false)
  results.D_only = evaluate(false, false, false, true)

  // Two-variable intersections (AB, AC, AD, BC, BD, CD)
  results.A_B_only = evaluate(true, true, false, false)
  results.A_C_only = evaluate(true, false, true, false)
  results.A_D_only = evaluate(true, false, false, true)
  results.B_C_only = evaluate(false, true, true, false)
  results.B_D_only = evaluate(false, true, false, true)
  results.C_D_only = evaluate(false, false, true, true)

  // Three-variable intersections (ABC, ABD, ACD, BCD)
  results.A_B_C_only = evaluate(true, true, true, false)
  results.A_B_D_only = evaluate(true, true, false, true)
  results.A_C_D_only = evaluate(true, false, true, true)
  results.B_C_D_only = evaluate(false, true, true, true)

  // Four-variable intersection (ABCD)
  results.A_B_C_D = evaluate(true, true, true, true)

  return results
}

/**
 * Evaluates a boolean expression for visualization in a 5-variable Venn diagram
 * This creates two 4-variable Venn diagrams, one for each value of the 5th variable
 *
 * @param expr The boolean expression tree
 * @param variables The variables to use in the visualization (must be 5)
 * @returns Data structure for a 5-variable Venn diagram
 */
export function evaluate5VarVenn(expr: BooleanExpression, variables: string[]): VennData5Vars {
  if (variables.length !== 5) {
    throw new Error('5-variable Venn diagram requires exactly 5 variables')
  }

  const [A, B, C, D, E] = variables

  // Create evaluation cache for performance
  const evaluationCache = new Map<string, boolean>()
  const memoizedEvaluate = (
    a: boolean,
    b: boolean,
    c: boolean,
    d: boolean,
    e: boolean
  ): boolean => {
    const key = `${a ? 1 : 0}${b ? 1 : 0}${c ? 1 : 0}${d ? 1 : 0}${e ? 1 : 0}`
    if (!evaluationCache.has(key)) {
      evaluationCache.set(key, evaluateExpression(expr, { [A]: a, [B]: b, [C]: c, [D]: d, [E]: e }))
    }
    return evaluationCache.get(key)!
  }

  // Calculate results for E=true
  const whenEIsTrue: VennData4Vars = {
    A_only: memoizedEvaluate(true, false, false, false, true),
    B_only: memoizedEvaluate(false, true, false, false, true),
    C_only: memoizedEvaluate(false, false, true, false, true),
    D_only: memoizedEvaluate(false, false, false, true, true),
    A_B_only: memoizedEvaluate(true, true, false, false, true),
    A_C_only: memoizedEvaluate(true, false, true, false, true),
    A_D_only: memoizedEvaluate(true, false, false, true, true),
    B_C_only: memoizedEvaluate(false, true, true, false, true),
    B_D_only: memoizedEvaluate(false, true, false, true, true),
    C_D_only: memoizedEvaluate(false, false, true, true, true),
    A_B_C_only: memoizedEvaluate(true, true, true, false, true),
    A_B_D_only: memoizedEvaluate(true, true, false, true, true),
    A_C_D_only: memoizedEvaluate(true, false, true, true, true),
    B_C_D_only: memoizedEvaluate(false, true, true, true, true),
    A_B_C_D: memoizedEvaluate(true, true, true, true, true),
    Neither: memoizedEvaluate(false, false, false, false, true),
  }

  // Calculate results for E=false
  const whenEIsFalse: VennData4Vars = {
    A_only: memoizedEvaluate(true, false, false, false, false),
    B_only: memoizedEvaluate(false, true, false, false, false),
    C_only: memoizedEvaluate(false, false, true, false, false),
    D_only: memoizedEvaluate(false, false, false, true, false),
    A_B_only: memoizedEvaluate(true, true, false, false, false),
    A_C_only: memoizedEvaluate(true, false, true, false, false),
    A_D_only: memoizedEvaluate(true, false, false, true, false),
    B_C_only: memoizedEvaluate(false, true, true, false, false),
    B_D_only: memoizedEvaluate(false, true, false, true, false),
    C_D_only: memoizedEvaluate(false, false, true, true, false),
    A_B_C_only: memoizedEvaluate(true, true, true, false, false),
    A_B_D_only: memoizedEvaluate(true, true, false, true, false),
    A_C_D_only: memoizedEvaluate(true, false, true, true, false),
    B_C_D_only: memoizedEvaluate(false, true, true, true, false),
    A_B_C_D: memoizedEvaluate(true, true, true, true, false),
    Neither: memoizedEvaluate(false, false, false, false, false),
  }

  return {
    whenEIsTrue,
    whenEIsFalse,
    E_name: E,
  }
}

/**
 * Generates a set of Venn diagrams for expressions with many variables
 * Each Venn diagram fixes some variables to specific values
 *
 * @param expr The boolean expression tree
 * @param variables All variables in the expression
 * @param vennVarCount Number of variables to use in each Venn diagram (1-5)
 * @returns Array of Venn diagram configurations for each sub-expression
 */
export function generateMultiVennDiagrams(
  expr: BooleanExpression,
  variables: string[],
  vennVarCount: number = 3
): Array<{
  vennData: VennData
  variables: string[]
  title: string
  fixedVariables: Record<string, boolean>
}> {
  // Handle the case with 0 variables (constant expression)
  if (variables.length === 0) {
    const vennData = evaluateConstantVenn(expr)
    return [
      {
        vennData,
        variables: [],
        title: 'Constant Expression',
        fixedVariables: {},
      },
    ]
  }

  // Limit vennVarCount to supported values (1-5)
  vennVarCount = Math.min(Math.max(vennVarCount, 1), 5)

  // If we have few enough variables, just return a single Venn diagram
  if (variables.length <= vennVarCount) {
    let vennData: VennData

    if (variables.length === 1) {
      vennData = evaluate1VarVenn(expr, variables)
    } else if (variables.length === 2) {
      vennData = evaluate2VarVenn(expr, variables)
    } else if (variables.length === 3) {
      vennData = evaluate3VarVenn(expr, variables)
    } else if (variables.length === 4) {
      vennData = evaluate4VarVenn(expr, variables)
    } else {
      // must be 5 at this point
      vennData = evaluate5VarVenn(expr, variables)
    }

    return [
      {
        vennData,
        variables,
        title: 'Complete Venn Diagram',
        fixedVariables: {},
      },
    ]
  }

  // First, reorder variables by importance for better visualization
  const orderedVars = getOptimalVariableOrder(expr, variables)

  // Generate reduced expressions
  const reducedExpressions = generateReducedExpressionSet(expr, orderedVars, vennVarCount)

  // Create a Venn diagram for each reduced expression
  return reducedExpressions.map(reduced => {
    let vennData: VennData

    if (reduced.freeVariables.length === 1) {
      vennData = evaluate1VarVenn(expr, reduced.freeVariables)
    } else if (reduced.freeVariables.length === 2) {
      vennData = evaluate2VarVenn(expr, reduced.freeVariables)
    } else if (reduced.freeVariables.length === 3) {
      vennData = evaluate3VarVenn(expr, reduced.freeVariables)
    } else if (reduced.freeVariables.length === 4) {
      vennData = evaluate4VarVenn(expr, reduced.freeVariables)
    } else {
      // must be 5 at this point
      vennData = evaluate5VarVenn(expr, reduced.freeVariables)
    }

    return {
      vennData,
      variables: reduced.freeVariables,
      title: reduced.title,
      fixedVariables: reduced.fixedVariables,
    }
  })
}
