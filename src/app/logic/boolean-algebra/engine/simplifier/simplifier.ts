import { BooleanExpression, SimplificationResult, SimplificationStep } from '../ast/types'
import { parseExpression, expressionToBooleanString, expressionToLatexString } from '../parser'
import { SimplificationRule } from '../ast/rule-types'
import { convertLawsToRules } from '../converter/law-converter'
import { deepClone } from '../utils/cloning'
import {
  getBasicRules,
  getNegationRules,
  getContradictionRules,
  getConstantRules,
  getDerivedRules,
  getConsensusRules,
  getDistributiveRules,
} from './rules'

/**
 * Get the default set of simplification rules
 */
export const getDefaultRules = (): SimplificationRule[] => {
  const rules: SimplificationRule[] = []

  // Add rules from modular rule files
  rules.push(...getNegationRules())
  rules.push(...getBasicRules())
  rules.push(...getContradictionRules())
  rules.push(...getConstantRules())
  rules.push(...getDistributiveRules())
  rules.push(...getDerivedRules())
  rules.push(...getConsensusRules())

  // Add rules converted from laws.ts
  rules.push(...convertLawsToRules())

  return rules
}

type ApplyRuleOnceParams = {
  rule: SimplificationRule
  expr: BooleanExpression
  seen: Set<string>
  ruleApplicationCounts: Map<string, number>
  MAX_RULE_APPLICATIONS: number
}

type ApplyRuleOnceResult = {
  appliedExpr: BooleanExpression | null
  step?: SimplificationStep
  newSeenValue?: string
  ruleAppliedName?: string
}

/**
 * Apply a single rule while tracking application counts.
 * This function is now purer with respect to steps and seen set modifications.
 */
const applyRuleOnce = ({
  rule,
  expr,
  seen,
  ruleApplicationCounts,
  MAX_RULE_APPLICATIONS,
}: ApplyRuleOnceParams): ApplyRuleOnceResult => {
  const ruleName = rule.info.name
  const currentCount = ruleApplicationCounts.get(ruleName) || 0

  if (currentCount >= MAX_RULE_APPLICATIONS) {
    return { appliedExpr: null }
  }

  if (!rule.canApply(expr)) {
    return { appliedExpr: null }
  }

  const newExpr = rule.apply(expr)
  const newExprString = expressionToBooleanString(newExpr)

  if (seen.has(newExprString)) {
    return { appliedExpr: null } // Already seen this result
  }

  const step: SimplificationStep = {
    ruleName: rule.info.name,
    ruleFormula: rule.info.formula,
    expressionBefore: deepClone(expr), // Clone before for the step
    expressionAfter: deepClone(newExpr), // Clone after for the step
  }

  return {
    appliedExpr: newExpr,
    step,
    newSeenValue: newExprString,
    ruleAppliedName: ruleName,
  }
}

// Helper type for managing simplification state through phases
type SimplificationPhaseState = {
  currentExpr: BooleanExpression
  steps: SimplificationStep[]
  seen: Set<string>
  ruleApplicationCounts: Map<string, number>
  // MAX_RULE_APPLICATIONS can be passed if it varies by phase, or be a constant from simplify
}

// Function to process and update state after a rule application attempt
function updateStateAfterRuleApplication(
  currentState: SimplificationPhaseState,
  ruleResult: ApplyRuleOnceResult
): { state: SimplificationPhaseState; changed: boolean } {
  if (ruleResult.appliedExpr) {
    const newSteps = ruleResult.step ? [...currentState.steps, ruleResult.step] : currentState.steps
    const newSeen = ruleResult.newSeenValue
      ? new Set(currentState.seen).add(ruleResult.newSeenValue)
      : currentState.seen
    const newRuleCounts = new Map(currentState.ruleApplicationCounts)
    if (ruleResult.ruleAppliedName) {
      newRuleCounts.set(
        ruleResult.ruleAppliedName,
        (newRuleCounts.get(ruleResult.ruleAppliedName) || 0) + 1
      )
    }
    return {
      state: {
        ...currentState, // carry over other potential fields
        currentExpr: ruleResult.appliedExpr,
        steps: newSteps,
        seen: newSeen,
        ruleApplicationCounts: newRuleCounts,
      },
      changed: true,
    }
  }
  return { state: currentState, changed: false }
}

