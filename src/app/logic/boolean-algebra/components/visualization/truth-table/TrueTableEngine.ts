import type { BooleanExpression } from '../../../engine'
import type { SubExpressionStep } from './types'

// --- Helper to get all sub-expressions from AST ---
export const getAllSubExpressions = (
  mainAstNode: BooleanExpression,
  exprToString: (ast: BooleanExpression) => string
): SubExpressionStep[] => {
  const collectedExpressions = new Map<string, BooleanExpression>()

  function visit(currentNode: BooleanExpression) {
    if (!currentNode) return

    if (currentNode.left) {
      visit(currentNode.left)
    }
    if (currentNode.right) {
      visit(currentNode.right)
    }

    // Collect operator nodes and the main node itself
    if (currentNode.type !== 'VARIABLE' && currentNode.type !== 'CONSTANT') {
      const strRepresentation = exprToString(currentNode)
      if (!collectedExpressions.has(strRepresentation)) {
        collectedExpressions.set(strRepresentation, currentNode)
      }
    }
  }

  visit(mainAstNode)

  const mainExpressionStr = exprToString(mainAstNode)
  // Ensure the main expression is always included
  if (!collectedExpressions.has(mainExpressionStr)) {
    collectedExpressions.set(mainExpressionStr, mainAstNode)
  }

  let steps = Array.from(collectedExpressions.entries()).map(([str, ast]) => ({
    str,
    ast,
    isFinal: false,
  }))

  // Sort by string length as a proxy for complexity, shorter expressions first.
  steps.sort((a, b) => a.str.length - b.str.length)

  // Ensure the main expression is the last one and marked as final.
  // Remove it from its current position if it exists and append it.
  const mainIndex = steps.findIndex(step => step.str === mainExpressionStr)
  if (mainIndex > -1) {
    const mainStep = steps.splice(mainIndex, 1)[0]
    steps.push({ ...mainStep, isFinal: true })
  } else {
    // This case should ideally not happen if main expression was added correctly
    steps.push({ str: mainExpressionStr, ast: mainAstNode, isFinal: true })
  }

  // Filter out single variables or constants if they are not the main expression itself,
  // as variables are already columns.
  steps = steps.filter(step => {
    if (step.isFinal) return true // Always keep the final expression
    return step.ast.type !== 'VARIABLE' && step.ast.type !== 'CONSTANT'
  })

  return steps
}
// --- End Helper ---

// Extract all variables from an expression string (can be simplified or derived from AST later if needed)
export const extractVariables = (expression: string): string[] => {
  const uniqueVars = new Set<string>()
  // Regex to find uppercase letters not part of common logic words like TRUE, FALSE, NOT, AND, OR etc.
  // This is a simplified approach; a robust solution would parse or use AST.
  // const variableRegex = /([A-Z])(?<!TRU)(?<!FALS)(?<!NO)(?<!AN)(?<!O)/g // improved regex to avoid matching parts of keywords

  // Simpler regex for variables if the above is too complex or restrictive for some cases
  const simplerVarRegex = /[A-Z]/g
  const tempExpression = expression.replace(/TRUE|FALSE|NOT|AND|OR|XOR|NAND|NOR|XNOR/g, '') // Remove keywords

  let match
  while ((match = simplerVarRegex.exec(tempExpression)) !== null) {
    if (match[0].length === 1) {
      // Ensure it's a single uppercase letter
      uniqueVars.add(match[0])
    }
  }
  return Array.from(uniqueVars).sort()
}
