import { BooleanExpression, SimplificationResult, SimplificationStep } from '../core'
import { ExpressionParser } from '../parser'
import { SimplificationRule } from '../core/rule-types'
import { convertLawsToRules } from '../conversion/law-converter'
import { getBasicRules, getNegationRules, getContradictionRules, getConstantRules } from './rules'
import { toast } from 'sonner'

/**
 * Core simplification engine for Boolean expressions
 */
export class BooleanSimplifier {
  private rules: SimplificationRule[]

  /**
   * Create a new BooleanSimplifier with default or custom rules
   */
  constructor(customRules?: SimplificationRule[]) {
    this.rules = customRules || this.getDefaultRules()
  }

  /**
   * Simplify a boolean expression string
   */
  simplifyExpression(expression: string): {
    steps: { ruleName: string; ruleFormula: string; before: string; after: string }[]
    finalExpression: string
  } {
    try {
      // Parse the input expression into a tree
      const expressionTree = ExpressionParser.parse(expression)

      // Apply simplification
      const result = this.simplify(expressionTree)

      // Convert results back to string format
      return {
        steps: result.steps.map(step => ({
          ruleName: step.ruleName,
          ruleFormula: step.ruleFormula,
          before: ExpressionParser.toBooleanString(step.expressionBefore),
          after: ExpressionParser.toBooleanString(step.expressionAfter),
        })),
        finalExpression: ExpressionParser.toBooleanString(result.finalExpression),
      }
    } catch (error) {
      // Show toast notification with error
      const errorMessage = error instanceof Error ? error.message : String(error)
      toast.error(errorMessage)

      // Return an empty result with just the error message as the final expression
      return {
        steps: [],
        finalExpression: `Error: ${errorMessage}`,
      }
    }
  }

  /**
   * Get LaTeX representations for all steps and the final result
   */
  getLatexResults(expression: string): {
    steps: { ruleName: string; ruleFormula: string; beforeLatex: string; afterLatex: string }[]
    finalLatex: string
  } {
    try {
      // Parse and simplify
      const expressionTree = ExpressionParser.parse(expression)
      const result = this.simplify(expressionTree)

      // Convert to LaTeX
      return {
        steps: result.steps.map(step => ({
          ruleName: step.ruleName,
          ruleFormula: step.ruleFormula,
          beforeLatex: ExpressionParser.toLatexString(step.expressionBefore),
          afterLatex: ExpressionParser.toLatexString(step.expressionAfter),
        })),
        finalLatex: ExpressionParser.toLatexString(result.finalExpression),
      }
    } catch (error) {
      // Show toast notification with error
      const errorMessage = error instanceof Error ? error.message : String(error)
      toast.error(errorMessage)

      // Return an empty result with just the error message
      return {
        steps: [],
        finalLatex: `\\text{Error: ${errorMessage.replace(/\\/g, '\\\\')}}`,
      }
    }
  }

