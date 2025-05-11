import { BooleanExpression, SimplificationResult, SimplificationStep } from '../ast/types'
import { parseExpression, expressionToBooleanString, expressionToLatexString } from '../parser'
import { SimplificationRule, SimplificationContext } from '../ast/rule-types'
import { expressionsEqual } from '../utils'
import {
  getNegationRules,
  getContradictionRules,
  getConstantRules,
  getDerivedRules,
  getConsensusRules,
  getDistributiveRules,
  getIdempotentRules,
  getDeMorganRules,
} from './rules'

// --- BEGINNING OF DEFINITIONS TO RESTORE/ENSURE ---
export interface SimplifierConfig {
  maxTotalIterations: number
  maxRuleApplicationsPerRule: number
  maxPhaseInternalLoops: number
}

const MAX_OVERALL_ITERATIONS = 20
const MAX_RULE_APPLICATIONS_PER_RULE = 50
const MAX_PHASE_INTERNAL_LOOPS = 10

export const defaultConfig: SimplifierConfig = {
  maxTotalIterations: MAX_OVERALL_ITERATIONS,
  maxRuleApplicationsPerRule: MAX_RULE_APPLICATIONS_PER_RULE,
  maxPhaseInternalLoops: MAX_PHASE_INTERNAL_LOOPS,
}
// --- END OF DEFINITIONS TO RESTORE/ENSURE ---

/**
 * Get the default set of simplification rules
 */
export const getDefaultRules = (): SimplificationRule[] => {
  const rules: SimplificationRule[] = []

  // Add rules from modular rule files
  rules.push(...getNegationRules())
  rules.push(...getContradictionRules())
  rules.push(...getConstantRules())
  rules.push(...getDistributiveRules('all'))
  rules.push(...getDerivedRules())
  rules.push(...getConsensusRules())
  rules.push(...getIdempotentRules())
  rules.push(...getDeMorganRules())

  return rules
}

const applyPhase = (
  phaseName: string,
  expression: BooleanExpression,
  rules: SimplificationRule[],
  context: SimplificationContext & { config: SimplifierConfig },
  maxInternalLoopsArg?: number
): BooleanExpression => {
  let currentExpr = expression
  let phaseIterations = 0

  const currentMaxInternalLoops =
    context.config?.maxPhaseInternalLoops ?? maxInternalLoopsArg ?? MAX_PHASE_INTERNAL_LOOPS

  while (phaseIterations < currentMaxInternalLoops) {
    phaseIterations++
    let expressionChangedInIteration = false

    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i]
      if (
        (context.ruleApplicationCounts.get(rule.info.name) || 0) >=
        context.config.maxRuleApplicationsPerRule
      )
        continue

      const ruleCanApply = rule.canApply(currentExpr)

      if (ruleCanApply) {
        const exprBeforeThisRuleApplication = currentExpr // Capture state before this specific rule applies

        const nextExpr = rule.apply(exprBeforeThisRuleApplication)

        const isEqual = expressionsEqual(nextExpr, exprBeforeThisRuleApplication)

        if (!isEqual) {
          const step: SimplificationStep = {
            ruleName: rule.info.name,
            ruleFormula: rule.info.formula,
            expressionBefore: expressionToBooleanString(exprBeforeThisRuleApplication),
            expressionAfter: expressionToBooleanString(nextExpr),
          }
          context.steps.push(step)
          const count = context.ruleApplicationCounts.get(rule.info.name) || 0
          context.ruleApplicationCounts.set(rule.info.name, count + 1)
          context.totalApplications = context.totalApplications + 1

          currentExpr = nextExpr // Update currentExpr for subsequent rules in this pass and for the next phaseIteration
          expressionChangedInIteration = true
        }
      }
    }

    if (!expressionChangedInIteration) {
      break
    }
  }

  return currentExpr
}

/**
 * Core simplification algorithm with anti-cycling control
 */