// Phase 2: Apply constant simplifications - refactored into its own function
function applyConstantSimplificationPhase(
  initialState: SimplificationPhaseState,
  constantRules: SimplificationRule[],
  MAX_RULE_APPLICATIONS: number
): SimplificationPhaseState {
  let state = initialState
  let changedInPhaseLoop = true

  while (changedInPhaseLoop) {
    changedInPhaseLoop = false
    for (const rule of constantRules) {
      const ruleResult = applyRuleOnce({
        rule,
        expr: state.currentExpr,
        seen: state.seen,
        ruleApplicationCounts: state.ruleApplicationCounts,
        MAX_RULE_APPLICATIONS,
      })

      const { state: nextState, changed } = updateStateAfterRuleApplication(state, ruleResult)
      state = nextState
      if (changed) {
        changedInPhaseLoop = true
        break // Restart with the new expression from the beginning of constantRules
      }
    }
  }
  return state
}

// Phase 4: Apply algebraic rules - refactored into its own function
function applyAlgebraicSimplificationPhase(
  initialState: SimplificationPhaseState,
  algebraicRules: SimplificationRule[],
  MAX_RULE_APPLICATIONS: number
): SimplificationPhaseState {
  let state = initialState
  let changedInPhaseLoop = true

  while (changedInPhaseLoop) {
    changedInPhaseLoop = false
    for (const rule of algebraicRules) {
      const ruleResult = applyRuleOnce({
        rule,
        expr: state.currentExpr,
        seen: state.seen,
        ruleApplicationCounts: state.ruleApplicationCounts,
        MAX_RULE_APPLICATIONS,
      })

      const { state: nextState, changed } = updateStateAfterRuleApplication(state, ruleResult)
      state = nextState
      if (changed) {
        changedInPhaseLoop = true
        break // Restart with the new expression from the beginning of algebraicRules
      }
    }
  }
  return state
}

/**
 * Core simplification algorithm with anti-cycling control
 */