  /**
   * Core simplification algorithm with anti-cycling control
   */
  simplify(expression: BooleanExpression): SimplificationResult {
    const steps: SimplificationStep[] = []
    let currentExpr = this.deepClone(expression)
    const seen = new Set<string>([ExpressionParser.toBooleanString(currentExpr)])

    // Track rules applied to prevent cycling
    const ruleApplicationCounts: Map<string, number> = new Map()
    const MAX_RULE_APPLICATIONS = 3 // Prevent any rule from being applied more than 3 times

    // Helper to apply a single rule while tracking application counts
    const applyRuleOnce = (
      rule: SimplificationRule,
      expr: BooleanExpression
    ): BooleanExpression | null => {
      // Skip if we've applied this rule too many times
      const ruleName = rule.info.name
      const currentCount = ruleApplicationCounts.get(ruleName) || 0
      if (currentCount >= MAX_RULE_APPLICATIONS) {
        return null
      }

      // Check if rule can apply
      if (!rule.canApply(expr)) {
        return null
      }

      // Apply the rule
      const newExpr = rule.apply(expr)
      const newExprString = ExpressionParser.toBooleanString(newExpr)

      // If we've seen this expression before, skip
      if (seen.has(newExprString)) {
        return null
      }

      // Record this step
      steps.push({
        ruleName: rule.info.name,
        ruleFormula: rule.info.formula,
        expressionBefore: this.deepClone(expr),
        expressionAfter: this.deepClone(newExpr),
      })

      // Update tracking
      seen.add(newExprString)
      ruleApplicationCounts.set(ruleName, currentCount + 1)

      return newExpr
    }

    // PHASE 1: Normalize negations first (most important to break cycles)
    const negationRules = this.rules.filter(
      rule =>
        rule.info.name.includes('Chain Negation') || rule.info.name.includes('Double Negation')
    )

    for (const rule of negationRules) {
      const newExpr = applyRuleOnce(rule, currentExpr)
      if (newExpr) {
        currentExpr = newExpr
      }
    }

    // PHASE 2: Apply constant simplifications
    const constantRules = this.rules.filter(
      rule =>
        rule.info.name.includes('with True') ||
        rule.info.name.includes('with False') ||
        rule.info.name.includes('NOT True') ||
        rule.info.name.includes('NOT False')
    )

    let changed = true
    while (changed) {
      changed = false
      for (const rule of constantRules) {
        const newExpr = applyRuleOnce(rule, currentExpr)
        if (newExpr) {
          currentExpr = newExpr
          changed = true
          break
        }
      }
    }

    // PHASE 3: Apply contradictions and tautologies
    const identityRules = this.rules.filter(
      rule => rule.info.name.includes('Contradiction') || rule.info.name.includes('Tautology')
    )

    for (const rule of identityRules) {
      const newExpr = applyRuleOnce(rule, currentExpr)
      if (newExpr) {
        currentExpr = newExpr
        // If we found a contradiction/tautology, we're done
        return { steps, finalExpression: currentExpr }
      }
    }

    // PHASE 4: Apply distributive, absorption, and algebraic laws
    // (avoiding De Morgan cycling by applying them only once per run)
    const algebraicRules = this.rules.filter(
      rule =>
        !rule.info.name.includes('De Morgan') &&
        !rule.info.name.includes('Negated Parentheses') &&
        !negationRules.includes(rule) &&
        !constantRules.includes(rule) &&
        !identityRules.includes(rule)
    )

    changed = true
    while (changed) {
      changed = false
      for (const rule of algebraicRules) {
        const newExpr = applyRuleOnce(rule, currentExpr)
        if (newExpr) {
          currentExpr = newExpr
          changed = true
          break
        }
      }
    }

    // PHASE 5: Apply De Morgan laws exactly ONCE (to avoid cycling)
    const deMorganRules = this.rules.filter(rule => rule.info.name.includes('De Morgan'))

    for (const rule of deMorganRules) {
      const newExpr = applyRuleOnce(rule, currentExpr)
      if (newExpr) {
        currentExpr = newExpr
        // Re-apply negation rules after De Morgan to simplify
        for (const negRule of negationRules) {
          const newerExpr = applyRuleOnce(negRule, currentExpr)
          if (newerExpr) {
            currentExpr = newerExpr
          }
        }
        break // Only apply one De Morgan transformation
      }
    }

    // FINAL PHASE: Cleanup with negated parentheses simplification
    const parenthesesRules = this.rules.filter(rule =>
      rule.info.name.includes('Negated Parentheses')
    )

    for (const rule of parenthesesRules) {
      const newExpr = applyRuleOnce(rule, currentExpr)
      if (newExpr) {
        currentExpr = newExpr
      }
    }

    return {
      steps,
      finalExpression: currentExpr,
    }
  }

  /**
   * Create a deep clone of a BooleanExpression
   */
  private deepClone(expr: BooleanExpression): BooleanExpression {
    const clone: BooleanExpression = {
      type: expr.type,
    }

    if (expr.value !== undefined) {
      clone.value = expr.value
    }

    if (expr.left) {
      clone.left = this.deepClone(expr.left)
    }

    if (expr.right) {
      clone.right = this.deepClone(expr.right)
    }

    return clone
  }

  /**
   * Get the default set of simplification rules
   */
  private getDefaultRules(): SimplificationRule[] {
    const rules: SimplificationRule[] = []

    // Add rules from modular rule files
    rules.push(...getNegationRules())
    rules.push(...getBasicRules())
    rules.push(...getContradictionRules())
    rules.push(...getConstantRules())

    // Add rules converted from laws.ts
    rules.push(...convertLawsToRules())

    return rules
  }
}