export function simplify(
  expressionOrString: BooleanExpression | string,
  config?: Partial<SimplifierConfig>
): SimplificationResult {
  const activeConfig = { ...defaultConfig, ...config }

  const initialExpr =
    typeof expressionOrString === 'string'
      ? parseExpression(expressionOrString)
      : expressionOrString

  if (!initialExpr) {
    return {
      originalExpression:
        typeof expressionOrString === 'string'
          ? expressionOrString
          : expressionToBooleanString(expressionOrString as BooleanExpression), // Fallback for BooleannExpression
      simplifiedExpression: parseExpression('ERROR_PARSE')!, // A dummy error expression
      simplifiedExpressionString: 'ERROR_PARSE',
      simplifiedExpressionLatex: 'ERROR_PARSE',
      steps: [],
      totalApplications: 0,
      iterations: 0,
      ruleApplicationCounts: {},
      maxIterationsReached: false,
    }
  }

  let currentWorkingExpr = initialExpr // Use initialExpr directly, no clone
  const steps: SimplificationStep[] = []
  const ruleApplicationCounts = new Map<string, number>()

  // These values will be part of the context and modified by applyPhase directly
  // and then used in the final result.
  const simplificationContextForPhases: SimplificationContext & { config: SimplifierConfig } = {
    steps,
    ruleApplicationCounts,
    totalApplications: 0 as number, // Ensure this is seen as a mutable number property
    maxIterationsReached: false as boolean, // Ensure this is seen as a mutable boolean property
    config: activeConfig,
  }

  let overallIterations = 0
  let lastExprStr = expressionToBooleanString(currentWorkingExpr)
  const expressionsSeen = new Set<string>() // Local set for cycle detection in this simplify call

  while (overallIterations < activeConfig.maxTotalIterations) {
    overallIterations++
    const exprBeforeFullPass = currentWorkingExpr

    const currentExprStrForCycleCheck = expressionToBooleanString(currentWorkingExpr)
    if (expressionsSeen.has(currentExprStrForCycleCheck)) {
      break
    }
    expressionsSeen.add(currentExprStrForCycleCheck)

    currentWorkingExpr = applyPhase(
      'Constants & Identities',
      currentWorkingExpr,
      [...getConstantRules(), ...getContradictionRules(), ...getIdempotentRules()],
      simplificationContextForPhases
    )

    currentWorkingExpr = applyPhase(
      'Derived Ops',
      currentWorkingExpr,
      getDerivedRules(),
      simplificationContextForPhases
    )

    currentWorkingExpr = applyPhase(
      'Negations',
      currentWorkingExpr,
      [...getNegationRules(), ...getDeMorganRules()],
      simplificationContextForPhases
    )

    currentWorkingExpr = applyPhase(
      'Algebraic Laws',
      currentWorkingExpr,
      [...getDistributiveRules(), ...getConsensusRules()],
      simplificationContextForPhases
    )

    currentWorkingExpr = applyPhase(
      'Final Clean-up',
      currentWorkingExpr,
      [...getConstantRules(), ...getIdempotentRules(), ...getNegationRules()],
      simplificationContextForPhases
    )

    const currentExprStr = expressionToBooleanString(currentWorkingExpr)
    if (currentExprStr === lastExprStr) {
      break
    }
    lastExprStr = currentExprStr

    if (expressionsEqual(currentWorkingExpr, exprBeforeFullPass) && overallIterations > 1) {
      break
    }
  }

  if (overallIterations >= activeConfig.maxTotalIterations) {
    simplificationContextForPhases.maxIterationsReached = true
  }

  return {
    originalExpression:
      typeof expressionOrString === 'string'
        ? expressionOrString
        : expressionToBooleanString(expressionOrString),
    simplifiedExpression: currentWorkingExpr,
    simplifiedExpressionString: expressionToBooleanString(currentWorkingExpr),
    simplifiedExpressionLatex: expressionToLatexString(currentWorkingExpr),
    steps: simplificationContextForPhases.steps,
    totalApplications: simplificationContextForPhases.totalApplications,
    iterations: overallIterations,
    ruleApplicationCounts: Object.fromEntries(simplificationContextForPhases.ruleApplicationCounts),
    maxIterationsReached: simplificationContextForPhases.maxIterationsReached,
  }
}

/**
 * Simplify a boolean expression string
 */
export const simplifyExpression = (
  expression: string,
  config?: Partial<SimplifierConfig>
): {
  steps: Array<{ ruleName: string; ruleFormula: string; before: string; after: string }>
  finalExpression: string
} => {
  try {
    const expressionTree = parseExpression(expression)
    const result = simplify(expressionTree, config)

    return {
      steps: result.steps.map((step: SimplificationStep) => ({
        ruleName: step.ruleName,
        ruleFormula: step.ruleFormula,
        before: step.expressionBefore,
        after: step.expressionAfter,
      })),
      finalExpression: result.simplifiedExpressionString,
    }
  } catch (error: unknown) {
    let errorMessage = 'An unknown error occurred'
    if (error instanceof Error) {
      errorMessage = error.message
    } else if (typeof error === 'string') {
      errorMessage = error
    }
    throw new Error(`Error simplifying expression: ${errorMessage}`)
  }
}