export const simplify = (
  expression: BooleanExpression,
  rules: SimplificationRule[] = getDefaultRules()
): SimplificationResult => {
  // Initial state setup
  let workingState: SimplificationPhaseState = {
    currentExpr: deepClone(expression),
    steps: [],
    seen: new Set<string>([expressionToBooleanString(expression)]),
    ruleApplicationCounts: new Map<string, number>(),
  }
  const MAX_RULE_APPLICATIONS = 3

  // PHASE 1: Normalize negations first
  const negationRules = rules.filter(
    rule => rule.info.name.includes('Chain Negation') || rule.info.name.includes('Double Negation')
  )
  for (const rule of negationRules) {
    const ruleResult = applyRuleOnce({
      rule,
      expr: workingState.currentExpr,
      seen: workingState.seen,
      ruleApplicationCounts: workingState.ruleApplicationCounts,
      MAX_RULE_APPLICATIONS,
    })
    const { state: nextState } = updateStateAfterRuleApplication(workingState, ruleResult)
    workingState = nextState
  }

  // PHASE 2: Apply constant simplifications (using the new phase function)
  const constantRules = rules.filter(
    rule =>
      rule.info.name.includes('with True') ||
      rule.info.name.includes('with False') ||
      rule.info.name.includes('NOT True') ||
      rule.info.name.includes('NOT False')
  )
  workingState = applyConstantSimplificationPhase(
    workingState,
    constantRules,
    MAX_RULE_APPLICATIONS
  )

  // PHASE 3: Apply contradictions and tautologies
  const identityRules = rules.filter(
    rule => rule.info.name.includes('Contradiction') || rule.info.name.includes('Tautology')
  )
  for (const rule of identityRules) {
    const ruleResult = applyRuleOnce({
      rule,
      expr: workingState.currentExpr,
      seen: workingState.seen,
      ruleApplicationCounts: workingState.ruleApplicationCounts,
      MAX_RULE_APPLICATIONS,
    })
    const { state: nextState, changed } = updateStateAfterRuleApplication(workingState, ruleResult)
    workingState = nextState
    if (changed && workingState.currentExpr.type === 'CONSTANT') {
      return { steps: workingState.steps, finalExpression: workingState.currentExpr }
    }
  }

  // PHASE 4: Apply algebraic laws (using the new phase function)
  const algebraicRules = rules.filter(
    rule =>
      !rule.info.name.includes('De Morgan') &&
      !rule.info.name.includes('Negated Parentheses') &&
      !negationRules.includes(rule) &&
      !constantRules.includes(rule) &&
      !identityRules.includes(rule)
  )
  workingState = applyAlgebraicSimplificationPhase(
    workingState,
    algebraicRules,
    MAX_RULE_APPLICATIONS
  )

  // PHASE 5: Apply De Morgan laws exactly ONCE
  const deMorganRules = rules.filter(rule => rule.info.name.includes('De Morgan'))
  for (const rule of deMorganRules) {
    const ruleResult = applyRuleOnce({
      rule,
      expr: workingState.currentExpr,
      seen: workingState.seen,
      ruleApplicationCounts: workingState.ruleApplicationCounts,
      MAX_RULE_APPLICATIONS,
    })
    const { state: nextState, changed } = updateStateAfterRuleApplication(workingState, ruleResult)
    workingState = nextState
    if (changed) {
      // Re-apply negation rules after De Morgan to simplify
      for (const negRule of negationRules) {
        const negRuleResult = applyRuleOnce({
          rule: negRule,
          expr: workingState.currentExpr,
          seen: workingState.seen,
          ruleApplicationCounts: workingState.ruleApplicationCounts,
          MAX_RULE_APPLICATIONS,
        })
        const { state: nextNegState } = updateStateAfterRuleApplication(workingState, negRuleResult)
        workingState = nextNegState
      }
      break // Only apply one De Morgan transformation
    }
  }

  // FINAL PHASE: Cleanup with negated parentheses simplification
  const parenthesesRules = rules.filter(rule => rule.info.name.includes('Negated Parentheses'))
  for (const rule of parenthesesRules) {
    const ruleResult = applyRuleOnce({
      rule,
      expr: workingState.currentExpr,
      seen: workingState.seen,
      ruleApplicationCounts: workingState.ruleApplicationCounts,
      MAX_RULE_APPLICATIONS,
    })
    const { state: nextState } = updateStateAfterRuleApplication(workingState, ruleResult)
    workingState = nextState
  }

  return {
    steps: workingState.steps,
    finalExpression: workingState.currentExpr,
  }
}

/**
 * Simplify a boolean expression string
 */
export const simplifyExpression = (
  expression: string,
  customRules?: SimplificationRule[]
): {
  steps: { ruleName: string; ruleFormula: string; before: string; after: string }[]
  finalExpression: string
} => {
  try {
    const expressionTree = parseExpression(expression)
    const rules = customRules || getDefaultRules()
    const result = simplify(expressionTree, rules)

    return {
      steps: result.steps.map((step: SimplificationStep) => ({
        ruleName: step.ruleName,
        ruleFormula: step.ruleFormula,
        before: expressionToBooleanString(step.expressionBefore),
        after: expressionToBooleanString(step.expressionAfter),
      })),
      finalExpression: expressionToBooleanString(result.finalExpression),
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`Error simplifying expression: ${message}`)
  }
}

/**
 * Get LaTeX representations for all steps and the final result
 */
export const getLatexResults = (
  expression: string,
  customRules?: SimplificationRule[]
): {
  steps: { ruleName: string; ruleFormula: string; beforeLatex: string; afterLatex: string }[]
  finalLatex: string
} => {
  try {
    const expressionTree = parseExpression(expression)
    const rules = customRules || getDefaultRules()
    const result = simplify(expressionTree, rules)

    return {
      steps: result.steps.map((step: SimplificationStep) => ({
        ruleName: step.ruleName,
        ruleFormula: step.ruleFormula,
        beforeLatex: expressionToLatexString(step.expressionBefore),
        afterLatex: expressionToLatexString(step.expressionAfter),
      })),
      finalLatex: expressionToLatexString(result.finalExpression),
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`Error simplifying LaTeX expression: ${message}`)
  }
}
